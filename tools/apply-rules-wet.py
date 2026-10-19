#!/usr/bin/env python3
"""Apply the agreed content rules to the assigned wet-lab/team pages only.

Run once with --apply. The adjacent glossary is an audit record, not a claim
that unstandardized scientific phrases have an accepted abbreviation.
Tables, source runs, identifiers, URLs, image sources, and references stay exact.
"""
import argparse
import copy
import hashlib
import html
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = 'attributions background contribution description engineering experiments members parts part-collection protocols results safety'.split()
TERMS = []

def term(full, short, *aliases, species=False, plural=None, source='established scientific nomenclature'):
    TERMS.append(dict(full=full, abbreviation=short, aliases=list(aliases), species=species, plural=plural, source=source))

term('G protein-coupled receptor', 'GPCR', 'G-protein coupled receptor', plural='GPCRs', source='https://pmc.ncbi.nlm.nih.gov/articles/PMC6476273/')
term('mitogen-activated protein kinase', 'MAPK', source='https://pmc.ncbi.nlm.nih.gov/articles/PMC10753199/')
term('molecular dynamics', 'MD')
term('ordinary differential equation', 'ODE', plural='ODEs')
term('interaction fingerprint', 'IFP', plural='IFPs')
term('wild type', 'WT', 'wild-type')
term('root mean square deviation', 'RMSD', 'root-mean-square deviation')
term('root mean square error', 'RMSE', 'root mean squared error', 'root-mean-square error')
term('polymerase chain reaction', 'PCR', source='https://www.genome.gov/genetics-glossary/Polymerase-Chain-Reaction-PCR')
term('quantitative polymerase chain reaction', 'qPCR', 'quantitative PCR')
term('next-generation sequencing', 'NGS')
term('loop-mediated isothermal amplification', 'LAMP', source='https://www.neb.com/en-us/faqs/what-is-lamp-and-rt-lamp')
term('recombinase polymerase amplification', 'RPA', source='https://www.neb.com/applications/dna-amplification-pcr-and-qpcr/isothermal-amplification/recombinase-polymerase-amplification-and-strand-invasion-based-amplification')
term('convolutional neural network', 'CNN', plural='CNNs')
term('plant-parasitic nematode', 'PPN', plural='PPNs')
term('deoxyribonucleic acid', 'DNA')
term('ribonucleic acid', 'RNA')
term('complementary DNA', 'cDNA')
term('single-guide RNA', 'sgRNA', 'single guide RNA', plural='sgRNAs')
term('guide RNA', 'gRNA', plural='gRNAs')
term('coding sequence', 'CDS', plural='CDSs')
term('homologous recombination', 'HR')
term('superfolder green fluorescent protein', 'sfGFP')
term('green fluorescent protein', 'GFP')
term('synthetic transcription factor', 'sTF', plural='sTFs', source='https://pmc.ncbi.nlm.nih.gov/articles/PMC10753199/')
term('DNA-binding domain', 'DBD', 'DNA binding domain', source='https://pmc.ncbi.nlm.nih.gov/articles/PMC10753199/')
term('pheromone-responsive domain', 'PRD', 'pheromone responsive domain', source='https://pmc.ncbi.nlm.nih.gov/articles/PMC10753199/')
term('clustered regularly interspaced short palindromic repeats–CRISPR-associated protein 9', 'CRISPR-Cas9', 'CRISPR–Cas9', 'CRISPR‑Cas9')
term('Calcofluor White', 'CFW', 'Calcofluor-White', 'Calcofluor‑White', source='https://tools.thermofisher.com/content/sfs/manuals/IFU21507.pdf')
term('phosphate-buffered saline', 'PBS')
term('yeast nitrogen base', 'YNB')
term('synthetic complete', 'SC')
term('yeast extract–peptone–dextrose', 'YPD')
term('red–green–blue', 'RGB')
term('design–build–test–learn', 'DBTL')
term('double-joint PCR', 'DJ-PCR', 'Double-Joint PCR', 'Double‑joint PCR')
term('structure-data format', 'SDF', source='https://meeko.readthedocs.io/en/develop/lig_overview.html')
term('Protein Data Bank format with partial charges and atom types', 'PDBQT', source='https://github.com/forlilab/Meeko/blob/develop/docs/source/pdbqt_spec.rst')
term('1-palmitoyl-2-oleoyl-sn-glycero-3-phosphocholine', 'POPC', source='https://www.sigmaaldrich.com/NZ/en/product/avanti/850457c')
term('personal protective equipment', 'PPE')
term('second-stage juvenile', 'J2', plural='J2')
term('guanine nucleotide-binding protein', 'G protein', 'G-protein', plural='G proteins')
for full, short in [('alanine','Ala'),('arginine','Arg'),('tryptophan','Trp'),('tyrosine','Tyr'),('histidine','His'),('leucine','Leu')]:
    term(full, short, *(['tryptophans','tryptophan residues'] if full=='tryptophan' else []), source='standard amino-acid three-letter code')
