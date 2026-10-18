import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const read = file => JSON.parse(fs.readFileSync(file,'utf8'));
const slugs = fs.readdirSync('src/data/scenes').filter(f => f.endsWith('.json') && !f.endsWith('.atlas.json')).map(f => f.slice(0, -5));
for (const slug of slugs) {
  const layout=read(`src/data/scenes/${slug}.json`),atlas=read(`src/data/scenes/${slug}.atlas.json`);
  for(const kind of ['desktop','mobile']) {
    test(`${slug}/${kind}: every layer has a bounded frame, current atlas hash, and fits budget`,()=>{
      const a=atlas[kind],layers=layout[kind].layers,raw=fs.readFileSync(`static/img/scenes/${a.file}`);
      assert.ok(layers.length<=(kind==='mobile'?6:10));
      assert.ok(raw.length<=(kind==='mobile'?165000:290000));
      assert.equal(a.bytes,raw.length);
      assert.equal(a.hash,crypto.createHash('sha256').update(raw).digest('hex').slice(0,12));
      assert.equal(new Set(layers.map(l=>l.id)).size,layers.length);
      for(const l of layers) {
        const [x,y,w,h]=a.frames[l.prop];
        assert.ok(w>0&&h>0&&x>=0&&y>=0&&x+w<=a.size[0]&&y+h<=a.size[1]);
        assert.ok(l.win[0]<l.win[1]&&l.win[0]>=0&&l.win[1]<=1);
      }
    });
    if(layout.sharedFrames?.length) test(`${slug}/${kind}: animated pieces retain their shared camera frame`,()=>{
      const dimensions=layout.sharedFrames.map(name=>{
        const raw=fs.readFileSync(`assets/scenes/${slug}/${name}.png`);
        const source=[raw.readUInt32BE(16),raw.readUInt32BE(20)];
        const frame=atlas[kind].frames[name].slice(2);
        assert.ok(Math.abs(frame[0]/frame[1]-source[0]/source[1])<.004,'transparent camera margins were cropped');
        return frame;
      });
      for(const dim of dimensions)assert.deepEqual(dim,dimensions[0]);
    });
  }
}
test('extra pages keep empty copy and do not assert an award or named supporter',()=>{
  for(const slug of ['awards','acknowledgements']) {
    const page=read(`content/optional/${slug}.json`);
    assert.deepEqual(page.blocks,[]);
    assert.equal(page.search,false);
    assert.equal(fs.existsSync(`content/wiki/${slug}.json`),false);
    assert.equal(fs.existsSync(`src/content/pages/${slug}.md`),false);
    assert.ok(fs.existsSync(`src/content/optional/${slug}.md`));
  }
});
