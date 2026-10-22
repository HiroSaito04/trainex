import {safeEqual} from './deviceAuthentication.js';
export function authenticateBrowser(token,allowList){return allowList.some(candidate=>safeEqual(token,candidate))}
export function validSessionId(id){return typeof id==='string'&&id.length>=1&&id.length<=128&&/^[A-Za-z0-9_-]+$/.test(id)}
