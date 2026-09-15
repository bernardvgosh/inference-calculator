const assert = require('node:assert/strict');
const E = require('../js/economics.js');
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function near(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-7 * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`); }
test('default inputs valid', () => assert.deepEqual(E.validate(E.defaults), {}));
test('known single-unit capacity and energy', () => {
  const r=E.calculate({...E.defaults,units:1,throughput:1000,utilization:100,availability:100,demand:10,activeWatts:1000,idleWatts:0,pue:1,electricity:0.1});
  near(r.capacity,2628000000); near(r.served,2628000000); near(r.energyKWh,730); near(r.costs.Electricity,73); near(r.joules,1);
});
test('zero demand retains idle and fixed costs without invalid ratios', () => {
  const r=E.calculate({...E.defaults,demand:0}); assert.equal(r.served,0); assert.equal(r.revenue,0); assert.equal(r.unitCost,null); assert.equal(r.payback,null); near(r.powerKW,9.6); assert.ok(r.monthly>0);
});
test('revenue uses served tokens and million-token prices', () => {
  const r=E.calculate({...E.defaults,demand:1,inputPrice:2,outputPrice:6,outputShare:25}); near(r.revenue,3000); near(r.served,1e9);
});
test('over-capacity demand cannot inflate revenue', () => {
  const a=E.calculate({...E.defaults,demand:10000}); const b=E.calculate({...E.defaults,demand:20000}); near(a.revenue,b.revenue); assert.ok(b.shortfall>a.shortfall);
});
test('lifetime TCO counts capital once', () => {
  const r=E.calculate(E.defaults); near(r.tco,r.capital+r.opex*36); near(r.tco,r.monthly*36);
});
test('peak power budget only fits whole units', () => {
  const r=E.calculate({...E.defaults,powerBudget:0.01}); assert.equal(r.maxUnits,8); assert.ok(r.maxUnits*1200<=10000);
});
test('nonpositive cash contribution has no payback', () => assert.equal(E.calculate({...E.defaults,inputPrice:0,outputPrice:0}).payback,null));
test('input bounds and finite numeric values enforced', () => {
  for(const [key] of Object.entries(E.limits))for(const bad of [null,NaN,Infinity,'1',-1])assert.ok(E.validate({...E.defaults,[key]:bad})[key],key);
  assert.ok(E.validate({...E.defaults,units:1.5}).units); assert.ok(E.validate({...E.defaults,idleWatts:2000}).idleWatts);
  assert.ok(E.validate(null).scenario);
});
test('availability and utilization reduce capacity', () => {
  const r=E.calculate({...E.defaults,units:1,throughput:1000,utilization:50,availability:80}); near(r.capacity,1051200000);
});
test('zero cost scenario remains finite', () => {
  const r=E.calculate({...E.defaults,capex:0,electricity:0,labor:0,network:0,software:0,facility:0}); assert.equal(r.monthly,0); assert.equal(r.unitCost,0); assert.equal(r.payback,0);
});
test('exported scenario round trips and is deterministic', () => {const s=JSON.parse(JSON.stringify(E.defaults));assert.deepEqual(E.calculate(s),E.calculate(E.defaults));});
console.log(`${passed} calculation tests passed.`);
