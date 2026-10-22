import {DeviceRegistry} from '../routing/DeviceRegistry.js';
import {SessionRegistry} from '../routing/SessionRegistry.js';
export function createConnectionRegistry(){return {devices:new DeviceRegistry(),sessions:new SessionRegistry()}}
