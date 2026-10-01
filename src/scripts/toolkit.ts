// Custom elements reconnect automatically when Tina replaces an editable island.
import styles from '../styles/toolkit.css?raw';
const el = (tag, text = '', attrs = {}) => { const n = document.createElement(tag); n.textContent = text; for (const [k,v] of Object.entries(attrs)) n.setAttribute(k,String(v)); return n; };
const para = text => el('p', text || '', {class:'text'});
function asset(value) {
  if (!value) return '';
  if (String(value).startsWith('#')) return new URL(String(value), location.href).href;
  const root = new URL(document.documentElement.dataset.root || '/', location.href);
  const url = new URL(String(value).replace(/^\/(?!\/)/,''),root);
  if (!['http:','https:'].includes(url.protocol) || String(value).startsWith('//')) throw new Error('请使用网站内文件路径或 HTTPS 地址');
  return url.href;
}
function link(text, href) { const n=el('a',text,{href:asset(href),class:'link'}); n.rel='noopener'; return n; }
class WikiToolkit extends HTMLElement {
  static observedAttributes = ['data-props'];
  cleanup = () => {}; controller; generation=0;
  constructor(){super();this.attachShadow({mode:'open'});}
  connectedCallback(){this.render();}
  attributeChangedCallback(){if(this.isConnected)this.render();}
  disconnectedCallback(){this.cleanup();this.controller?.abort();}
  async render(){
    const generation=++this.generation;this.cleanup();this.controller?.abort();this.controller=new AbortController();
    const root=this.shadowRoot;root.replaceChildren(el('style',styles));
    const box=el('section','',{class:'box'});root.append(box);
    try{
      const d=JSON.parse(this.getAttribute('data-props')||'{}');
      if(d.title)box.append(el('h3',d.title));
      const area=el('div');box.append(area);
      const items=d.items||[];
      const button=(label,handler)=>{const b=el('button',label,{type:'button'});b.onclick=handler;return b;};
      const toolbar=()=>{const n=el('div','',{class:'toolbar'});area.append(n);return n;};
      const load=async()=>{
        if(!d.file)return '';
        const r=await fetch(asset(d.file),{signal:this.controller.signal});if(!r.ok)throw Error(`文件加载失败 HTTP ${r.status}`);return r.text();
      };
      const active=()=>this.isConnected&&generation===this.generation;
      switch(d._template){
        case 'tabs': {
          if(!items.length){area.append(para('请添加分栏条目。'));break;}
          const bar=toolbar();bar.setAttribute('role','tablist');bar.setAttribute('aria-label',d.title||'内容分栏');
          const buttons=[],panels=[];
          items.forEach((item,i)=>{const panel=el('div','',{role:'tabpanel',id:`panel-${i}`,'aria-labelledby':`tab-${i}`,tabindex:'0'});panel.append(para(item.text));panel.hidden=i!==0;panels.push(panel);
            const b=button(item.title||`分栏 ${i+1}`,()=>select(i));b.id=`tab-${i}`;b.setAttribute('role','tab');b.setAttribute('aria-controls',panel.id);buttons.push(b);bar.append(b);area.append(panel);
            b.onkeydown=e=>{const keys=['ArrowLeft','ArrowRight','Home','End'];if(!keys.includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowLeft'?-1:1)+items.length)%items.length;select(n);buttons[n].focus();};
          });
          function select(n){buttons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===n));b.tabIndex=i===n?0:-1;panels[i].hidden=i!==n;});}select(0);break;
        }
        case 'accordion':items.forEach(item=>{const n=el('details');n.append(el('summary',item.title||'展开'),para(item.text));area.append(n);});if(!items.length)area.append(para('请添加问答或访谈条目。'));break;
        case 'chronology':{
          const bar=toolbar(),select=el('select','',{'aria-label':'筛选分类'});select.append(el('option','全部分类',{value:''}));[...new Set(items.map(i=>i.category).filter(Boolean))].forEach(c=>select.append(el('option',c,{value:c})));bar.append(select);
          const timeline=el('div','',{class:'timeline'});area.append(timeline);
          const draw=()=>{timeline.replaceChildren();items.filter(i=>!select.value||i.category===select.value).forEach(i=>{const item=el('article','',{class:'event'});item.append(el('div',[i.date,i.category].filter(Boolean).join(' · '),{class:'date'}),el('h4',i.title||''),para(i.text));if(i.href)item.append(link('查看相关内容',i.href));timeline.append(item);});if(!timeline.childNodes.length)timeline.append(para('暂无事件。'));};select.onchange=draw;draw();break;
        }
        case 'protocol':{
          if(d.materials){area.append(el('h4','材料'));const ul=el('ul');d.materials.split('\n').filter(Boolean).forEach(t=>ul.append(el('li',t)));area.append(ul);}
          const progress=el('p','',{role:'status',class:'muted'});area.append(progress);let done=0;
          const update=()=>{progress.textContent=`已勾选 ${done} / ${items.length} 步（仅本次阅读，不作为实验记录）`;};
          items.forEach((i,n)=>{const row=el('label','',{class:'check'}),check=el('input','',{type:'checkbox'}),content=el('div');content.append(el('strong',`${n+1}. ${i.title||'步骤'}`),para(i.text));if(i.duration)content.append(el('small',i.duration));check.onchange=()=>{done+=check.checked?1:-1;update();};row.append(check,content);area.append(row);});update();break;
        }
        case 'lightbox':{
          const grid=el('div','',{class:'grid'}),dialog=el('dialog'),image=el('img'),description=para('');area.append(grid,dialog);
          const close=button('关闭',()=>dialog.close());dialog.append(close,image,description);dialog.onclick=e=>{if(e.target===dialog)dialog.close();};
          items.forEach(i=>{if(!i.image)return;const b=button('',()=>{image.src=asset(i.image);image.alt=i.title||'';description.textContent=i.text||i.title||'';dialog.showModal();close.focus();});b.append(el('img','',{src:asset(i.image),alt:i.title||'图片',loading:'lazy'}),para(i.title));grid.append(b);});if(!grid.childNodes.length)area.append(para('请添加图片。'));break;
        }
        case 'comparison':{
          if(!d.before||!d.after){area.append(para('请选择两张需要对比的图片。'));break;}
          const frame=el('div','',{class:'compare'});frame.append(el('img','',{src:asset(d.after),alt:d.afterLabel||'后图'}));const before=el('img','',{src:asset(d.before),alt:d.beforeLabel||'前图',class:'before'});frame.append(before);
          const range=el('input','',{type:'range',min:'0',max:'100',value:'50','aria-label':'左右图片分界位置'});range.style.width='100%';range.oninput=()=>before.style.clipPath=`inset(0 ${100-Number(range.value)}% 0 0)`;area.append(frame,range,para(`${d.beforeLabel||'前图'} ← 拖动分界 → ${d.afterLabel||'后图'}`));break;
        }
        case 'video':{
          if(!d.file){area.append(para('请选择 MP4 或 WebM 视频。'));break;}
          const video=el('video','',{controls:'',preload:'metadata',playsinline:'',src:asset(d.file)});if(d.poster)video.poster=asset(d.poster);
          if(d.subtitles){const track=el('track','',{kind:'subtitles',src:asset(d.subtitles),srclang:d.language||'zh',label:d.language||'中文字幕',default:''});video.append(track);}
          video.onerror=()=>area.append(para('视频无法播放，请检查格式或使用下载链接。'));area.append(video,link('下载视频',d.file));break;
        }
        case 'downloads':{
          const list=el('ul','',{class:'files'});items.forEach(i=>{const li=el('li');if(i.file){const a=link(i.title||'下载附件',i.file);a.setAttribute('download','');li.append(a);}else li.append(el('strong',i.title||'待上传附件'));li.append(para(i.text));list.append(li);});area.append(list);if(!items.length)area.append(para('请添加附件。'));break;
        }
        case 'equation':{
          if(!d.latex){area.append(para('请填写 LaTeX 公式。'));break;}
          root.append(el('link','',{rel:'stylesheet',href:asset('/widgets/vendor/katex/katex.min.css')}));
          const {default:katex}=await import('katex');if(!active())return;
          const math=el('div','',{class:'scroll'});katex.render(d.latex,math,{displayMode:true,throwOnError:true,trust:false,strict:'warn',maxExpand:500,maxSize:20});area.append(math);break;
        }
        case 'sequence':{
          const text=(await load())||d.sequence||'';if(!active())return;
          if(!text.trim()){area.append(para('请粘贴序列或选择 FASTA 文件。'));break;}
          const headers=text.match(/^>/gm)||[];if(headers.length>1)throw Error('请使用单条 FASTA 序列；当前文件包含多个记录。');
          const sequence=text.split('\n').filter(l=>!l.startsWith('>')).join('').replace(/\s/g,'').toUpperCase();
          const kind=d.sequenceType||'dna',valid=kind==='protein'?/^[ABCDEFGHIKLMNPQRSTVWXYZ*OUJ-]+$/:kind==='rna'?/^[ACGURYSWKMBDHVN-]+$/:/^[ACGTRYSWKMBDHVN-]+$/;
          if(!valid.test(sequence))throw Error('序列包含无效字符，请检查类型；不要粘贴行号。');
          let gc='';if(kind!=='protein'){const bases=(sequence.match(/[ACGTU]/g)||[]).length;gc=` · GC ${bases?((sequence.match(/[GC]/g)||[]).length/bases*100).toFixed(1):'—'}%（忽略模糊碱基）`;}
          area.append(para(`${sequence.length} ${kind==='protein'?'aa':'nt'}${gc}`));
          const bar=toolbar(),search=el('input','',{placeholder:'查找片段','aria-label':'查找序列片段'}),message=el('span','',{role:'status'});bar.append(search,message);
          bar.append(button('复制序列',async()=>{try{await navigator.clipboard.writeText(sequence);message.textContent='已复制';}catch{message.textContent='复制不可用，请手动选择序列。';}}));
          const ranges=(d.highlight||'').split(',').map(v=>v.trim().match(/^(\d+)-(\d+)$/)).filter(Boolean).map(m=>[Number(m[1]),Number(m[2])]);
          const pre=el('pre','',{class:'sequence',tabindex:'0'});area.append(pre);
          const draw=()=>{const q=search.value.replace(/\s/g,'').toUpperCase();const hit=q?sequence.indexOf(q):-1;message.textContent=q?(hit>=0?`首次出现于 ${hit+1}`:'未找到'):'';pre.replaceChildren();for(let start=0;start<sequence.length;start+=60){pre.append(document.createTextNode(String(start+1).padStart(6)+'  '));for(let j=start;j<Math.min(start+60,sequence.length);j++){const marked=ranges.some(([a,b])=>j+1>=a&&j+1<=b)||(hit>=0&&j>=hit&&j<hit+q.length);pre.append(marked?el('mark',sequence[j]):document.createTextNode(sequence[j]));}pre.append(document.createTextNode('\n'));}};
          if(sequence.length>100000)throw Error('当前阅读器适合不超过 100,000 个字符的单条序列，请拆分后展示。');search.oninput=draw;draw();break;
        }
        case 'datatable':case 'chart':{
          const text=(await load())||d.csv||'';if(!active())return;if(!text.trim()){area.append(para('请选择 CSV 文件或粘贴数据，首行为列名。'));break;}
          const {default:Papa}=await import('papaparse');if(!active())return;
          const parsed=Papa.parse(text.trim(),{skipEmptyLines:'greedy'});if(parsed.errors.length)throw Error(parsed.errors[0].message);
          const [headers,...rows]=parsed.data;if(!headers?.length||!rows.length)throw Error('CSV 需要列名和至少一行数据');if(rows.some(r=>r.length!==headers.length))throw Error('CSV 每行列数必须与表头一致');
          if(d._template==='chart'){
            if(headers.length<2)throw Error('图表至少需要两列：X 和 Y');
            const type=['line','bar','scatter'].includes(d.chartType)?d.chartType:'line';
            const colors=['#76568b','#52998a','#bf8741','#737fc1','#c06d86'];
            const datasets=headers.slice(1).map((label,k)=>({label,borderColor:colors[k%colors.length],backgroundColor:colors[k%colors.length],data:rows.map(r=>{if(!r[k+1].trim())return null;const y=Number(r[k+1]);if(!Number.isFinite(y))throw Error(`列 ${label} 包含非数字`);if(type==='scatter'){if(!r[0].trim()||!Number.isFinite(Number(r[0])))throw Error('散点图第一列需要数字');return{x:Number(r[0]),y};}return y;}),spanGaps:false}));
            const frame=el('div','',{class:'chart'}),canvas=el('canvas','',{role:'img','aria-label':d.title||'数据图表'});frame.append(canvas);area.append(frame);
            const {default:Chart}=await import('chart.js/auto');if(!active())return;
            const chart=new Chart(canvas,{type,data:{labels:rows.map(r=>r[0]),datasets},options:{responsive:true,maintainAspectRatio:false,animation:!matchMedia('(prefers-reduced-motion: reduce)').matches,scales:{x:{title:{display:!!d.xLabel,text:d.xLabel}},y:{title:{display:!!d.yLabel,text:d.yLabel}}}}});this.cleanup=()=>chart.destroy();
            const download=button('下载图表 PNG',()=>{const a=el('a','',{download:'chart.png',href:chart.toBase64Image()});a.click();});toolbar().append(download);
          }
          const bar=toolbar(),search=el('input','',{placeholder:'筛选表格','aria-label':'筛选表格'}),status=el('span','',{role:'status'});bar.append(search,status);
          const table=el('table'),head=el('thead'),tr=el('tr'),body=el('tbody');table.append(head,body);head.append(tr);const scroll=el('div','',{class:'scroll',tabindex:'0'});scroll.append(table);area.append(scroll);
          let sort=-1,asc=true,page=0;const pagination=toolbar();const previous=button('上一页',()=>{page--;draw();}),next=button('下一页',()=>{page++;draw();});pagination.append(previous,next);
          headers.forEach((name,k)=>{const th=el('th','',{scope:'col'});th.append(button(name,()=>{asc=sort===k?!asc:true;sort=k;page=0;head.querySelectorAll('th').forEach((cell,i)=>cell.setAttribute('aria-sort',i===k?(asc?'ascending':'descending'):'none'));draw();}));tr.append(th);});
          function draw(){let result=rows.filter(row=>row.join(' ').toLowerCase().includes(search.value.toLowerCase()));if(sort>=0)result=[...result].sort((a,b)=>{const x=a[sort],y=b[sort];const compare=x.trim()&&y.trim()&&Number.isFinite(+x)&&Number.isFinite(+y)?+x-+y:x.localeCompare(y);return asc?compare:-compare;});page=Math.max(0,Math.min(page,Math.ceil(result.length/25)-1));body.replaceChildren();result.slice(page*25,page*25+25).forEach(row=>{const tr=el('tr');row.forEach(value=>tr.append(el('td',value)));body.append(tr);});status.textContent=`${result.length} 行 · 第 ${page+1} 页`;previous.disabled=page===0;next.disabled=(page+1)*25>=result.length;}
          search.oninput=()=>{page=0;draw();};draw();break;
        }
        default:throw Error('未知组件类型');
      }
      if(d.caption)box.append(el('p',d.caption,{class:'caption'}));
    }catch(error){if(error.name==='AbortError')return;if(generation===this.generation)box.append(el('p',error.message||String(error),{class:'error',role:'alert'}));}
  }
}
if(!customElements.get('wiki-toolkit'))customElements.define('wiki-toolkit',WikiToolkit);
