import {useEffect,useState} from 'react';
/** Pass a SINGLE createHardwareTrainingBridge instance from your app runtime. */
export default function HardwareConnectionPanel({bridge}){
 const [mode,setMode]=useState('wss');
 const [url,setUrl]=useState('wss://relay.example.com/ws');
 const [token,setToken]=useState('');const [deviceId,setDeviceId]=useState('trainex-esp32-01');const [pairingCode,setPairingCode]=useState('');
 const [status,setStatus]=useState('DISCONNECTED');const [message,setMessage]=useState('');
 useEffect(()=>{
  let unsub;
  const watch=()=>{unsub?.();unsub=bridge?.hardware?.subscribe(s=>{setStatus(s.status);setMessage(s.error??'')});};
  watch();return()=>unsub?.();
 },[bridge,status]);
 async function connect(){try{
  setMessage('');
  if(mode==='serial')await bridge.connectUsb({deviceId});
  else await bridge.connectWss({url,token});
  setStatus(bridge.hardware?.getState().status??'DISCONNECTED');setToken('');
 }catch(e){setMessage(e.message)}}
 async function pair(){try{bridge?.hardware?.pair({deviceId,pairingCode});setMessage('Pair request sent. Check for confirmation.')}catch(e){setMessage(e.message)}}
 async function disconnect(){await bridge?.disconnect();setStatus('DISCONNECTED')}
 return <section aria-label="TRAINEX hardware connection">
  <h2>Hardware Connection</h2>
  <p>Use an ESP32 over Wi-Fi / WSS or direct USB serial. Bluetooth is not used.</p>
  <label>Transport <select value={mode} onChange={e=>setMode(e.target.value)}><option value="wss">Wi-Fi / WSS relay</option><option value="serial">USB Web Serial</option></select></label>
  {mode==='wss'&&<><label>Relay WSS URL <input value={url} onChange={e=>setUrl(e.target.value)}/></label><label>Browser access token (temporary) <input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)}/></label></>}
  <label>Device ID <input value={deviceId} onChange={e=>setDeviceId(e.target.value)}/></label>
  {mode==='wss'&&<label>Device pairing code <input type="password" autoComplete="off" value={pairingCode} onChange={e=>setPairingCode(e.target.value)}/></label>}
  <p role="status">{status}: {message}</p>
  <button type="button" onClick={connect}>Connect</button>
  {mode==='wss'&&<button type="button" disabled={status!=='CONNECTED'} onClick={pair}>Pair to current session</button>}
  <button type="button" onClick={disconnect}>Disconnect</button>
 </section>;
}