term('transmembrane helix 6', 'TM6', source='standard transmembrane-helix positional nomenclature')
term('Human Practices', 'HP', source='project team designation')
term('principal investigator', 'PI', plural='PIs')
term('artificial intelligence', 'AI')
term('Microsoft PowerPoint presentations', 'PPTs')
term('Saccharomyces cerevisiae', 'S.c', 'S. cerevisiae', 'S.cerevisiae', species=True, source='https://www.yeastgenome.org/; project-approved S.c abbreviation')
term('Meloidogyne incognita', 'Mi', 'M. incognita', 'southern root-knot nematode', species=True, source='project ODE model notation Mi')
term('Caenorhabditis elegans', 'Ce', 'C. elegans', species=True, source='project ODE model notation Ce')
term('Heterodera glycines', 'H. glycines', species=True)
term('Arthrobotrys oligospora', 'A. oligospora', species=True)
term('Arthrobotrys flagrans', 'A. flagrans', species=True)
term('Escherichia coli', 'E. coli', species=True)
for number in [3, 5, 7, 18]:
    term(f'ascaroside #{number}', f'ascr#{number}', f'ascaroside {number}', source='project ligand nomenclature; source literature')

# Full concept inventory from the assigned prose. These are deliberately not
# shortened until an accepted abbreviation or a project decision is available.
PENDING = '''plant-parasitic nematodes|sedentary endoparasitic nematodes|nematode-trapping fungi|ascarosides|betaxanthin|betalamic acid|biosensor|synthetic biology|colorimetric output|signal transduction|heterologous expression|molecular docking|receptor engineering|genome editing|gene knockout|gene knock-in|plasmid|auxotrophic marker|homology arm|fluorescence microscopy|one-step cloning|colony counting|lyophilization|genomic DNA|restriction enzyme digestion|agarose gel electrophoresis|metabarcoding|deep learning|hyperspectral imaging|remote sensing|nematicides|chemical fumigation|biological control|crop rotation|rhizosphere microbiome|syncytial feeding sites|chlorosis|6-methoxybenzoxazolin-2-one|cellulose|sulfite paper|cotton fiber|wood pulp|cellulose acetate|sodium alginate|trehalose|glycerol|sodium glutamate|mannitol|copper sulfate|iron(III) chloride|cobalt(II) chloride|copper(II) sulfate|manganese(II) chloride|tyrosine|tryptophan|glucose|Tween 80|cyanoacrylate|doxycycline|mitochondrial apoptosis|biosafety cabinet|autoclaves|high-throughput homogenizers|force field|lipid bilayer|ligand|hydrophobic contact|hydrogen bond|saturation scanning|alanine substitution|color development|transmembrane localization|chassis strain|suicide switch|protectant|receptor recognition|conformational changes|ionic environment|endocytosis|gene expression|promoter|terminator|genetic modification|genetic parts|mutant|mutation|carboxylate|matrix interference|input–output interface|G protein cycle|galactose regulon|galactose-inducible|antioxidant|surfactant|CRISPR editing|nucleic acid|amino acid|transcription factor|membrane protein|chemical signals|nematode density|nutrient uptake|phenolic compounds|double digestion|seamless assembly|sample preparation|lateral flow test strip'''.split('|')
IDENTIFIERS = '''Gpr2|Gpr3|GprC|GPR2|GPR3|GPR|Gpa2|GPA1|Gpa1|GPR2-sfGFP|GPR2‑sfGFP|FM4-64|FM4‑64|Gal80|GAL80|Gal4|Gal1|GAL1|GAL10|STE2|STE12|STE12-PRD|Gal4-DBD|MjDOD|BvCYP76AD5|TEF1|CYC1|LEU2|Leu2|TRP1|URA3|His|Leu|Trp|GAL|DAF-37|DAF-38|SRBC-64|SRBC-66|TM1|TM5|TM6|Fus3|GF/B|GF/A|CEN.PK2-1C|CEN.PK2‑1C|NKU-Y02|NKU-Y05|NKU-Y06|NKU-Y07|N84V|V368R|Arg189|Arg345|Arg368|Asp70|R189|W338|R167Y|KOSTE12|KOGal80|KOGAL80|gSTE12|gGal4|gSTE2|L-DOPA|L-tyrosine|FMN|Tet-On|Bax|oliC|gprC|gasA|GPR2/GPA1'''.split('|')
PROPER = set('iGEM GPCR GPCRs GPR2 GPR3 Gpr2 Gpr3 GprC GPA1 GPA2 GPA1/GPR2 MAPK DNA RNA cDNA sgRNA sgRNAs gRNA sfGFP GFP sTF ODE ODEs MD IFP RMSD RMSE PCR qPCR DJ-PCR CRISPR Cas9 DBTL PI HP RGB PDBQT SDF POPC CFW GAL LAMP RPA NGS CNN CDS YNB SC PBS YPD STE12 STE2 TEF1 CYC1 GAL1 GAL10 Leu2 Mi Ce S.c NKU-China NemaKlear Nemaklear Nankai ChatGPT AutoDock Vina SwissDock AlphaFold Meeko GitHub ProLIF ImageJ Whatman Trans5α Phanta Max Super-Fidelity FastPure Fast ClonExpress Ultra EasyComp TransFast Taq SuperMix pEASY Pro Gal80 Gal4 Gal1 GPR'.split())
PROPER.update('Saccharomyces Heterodera Arthrobotrys Caenorhabditis Meloidogyne Escherichia'.split())
PROPER.update('PDF HTML CSV JSON HTTP HTTPS URL SQL API AI'.split())
PROPER.update(t['abbreviation'] for t in TERMS)
PROPER.update(t['plural'] for t in TERMS if t['plural'])

