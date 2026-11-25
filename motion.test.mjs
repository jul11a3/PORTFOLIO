// Run with: node motion.test.mjs
import assert from 'node:assert/strict';
import {createTransition} from './motion.mjs';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const unhandled=[];const onUnhandled=error=>unhandled.push(error);process.on('unhandledRejection',onUnhandled);
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};}
function mockDocument(){
  const calls=[];
  return{calls,startViewTransition(update){
    const ready=deferred(),finished=deferred(),done=deferred();
    const call={update,ready,finished,done,skips:0};calls.push(call);
    return{ready:ready.promise,finished:finished.promise,updateCallbackDone:done.promise,skipTransition(){call.skips++;const error=Object.assign(new Error('Skipped'),{name:'AbortError'});ready.reject(error);finished.reject(error);done.reject(error);}};
  }};
}
const errors=[];const settings={onError:error=>errors.push(error)};
{
  const doc=mockDocument(),transition=createTransition(doc,{matches:false},settings);let applied=0;
  transition(()=>applied++);const call=doc.calls[0];call.update();call.done.resolve();call.ready.resolve();call.finished.resolve();await wait(0);call.update();assert.equal(applied,1);
}
{
  const doc=mockDocument(),transition=createTransition(doc,{matches:false},settings);let applied=0;
  transition(()=>applied++);const call=doc.calls[0];call.ready.reject(Object.assign(new Error('Capture timed out'),{name:'TimeoutError'}));await wait(0);call.update();assert.equal(applied,1);assert.equal(call.skips,1);
}
{
  const doc=mockDocument(),transition=createTransition(doc,{matches:false},settings);let applied=0;const before=Date.now();
  transition(()=>applied++);await wait(190);assert.equal(applied,1);assert.ok(Date.now()-before>=150);const call=doc.calls[0];assert.equal(call.skips,1);call.update();assert.equal(applied,1);
}
{
  const doc=mockDocument(),transition=createTransition(doc,{matches:false},settings),order=[];let language='zh',route='home';
  transition(()=>{language=language==='zh'?'en':'zh';order.push('language');});
  transition(()=>{route='articles';order.push('route');});
  assert.deepEqual(order,['language']);const first=doc.calls[0],second=doc.calls[1];second.update();first.update();second.done.resolve();second.ready.resolve();second.finished.resolve();await wait(0);
  assert.deepEqual(order,['language','route']);assert.equal(language,'en');assert.equal(route,'articles');assert.equal(first.skips,1);
}
{
  const doc=mockDocument(),transition=createTransition(doc,{matches:true},settings);let applied=0;transition(()=>applied++);assert.equal(applied,1);assert.equal(doc.calls.length,0);
}
await wait(0);assert.deepEqual(unhandled,[]);assert.deepEqual(errors,[]);process.off('unhandledRejection',onUnhandled);
console.log('PASS normal once / all transition promises handled / 160ms fallback / ordered rapid actions / reduced-motion sync; no unhandled rejections');
