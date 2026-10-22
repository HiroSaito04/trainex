export class SecureWebSocketTransport {
  constructor({url,WebSocketImpl=globalThis.WebSocket}){
    if(typeof url!=='string'||!url.startsWith('wss://'))throw new Error('Relay must use wss://');
    if(!WebSocketImpl)throw new Error('WebSocket is unsupported.');
    this.url=url;this.WebSocketImpl=WebSocketImpl;this.ws=null;this.listeners=new Set();this.closed=false;
  }
  onMessage(handler){this.listeners.add(handler);return()=>this.listeners.delete(handler)}
  async connect(){
    if(this.ws)throw new Error('Already connected.');
    this.closed=false;
    return await new Promise((resolve,reject)=>{
      const ws=new this.WebSocketImpl(this.url);this.ws=ws;
      let settled=false;
      ws.onopen=()=>{settled=true;resolve()};
      ws.onerror=()=>{if(!settled){settled=true;reject(new Error('WSS connection failed.'))}};
      ws.onmessage=event=>{for(const handler of this.listeners)handler(event.data)};
      ws.onclose=()=>{if(!settled){settled=true;reject(new Error('WSS connection closed.'))}for(const handler of this.listeners)handler(JSON.stringify({type:'transport_closed'}))};
    });
  }
  send(message){if(!this.ws||this.ws.readyState!==1)throw new Error('WSS transport disconnected.');this.ws.send(typeof message==='string'?message:JSON.stringify(message))}
  close(){this.closed=true;this.ws?.close();this.ws=null}
}
