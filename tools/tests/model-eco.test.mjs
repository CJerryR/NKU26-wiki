import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateEconomicScenario } from '../../src/lib/model-eco.mjs';
const config = JSON.parse(fs.readFileSync(new URL('../../src/data/model-eco.json',import.meta.url),'utf8'));
test('reproduces the submitted density-100 profit table and both baselines', () => {
  const r=evaluateEconomicScenario(100,config);
  assert.equal(r.treatmentKey,'high');
  for(const [key,value] of Object.entries({noControl:-1828.19,uniform:14704.03,guided:15200.29,benefitVsNoControl:17028.48,benefitVsUniform:496.26})) {
    assert.ok(Math.abs(r[key]-value)<0.011,`${key}: ${r[key]}`);
  }
});
test('preserves the preset boundaries and shared-treatment comparison', () => {
  for(const [d,key] of [[0,'low'],[6,'low'],[9.999,'low'],[10,'middle'],[79.999,'middle'],[80,'high'],[869.6,'high']]) assert.equal(evaluateEconomicScenario(d,config).treatmentKey,key);
  for(const d of [10,40,79.999]) assert.ok(Math.abs(evaluateEconomicScenario(d,config).benefitVsUniform+5)<1e-9);
  assert.equal(evaluateEconomicScenario(0,config).relativeYield,1);
  assert.equal(evaluateEconomicScenario(6,config).relativeYield,1);
});
test('rejects nonnumeric, negative and unsupported density rather than returning stale numbers', () => {
  for(const d of ['',null,'100',NaN,Infinity,-1,869.601]) assert.throws(()=>evaluateEconomicScenario(d,config),RangeError);
});