def sentence_case(text):
    # A curated English heading transformation; scientific and trade names are
    # retained as tokens rather than lowercasing arbitrary body text.
    first = True
    def word(m):
        nonlocal first
        w = m.group()
        if not re.search('[A-Za-z]', w):
            return w
        keep = w in PROPER or bool(re.search(r'\d', w)) or bool(re.search(r'[a-z][A-Z]', w))
        out = w if keep else w.lower()
        if first and not keep:
            out = out[0].upper() + out[1:]
        first = False
        return out
    return re.sub(r'[A-Za-z][A-Za-z0-9.αβ]*', word, text)

def unnumber(s):
    return re.sub(r'^\s*(?:\d+(?:\.\d+)*\.?)[\s\u00a0]+', '', s)

def plain(s):
    return html.unescape(re.sub('<[^>]+>', ' ', str(s)))

def visible_fields(data):
    """Yield editable prose only, excluding headings/tables/codes/references."""
    references = False
    for i, block in enumerate(data['blocks']):
        if block.get('_template') == 'heading':
            references = bool(re.fullmatch(r'References?', unnumber(plain(block.get('text', ''))), re.I)) or (references and block['level'] > 2)
            continue
        field_order = ('accompanyingBody', 'body') if block.get('layout') == 'stack' else ('body','accompanyingBody')
        for key in (*field_order,'leftCaption','rightCaption','afterBody'):
            text = block.get(key)
            if not isinstance(text, str):
                continue
            if re.fullmatch(r'\s*(?:<[^>]+>)*References?(?:</[^>]+>)*\s*', text, re.I):
                references = True
            if not references:
                yield block, key, f'blocks[{i}].{key}', False
        for j, item in enumerate(block.get('items', [])):
            if 'introduction' in item:
                yield item, 'introduction', f'blocks[{i}].items[{j}].introduction', True
            for k, task in enumerate(item.get('specificTasks', [])):
                yield task, 'text', f'blocks[{i}].items[{j}].specificTasks[{k}].text', True

def source_entry(block):
    return bool(re.search(r'author-source-link|data-source-document|Original submission \(\.docx\)|Historical [Ss]ource [Dd]ocuments|/source-archive/', block.get('body', '')))

def compile_terms():
    variants = []
    lookup = {}
    for t in TERMS:
        singulars = [t['full'], t['abbreviation'], *t['aliases']]
        plurals = []
        if t['plural']:
            plurals = [t['full'] + 's', t['plural']]
        for variant in singulars + plurals:
            key = variant.casefold()
            lookup[key] = (t, variant in plurals)
            variants.append(re.escape(variant))
    # DNA should not match cDNA or material codes such as GPR2-sfGFP.
    pattern = re.compile(r'(?<![\w])(?:' + '|'.join(sorted(set(variants), key=len, reverse=True)) + r')(?![\w])', re.I)
    return pattern, lookup

PATTERN, LOOKUP = compile_terms()

def normalize_expansions(text):
    for t in TERMS:
        # Species formatting wrappers are rebuilt so a shortened scientific name
        # never loses italics and definitions do not acquire nested emphasis.
        if t['species']:
            for name in [t['full'], t['abbreviation'], *t['aliases']]:
                text = re.sub(r'<(?:em|i)>\s*' + re.escape(name) + r'\s*</(?:em|i)>', name, text, flags=re.I)
                text = re.sub(r'(?<!\*)\*' + re.escape(name) + r'\*(?!\*)', name, text, flags=re.I)
        for full in [t['full'], *t['aliases']]:
            # Clear a previous definition only when it exactly names the same
            # scientific abbreviation; arbitrary parenthesized data remain.
            shorts = [t['abbreviation']] + ([t['plural']] if t['plural'] else [])
            for short in shorts:
                text = re.sub(r'(?<![\w])' + re.escape(full) + r'\s*\(\s*(?:<(?:em|i)>)?' + re.escape(short) + r'(?:</(?:em|i)>)?\s*\)', full, text, flags=re.I)
                text = re.sub(r'(?<![\w])' + re.escape(full) + r'\s+' + re.escape(short) + r'(?![\w])', full, text, flags=re.I)
        if t['plural']:
            text = re.sub(re.escape(t['full']+'s') + r'\s*\(' + re.escape(t['plural']) + r'\)', t['full']+'s', text, flags=re.I)
    return text

