export const TRANSPORT_MODES = Object.freeze({ WSS: 'wss', SERIAL: 'serial' });
export function validateTransportConfig({mode='wss', url}={}) {
  if(!['wss','serial'].includes(mode)) throw new Error('Mode must be wss or serial.');
  if(mode==='wss' && (typeof url!=='string'|| !url.startsWith('wss://'))) throw new Error('Production relay URL must use wss://.');
  return {mode,url};
}
