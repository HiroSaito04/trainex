export class SessionRegistry {
  constructor() { this.byDevice=new Map(); this.byBrowser=new Map(); }
  pair({deviceId,sessionId,browserSocket,deviceSocket}) {
    const previous=this.byDevice.get(deviceId);
    if (previous) this.byBrowser.delete(previous.browserSocket);
    const current=this.byBrowser.get(browserSocket);
    if (current) this.byDevice.delete(current.deviceId);
    const pair={deviceId,sessionId,browserSocket,deviceSocket,lastSequence:-1};
    this.byDevice.set(deviceId,pair);
    this.byBrowser.set(browserSocket,pair);
    return pair;
  }
  devicePair(id) { return this.byDevice.get(id); }
  browserPair(socket) { return this.byBrowser.get(socket); }
  removeDevice(id) {
    const pair=this.byDevice.get(id);
    if (pair) { this.byDevice.delete(id); this.byBrowser.delete(pair.browserSocket); }
    return pair;
  }
  removeBrowser(socket) {
    const pair=this.byBrowser.get(socket);
    if (pair) { this.byBrowser.delete(socket); this.byDevice.delete(pair.deviceId); }
    return pair;
  }
}
