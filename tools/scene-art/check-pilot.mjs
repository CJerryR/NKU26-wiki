/** Real-build browser QA, never the stand-alone mock hero. */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const out = path.resolve(process.env.SCENE_QA_OUT || '../../outputs/codex-3d-pilot-20261018');
await fs.mkdir(out, {recursive:true});
const base = process.env.SCENE_QA_URL || 'http://127.0.0.1:8793';
const browser = await chromium.launch({channel:'chrome',headless:true});
const report=[];
for (const [slug,route] of [['model-docking','model-docking'],['awards','awards'],['acknowledgements','acknowledgements']]) {
  for(const [width,height] of [[1440,900],[390,844]]) {
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    const errors=[],failed=[],atlases=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.url().includes('/img/scenes/'))atlases.push({url:r.url(),status:r.status()}); if(r.status()>=400 && new URL(r.url()).hostname==='127.0.0.1')failed.push({url:r.url(),status:r.status()});});
    await page.goto(`${base}/${route}/`,{waitUntil:'networkidle',timeout:60000});
    await page.evaluate(()=>document.fonts.ready);
    const range=await page.locator('[data-scene]').evaluate(el=>el.offsetHeight-el.querySelector('.scene__stage').offsetHeight);
    for(const progress of [0,.5,1]) {
      await page.evaluate(y=>window.scrollTo(0,y),range*progress);await page.waitForTimeout(450);
      await page.screenshot({path:path.join(out,`${slug}-${width}-p${progress*100}.png`)});
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    await page.locator('.scene__skip').focus();await page.keyboard.press('Enter');await page.waitForTimeout(500);
    const skip=await page.locator('#content').evaluate(el=>({top:el.getBoundingClientRect().top,focused:document.activeElement===el}));
    report.push({slug,width,height,range,overflow,skip,errors,failed,atlases});
    await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});
    report.at(-1).reduced=await page.locator('[data-scene]').evaluate(el=>({height:el.offsetHeight,stage:el.querySelector('.scene__stage').offsetHeight,position:getComputedStyle(el.querySelector('.scene__stage')).position}));
    await page.close();
  }
}
await browser.close();await fs.writeFile(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(report.some(r=>r.overflow||r.errors.length||r.failed.length||!r.skip.focused||r.reduced.position==='sticky'))process.exitCode=1;