def transform_prose(text, state, location, text_only=False):
    source = re.search(r'\bSource\s*:', text, re.I)
    if source:
        return transform_prose(text[:source.start()], state, location, text_only) + text[source.start():]
    text = normalize_expansions(text)
    text = re.sub(r'\b(DBD|PRD)\s+domain\b',r'\1',text)
    chunks = re.split(r'(<[^>]*>|`[^`]*`|\$\$[\s\S]*?\$\$|\$[^$\n]*\$|\]\([^)]*\))', text)
    protected_depth = 0
    for i, chunk in enumerate(chunks):
        if chunk.startswith('<'):
            match = re.match(r'<\s*(/?)\s*([\w-]+)', chunk)
            if match and match[2].lower() in {'code','pre','svg','math','annotation','table','h1','h2','h3','h4','h5','h6'}:
                protected_depth += -1 if match[1] else 1
            continue
        if protected_depth or chunk.startswith(('`','$','](')):
            continue
        # Markdown tables contain source observations and exact material values.
        if chunk.lstrip().startswith('|'):
            continue
        def replace(m):
            t, plural = LOOKUP[m.group().casefold()]
            full, abbr = t['full'], t['plural'] if plural else t['abbreviation']
            if t['abbreviation']=='Trp' and m.group().casefold() in {'tryptophans','tryptophan residues'}:
                full='tryptophan residues'
            if plural:
                full += 's'
            # Keep exact fusion/construct/file identities. Definitions are made
            # in separate running prose, never by renaming a material.
            before, after = chunk[:m.start()], chunk[m.end():]
            if (re.search(r'[\w][\-‑–/]$', before) or re.match(r'[\-‑–/][A-Za-z0-9]', after)) and t['abbreviation'] in {'DNA','cDNA','sgRNA','gRNA','sfGFP','GFP','sTF','DBTL','DBD','PRD'}:
                return m.group()
            if t['abbreviation'] == 'S.c' and re.match(r'\.?\s+EasyComp', after):
                return m.group()
            if t['abbreviation'] in {'Trp','His','Leu'} and re.match(r'[^.!?]{0,45}\bmarker\b', after):
                return m.group()
            record = state.setdefault(t['abbreviation'], dict(full=full, abbreviation=t['abbreviation'], first_position=location, count=0, source=t['source']))
            record['count'] += 1
            first = record['count'] == 1
            if text_only:
                return f'{full} ({abbr})' if first else abbr
            if t['species']:
                return f'<strong><em>{full}</em> (<em>{abbr}</em>)</strong>' if first else f'<em>{abbr}</em>'
            if first:
                sentence_before = plain(''.join(chunks[:i])+before).strip()
                if not sentence_before or re.search(r'[.!?]\s*$', sentence_before):
                    full = full[0].upper() + full[1:]
                return f'<strong>{full} ({abbr})</strong>'
            return abbr
        chunks[i] = PATTERN.sub(replace, chunk)
    result = ''.join(chunks)
    # Imported figures already emphasize entire caption clauses. Retain that
    # emphasis without nesting newly emphasized terminology in another strong.
    depth = 0
    flat = []
    for piece in re.split(r'(</?strong>)',result):
        if piece=='<strong>':
            depth += 1
            if depth==1:flat.append(piece)
        elif piece=='</strong>':
            if depth==1:flat.append(piece)
            depth=max(0,depth-1)
        else:flat.append(piece)
    return re.sub(r'\ba sTF\b','an sTF',''.join(flat))

