import {loadRelayConfig} from './config/relayConfig.js';
import {createRelayApp} from './app.js';
import {logEvent} from './monitoring/logger.js';

console.log("TRAINEX Railway environment check", {
  originsPresent:
    Boolean(process.env.RELAY_ALLOWED_ORIGINS?.trim()),

  devicesPresent:
    Boolean(process.env.RELAY_DEVICES_JSON?.trim()),

  deviceCount: (() => {
    try {
      const parsed = JSON.parse(
        process.env.RELAY_DEVICES_JSON || "{}"
      );
      return parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
          ? Object.keys(parsed).length
          : "not an object";
    } catch {
      return "invalid JSON";
    }
  })(),

  prototypeAuth:
    process.env.RELAY_ALLOW_PAIR_CODE_BROWSER_AUTH
      === "true"
});


const config=loadRelayConfig();
const {server,wss}=createRelayApp(config);
server.listen(config.port,'0.0.0.0',()=>logEvent('relay_listening',{port:config.port}));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{
  wss.close();server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),5000).unref();
});
