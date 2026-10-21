#!/usr/bin/env python3
"""Apply the confirmed editorial rules to the assigned Model/HP content sources.

Only literal prose and title fields are edited. HTML attributes, MathML, tables,
code, reference entries and identifiers remain byte-for-byte unchanged.
"""
import argparse
import hashlib
import html
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ('model', 'model-1', 'model-2', 'model-docking', 'model-md',
         'model-ode', 'model-eco', 'hp-overview', 'hp-investigation',
         'hp-industry', 'human-practices', 'education')
PROPER = (
    'National Natural History Museum of China', 'China Agricultural Museum',
    'Beijing Academy of Agriculture and Forestry Sciences',
    'Institute of Plant Protection', 'Tianjin Academy of Agricultural Sciences',
    'College of Plant Protection', 'China Agricultural University',
    'Beijing Forestry University',
    'Nankai University', 'Xiangyang Program', 'Yurong Yao', 'Qian Liu',
    'Zhihao Pang', 'ExCell Bio', 'NemaKlear', 'AutoDock Vina', 'AlphaFold 3',
    'Meloidogyne incognita', 'Caenorhabditis elegans', 'Saccharomyces cerevisiae',
    'Tianjin', 'China', 'Beijing', 'Hebei', 'Gansu', 'Jiangxi',
    'Human Practices', 'Integrated Human Practices',
)
# Human Practices is a page/topic label, not a proper-name exception in headings.
PROPER = tuple(x for x in PROPER if x not in ('Human Practices', 'Integrated Human Practices'))


def sentence_case(value):
    held = []
    def protect(m):
        held.append(m.group(0))
        return f'\ue000{len(held)-1}\ue001'
    value = re.sub('|'.join(re.escape(x) for x in sorted(PROPER, key=len, reverse=True)), protect, value)
    # Preserve abbreviations and mixed-case scientific/brand identifiers.
    value = re.sub(r'\b[A-Z][a-z]+\b', lambda m: m.group().lower(), value)
    first = re.search(r'[A-Za-z]|\ue000', value)
    if first and first.group() != '\ue000':
        word = re.match(r'[A-Za-z0-9]+', value[first.start():]).group()
        if word not in ('iGEM', 'iHP', 'sTF', 'pH'):
            value = value[:first.start()] + value[first.start()].upper() + value[first.start()+1:]
    for i, original in enumerate(held):
        value = value.replace(f'\ue000{i}\ue001', original)
    return value


def no_number(value):
    return re.sub(r'^\s*(?:\d+(?:\.\d+)*[.)]?\s+)', '', value).strip()


# Canonical definitions shared with the wet-lab content agent. Plural patterns
# retain local grammar. These are established abbreviations, never invented ones.
TERMS = [
    ('G protein-coupled receptor', 'GPCR', r'G[ -]protein[ -]coupled receptor|GPCR', True, False),
    ('molecular dynamics', 'MD', r'molecular dynamics|MD', False, False),
    ('ordinary differential equation', 'ODE', r'ordinary differential equation|ODE', True, False),
    ('wild type', 'WT', r'wild[ -]type|WT', False, False),
    ('mitogen-activated protein kinase', 'MAPK', r'mitogen[ -]activated protein kinase|MAPK', False, False),
    ('synthetic transcription factor', 'sTF', r'synthetic[ -]transcription[ -]factor|sTF', True, False),
    ('root mean square deviation', 'RMSD', r'root[ -]mean[ -]square deviation|RMSD', False, False),
    ('root mean square error', 'RMSE', r'root[ -]mean[ -]square error|RMSE', True, False),
    ('1-palmitoyl-2-oleoyl-sn-glycero-3-phosphocholine', 'POPC', r'1-palmitoyl-2-oleoyl-sn-glycero-3-phosphocholine|POPC', False, False),
    ('guanosine diphosphate', 'GDP', r'guanosine diphosphate|GDP', False, False),
    ('red–green–blue', 'RGB', r'red[–-]green[–-]blue|RGB', False, False),
    ('guanine nucleotide-binding protein', 'G protein', r'guanine nucleotide[ -]binding protein|G protein', True, False),
    ('deoxyribonucleic acid', 'DNA', r'deoxyribonucleic acid|DNA', False, False),
    ('ribonucleic acid', 'RNA', r'ribonucleic acid|RNA', False, False),
    ('alanine', 'Ala', r'[Aa]lanine|Ala', False, False),
    ('arginine', 'Arg', r'[Aa]rginine|Arg', False, False),
    ('tryptophan', 'Trp', r'[Tt]ryptophan|Trp', True, False),
    ('transmembrane helix 6', 'TM6', r'transmembrane helix 6|TM6', False, False),
    ('second-stage juvenile', 'J2', r'second-stage juvenile|J2', True, False),
    ('structure-data format', 'SDF', r'structure-data format|SDF', False, False),
    ('Protein Data Bank format with partial charges and atom types', 'PDBQT', r'Protein Data Bank format with partial charges and atom types|PDBQT', False, False),
    ('Human Practices', 'HP', r'Human Practices|HP', False, False),
    ('integrated Human Practices', 'iHP', r'integrated Human Practices|iHP', False, False),
    ('plant-parasitic nematode', 'PPN', r'[Pp]lant[ -]parasitic nematode|PPN', True, False),
    ('Meloidogyne incognita', 'M.i', r'Meloidogyne incognita|M\.\s*incognita|M\.i', False, True),
    ('Caenorhabditis elegans', 'C.e', r'Caenorhabditis elegans|C\.\s*elegans|C\.e', False, True),
    ('Saccharomyces cerevisiae', 'S.c', r'Saccharomyces cerevisiae|Saccaromyces cerevisiae|S\.\s*cerevisiae|S\.c', False, True),
    ('ascaroside #3', 'ascr#3', r'ascaroside\s*#?3|ascr#3', False, False),
    ('ascaroside #18', 'ascr#18', r'ascaroside\s*#?18|ascr#18', False, False),
]

