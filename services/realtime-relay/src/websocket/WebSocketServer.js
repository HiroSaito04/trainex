import {WebSocketServer} from 'ws';
import {createConnectionHandler} from './ConnectionHandler.js';
export function attachRelayWebSocket(server,context){
 const wss=new WebSocketServer({server,path:'/ws',maxPayload:4096,perMessageDeflate:false});
 wss.on('connection',createConnectionHandler(context));return wss;
}