def headings(data, page):
    changed = []
    # Repair imported source hierarchy, retaining all explicit stable anchors.
    if page == 'contribution':
        for i in [35,52,56,61]: data['blocks'][i]['level'] = 3
        for i in [36,44,48]: data['blocks'][i]['level'] = 4
        for i in [71,75,79,82]: data['blocks'][i]['level'] = 3
    if page == 'engineering':
        for i in [105,114,123]: data['blocks'][i]['level'] = 3
        data['blocks'][134]['level'] = 2
    # Standalone bold DBTL phase labels are actual subsections, not body prose.
    for b in data['blocks']:
        body = b.get('body','')
        match = re.fullmatch(r'\s*<p\b[^>]*>\s*<strong>\s*((?:Design|Build(?:\s*&amp;\s*Test)?|Test|Learn)(?:\s*\|[^<]+)?)\s*</strong>\s*</p>\s*', body)
        if b.get('_template')=='text' and match:
            text = html.unescape(match[1]).strip()
            b.clear(); b.update(_template='heading', level=4, text=text)
        elif page=='results' and re.fullmatch(r'\s*<p\b[^>]*>\s*<strong>References</strong>\s*</p>\s*',body):
            b.clear(); b.update(_template='heading',level=3,text='References',attributes='#results-dbtl3-references')
    chapter = sub = detail = 0
    section_title = ''
    for b in data['blocks']:
        if b.get('_template') == 'heading':
            old = b['text']
            level = b['level']
            if level == 2: chapter += 1; sub = detail = 0
            elif level == 3: sub += 1; detail = 0
            elif level == 4: detail += 1
            text = sentence_case(unnumber(old))
            if level == 3: text = f'{chapter}.{sub} {text}'
            elif level == 4 and re.match(r'^\d+\.\d+\.\d+\s', old): text = f'{chapter}.{sub}.{detail} {text}'
            elif level == 4: text = unnumber(text)
            b['text'] = text
            section_title = unnumber(text)
            if b.get('attributes'):
                b['attributes'] = re.sub(r'toc="([^"]*)"', lambda m: f'toc="{sentence_case(unnumber(m[1]))}"', b['attributes'])
            if old != text: changed.append(dict(before=old, after=text, level=level))
        for k in ['title','heading','label']:
            if isinstance(b.get(k), str): b[k] = sentence_case(b[k])
        if b.get('_template')=='pdf' and section_title:
            b['title']=section_title+' (PDF)'
        for k in ['body','accompanyingBody']:
            if isinstance(b.get(k), str):
                b[k] = re.sub(r'(<h[1-6]\b[^>]*>)([\s\S]*?)(</h[1-6]>)', lambda m: m[1] + sentence_case(m[2]) + m[3], b[k], flags=re.I)
        for item in b.get('items', []):
            for k in ['title','heading','label','role']:
                if isinstance(item.get(k), str): item[k] = sentence_case(item[k])
            if isinstance(item.get('tasks'),str):
                item['tasks'] = ', '.join(sentence_case(t.strip()) for t in item['tasks'].split(','))
            for task in item.get('specificTasks', []):
                task['text'] = re.sub(r'^([^:：]{2,40})([:：])', lambda m: sentence_case(m[1]) + m[2], task['text'])
    for k in ['title','heading']:
        if k in data: data[k] = sentence_case(data[k])
    data['crumbs'] = [sentence_case(s) for s in data.get('crumbs', [])]
    return changed

