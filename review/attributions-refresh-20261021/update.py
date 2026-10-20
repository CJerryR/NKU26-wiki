import copy,json,re,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[2]
source=json.loads((Path(__file__).parent/'feishu-blocks.json').read_text())
clean=lambda s:re.sub('[\u200b-\u200f\ufeff]','',s).strip()
source=[dict(b,text=clean(b['text'])) for b in source if 2<=int(b['id'])<=286]
file=root/'content/wiki/attributions.json';d=json.loads(file.read_text());old=json.loads(subprocess.check_output(['git','show','dd7a475:content/wiki/attributions.json'],cwd=root,text=True))
people=[i for b in old['blocks'] if b['_template']=='creditgrid' for i in b['items']]
aliases=['Jie Fan','Penglin Wei','Zhiyi Zhu','Zhanning Zhang','Xinya Fu','Ruoxi Yang','Feiyue Chen','Hongbo Zhang','Chang Wang','Yifei Liu','Yinzi Kuang','Yuanwen Luo','Qinghua Wang','Shizhao Zheng','Ziyi Peng','Xinqi Huang','Yanmei Song','Shulan Ye','Zhiyuan Guan','Peisong Ma','Xinying Song','Yuxin Chen','Jiarui Chen','Kaiben Zhang','Xinyu Han','Ruitong Bai','Yiling Chen']
assert len(people)==len(aliases)==27
lookup=dict(zip(aliases,people));blocks=[];expected=[];current=None
oldheads={re.sub(r'^\d+(?:\.\d+)*\s+','',b['text']).lower():b for b in old['blocks'] if b['_template']=='heading'}
heading_overrides={'Team Member Contributions':'Team member contributions','Team PI':'Team PI','Student Members':'Student members','Student Leaders':'Student leaders','Student Team Members':'Student team members','Student Team Members — Wet Lab':'Student team members — wet lab','Student Team Members — Dry Lab':'Student team members — dry lab','Student Team Members — Human Practices':'Student team members — human practices','Other Members':'Other members','Advisors':'Advisors','Others':'Others','AI Tool Use':'AI tool use','Human Review and Responsibility':'Human review and responsibility','iGEM & Partner Offers':'iGEM & partner offers','External Contributions':'External contributions'}
anchors={'Team PI':'team-pi-advisor','Student Team Members — Wet Lab':'wet-lab','Student Team Members — Dry Lab':'dry-lab','Student Team Members — Human Practices':'human-practices','Other Members':'visual-design','Advisors':'advisors','Others':'others','Human Review and Responsibility':'human-review-responsibility'}
def paragraph(t):
 return re.sub(r'(?m)^([A-Za-z][A-Za-z /–-]{1,34}:)',r'**\1**',t)
for b in source:
 t=b['text'];cls=b['cls']
 if 'heading' in cls:
  current=None
  if t in lookup:
   p=lookup[t]; current={k:p[k] for k in ['anchor','image','chineseName']};current.update(name=t,role='',tasks='',specificTasks=[])
   if not blocks or blocks[-1]['_template']!='creditgrid':blocks.append({'_template':'creditgrid','headingLevel':4,'items':[]})
   blocks[-1]['items'].append(current);expected.append({'name':t,'anchor':current['anchor'],'tasks':'','specificTasks':[]});continue
  level=int(re.search('heading(\d)',cls)[1])+1
  text=heading_overrides.get(t,t)
  existing=oldheads.get(text.lower());anchor=anchors.get(t) or (re.search(r'#([^ ]+)',existing['attributes'])[1] if existing else re.sub('[^a-z0-9]+','-',t.lower()).strip('-'))
  blocks.append({'_template':'heading','text':text,'level':level,'attributes':f'#{anchor} toc="{text}"'});continue
 if current is not None:
  if t.startswith('Tasks:'):
   current['tasks']=t.split(':',1)[1].strip();expected[-1]['tasks']=current['tasks']
  elif 'ordered-block' in cls:
   value=re.sub(r'^\d+\.\s*','',t);current['specificTasks'].append({'text':value});expected[-1]['specificTasks'].append(value)
  else:assert t in ('Specific Tasks',''),(b['id'],t)
 elif 'sheet-block' in cls:
  blocks.append(copy.deepcopy(next(x for x in old['blocks'] if x['_template']=='datatable')))
 elif 'text-block' in cls and t:
  if blocks and blocks[-1]['_template']=='text':blocks[-1]['body']+='\n\n'+paragraph(t)
  else:blocks.append({'_template':'text','body':paragraph(t)})
d['blocks']=blocks
assert len(expected)==27
assert {i['anchor']:i['image'] for b in blocks if b['_template']=='creditgrid' for i in b['items']}=={i['anchor']:i['image'] for i in people}
file.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
(Path(__file__).parent/'expected-people.json').write_text(json.dumps(expected,ensure_ascii=False,indent=2)+'\n')
(Path(__file__).parent/'source.txt').write_text('\n\n'.join(b['text'] for b in source)+'\n')
print('Updated',len(expected),'people;',sum(len(p['specificTasks']) for p in expected),'specific tasks')
print('Order:',', '.join(p['name'] for p in expected))
