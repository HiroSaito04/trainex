export function loadRelayConfig(env=process.env){
 let devices;
 try{devices=JSON.parse(env.RELAY_DEVICES_JSON||'{}')}catch{throw new Error('Invalid RELAY_DEVICES_JSON')}
 const browserTokens=(env.RELAY_BROWSER_TOKENS??'').split(',').map(s=>s.trim()).filter(Boolean);
 const origins=(env.RELAY_ALLOWED_ORIGINS??'').split(',').map(s=>s.trim()).filter(Boolean);
 if(!browserTokens.length||!Object.keys(devices).length||!origins.length)throw new Error('Missing relay authentication/origin configuration');
 if(browserTokens.some(s=>s.length<24||s.includes('REPLACE')) || Object.values(devices).some(d=>typeof d?.token!=='string'||d.token.length<24||d.token.includes('REPLACE')||!d.pairingCode||String(d.pairingCode).includes('REPLACE')))throw new Error('Use long random credentials and pairing codes');
 const port=Number(env.RELAY_PORT||8787);
 if(!Number.isInteger(port)||port<=0||port>65535)throw new Error('Invalid port');
 return {port,browserTokens,devices,origins,heartbeatTimeoutMs:Math.max(15000,Number(env.RELAY_HEARTBEAT_TIMEOUT_MS||90000))};
}