def apply(regenerate=False):
    report_file = ROOT/'docs/术语表-wet.json'
    if report_file.exists():
        previous = json.loads(report_file.read_text())
        if all(hashlib.sha256((ROOT/'content/wiki'/f'{p}.json').read_bytes()).hexdigest() == previous['pages'][p].get('after_sha256') for p in PAGES):
            if not regenerate:
                print('All assigned pages already match the recorded result; no changes.')
                return
        else:
            raise SystemExit('The recorded result has changed. Review new edits before deliberately regenerating this one-time migration.')
    reports = {}
    for page in PAGES:
        file = ROOT / 'content/wiki' / f'{page}.json'
        source = subprocess.check_output(['git','show',f'e205f4a:content/wiki/{page}.json'],cwd=ROOT) if regenerate else file.read_bytes()
        data = json.loads(source)
        before_hash = hashlib.sha256(source).hexdigest()
        title_changes = headings(data, page)
        removed = [b.get('body','') for b in data['blocks'] if source_entry(b)]
        data['blocks'] = [b for b in data['blocks'] if not source_entry(b)]
        # Add definitions for acronyms that occur first in immutable data tables
        # or exact material names. The tables and manufacturer's kit names stay exact.
        if page == 'description':
            idx = next(i for i,b in enumerate(data['blocks']) if b.get('body','').lstrip().startswith('| Method'))
            data['blocks'].insert(idx, dict(_template='text', body='<p>The methods compared below include PCR, qPCR, NGS, LAMP, RPA, and CNN approaches.</p>'))
        if page == 'parts':
            data['blocks'][0]['body'] = '<p>This page summarizes all parts and collections submitted in this project. DNA and RNA are the nucleic acids represented in the sequence entries. In the tables, cDNA and CDS describe sequence categories; HR and CRISPR-Cas9 describe genome-engineering methods; sgRNA and gRNA denote guide molecules; sfGFP is a localization reporter. The chassis species is Saccharomyces cerevisiae; Escherichia coli is used for plasmid propagation.</p>'
        if page == 'experiments':
            # Place the explanatory existing introduction before the first data
            # table rather than letting table labels act as first definitions.
            intro = data['blocks'].pop(2)
            intro['body'] = '<p>This section documents the biological materials and experimental methods used in wet-lab work. DNA and RNA are the nucleic acids represented in the sequence entries. We summarize the designed sgRNA sequences, constructed plasmids and engineered strains generated in our project. PCR underpins the cloning workflows described below. The chassis species is Saccharomyces cerevisiae; Escherichia coli is used for plasmid propagation.</p>'
            data['blocks'].insert(1, intro)
        if page == 'contribution':
            b = next(b for b in data['blocks'] if 'submitted 39 Parts' in b.get('body',''))
            b['body'] = b['body'].replace('These submissions cover','The guide molecules consist of RNA. These submissions cover')
        if page == 'results':
            b=next(b for b in data['blocks'] if 'synthetic transcription factor sTF' in b.get('body',''))
            b['body'] = b['body'].replace('synthetic transcription factor sTF','synthetic transcription factor sTF') + ' Its fusion components contain the DBD of Gal4 and the PRD of STE12.'
            b=next(b for b in data['blocks'] if 'specific sgRNAs' in b.get('body',''))
            b['body']=b['body'].replace('In addition, according to available references','The guide molecules consist of RNA. In addition, according to available references')
            for b in data['blocks']:
                if 'Figure 2. Gal80 Gene Knockout' in b.get('body',''):
                    b['body']=b['body'].replace('Figure 2. Gal80 Gene Knockout','Figure 2. Gal80 gene knockout')
            # The automatic doc-section closes at an h2 boundary. A raw author
            # section opened before that h2 would consume the automatic closing
            # tag and nest the next chapter inside the preceding chapter.
            for i in range(len(data['blocks'])-1):
                if data['blocks'][i].get('body')=='<section class="author-manuscript" lang="en">' and data['blocks'][i+1].get('_template')=='heading' and data['blocks'][i+1].get('level')==2:
                    data['blocks'][i],data['blocks'][i+1]=data['blocks'][i+1],data['blocks'][i]
        if page == 'engineering':
            b=next(b for b in data['blocks'] if 'Both the southern root-knot nematode' in b.get('body',''))
            b['body'] += '<p>Nematode density is expressed as counts of second-stage juveniles (J2) per 100 cm³.</p>'
            b=next(b for b in data['blocks'] if 'To build a yeast sensor' in b.get('body',''))
            b['body']='<p>We organize engineering through DBTL cycles.</p>'+b['body']
            b=next(b for b in data['blocks'] if 'To validate heterologous expression' in b.get('body',''))
            b['body']=b['body'].replace('we adopted the following experimental pipeline:','the construct uses sfGFP as a localization reporter. We adopted the following experimental pipeline:')
            for b in data['blocks']:
                for k in ['body','leftCaption','rightCaption']:
                    if k in b:
                        b[k]=b[k].replace('Schematic Diagram of Yeast Biosensor Construction Pipeline','Schematic diagram of yeast biosensor construction pipeline').replace('*Gal80* Gene','*Gal80* gene')
                if b.get('_template')=='gallery' and 'DNA-binding domain' in b.get('afterBody',''):
                    b['afterBody']='In the domain terminology below, deoxyribonucleic acid (DNA) is abbreviated as DNA. '+b['afterBody']
        if page == 'background':
            b=next(b for b in data['blocks'] if 'Under the strong oliC promoter' in b.get('body',''))
            b['body']=b['body'].replace('Under the strong oliC promoter','The fusion uses GFP as a localization reporter. Under the strong oliC promoter')
        state = {}
        for obj, key, path, text_only in visible_fields(data):
            obj[key] = transform_prose(obj[key], state, path, text_only)
        # Source templates sometimes redundantly say '(Mi)' after an organism's
        # model name. Only remove same-symbol duplication introduced by aliases.
        for obj,key,_,_ in visible_fields(data):
            obj[key] = re.sub(r'(<em>(Mi|Ce)</em>)\s*\(\2\)', r'\1', obj[key])
            obj[key] = re.sub(r'(<strong><em>[^<]+</em> \(<em>(Mi|Ce)</em>\)</strong>)\s*\(\2\)', r'\1', obj[key])
            for t in TERMS:
                abbr=t['abbreviation']
                obj[key], removed_duplicates = re.subn(r'(\('+re.escape(abbr)+r'\))\s*\('+re.escape(abbr)+r'\)',r'\1',obj[key])
                if removed_duplicates and abbr in state:
                    state[abbr]['count']-=removed_duplicates
        prose = [(path, plain(obj[key])) for obj,key,path,_ in visible_fields(data)]
        pending = []
        identities = []
        for inventory, target, status in [(PENDING,pending,'按用户决定保留全称，待负责人确认缩写'),(IDENTIFIERS,identities,'preserved_exact_scientific_identifier')]:
            for phrase in inventory:
                if status.startswith('按用户') and any(phrase.casefold() in {t['full'].casefold(),(t['full']+'s').casefold()} for t in TERMS):
                    continue
                locations = [p for p,t in prose if re.search(r'(?<![\w])'+re.escape(phrase)+r'(?![\w])', t, re.I)]
                if locations: target.append(dict(full=phrase, abbreviation=None, first_position=locations[0], positions=locations, status=status))
        # Capture every remaining acronym-like token for explicit review instead
        # of claiming a small curated list exhausted the scientific vocabulary.
        tokens = {}
        known = {t['abbreviation'] for t in TERMS} | {t['plural'] for t in TERMS if t['plural']}
        for path,text in prose:
            for m in re.finditer(r'\b(?:[A-Z]{2,}[a-z]?\d*|[a-z]+[A-Z][a-zA-Z0-9]*)\b',text):
                token = m.group()
                if token not in known:
                    tokens.setdefault(token,path)
        file.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
        reports[page] = dict(route=data.get('route'), before_sha256=before_hash, after_sha256=hashlib.sha256(file.read_bytes()).hexdigest(), heading_changes=title_changes, removed_source_entries=removed, terminology=list(state.values()), pending=pending, scientific_identifiers=identities, remaining_symbol_inventory=tokens, h2=sum(b.get('level')==2 for b in data['blocks'] if b.get('_template')=='heading'), h3=sum(b.get('level')==3 for b in data['blocks'] if b.get('_template')=='heading'))
    glossary = dict(scope=PAGES, base_commit='e205f4a', policy='First eligible running-prose occurrence per page expands the term; immutable tables, exact material identities and reference originals stay exact. No unverified abbreviations are invented.', shared_species_notation={'Saccharomyces cerevisiae':'S.c','Meloidogyne incognita':'Mi','Caenorhabditis elegans':'Ce'}, pages=reports)
    (ROOT/'docs/术语表-wet.json').write_text(json.dumps(glossary,ensure_ascii=False,indent=2)+'\n')
    lines=['# 正文规则执行记录：实验、项目与团队页面','','基线：`e205f4a`。仅修改分配的 12 个内容 JSON；未构建、未导出、未发布。','','## 覆盖与标题层级','','| 页面 | 一级章节 | 连续编号子章节 | 术语定义 | 待确认词项 |','| --- | ---: | ---: | ---: | ---: |']
    for page,r in reports.items():lines.append(f"| {page} | {r['h2']} | {r['h3']} | {len(r['terminology'])} | {len(r['pending'])} |")
    lines += ['','标题组件只改 sentence case，不强加正文章节数字；正文 h3 逐章连续编号，现有显式 anchor 全部保留。Contribution 和 Engineering 修复导入时错置的标题层级；引用条目原文、CSV、sourceCellRuns、材料编号、图片源和视频未改。','','## 逐页术语定义位置','','完整机读明细（含匹配计数、首次块位置、原稿入口删除证据、标题前后对照及科学标识库存）见 `术语表-wet.json`。','','| 页面 | 全称 | 统一缩写 | 首次位置 |','| --- | --- | --- | --- |']
    for page,r in reports.items():
        for t in r['terminology']:lines.append(f"| {page} | {t['full']} | {t['abbreviation']} | `{t['first_position']}` |")
    lines += ['','## 待确认缩写：全量去重清单','','以下概念按用户决定保留全称，待负责人确认缩写；不擅自编造缩写，不阻塞本轮已确定规则的修改。重复出现页面在右栏列全。','','| 专业概念 | 出现页面 |','| --- | --- |']
    pending_by_term={}
    for page,r in reports.items():
        for t in r['pending']:pending_by_term.setdefault(t['full'],[]).append(page)
    for full,pages in sorted(pending_by_term.items()):lines.append(f"| {full} | {', '.join(pages)} |")
    lines += ['','## 科学标识处理边界','','Gpr2/GPR2、GPA1、GAL80、基因与蛋白符号、株系、荧光染料商品名、FM4-64、材料等级 GF/A 和 GF/B 以及完整质粒名均为准确科学标识。未因格式统一而推测全称、改写基因大小写或拆解构建体名称。具体列表与每页位置列在 JSON 的 `scientific_identifiers`；额外缩写样式词库存列在 `remaining_symbol_inventory`，供复验逐项排除人名、机构、软件和材料符号。','','## 术语核实来源','','- PCR： https://www.genome.gov/genetics-glossary/Polymerase-Chain-Reaction-PCR','- sTF/DBD/PRD 及信号途径： https://pmc.ncbi.nlm.nih.gov/articles/PMC10753199/','- GPCR： https://pmc.ncbi.nlm.nih.gov/articles/PMC6476273/','- LAMP： https://www.neb.com/en-us/faqs/what-is-lamp-and-rt-lamp','- RPA： https://www.neb.com/applications/dna-amplification-pcr-and-qpcr/isothermal-amplification/recombinase-polymerase-amplification-and-strand-invasion-based-amplification','- 酿酒酵母拼写： https://www.yeastgenome.org/','- POPC： https://www.sigmaaldrich.com/NZ/en/product/avanti/850457c','- Calcofluor White： https://tools.thermofisher.com/content/sfs/manuals/IFU21507.pdf','','物种简称 S.c 为用户约定；Mi/Ce 为既有 ODE 模型记号，已与模型内容代理协调统一，不更改公式或表格值。']
    (ROOT/'docs/术语表-wet.md').write_text('\n'.join(lines)+'\n')
    print(json.dumps({p:{'definitions':len(r['terminology']),'pending':len(r['pending']),'headings':len(r['heading_changes']),'removed_sources':len(r['removed_source_entries'])} for p,r in reports.items()},ensure_ascii=False,indent=2))

