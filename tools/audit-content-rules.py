#!/usr/bin/env python3
"""Audit every generated content page and protect scientific assets/data."""
import argparse
import csv
import importlib.util
import io
from collections import Counter
import json
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess

class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag=tag; self.attrs=dict(attrs); self.parent=parent; self.children=[]
    def has(self, cls): return cls in self.attrs.get('class','').split()
    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child,Node): yield from child.walk()
    def text(self):
        return ''.join(c.text() if isinstance(c,Node) else c for c in self.children)
    def inside(self, tag=None, cls=None):
        n=self
        while n:
            if (tag is None or n.tag==tag) and (cls is None or n.has(cls)): return True
            n=n.parent
        return False

class DOM(HTMLParser):
    void={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def __init__(self,text):
        super().__init__(convert_charrefs=True);self.root=Node();self.stack=[self.root];self.feed(text)
    def handle_starttag(self,tag,attrs):
        n=Node(tag,attrs,self.stack[-1]);self.stack[-1].children.append(n)
        if tag not in self.void:self.stack.append(n)
    def handle_startendtag(self,tag,attrs): self.handle_starttag(tag,attrs);self.handle_endtag(tag)
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag:self.stack=self.stack[:i];break
    def handle_data(self,text):self.stack[-1].children.append(text)

class TableCells(HTMLParser):
    """Read authored HTML table cells without discarding their visible text."""
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.rows=[]; self.row=None; self.row_latex=None; self.cell=None; self.cell_latex=None; self.table_depth=0
        self.latex_rows=[]; self.annotation_text=''; self.katex_html_depth=0; self.katex_mathml_depth=0; self.annotation_depth=0; self.span_katex=[]
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        if tag == 'table': self.table_depth += 1
        if not self.table_depth: return
        attrs=dict(attrs)
        if tag == 'span':
            classes=attrs.get('class','').split()
            marker='html' if 'katex-html' in classes else 'mathml' if 'katex-mathml' in classes else ''
            self.span_katex.append(marker)
            if marker == 'html': self.katex_html_depth += 1
            elif marker == 'mathml': self.katex_mathml_depth += 1
        if tag == 'annotation' and attrs.get('encoding') == 'application/x-tex':
            self.annotation_depth += 1; self.annotation_text=''
        if tag == 'tr': self.row=[]; self.row_latex=[]
        elif tag in ('td','th'): self.cell=''; self.cell_latex=[]
        elif tag == 'br' and self.cell is not None: self.cell += '\n'
    def handle_endtag(self, tag):
        if tag == 'span' and self.span_katex:
            marker=self.span_katex.pop()
            if marker == 'html': self.katex_html_depth -= 1
            elif marker == 'mathml': self.katex_mathml_depth -= 1
        if tag == 'annotation' and self.annotation_depth:
            self.annotation_depth -= 1
            self.cell_latex.append(self.annotation_text)
            self.annotation_text=''
        if self.table_depth and tag in ('td','th') and self.cell is not None:
            self.row.append(self.cell); self.row_latex.append(self.cell_latex); self.cell=None; self.cell_latex=None
        elif self.table_depth and tag == 'tr' and self.row is not None:
            if self.row: self.rows.append(self.row); self.latex_rows.append(self.row_latex)
            self.row=None; self.row_latex=None
        elif tag == 'table' and self.table_depth:
            self.table_depth -= 1
    def handle_data(self, data):
        if self.annotation_depth: self.annotation_text += data
        if self.cell is not None and not self.katex_html_depth and (not self.katex_mathml_depth or self.annotation_depth):
            # Keep KaTeX's authored TeX annotation as the single cell value;
            # its accessibility MathML and visual HTML are duplicate renderings.
            self.cell += data

class ImageSources(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True); self.sources=[]; self.feed(source)
    def handle_starttag(self, tag, attrs):
        if tag == 'img':
            src=dict(attrs).get('src')
            if src: self.sources.append(src)

def raw_image_sources(source):
    parser=ImageSources(source)
    return parser.sources

def verified_raw_image_conversions(old_doc,new_doc):
    """Permit raw-HTML img to Tina-image moves only if the page image stream is identical."""
    allowed=[];errors=[];matches=[]
    old_blocks=old_doc.get('blocks',[]); new_blocks=new_doc.get('blocks',[])
    old_direct=[b.get('src') for b in old_blocks if b.get('src')]
    old_raw=[src for b in old_blocks for src in raw_image_sources(b.get('body',''))]
    # Existing structured src values remain protected by the ordinary Counter;
    # only a newly explicit Tina image can stand in for a baseline raw <img>.
    remaining=list(old_direct); additions=[]
    for index,block in enumerate(new_blocks):
        if block.get('_template')!='image' or not block.get('src'): continue
        src=block['src']
        if src in remaining: remaining.remove(src)
        elif src in old_raw: additions.append((index,src))
        else: errors.append(f'block {index}: new Tina image src has no matching baseline raw HTML image')
    if additions and not errors:
        candidate_raw=[]
        for block in new_blocks:
            candidate_raw.extend(raw_image_sources(block.get('body','')))
        expected_raw=old_raw
        converted_stream=[src for _,src in sorted(additions)]
        if Counter(old_raw)!=Counter(candidate_raw+converted_stream):
            errors.append('page image source sequence/count differs between baseline raw HTML and candidate Tina images')
        else:
            allowed.extend(('src',json.dumps(src,sort_keys=True,ensure_ascii=False)) for _,src in additions)
            matches=[{'block':index,'src':src} for index,src in additions]
    return allowed,errors,matches

def html_table_rows(source):
    parser=TableCells(source)
    return parser.rows

def html_table_latex(source):
    parser=TableCells(source)
    return parser.latex_rows

def csv_rows(source):
    return list(csv.reader(io.StringIO(source, newline='')))

def source_runs_rows(runs):
    if not isinstance(runs, list): return None
    try:
        return [[ ''.join(segment['text'] for segment in cell) for cell in row ] for row in runs]
    except (TypeError, KeyError):
        return None

def source_runs_latex(runs):
    if not isinstance(runs, list): return None
    try:
        return [[[segment['latex'] for segment in cell if segment.get('latex')] for cell in row] for row in runs]
    except (TypeError, KeyError):
        return None

RAW_HTML_TABLE_TEXT_FIXES = {
    # §8 approved fixed spelling; applicable only while validating a new
    # datatable conversion from a raw-HTML table (never to existing CSV data).
    'lyophilization': 'freeze-drying',
    # §9 table headers use sentence case.
    'Substrate Type': 'Substrate type',
    'cell elution rate': 'Cell elution rate',
    'Performance Characteristics': 'Performance characteristics',
}

# Add mappings only from an explicit reviewed citation-renumbering record.
# Keys are page slugs; values map full citation tokens, never numeric data.
RAW_HTML_TABLE_CITATION_MAPS = {
    'model-ode': {
        '[1,2]': '[3, 4]',
        '[1]': '[3]',
        '[3,4]': '[5, 6]',
        '[6]': '[8]',
    },
}

def verified_raw_table_conversions(old_doc, new_doc, slug=''):
    """Return candidate CSV/run values proven to be lossless raw-table conversions.

    Existing CSV/sourceCellRuns stay protected byte-for-byte. A new datatable can
    replace a raw HTML table only at the same block position and only when both
    its CSV and formatting runs reproduce every original visible cell exactly.
    """
    allowed=[]; errors=[]; documented_changes=[]
    old_blocks=old_doc.get('blocks',[])
    for index, block in enumerate(new_doc.get('blocks',[])):
        if block.get('_template') != 'datatable' or index >= len(old_blocks): continue
        old=old_blocks[index]
        if '<table' not in old.get('body','').lower(): continue
        original=html_table_rows(old.get('body',''))
        original_latex=html_table_latex(old.get('body',''))
        candidate=csv_rows(block.get('csv',''))
        runs=source_runs_rows(block.get('sourceCellRuns'))
        run_latex=source_runs_latex(block.get('sourceCellRuns'))
        if not original:
            errors.append(f'block {index}: original HTML table has no readable cells')
        else:
            expected=[row[:] for row in original]
            page_citations=RAW_HTML_TABLE_CITATION_MAPS.get(slug,{})
            for row_index, row in enumerate(expected):
                for cell_index, cell in enumerate(row):
                    replacement=cell
                    for source_text, fixed_text in RAW_HTML_TABLE_TEXT_FIXES.items():
                        replacement=replacement.replace(source_text,fixed_text)
                    for source_token, fixed_token in page_citations.items():
                        replacement=replacement.replace(source_token,fixed_token)
                    if replacement != cell:
                        expected[row_index][cell_index]=replacement
                        documented_changes.append({
                            'page': slug, 'block': index, 'row': row_index + 1, 'cell': cell_index + 1,
                            'kind': 'citation-renumbering' if any(token in cell for token in page_citations) else 'copy-standardization',
                            'before': cell, 'after': replacement,
                        })
            if candidate != expected:
                errors.append(f'block {index}: datatable CSV cells differ from the original HTML table (outside approved spelling fixes)')
        if original and candidate == expected and runs != candidate:
            errors.append(f'block {index}: sourceCellRuns text differs from the datatable CSV')
        if original and candidate == expected and run_latex != original_latex:
            errors.append(f'block {index}: sourceCellRuns LaTeX differs from the original KaTeX annotations')
        if original and candidate == expected and runs == candidate and run_latex == original_latex:
            allowed.append(('csv',json.dumps(block.get('csv'),sort_keys=True,ensure_ascii=False)))
            allowed.append(('sourceCellRuns',json.dumps(block.get('sourceCellRuns'),sort_keys=True,ensure_ascii=False)))
    return allowed, errors, documented_changes

MODEL_MODULE_TITLES = {
    '#model-section-1': 'Molecular docking',
    '#model-section-2': 'Molecular dynamics',
    '#model-section-3': 'ODE and dual-channel model',
    '#model-section-4': 'Economic benefit',
}

# These Goal labels are required by the approved Engineering-page outline.
# Keep the numbered prefix verbatim, then apply the ordinary sentence-case
# rule only to the title text after the colon.
ENGINEERING_GOAL_PREFIXES = {
    f'#engineering-goal-{n}-{slug}': f'Goal {n}:'
    for n, slug in (
        (1, 'building-the-biosensor'),
        (2, 'making-the-readout-informative'),
        (3, 'engineering-a-usable-test-format'),
        (4, 'refining-the-project-for-agricultural-use'),
    )
}

def heading_sentence_case_violation(slug, label, attributes, level, sentence_case):
    """Preserve the fixed Model/Goal prefixes while checking their subtitles."""
    if slug == 'model' and level == 2:
        anchor = attributes.split()[0] if attributes.split() else ''
        prefix = MODEL_MODULE_TITLES.get(anchor)
        if prefix:
            if not label.startswith(prefix + ': '):
                return True
            normalized = sentence_case(label)
            normalized_prefix = sentence_case(prefix)
            if normalized.startswith(normalized_prefix):
                normalized = prefix + normalized[len(normalized_prefix):]
            return normalized != label
    if slug == 'engineering' and level == 2:
        anchor = attributes.split()[0] if attributes.split() else ''
        prefix = ENGINEERING_GOAL_PREFIXES.get(anchor)
        if prefix:
            if not label.startswith(prefix + ' '):
                return True
            suffix = label[len(prefix):].strip()
            return not suffix or sentence_case(suffix) != suffix
    return sentence_case(label) != label

def values(doc):
    out=[]
    protected={'src','left','right','csv','sourceCellRuns','latex','pdbUrl','pdb','videoUrl','poster','sequence'}
    def walk(value):
        if isinstance(value,dict):
            for key,item in value.items():
                if key in protected: out.append((key,json.dumps(item,sort_keys=True,ensure_ascii=False)))
                else:walk(item)
        elif isinstance(value,list):
            for item in value:walk(item)
    walk(doc);return Counter(out)

def archive_links(doc):
    links=[]
    for block in doc.get('blocks',[]):
        dom=DOM(block.get('body',''))
        for n in dom.root.walk():
            if n.tag=='a' and 'data-source-document' in n.attrs:
                links.append((n.attrs.get('data-source-document'),n.attrs.get('href'),n.attrs.get('download')))
    return sorted(links,key=str)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--base',default='e205f4a5c5ade14f1c38e6836a2b41521b20bf5e');parser.add_argument('--output',default='docs/content-rules-audit.json');parser.add_argument('--structure-only',action='store_true');args=parser.parse_args()
    reviewed_scope=set('description background engineering contribution model model-docking model-md model-ode model-eco'.split())
    spec=importlib.util.spec_from_file_location('rules',Path('tools/apply-rules-wet.py'))
    rules=importlib.util.module_from_spec(spec);spec.loader.exec_module(rules)
    failures=[];pages=[];pages_table_changes={};pages_image_conversions={}
    for path in sorted(Path('content/wiki').glob('*.json')):
        slug=path.stem;doc=json.loads(path.read_text())
        if not args.structure_only:
            old=json.loads(subprocess.check_output(['git','show',f'{args.base}:{path}'],text=True))
            converted, conversion_errors, table_text_changes=verified_raw_table_conversions(old,doc,slug)
            image_values,image_errors,image_matches=verified_raw_image_conversions(old,doc)
            failures.extend(f'{slug}: raw HTML image conversion {message}' for message in image_errors)
            if image_matches: pages_image_conversions[slug]=image_matches
            if table_text_changes:
                pages_table_changes[slug]=table_text_changes
            failures.extend(f'{slug}: raw HTML table conversion {message}' for message in conversion_errors)
            candidate_values=values(doc)
            for value in converted:
                candidate_values[value]-=1
                if candidate_values[value] <= 0: del candidate_values[value]
            for value in image_values:
                candidate_values[value]-=1
                if candidate_values[value] <= 0: del candidate_values[value]
            if candidate_values!=values(old):failures.append(f'{slug}: scientific asset/data fields changed')
            if slug=='source-archive' and archive_links(doc)!=archive_links(old):failures.append('source-archive: original download targets changed')
        if slug in reviewed_scope:
            for block in doc['blocks']:
                if block.get('_template')!='heading':continue
                label=rules.unnumber(block['text'])
                if heading_sentence_case_violation(slug, label, block.get('attributes', ''), block.get('level'), rules.sentence_case):failures.append(f'{slug}: heading is not sentence case: {label}')
                if re.search(r'(?:^|\s)unnumbered(?:\s|$)',block.get('attributes','')):failures.append(f'{slug}: chapter bypasses agreed outline numbering: {label}')
        generated=Path('public')/(doc['route']+'/index.html' if doc.get('route') else f'pages/{slug}.html')
        if not generated.exists(): failures.append(f'{slug}: generated page missing');continue
        dom=DOM(generated.read_text());nodes=list(dom.root.walk());article=next((n for n in nodes if n.tag=='article' and n.has('doc__body')),None)
        if article is None:failures.append(f'{slug}: article missing');continue
        heading_nodes=[n for n in article.walk() if n.tag in ('h2','h3','h4','h5','h6')]
        h2=[n for n in heading_nodes if n.tag=='h2'];h3=[n for n in heading_nodes if n.tag=='h3']
        if slug=='members':
            members_unnumbered={'pi':'PI','advisors':'Advisor','student-leaders':'Student leaders','student-team-members':'Student team members'}
            source_headings={re.search(r'#([^ ]+)',b.get('attributes','')).group(1):b
                for b in doc['blocks'] if b.get('_template')=='heading' and b.get('level')==3 and re.search(r'#([^ ]+)',b.get('attributes',''))}
            for anchor,label in members_unnumbered.items():
                block=source_headings.get(anchor)
                if block is None or block.get('text')!=label or 'toc-unnumbered' not in block.get('attributes',''):
                    failures.append(f'members: expected explicit unnumbered heading {anchor}: {label}')
                rendered=[n for n in h3 if n.attrs.get('id')==anchor]
                if len(rendered)!=1:
                    failures.append(f'members: expected one rendered h3 #{anchor}, found {len(rendered)}')
                elif re.match(r'^\s*(?:\d+(?:\.\d+)*[.)]?|[IVX]+[.)])\s+',rendered[0].text().strip()):
                    failures.append(f'members: explicit unnumbered h3 gained a numeric prefix: {rendered[0].text().strip()}')
        for n in h2:
            label=n.text().strip()
            calendar_date=re.match(r'^\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b',label)
            if not calendar_date and re.match(r'^\s*(?:\d+(?:\.\d+)*[.)]?|[IVX]+[.)])\s+',label):failures.append(f'{slug}: h2 still numbered: {label[:100]}')
        if slug in reviewed_scope:
            for item in (n for n in nodes if n.has('toc__item--3')):
                if any(n.has('toc__num') for n in item.walk()):failures.append(f'{slug}: child outline item still displays a number: {item.text()[:80]}')
        for section in (n for n in article.walk() if n.has('doc-section') and n.attrs.get('data-num')):
            if section.parent and section.parent.inside(cls='doc-section'):failures.append(f'{slug}: chapter {section.attrs["data-num"]} is nested inside another chapter')
            def belongs(n):
                parent=n.parent
                while parent and not parent.has('doc-section'):parent=parent.parent
                return parent is section
            children=[n for n in section.walk() if n.tag=='h3' and belongs(n) and not any(n.inside(cls=c) for c in ('cards','card','timeline','features','member-grid','credit-grid','person-name','wf'))]
            chapter=int(section.attrs['data-num'])
            unnumbered_children = {re.search(r'#([^ ]+)', b.get('attributes', '')).group(1) for b in doc['blocks']
                if b.get('_template') == 'heading' and 'toc-unnumbered' in b.get('attributes', '') and re.search(r'#([^ ]+)', b.get('attributes', ''))}
            for ordinal,n in enumerate(children,1):
                if n.attrs.get('id') in unnumbered_children:
                    continue
                expected=f'{chapter}.{ordinal} '
                if not n.text().strip().startswith(expected):failures.append(f'{slug}: expected h3 {expected.strip()}: {n.text()[:100]}')
        nonarchive=slug!='source-archive'
        if nonarchive:
            for n in nodes:
                if n.tag=='a' and ('source-archive' in n.attrs.get('href','') or 'data-source-document' in n.attrs): failures.append(f'{slug}: manuscript/archive link remains: {n.text()[:80]}')
                if n.tag not in ('script','style') and not any(isinstance(c,Node) for c in n.children):
                    if re.search(r'Historical source documents|Original submission|历史原稿|历史文档|历史资料',n.text(),re.I): failures.append(f'{slug}: historical document text remains: {n.text()[:80]}')
            for n in article.walk():
                if n.tag=='p' and re.search(r'Back to HP Overview|Next:\s*(?:Education|iHP|Investigation)',n.text(),re.I):failures.append(f'{slug}: duplicate body paging remains')
        ids=Counter(n.attrs['id'] for n in nodes if 'id' in n.attrs)
        for key,count in ids.items():
            if count>1:failures.append(f'{slug}: duplicate id {key}')
        pages.append({'page':slug,'route':str(generated),'h2':len(h2),'h3':len(h3),'headings':[{'level':n.tag,'text':n.text().strip(),'id':n.attrs.get('id')} for n in heading_nodes]})
    index=Path('public/js/search-data.js').read_text()
    if 'source-archive/' in index or re.search('historical source documents|历史原稿|历史文档',index,re.I):failures.append('search: archive content remains')
    report={'base':args.base,'page_count':len(pages),'passed':not failures,'failures':failures,'pages':pages,'raw_html_table_text_fixes':pages_table_changes,'raw_html_image_conversions':pages_image_conversions}
    Path(args.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'page_count':len(pages),'passed':not failures,'failures':failures},ensure_ascii=False,indent=2));return bool(failures)
if __name__=='__main__':raise SystemExit(main())
