import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
const server=createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const files={'/':'index.html','/index.html':'index.html','/trainexRelayClient.js':'trainexRelayClient.js'};
 const name=files[url.pathname];
 if(!name){res.writeHead(404);res.end('Not found');return;}
 try{
  const data=await readFile(join(root,name));
  res.writeHead(200,{'Content-Type':name.endsWith('.js')?'application/javascript':'text/html','Cache-Control':'no-store'});
  res.end(data);
 }catch {res.writeHead(500);res.end('Internal error');}
});
server.listen(5173,'127.0.0.1',()=>console.log('TRAINEX relay test page: http://localhost:5173'));