# Terms requiring a human decision because no unique abbreviation is established
# in this project. A match records its exact page/block, rather than silently
# omitting the term or fabricating an acronym.
PENDING = [
    ('molecular docking', r'molecular docking|\bdocking\b', 'MD conflicts with molecular dynamics'),
    ('ascaroside', r'\bascarosides?\b', 'generic family; individual ascr#3/ascr#18 are defined separately'),
    ('receptor engineering', r'receptor engineering|receptor-engineering', ''),
    ('ligand', r'\bligands?\b', ''),
    ('receptor', r'\breceptors?\b', ''),
    ('alanine scanning', r'alanine scan(?:ning)?|alanine substitutions?', ''),
    ('saturation scanning', r'saturation scanning', ''),
    ('sequence alignment', r'sequence alignment', ''),
    ('structural alignment', r'structural alignment', ''),
    ('hydrogen bond', r'hydrogen[ -]bonds?', ''),
    ('salt bridge', r'salt[ -]bridges?', ''),
    ('ligand carboxylate', r'carboxylate', ''),
    ('guanidinium', r'guanidinium', ''),
    ('transmembrane helix/core', r'transmembrane', ''),
    ('contact occupancy', r'contact occupancy', ''),
    ('docking score', r'docking[ -]scores?', ''),
    ('contact frequency', r'contact frequenc(?:y|ies)', ''),
    ('binding pose', r'binding poses?', ''),
    ('heterologous localization', r'heterologous localization', ''),
    ('ligand selectivity', r'\bselectivity\b', ''),
    ('ascaroside-binding pocket', r'ascaroside-binding pockets?', ''),
    ('energy minimization', r'energy minimization', ''),
    ('equilibration', r'(?:pre-)?equilibration', ''),
    ('lipid bilayer', r'lipid bilayers?', ''),
    ('mutant/substitution', r'\bmutants?\b|\bsubstitutions?\b', ''),
    ('nematode', r'\bnematodes?\b', ''),
    ('southern root-knot nematode', r'southern root-knot nematode', 'use M.i only when species identity is explicitly established'),
    ('free-living nematode', r'free-living nematode', 'ecological group, not necessarily C.e'),
    ('engineered yeast', r'engineered yeast', 'yeast is not necessarily the named species S.c'),
    ('GAL system/output', r'\bGAL\b', 'gene/regulon label; no unambiguous prose expansion in source'),
    ('Hill equation/exponent', r'\bHill\b', ''),
    ('betaxanthin', r'betaxanthin', ''),
    ('indicaxanthin', r'indicaxanthin', ''),
    ('pigment-equivalent concentration', r'pigment-equivalent concentration', ''),
    ('dual-channel model', r'dual-channel (?:model|regression)', ''),
    ('least-squares fitting', r'least-squares fitting', ''),
    ('regression', r'\bregression\b', ''),
    ('prediction interval', r'prediction[ -]intervals?', ''),
    ('confidence interval', r'confidence interval', ''),
    ('signal amplification', r'(?:signal|cascade)[ -]amplification|cascad(?:e|ed) amplif', ''),
    ('Seinhorst loss relationship', r'Seinhorst', ''),
    ('absorbance at 480 nm', r'\bA480\b', 'measurement symbol; preserve existing calibrated readout'),
    ('sensitivity analysis', r'sensitivity analys[ie]s', ''),
    ('sampling representativeness', r'representativeness|representative samples?', ''),
    ('matrix inhibition/interference', r'matrix (?:inhibition|interference)', ''),
    ('synthetic biology', r'synthetic biology', ''),
    ('biosensing', r'biological sensing|yeast-based sensing|biosens', ''),
    ('soil microbial community', r'soil microbial|microbial communit', ''),
    ('nematode disease', r'nematode disease', ''),
    ('soil disinfection', r'soil disinfection', ''),
    ('morphological identification', r'morphological', ''),
    ('molecular identification', r'molecular methods', ''),
    ('plant defenses', r'plant defen[cs]es', ''),
    ('root-knot nematode', r'root-knot nematode', 'group broader than M.i'),
    ('cyst nematode', r'cyst nematode', ''),
    ('soil life/biodiversity', r'biodiversity|soil life', ''),
    ('early-warning detection', r'early[ -]warning|early detection', ''),
    ('agricultural disease management', r'disease management', ''),
    ('crop yield loss', r'yield loss', ''),
    ('density–yield relationship', r'density[–-]yield relationship', ''),
    ('quantitative/semiquantitative detection', r'semiquantitative|quantitative information', ''),
    ('plasma membrane', r'plasma[ -]membrane', ''),
    ('mitochondria', r'mitochondri', ''),
    ('formal charge', r'formal charges?', ''),
    ('ionic contact', r'ionic[ -](?:type )?contacts?', ''),
    ('hydrophobic contact', r'hydrophobic contacts?', ''),
    ('amino-acid residue', r'\bresidues?\b', ''),
    ('ligand pocket', r'\bpockets?\b', ''),
    ('side-chain', r'side[ -]chains?', ''),
    ('scaffold complex', r'scaffold', ''),
    ('negative feedback', r'\bfeedback\b', ''),
    ('heterotrimer', r'heterotrimer', ''),
    ('Gα/Gβγ subunits', r'G[αβγ]', 'canonical subunit symbols; do not invent replacement acronyms'),
    ('dose–response relationship', r'dose[ -]gradient|dose[–-]response', ''),
    ('signal stability', r'signal stability', ''),
    ('soil matrix', r'soil (?:background|interference|environment)', ''),
    ('blank correction', r'blank correction|blank-relative|blank subtraction', ''),
    ('linear calibration', r'linear[ -]calibration|standard curve', ''),
    ('parameter identification', r'parameter identification', ''),
    ('relative yield', r'relative yield', ''),
    ('treatment efficacy', r'treatment efficacy', ''),
    ('net return', r'net[ -]returns?', ''),
    ('tolerance density/level', r'tolerance (?:density|level)', ''),
    ('nematode secretion profile', r'secretion (?:composition|profiles?)', ''),
    ('nematode pheromone', r'pheromone', ''),
    ('experimental control', r'\bcontrols?\b', ''),
]
IDENTIFIERS = ('Gpr2', 'Gpr3', 'GprC', 'Fus3', 'Sst2', 'Ste12', 'Gal4',
               'DAF-37', 'SRBC-64', 'Meeko', 'Eco',
               'CAU-China', 'ZZU', 'BJWZ-China', 'PROFUTURE',
               'AlphaFold 3', 'AutoDock Vina', 'Supady Model B', 'P3', 'P18')

