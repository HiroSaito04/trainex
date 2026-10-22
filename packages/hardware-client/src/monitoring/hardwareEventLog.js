export function createHardwareEventLog(limit=100){
  const items=[];
  return {append(type,details={}){const record={type,details,timestamp:new Date().toISOString()};items.push(record);if(items.length>limit)items.shift();return record;},all(){return items.map(x=>({...x,details:{...x.details}}))},clear(){items.length=0}};
}
