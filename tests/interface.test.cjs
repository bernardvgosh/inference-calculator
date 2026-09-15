// Event-handler smoke tests using a minimal document adapter, not a browser renderer.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const sources=['economics.js','app.js'].map(f=>fs.readFileSync(path.join(__dirname,'../js',f),'utf8'));
function workspace(initial, brokenStorage=false){
  let html='', buttons=[];const downloads=[], store=new Map(initial?[['inference-enterprise-v2',JSON.stringify(initial)]]:[]),blobs=new Map(),fileInput={};
  const mount={get innerHTML(){return html;},set innerHTML(value){html=value;buttons=[...value.matchAll(/<button\b([^>]*)>/g)].map(m=>{const dataset={};for(const a of m[1].matchAll(/data-([a-z]+)="([^"]*)"/g))dataset[a[1]]=a[2];return {dataset,disabled:m[1].includes('disabled')};});}};
  const document={getElementById:id=>id==='root'?mount:fileInput,querySelectorAll:selector=>{const match=selector.match(/^\[data-([a-z]+)\]$/);return match?buttons.filter(b=>match[1] in b.dataset):[];},createElement:()=>({click(){downloads.push({name:this.download,blob:blobs.get(this.href)});}})};
  const context=vm.createContext({document,window:{print(){}},console,Intl,Blob,setTimeout:fn=>fn(),URL:{createObjectURL(blob){const id=String(blobs.size);blobs.set(id,blob);return id;},revokeObjectURL(){}},localStorage:{getItem:k=>{if(brokenStorage)throw Error('Disabled');return store.get(k)||null;},setItem:(k,v)=>{if(brokenStorage)throw Error('Disabled');store.set(k,v);}},confirm:()=>true});
  vm.runInContext(sources[0],context);context.window.Economics=context.Economics;vm.runInContext(sources[1],context);
  return {html:()=>html,click:(kind,value)=>{const b=buttons.find(b=>b.dataset[kind]===value);assert.ok(b,kind+' '+value);assert.ok(!b.disabled);b.onclick();},import:async data=>fileInput.onchange({target:{files:[{size:100,text:async()=>JSON.stringify(data)}]}}),downloads,store,defaults:context.Economics.defaults};
}
(async()=>{
  const w=workspace();assert.match(w.html(),/Economics overview/);assert.match(w.html(),/Cumulative infrastructure spend/);
  for(const [tab,text] of [['comparison','Own, rent, or use an API'],['capacity','Power-constrained deployment'],['sensitivity','Cost sensitivity matrix'],['scenarios','A home for your what-ifs'],['methodology','Transparent assumptions']]){w.click('tab',tab);assert.ok(w.html().includes(text),tab);}
  w.click('action','save');w.click('tab','scenarios');assert.match(w.html(),/1 of 20 snapshots/);w.click('load','0');assert.match(w.html(),/Scenario loaded/);
  w.click('action','export');const exported=JSON.parse(await w.downloads.at(-1).blob.text());assert.equal(exported.version,2);assert.equal(exported.results.served,80e9);
  w.click('action','csv');assert.match(await w.downloads.at(-1).blob.text(),/Hardware amortization/);
  await w.import({version:2,scenario:{...w.defaults,name:'<img src=x onerror=alert(1)>',demand:0}});assert.ok(w.html().includes('&lt;img'));assert.ok(!w.html().includes('<img src=x'));assert.match(w.html(),/No demand/);
  await w.import({version:2,scenario:{...w.defaults,units:-1}});assert.match(w.html(),/Import failed/);assert.match(w.html(),/No demand/);
  w.click('tab','scenarios');w.click('delete','0');assert.match(w.html(),/0 of 20 snapshots/);
  const recovered=workspace({scenario:{units:-1},saved:[null]});assert.match(recovered.html(),/Production inference/);
  const unavailable=workspace(null,true);assert.match(unavailable.html(),/Local data could not be read/);unavailable.click('action','save');assert.match(unavailable.html(),/Browser storage is unavailable/);
  console.log('Interface smoke tests passed: navigation, snapshots, exports, imports, escaping, and storage recovery.');
})().catch(error=>{console.error(error);process.exitCode=1;});
