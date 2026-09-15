(function(root){
  'use strict';
  const defaults={name:'Production inference',hardware:'GPU cluster',units:32,throughput:1800,activeWatts:1000,idleWatts:250,utilization:65,availability:99,pue:1.2,demand:80,outputShare:25,inputPrice:1,outputPrice:4,capex:35000,lifetime:3,electricity:0.09,maintenance:5,labor:6000,network:1200,software:800,facility:1200,cloudRate:2.5,apiInput:1.5,apiOutput:6,powerBudget:0.1};
  const limits={units:[1,100000,true],throughput:[1,1e8],activeWatts:[1,1e7],idleWatts:[0,1e7],utilization:[1,100],availability:[1,100],pue:[1,3],demand:[0,1e6],outputShare:[0,100],inputPrice:[0,1e5],outputPrice:[0,1e5],capex:[0,1e9],lifetime:[0.5,20],electricity:[0,10],maintenance:[0,100],labor:[0,1e9],network:[0,1e9],software:[0,1e9],facility:[0,1e9],cloudRate:[0,1e6],apiInput:[0,1e5],apiOutput:[0,1e5],powerBudget:[0.001,1e5]};
  function validate(s){
    const errors={};if(!s||typeof s!=='object')return {scenario:'Invalid scenario'};
    for(const [key,[min,max,integer]] of Object.entries(limits))if(typeof s[key]!=='number'||!Number.isFinite(s[key])||s[key]<min||s[key]>max||(integer&&!Number.isInteger(s[key])))errors[key]=`Enter ${integer?'a whole number':'a number'} from ${min} to ${max}.`;
    if(s.idleWatts>s.activeWatts)errors.idleWatts='Idle power cannot exceed active power.';
    for(const k of ['name','hardware'])if(typeof s[k]!=='string'||!s[k].trim()||s[k].length>80)errors[k]='Enter a label (1–80 characters).';
    return errors;
  }
  function calculate(s){
    if(Object.keys(validate(s)).length)throw new Error('Invalid scenario inputs');
    const hours=730,seconds=hours*3600,u=s.utilization/100,a=s.availability/100;
    const capacity=s.units*s.throughput*u*a*seconds,requested=s.demand*1e9,served=Math.min(requested,capacity);
    const load=served/(s.units*s.throughput*seconds),powerKW=s.units*(s.idleWatts+(s.activeWatts-s.idleWatts)*load)*s.pue/1000,peakKW=s.units*s.activeWatts*s.pue/1000;
    const energyKWh=powerKW*hours,capital=s.units*s.capex;
    const costs={'Hardware amortization':capital/(s.lifetime*12),'Electricity':energyKWh*s.electricity,'Maintenance':capital*s.maintenance/100/12,'Operations':s.labor,'Network':s.network,'Software':s.software,'Facility':s.facility};
    const monthly=Object.values(costs).reduce((x,y)=>x+y,0),opex=monthly-costs['Hardware amortization'];
    const price=s.inputPrice*(1-s.outputShare/100)+s.outputPrice*s.outputShare/100,revenue=served/1e6*price,profit=revenue-monthly,cash=revenue-opex;
    const cloud=s.units*s.cloudRate*hours+s.labor+s.network+s.software,api=served/1e6*(s.apiInput*(1-s.outputShare/100)+s.apiOutput*s.outputShare/100);
    const maxUnits=Math.floor(s.powerBudget*1e6/(s.activeWatts*s.pue));
    return {capacity,requested,served,load,powerKW,peakKW,energyKWh,capital,costs,monthly,opex,price,revenue,profit,cash,cloud,api,maxUnits,unitCost:served>0?monthly/(served/1e6):null,margin:revenue>0?profit/revenue*100:null,payback:cash>0?capital/cash:null,shortfall:Math.max(0,requested-served),tco:capital+opex*s.lifetime*12,joules:served>0?energyKWh*3.6e6/served:null,mwYield:s.throughput*u*a*maxUnits,requiredUnits:Math.ceil(requested/(s.throughput*u*a*seconds))};
  }
  const api={defaults,limits,validate,calculate};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.Economics=api;
})(typeof globalThis!=='undefined'?globalThis:this);
