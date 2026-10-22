export class SessionRegistry {
 constructor(){this.byDevice=new Map();this.byBrowser=new Map()}
 pair({deviceId,sessionId,browserSocket,deviceSocket}){
  const old=this.byDevice.get(deviceId);if(old)this.byBrowser.delete(old.browserSocket);
  const current=this.byBrowser.get(browserSocket);if(current)this.byDevice.delete(current.deviceId);
  const pair={deviceId,sessionId,browserSocket,deviceSocket,lastSequence:-1};
  this.byDevice.set(deviceId,pair);this.byBrowser.set(browserSocket,pair);return pair;
 }
 devicePair(deviceId){return this.byDevice.get(deviceId)}
 browserPair(ws){return this.byBrowser.get(ws)}
 removeDevice(deviceId){const pair=this.byDevice.get(deviceId);if(pair){this.byDevice.delete(deviceId);this.byBrowser.delete(pair.browserSocket)}return pair}
 removeBrowser(ws){const pair=this.byBrowser.get(ws);if(pair){this.byBrowser.delete(ws);this.byDevice.delete(pair.deviceId)}return pair}
}
