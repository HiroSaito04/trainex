export function serializeHardwareMessage(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new TypeError('Message must be an object.');
  return JSON.stringify(value);
}
