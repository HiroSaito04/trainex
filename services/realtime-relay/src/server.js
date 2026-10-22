import {loadRelayConfig} from './config/relayConfig.js';
import {createRelayApp} from './app.js';
import {logEvent} from './monitoring/logger.js';
const config=loadRelayConfig();
const {server,wss}=createRelayApp(config);
server.listen(config.port,'0.0.0.0',()=>logEvent('relay_listening',{port:config.port}));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{
  wss.close();server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),5000).unref();
});
