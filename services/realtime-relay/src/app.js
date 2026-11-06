import {createServer} from 'node:http';
import {createConnectionRegistry} from './coordination/ConnectionRegistryAdapter.js';
import {PairingManager} from './pairing/PairingManager.js';
import {MessageRouter} from './routing/MessageRouter.js';
import {createRateLimiter} from './security/rateLimiter.js';
import {attachRelayWebSocket} from './websocket/WebSocketServer.js';
export function createRelayApp(config) {
  const {devices,sessions}=createConnectionRegistry();
  const router=new MessageRouter({sessions});
  const pairing=new PairingManager({devices:config.devices,deviceRegistry:devices,sessionRegistry:sessions});
  // Up to 100 frames/sec from one IP; device input is also limited to 30/s.
  const frameLimiter=createRateLimiter({max:100,windowMs:1000});
  const inputLimiter=createRateLimiter({max:30,windowMs:1000});
  const pairLimiter=createRateLimiter({max:5,windowMs:60000});
  const limiter={allow(key,now=Date.now()){
    if(key.startsWith('pair:'))return pairLimiter.allow(key,now);
    if(key.startsWith('msg:'))return frameLimiter.allow(key,now);
    return inputLimiter.allow(key,now);
  }};
  const server=createServer((req,res)=>{
    if(req.url==='/health' && req.method==='GET'){
      res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
      res.end(JSON.stringify({status:'ok'}));return;
    }
    res.writeHead(404);res.end();
  });
  const wss=attachRelayWebSocket(server,{config,devices,sessions,router,pairing,rateLimiter:limiter});
  return {server,wss,devices,sessions};
}
