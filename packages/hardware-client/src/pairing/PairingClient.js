export class PairingClient {
  constructor({send}){this.send=send}
  pair({deviceId,sessionId,pairingCode}){
    if(!deviceId||!sessionId||!pairingCode)throw new Error('Device, active session and pairing code are required.');
    this.send({type:'pair',deviceId,sessionId,pairingCode});
  }
  unpair(){this.send({type:'unpair'})}
}
