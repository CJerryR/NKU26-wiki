import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const src=fs.readFileSync('static/js/home-pager.js','utf8');
const helper=src.slice(src.indexOf('  function makeStoryWheel()'),src.indexOf('  // End wheel intent helper.'));
const make=vm.runInNewContext(helper+';makeStoryWheel');
test('trackpad swipe and long decaying momentum produce one step',()=>{
 const input=make(), out=[];
 [4,12,24,35,29,24,20,16,12,9,7,5,4,3,2,1,...Array(50).fill(.6)].forEach((v,i)=>{const a=input(v,0,i*16);if(a)out.push(a);});
 assert.equal(out.length,1);assert.equal(out[0].mode,'trackpad');
});
test('renewed gentle push during momentum is accepted',()=>{
 const input=make();[5,10,15,12,...Array(25).fill(2)].forEach((v,i)=>input(v,0,i*16));
 const actions=[10,16,20].map((v,i)=>input(v,0,480+i*16)).filter(Boolean);
 assert.equal(actions.length,1);assert.equal(actions[0].dir,1);
});
test('line-mode and discrete pixel wheel ticks advance separately',()=>{
 for(const mode of [0,1]){const input=make();assert.ok(input(96,mode,0));assert.ok(input(96,mode,240));assert.ok(input(96,mode,480));}
});
test('reverse swipe and switching input device are recognized',()=>{
 const input=make();assert.ok(input(120,0,0));
 assert.equal(input(-8,0,50),null);assert.equal(input(-18,0,66).dir,-1);
 assert.equal(input(96,1,400).mode,'wheel');
});
