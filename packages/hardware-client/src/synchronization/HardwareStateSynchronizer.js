import {makeHardwareFeedback} from '@trainex/contracts';
export class HardwareStateSynchronizer {
  constructor({send,getState}){this.send=send;this.getState=getState;this.last=''}
  push(){
    const state=this.getState?.(); if(!state)return false;
    const feedback=makeHardwareFeedback(state.display??state);
    const key=JSON.stringify(feedback);if(key===this.last)return false;
    this.last=key;
    this.send(feedback);return true;
  }
  reset(){this.last=''}
}