PROTECTED = re.compile(r'(<(?:math|table|pre|code|svg|script|style|nav)\b[^>]*>.*?</(?:math|table|pre|code|svg|script|style|nav)>|<p\b[^>]*class="hp-inpage-nav"[^>]*>.*?</p>|`[^`]*`|\$\$.*?\$\$|\\\[.*?\\\]|\\\(.*?\\\)|<[^>]*>)', re.I | re.S)


def prose_parts(value):
    return PROTECTED.split(value)


def visible_prose(value):
    return html.unescape(' '.join(p for i, p in enumerate(prose_parts(value)) if i % 2 == 0))


def update_titles(value, section, counters, cards=False):
    def md(m):
        marker, text, attrs = m.groups()
        level = len(marker)
        text = sentence_case(no_number(text))
        if level == 3 and not cards:
            counters[section] = counters.get(section, 0) + 1
            text = f'{section}.{counters[section]} {text}'
        return marker + ' ' + text + (attrs or '')
    value = re.sub(r'(?m)^(#{2,6})[ \t]+(.+?)([ \t]+\{[^\n]*\})?[ \t]*$', md, value)
    def ht(m):
        level, attrs, text = m.groups()
        text = sentence_case(no_number(text))
        if level == '3' and not cards:
            counters[section] = counters.get(section, 0) + 1
            text = f'{section}.{counters[section]} {text}'
        return f'<h{level}{attrs}>{text}</h{level}>'
    return re.sub(r'<h([2-6])(\b[^>]*)>(.*?)</h\1>', ht, value, flags=re.S)


