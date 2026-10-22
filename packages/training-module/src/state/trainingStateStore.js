export function createTrainingStateStore(initial={status:'IDLE',scenarioId:null,sessionId:null,stepIndex:0,history:[],score:0}){
 let state=Object.freeze({...initial});const listeners=new Set();
 return {getState:()=>state,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},setState(next){state=Object.freeze({...next,history:Object.freeze([...(next.history??[])])});for(const fn of listeners)fn(state);return state}};
}