def audit():
    report = json.loads((ROOT/'docs/术语表-wet.json').read_text())
    protected = {'csv','sourceCellRuns','src','left','right','image','name','chineseName','university','cohort','url','href','pdf','html','pdb'}
    def immutable(obj):
        out=[]
        if isinstance(obj,dict):
            for k,v in obj.items():
                if k in protected:out.append((k,v))
                elif isinstance(v,(dict,list)):out.extend(immutable(v))
        elif isinstance(obj,list):
            for v in obj:out.extend(immutable(v))
        return out
    counts={}
    for page in PAGES:
        file=ROOT/'content/wiki'/f'{page}.json'
        current=json.loads(file.read_text())
        original=json.loads(subprocess.check_output(['git','show',f'e205f4a:content/wiki/{page}.json'],cwd=ROOT))
        assert hashlib.sha256(file.read_bytes()).hexdigest()==report['pages'][page]['after_sha256'],f'{page}: report drift'
        assert immutable(current)==immutable(original),f'{page}: scientific fields changed'
        chapter=sub=0
        for b in current['blocks']:
            if b.get('_template')=='heading':
                if b['level']==2:
                    chapter+=1;sub=0
                    assert not re.match(r'^\d+\s',b['text']),f'{page}: numbered h2'
                elif b['level']==3:
                    sub+=1
                    assert b['text'].startswith(f'{chapter}.{sub} '),f'{page}: h3 sequence'
        old_anchors=[re.match(r'#([^ ]+)',b.get('attributes',''))[1] for b in original['blocks'] if b.get('_template')=='heading' and re.match(r'#([^ ]+)',b.get('attributes',''))]
        new_anchors=[re.match(r'#([^ ]+)',b.get('attributes',''))[1] for b in current['blocks'] if b.get('_template')=='heading' and re.match(r'#([^ ]+)',b.get('attributes',''))]
        assert all(a in new_anchors for a in old_anchors),f'{page}: stable anchor lost'
        # The bibliography entries are immutable; only headings get case/numbering.
        def bibliography(d):
            started=False;out=[]
            for b in d['blocks']:
                if b.get('_template')=='heading':
                    title=unnumber(plain(b.get('text','')))
                    started=bool(re.fullmatch(r'References?',title,re.I)) or (started and b['level']>2)
                elif re.fullmatch(r'\s*(?:<[^>]+>)*References?(?:</[^>]+>)*\s*',b.get('body',''),re.I):started=True
                elif started and not source_entry(b) and not re.fullmatch(r'\s*</?(?:section|div)\b[^>]*>\s*',b.get('body','')):out.append(b)
            return out
        assert bibliography(current)==bibliography(original),f'{page}: reference text changed'
        if page=='results':
            author_sections=0
            for b in current['blocks']:
                if b.get('_template')=='heading' and b.get('level')==2:
                    assert author_sections==0,'results: raw author section crosses an h2 boundary'
                body=b.get('body','')
                if re.fullmatch(r'\s*<section class="author-manuscript"[^>]*>\s*',body):author_sections+=1
                elif body.strip()=='</section>':author_sections-=1
            assert author_sections==0,'results: unbalanced raw author section'
        for obj,key,_,_ in visible_fields(current):
            value=obj[key]
            assert not re.search(r'author-source-link|data-source-document|/source-archive/',value),f'{page}: source entry remains'
            assert '<strong><strong>' not in value,f'{page}: nested strong'
        counts[page]={'h2':report['pages'][page]['h2'],'h3':report['pages'][page]['h3'],'definitions':len(report['pages'][page]['terminology'])}
    result={'status':'pass','pages':counts,'checks':['recorded output hashes','exact scientific fields','continuous h3','no h2 numeric prefix','stable anchors','exact reference entries','no source entries','no nested strong']}
    (ROOT/'docs/术语表-wet-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply',action='store_true',help='Perform the assigned content edits once')
    parser.add_argument('--regenerate',action='store_true',help='Recreate only unchanged recorded results from the fixed e205f4a baseline')
    parser.add_argument('--audit',action='store_true',help='Validate the assigned source pages against baseline and recorded glossary')
    args=parser.parse_args()
    if args.audit: audit()
    elif args.apply: apply(args.regenerate)
    else: parser.print_help()
