export class InputSequenceTracker {
  #last=new Map();
  check(deviceId,sequence){
    if(typeof deviceId!=='string'||!Number.isSafeInteger(sequence)||sequence<0)return false;
    const last=this.#last.get(deviceId);
    return last==null||sequence>last;
  }
  commit(deviceId,sequence){if(!this.check(deviceId,sequence))return false;this.#last.set(deviceId,sequence);return true}
  reset(){this.#last.clear()}
}
