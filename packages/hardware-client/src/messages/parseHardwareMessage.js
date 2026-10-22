export function parseHardwareMessage(raw){
  try{
    const text=typeof raw==='string'?raw:(raw instanceof Uint8Array?new TextDecoder().decode(raw):null);
    const message=text?JSON.parse(text):raw;
    if(!message||typeof message!=='object'||Array.isArray(message))throw new Error('Not an object');
    return {ok:true,message};
  }catch{return {ok:false,reason:'Invalid hardware JSON message.'}}
}