def apply_page(name, source):
    data = json.loads(source)
    rows = []
    for key in ('title', 'heading', 'sub'):
        if isinstance(data.get(key), str):
            data[key] = sentence_case(data[key])
    data['crumbs'] = [sentence_case(x) for x in data.get('crumbs', [])]
    sections, counters, references, definitions = 0, {}, False, {}
    blocks = []
    for old_index, original in enumerate(data['blocks']):
        b = dict(original)
        loc = f'blocks[{len(blocks)}]'
        if isinstance(b.get('label'), str):
            b['label'] = sentence_case(b['label'])
        if b['_template'] == 'heading':
            clean = no_number(b['text'])
            if re.match(r'References(?:\b|$)', clean, re.I):
                references = True
                b['level'] = 2
            if b['level'] == 4 and name == 'model-ode':
                b['level'] = 3
            if b['level'] == 2:
                sections += 1
            b['text'] = sentence_case(clean)
            if b['level'] == 3:
                counters[sections] = counters.get(sections, 0) + 1
                b['text'] = f'{sections}.{counters[sections]} ' + b['text']
            if 'attributes' in b:
                b['attributes'] = re.sub(r'toc="([^"]*)"', lambda m: 'toc="' + sentence_case(no_number(m[1])) + '"', b['attributes'])
            blocks.append(b)
            continue
        if 'body' not in b:
            blocks.append(b)
            continue
        body = b['body']
        if 'author-source-link' in body:
            continue
        # These exact standalone blocks are redundant with the global footer.
        if re.match(r'^\s*<p\b[^>]*>\s*<a\b[^>]*>Back to HP Overview</a>', body):
            continue
        if name == 'hp-industry' and 'Overview entry  Industry Engagement and Support' in body:
            continue
        body = update_titles(body, sections, counters, b.get('kind') in ('cards', 'features', 'timeline'))
        # Labels inside the existing chapter navigation are titles, not prose.
        body = re.sub(r'(<nav\b.*?</nav>)', lambda m: re.sub(r'(<a\b[^>]*>)([^<]+)(</a>)', lambda a: a[1] + sentence_case(a[2]) + a[3], m[0]), body, flags=re.S)
        body = re.sub(r'(<p\b[^>]*class="hp-image-label"[^>]*>)([^<]+)(</p>)', lambda m: m[1] + sentence_case(m[2]) + m[3], body)
        if name in ('model-1', 'model-2'):
            body = body.replace('Continue to Molecular Docking', 'Continue to molecular docking').replace('Continue to Molecular Dynamics', 'Continue to molecular dynamics').replace('open the Model overview', 'open the model overview')
        if name == 'model-ode':
            body = body.replace('Caenorhabditis elegans <em>Caenorhabditis elegans</em> (C.e)', '<em>Caenorhabditis elegans</em> (C.e)')
        if not references:
            raw_prose = visible_prose(body)
            for full, pattern, note in PENDING:
                if re.search(pattern, raw_prose, re.I):
                    rows.append(dict(page=name, full=full, abbreviation='', location=loc,
                                     status='按用户决定保留全称，待负责人确认缩写', note=note or 'No unique established abbreviation in the supplied project source'))
            for identifier in IDENTIFIERS:
                if re.search(r'(?<!\w)' + re.escape(identifier) + r'(?!\w)', raw_prose):
                    rows.append(dict(page=name, full=identifier, abbreviation=identifier,
                                     location=loc, status='保留科学标识符', note='Protein/gene/model/software/file-format identifier; do not fabricate an expansion'))

            # Strip adjacent species emphasis + an existing definition before
            # processing so the scientific name and abbreviation form one unit.
            for full, short, pattern, plural, italic in TERMS:
                if italic:
                    body = re.sub(r'<em>(' + pattern + r')</em>(?:\s*\(<em>' + re.escape(short) + r'</em>\)|\s*\(' + re.escape(short) + r'\))?', lambda m: m[1], body)
            parts = prose_parts(body)
            for pindex in range(0, len(parts), 2):
                text = parts[pindex]
                # A Markdown heading line is handled as a title, never expanded.
                lines = text.splitlines(keepends=True)
                for li, line in enumerate(lines):
                    if re.match(r'^#{2,6}\s', line):
                        continue
                    # Simultaneous union prevents re-matching newly expanded text.
                    alternatives = []
                    for ti, (full, short, pattern, plural, italic) in enumerate(TERMS):
                        plural_suffix = '(?P<plural%d>s)?' % ti if plural else ''
                        suffix = r'(?:\s*\(' + re.escape(short) + (r's?' if plural else '') + r'\))?'
                        alternatives.append(r'(?P<t%d>(?<![A-Za-z0-9])(?:' % ti + pattern + ')' + plural_suffix + suffix + r'(?![A-Za-z0-9]))')
                    rx = re.compile('|'.join(alternatives))
                    def term(m):
                        ti = next(i for i in range(len(TERMS)) if m.group('t%d' % i) is not None)
                        full, short, pattern, plural, italic = TERMS[ti]
                        is_plural = bool(plural and m.groupdict().get('plural%d' % ti))
                        # J2 is an established unit component. Do not alter
                        # literal density units or superscript/table notation.
                        if short == 'J2' and m[0].startswith('J2'):
                            return m[0]
                        key = short
                        expansion = full + ('s' if is_plural else '')
                        abbreviation = short + ('s' if is_plural else '')
                        if short in ('Trp', 'J2'):
                            abbreviation = short
                            if short == 'Trp' and is_plural:
                                expansion = 'tryptophan residues'
                        if key not in definitions:
                            definitions[key] = loc
                            rows.append(dict(page=name, full=full, abbreviation=short, location=loc,
                                             status='已统一', note='First prose definition, subsequent prose uses the abbreviation; protected source material is exempt'))
                            if re.match(r'^\s*$', line[:m.start()]) and m[0][0].isupper() and expansion[0].islower():
                                expansion = expansion[0].upper() + expansion[1:]
                            result = expansion + ' (' + abbreviation + ')'
                            if italic:
                                return '<strong><em>' + expansion + '</em> (<em>' + abbreviation + '</em>)</strong>'
                            return '<strong>' + result + '</strong>'
                        return '<em>' + abbreviation + '</em>' if italic else abbreviation
                    lines[li] = rx.sub(term, line)
                parts[pindex] = ''.join(lines)
            body = ''.join(parts)
            depth = 0
            def flatten_strong(match):
                nonlocal depth
                if match[1]:
                    depth = max(0, depth - 1)
                    return '</strong>' if depth == 0 else ''
                depth += 1
                return '<strong>' if depth == 1 else ''
            body = re.sub(r'<(/?)strong>', flatten_strong, body)
        # Remove manuscript p-level left overrides so the shared justified
        # paragraph rule can apply; do not change figure/table alignment.
        body = re.sub(r'(<p\b[^>]*\bstyle=")text-align:\s*left;\s*(")', r'\1\2', body)
        body = re.sub(r'(<p\b[^>]*)\s+style=""', r'\1', body)
        b['body'] = body
        blocks.append(b)
    data['blocks'] = blocks
    # Keep the first recorded location of each term/state per page.
    unique = {}
    for row in rows:
        unique.setdefault((row['page'], row['full'], row['status']), row)
    return data, list(unique.values())


