export function createConnectionStateStore(){
  let state=Object.freeze({status:'DISCONNECTED',deviceId:null,sessionId:null,error:null});
  const listeners=new Set();
  return {
    getState:()=>state,
    subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener)},
    update(patch){state=Object.freeze({...state,...patch});for(const fn of listeners)fn(state);return state;}
  };
}
