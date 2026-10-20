"""Apply the reviewed, DOM-extracted Feishu Members snapshot without changing portraits."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source_path = root / 'docs/members-feishu-20261021.json'
source = json.loads(source_path.read_text())
people = {}
for chunk in source['chunks']:
    lines = [s.strip() for s in ''.join(chunk['text']).split('\u200b') if s.strip()]
    for i, line in enumerate(lines):
        if line != 'Front' or not i:
            continue
        fields = {}
        j = i + 1
        while j < len(lines) and lines[j] != 'Back':
            if ':' in lines[j]:
                key, value = lines[j].split(':', 1)
                fields[key] = value.strip()
            j += 1
        if j + 1 < len(lines) and len(lines[j + 1]) > 90:
            name = lines[i - 1]
            person = {'name': name, **fields, 'introduction': lines[j + 1]}
            if name in people:
                assert person == people[name], name
            people[name] = person
assert len(people) == 27
source['people'] = list(people.values())
source_path.write_text(json.dumps(source, ensure_ascii=False, indent=2) + '\n')

path = root / 'content/wiki/members.json'
doc = json.loads(path.read_text())
old = {p['anchor']: p for b in doc['blocks'] if b['_template'] == 'membergrid' for p in b['items']}
anchors = [
    'jie-fan', 'ruoxi-yang-student-leader', 'fu-xinya', 'chen-feiyue',
    'chang-wang', 'shizhao-zheng', 'ivy-liu', 'kuang-yinzi', 'zhang-hongbo',
    'yuanwen-luo', 'wang-qinghua', 'ziyi-peng', 'zhiyuan-guan-student',
    'yanmei-song-student', 'shulan-ye-student', 'huang-xinqi', 'ma-peisong',
    'kaiben-zhang', 'han-xinyu', 'song-xinying', 'chen-yuxin', 'chen-jiarui',
    'peng-lin-wei', 'zhiyi-zhu', 'zhanning-zhang-advisor', 'ruitong-bai', 'yiling-chen',
]
assert len(old) == len(anchors) == len(people)
updated = {}
for (name, p), anchor in zip(people.items(), anchors):
    previous = old[anchor]
    # Existing identifiers and CDN portrait mappings survive name/order corrections.
    updated[name] = {
        'anchor': anchor, 'image': previous['image'], 'name': name,
        'role': p.get('Role', ''), 'academicStatus': p.get('Academic Status', ''),
        'university': p.get('University', ''), 'group': p.get('Group', ''),
        'tags': p.get('Tags', ''), 'outsideTheLab': p.get('Outside the Lab', ''),
        'introduction': p['introduction'],
    }

def heading(text, level, anchor):
    return {'_template': 'heading', 'text': text, 'level': level,
            'attributes': f'#{anchor} toc="{text}"'}

def grid(names, level):
    return {'_template': 'membergrid', 'headingLevel': level, 'items': [updated[n] for n in names]}

names = list(people)
doc['blocks'] = [doc['blocks'][0],
    heading('Team PI', 2, 'team-pi-advisor'), grid(names[:1], 3),
    heading('Student leaders', 2, 'student-leaders'), grid(names[1:3], 3),
    heading('Wet lab', 2, 'wet-lab'), grid(names[3:12], 3),
    heading('Dry lab', 2, 'dry-lab'), grid(names[12:16], 3),
    heading('Human practices', 2, 'human-practices'), grid(names[16:22], 3),
    heading('Other members', 2, 'visual-design'),
    heading('Advisors', 3, 'advisors'), grid(names[22:25], 4),
    heading('Visual design', 3, 'visual-design-members'), grid(names[25:], 4),
]
path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n')
print(f'Updated {len(updated)} members from {source["url"]}')
