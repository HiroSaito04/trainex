import {randomBytes} from 'node:crypto';

export function loadRelayConfig(env = process.env) {
  let devices;
  try { devices = JSON.parse(env.RELAY_DEVICES_JSON || '{}'); }
  catch { throw new Error('RELAY_DEVICES_JSON must contain valid JSON'); }
  if (!devices || Array.isArray(devices) || typeof devices !== 'object')
    throw new Error('RELAY_DEVICES_JSON must be an object');

  const origins = (env.RELAY_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const browserTokens = (env.RELAY_BROWSER_TOKENS || '').split(',').map(s => s.trim()).filter(Boolean);
  const allowPairCodeBrowserAuth = env.RELAY_ALLOW_PAIR_CODE_BROWSER_AUTH === 'true';
  if (!origins.length || !Object.keys(devices).length)
    throw new Error('Configure RELAY_ALLOWED_ORIGINS and RELAY_DEVICES_JSON');
  if (origins.some(x => !/^https:\/\/[^/]+$/.test(x) && x !== 'http://localhost:5173'))
    throw new Error('Origin must be an exact HTTPS origin (or http://localhost:5173 for development)');
  if (!allowPairCodeBrowserAuth && !browserTokens.length)
    throw new Error('Set RELAY_BROWSER_TOKENS or explicitly enable prototype pairing-code browser authorization');
  if (browserTokens.some(t => t.length < 24 || t.includes('REPLACE')))
    throw new Error('Browser tokens must be long, random, non-placeholder secrets');

  const codes = new Set();
  for (const [id, device] of Object.entries(devices)) {
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) throw new Error('Invalid device ID');
    if (typeof device?.token !== 'string' || device.token.length < 32 || device.token.includes('REPLACE'))
      throw new Error(`Set a 32+ character random token for ${id}`);
    if (typeof device?.pairingCode !== 'string' || device.pairingCode.length < 16 || device.pairingCode.includes('REPLACE'))
      throw new Error(`Set a 16+ character random pairing code for ${id}`);
    if (codes.has(device.pairingCode)) throw new Error('Pairing codes must be unique across devices');
    codes.add(device.pairingCode);
  }
  const port = Number(env.PORT || env.RELAY_PORT || 8787);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) throw new Error('Invalid port');
  const heartbeatTimeoutMs = Number(env.RELAY_HEARTBEAT_TIMEOUT_MS || 90000);
  if (!Number.isFinite(heartbeatTimeoutMs) || heartbeatTimeoutMs < 20000 || heartbeatTimeoutMs > 600000)
    throw new Error('Invalid heartbeat timeout');
  return {port,origins,browserTokens,devices,allowPairCodeBrowserAuth,heartbeatTimeoutMs};
}
