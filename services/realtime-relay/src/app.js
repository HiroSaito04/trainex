import {createServer} from 'node:http';
import {createConnectionRegistry} from './coordination/ConnectionRegistryAdapter.js';
import {PairingManager} from './pairing/PairingManager.js';
import {MessageRouter} from './routing/MessageRouter.js';
import {createRateLimiter} from './security/rateLimiter.js';
import {attachRelayWebSocket} from './websocket/WebSocketServer.js';
export function createRelayApp(config){
 const {devices,sessions}=createConnectionRegistry();
 const router=new MessageRouter({sessions});
 const pairing=new PairingManager({devices:config.devices,deviceRegistry:devices,sessionRegistry:sessions});
 const rateLimiter=createRateLimiter({max:30,windowMs:1000});
 const server=createServer((req,res)=>{
  if(req.url==='/health'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({status:'ok'}));return}
  res.writeHead(404);res.end();
 });
 const wss=attachRelayWebSocket(server,{config,devices,sessions,router,pairing,rateLimiter});
 return {server,wss,devices,sessions};
}
