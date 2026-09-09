import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {useDemoStudio} from '../src/demo-walkthrough/controller';
import type {StudioAdapter} from '../src/demo-walkthrough/adapter';
import type {StudioController,Recording,Workflow} from '../src/demo-walkthrough/contracts';
test('shared controller loads, seeks, changes actors/branches and disposes without host state code',async()=>{
 const win=new Window({url:'https://example.invalid'});Object.assign(globalThis,{window:win,document:win.document,ResizeObserver:win.ResizeObserver,IS_REACT_ACT_ENVIRONMENT:true});
 const w:Workflow={id:'unrelated',title:'Order review',description:'test',defaultActor:'buyer',nodes:[{id:'one',label:'Buy',path:'/one',surface:'store',expected:'test',actor:'buyer'},{id:'two',label:'Review',path:'/two',surface:'desk',expected:'test',actor:'reviewer'}],edges:[['one','two']],route:['one','two'],chapters:[{label:'Buy',steps:['one']},{label:'Review',steps:['two']}],branches:[{id:'review',label:'Review only',steps:['two']}]};
 const run:Recording={id:'r',workflow:w.id,createdAt:new Date().toISOString(),outcome:'passed',captures:w.nodes.map((n,i)=>({stepId:n.id,at:i*4000,surface:n.surface,html:'',url:'https://example.invalid'+n.path,heading:n.label}))};
 const navigation:any[]=[];
 const adapter:StudioAdapter={id:'test',workflows:[w],actors:[{id:'buyer',label:'Buyer'},{id:'reviewer',label:'Reviewer'}],surfaces:[{id:'store',label:'Store',initialPath:'/one',url:p=>'https://example.invalid'+p,origins:['https://example.invalid']},{id:'desk',label:'Desk',initialPath:'/two',url:p=>'https://example.invalid'+p,origins:['https://example.invalid']}],guide:()=>({caption:'Test',action:'inspect'}),store:{list:async()=>[run],save:async()=>{}},plan:()=>({prepare:async()=>({}),steps:()=>[]}),prepareSnapshot:c=>c.html,navigation:{read:()=>({recording:'latest'}),write:v=>navigation.push(v)}};
 let state:StudioController;
 function Probe(){state=useDemoStudio(adapter);return React.createElement('div',null,state.node.label);}
 const element=win.document.createElement('div');win.document.body.append(element);const root=createRoot(element as unknown as HTMLElement);
 await act(async()=>{root.render(React.createElement(Probe));});
 assert.equal(state!.mode,'replay');assert.equal(state!.node.id,'one');
 await act(async()=>state!.select('two'));assert.equal(state!.time,4000);assert.equal(state!.handoff,true);
 await act(async()=>state!.crossHandoff());assert.equal(state!.actor,'reviewer');assert.equal(state!.handoff,false);
 await act(async()=>{state!.setBranch('review');state!.setTime(0);});assert.deepEqual(state!.playback.map(c=>c.stepId),['two']);
 await act(async()=>state!.fresh());assert.equal(state!.mode,'live');assert.equal(state!.recording,null);assert.equal(state!.node.id,'two');assert.ok(navigation.length>0);
 await act(async()=>root.unmount());
});
