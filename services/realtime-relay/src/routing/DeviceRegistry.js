export class DeviceRegistry {
 constructor(){this.devices=new Map()}
 add(deviceId,ws){const old=this.devices.get(deviceId);if(old&&old!==ws)try{old.close(4003,'New device connection')}catch{}this.devices.set(deviceId,ws)}
 get(id){return this.devices.get(id)}
 remove(id,ws){if(this.devices.get(id)===ws)this.devices.delete(id)}
}
