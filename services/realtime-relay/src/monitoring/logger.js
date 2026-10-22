export function logEvent(event,details={}){
 // Never log bearer tokens or pairing codes.
 const safe=Object.fromEntries(Object.entries(details).filter(([k])=>!/token|code|secret|password/i.test(k)));
 console.log(JSON.stringify({time:new Date().toISOString(),event,...safe}));
}