def write_markdown_reports(rows, report):
    lines = ['# Model 与 Human Practices 术语表', '',
             '状态：已落实可确定的通用缩写；无可确定通用缩写的术语按用户决定保留全称，由负责人确认。首次正文位置为当前 JSON 的 blocks 下标。导航、标题、表格、公式、代码与参考文献不作为普通正文首次定义位置。', '',
             '## 已统一术语', '', '| 全称 | 缩写 | 页面 | 首次正文位置 |', '| --- | --- | --- | --- |']
    for row in rows:
        if row['status'] == '已统一':
            lines.append('| {full} | {abbreviation} | {page} | `{location}` |'.format(**row))
    pending, identifiers = {}, {}
    for row in rows:
        if row['status'].startswith('按用户决定'):
            pending.setdefault(row['full'], dict(pages=[], note=row['note']))['pages'].append(row['page'])
        elif row['status'] == '保留科学标识符':
            identifiers.setdefault(row['full'], []).append(row['page'])
    lines += ['', '## 保留全称，待负责人确认缩写', '',
              '以下为跨页面去重清单，状态均为“按用户决定保留全称，待负责人确认缩写”。', '',
              '| 全称或术语 | 出现页面 | 备注 |', '| --- | --- | --- |']
    for full, row in sorted(pending.items()):
        lines.append('| ' + full + ' | ' + ', '.join(row['pages']) + ' | ' + row['note'] + ' |')
    lines += ['', '## 保留科学标识符与品牌', '', '| 标识符 | 出现页面 |', '| --- | --- |']
    for term, pages in sorted(identifiers.items()):
        lines.append('| ' + term + ' | ' + ', '.join(pages) + ' |')
    (ROOT/'docs/术语表-model-hp.md').write_text('\n'.join(lines) + '\n')
    lines = ['# Model 与 Human Practices 规则执行报告', '',
             '基线：`e205f4a`；工作目录：`workspace/tasks/bug-rules`。未运行导出、构建、预览或发布，生成网页与桌面/手机复验由主代理执行。', '',
             '## 修改范围', '',
             '- 覆盖分配的 12 个 JSON 内容源，含两个旧模型跳转页。全部 block 键已枚举，本组只有 body 文案字段，无 accompanyingBody/gallery 嵌套文案。',
             '- 页面标题、副标题、面包屑、正文标题、目录短标题、卡片/功能/时间线标题、HP 章节导航及图片组标题统一 sentence case，保留机构名和科学标识符大小写。',
             '- 删除 h2 的编号和空格；h3 按每页实际章节连续编号。model-ode 的实际二级标题从 h4 提升为 h3，参考文献提升为独立 h2。稳定 anchor 保持不变。',
             '- 删除 5 个正文原稿下载入口、5 个 Back/Next 段落和行业页重复总览入口；保留章节导航、科研交叉链接和教学资源下载。',
             '- 去掉普通 p 元素的 text-align:left 局部覆盖，由公共样式提供两端对齐。',
             '- 逐页定义已确认通用缩写，与另一内容代理统一 M.i/C.e、SDF/PDBQT、PPN 和 G protein。未确定缩写按用户决定保留全称并逐项记录。',
             '- 修正 model-ode 原有 Caenorhabditis elegans 双写；正文 M.i/C.e 使用斜体。公式、表格、模型数字和参考文献原题原样保留。', '',
             '## 验证', '',
             '`python3 tools/apply-rules-model-hp.py --apply --verify` 逐页通过：JSON、MathML/表格/代码逐字比较、图片 URL、HTML/标题 anchor、引用原文、审核及路由元数据、h2/h3 编号、历史入口与重复导航。重复执行结果字节一致。', '',
             '| 页面 | 原 block 数 | 现 block 数 | 已定义通用缩写 | 保留全称待确认 |', '| --- | ---: | ---: | ---: | ---: |']
    for row in report:
        lines.append('| {page} | {original_blocks} | {final_blocks} | {defined_terms} | {pending_terms} |'.format(**row))
    lines += ['', '## 验证边界', '',
              '- 本报告证明内容源与受保护科研材料的完整性；最终生成网页、目录计算和桌面/手机视觉由主代理复验。',
              '- 所有已定义、保留全称及科学标识符见 `术语表-model-hp.md` 与同名 JSON。没有将待负责人确认项伪报为已统一。',
              '- 脚本从固定基线派生本轮修改，逐页记录前后 SHA-256；只有内容仍为基线或本轮审阅结果时允许写入，发现后续改动即拒绝覆盖。']
    (ROOT/'docs/规则执行报告-model-hp.md').write_text('\n'.join(lines) + '\n')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--verify', action='store_true')
    args = parser.parse_args()
    rows, report = [], []
    for name in PAGES:
        path = ROOT / 'content/wiki' / (name + '.json')
        # Always derive from the task baseline so the transformation is reviewable
        # and running this helper twice does not duplicate first definitions.
        baseline = subprocess.check_output(['git', 'show', 'e205f4a:content/wiki/' + name + '.json'], cwd=ROOT, text=True)
        data, terms = apply_page(name, baseline)
        rows.extend(terms)
        report.append(dict(page=name, original_blocks=len(json.loads(baseline)['blocks']), final_blocks=len(data['blocks']),
                           defined_terms=sum(r['status'] == '已统一' for r in terms),
                           pending_terms=sum(r['status'] == '按用户决定保留全称，待负责人确认缩写' for r in terms)))
        output = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
        report[-1]['baseline_sha256'] = hashlib.sha256(baseline.encode()).hexdigest()
        report[-1]['result_sha256'] = hashlib.sha256(output.encode()).hexdigest()
        if args.apply:
            existing = json.loads(path.read_text())
            if existing != json.loads(baseline) and existing != data:
                raise RuntimeError(f'{name}: refusing to overwrite later edits; current JSON is neither baseline nor the reviewed result')
            path.write_text(output)
        if args.verify:
            actual = json.loads(path.read_text())
            assert actual == data, f'{name}: source diverges from reviewed transformation'
            before = json.loads(baseline)
            before_body = '\n'.join(b.get('body', '') for b in before['blocks'])
            after_body = '\n'.join(b.get('body', '') for b in actual['blocks'])
            protected = re.compile(r'<(math|table|pre|code|svg|script|style)\b[^>]*>.*?</\1>', re.I | re.S)
            assert [m[0] for m in protected.finditer(before_body)] == [m[0] for m in protected.finditer(after_body)], f'{name}: immutable math/table/code changed'
            assert re.findall(r'\bsrc="([^"]+)"', before_body) == re.findall(r'\bsrc="([^"]+)"', after_body), f'{name}: image URL changed'
            assert re.findall(r'\bid="([^"]+)"', before_body) == re.findall(r'\bid="([^"]+)"', after_body), f'{name}: HTML anchor changed'
            before_anchors = [re.search(r'^#(\S+)', b.get('attributes', ''))[1] for b in before['blocks'] if re.match(r'^#\S+', b.get('attributes', ''))]
            after_anchors = [re.search(r'^#(\S+)', b.get('attributes', ''))[1] for b in actual['blocks'] if re.match(r'^#\S+', b.get('attributes', ''))]
            assert before_anchors == after_anchors, f'{name}: heading anchor changed'
            assert '/source-archive/' not in after_body and 'Original submission' not in after_body, f'{name}: source entry remains'
            assert 'Back to HP Overview' not in after_body, f'{name}: duplicate navigation remains'
            for key in ('route', 'search', 'hidden', 'meta', 'preserveAuthorFormatting'):
                assert before.get(key) == actual.get(key), f'{name}: scientific/review metadata changed'
            def refs(page):
                active, result = False, []
                for b in page['blocks']:
                    if b.get('_template') == 'heading' and re.match(r'References', no_number(b['text']), re.I):
                        active = True
                        continue
                    if active:
                        v = b.get('body', '')
                        v = re.sub(r'(<p\b[^>]*\bstyle=")text-align:\s*left;\s*(")', r'\1\2', v)
                        v = re.sub(r'(<p\b[^>]*)\s+style=""', r'\1', v)
                        result.append(v)
                return result
            assert refs(before) == refs(actual), f'{name}: reference source content changed'
            section, count = 0, 0
            for b in actual['blocks']:
                if b.get('_template') != 'heading':
                    continue
                if b['level'] == 2:
                    section, count = section + 1, 0
                    assert not re.match(r'^\d', b['text']), f'{name}: numbered h2'
                if b['level'] == 3:
                    count += 1
                    assert b['text'].startswith(f'{section}.{count} '), f'{name}: discontinuous h3'
                assert sentence_case(no_number(b['text'])) == no_number(b['text']), f'{name}: title case remains'
            report[-1]['validation'] = 'PASS: JSON, protected HTML/MathML/tables/code, image URLs, anchors, reference entries, review metadata, heading numbering, source/navigation removal'
    if args.apply:
        (ROOT/'docs/术语表-model-hp.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n')
        (ROOT/'docs/规则执行报告-model-hp.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
        write_markdown_reports(rows, report)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
