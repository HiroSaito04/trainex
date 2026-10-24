import {MASTER_POSITIONS} from '../config/consoleParts.js';

const numberOrNull=value=>typeof value==='number' && Number.isFinite(value)?value:null;

/**
 * The Simulation Engine, not this package, is authoritative.
 * No pressure values, speed, or signalling permission are fabricated.
 */
export function getCabDisplayState(trainState){
  const outer = trainState && typeof trainState==='object' ? trainState : {};
  const display = outer.display && typeof outer.display==='object' ? outer.display : {};
  const read=(field)=>outer[field] ?? display[field];
  const master = read('masterHandle');
  const doorState=read('doorState');
  const doors=read('allDoorsClosed');
  const emergency=read('emergencyBrake');
  const bc=read('brakeCylinderPressureKpa') ?? outer.pressures?.brakeCylinderKpa;
  const bp=read('brakePipePressureKpa') ?? outer.pressures?.brakePipeKpa;
  return Object.freeze({
    speed:numberOrNull(read('speed')),
    masterHandle:MASTER_POSITIONS.includes(master)?master:null,
    doorState:typeof doorState==='string'?doorState:null,
    allDoorsClosed:typeof doors==='boolean'?doors:null,
    emergencyBrake:typeof emergency==='boolean'?emergency:null,
    brakeCylinderPressureKpa:numberOrNull(bc),
    brakePipePressureKpa:numberOrNull(bp),
    permittedSpeedKmh:numberOrNull(read('permittedSpeedKmh')),
  });
}
export function displayNumber(value,decimalPlaces=0){return Number.isFinite(value)?value.toFixed(decimalPlaces):'—';}
