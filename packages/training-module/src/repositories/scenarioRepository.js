import coasting from '../scenarios/coasting.json' with {type:'json'};
import identification from '../scenarios/controlIdentification.json' with {type:'json'};
import doors from '../scenarios/doorClosing.json' with {type:'json'};
import emergency from '../scenarios/emergencyBraking.json' with {type:'json'};
import braking from '../scenarios/serviceBraking.json' with {type:'json'};
import stopping from '../scenarios/stationStopping.json' with {type:'json'};
import traction from '../scenarios/tractionOperation.json' with {type:'json'};
import startup from '../scenarios/trainStartup.json' with {type:'json'};
const scenarios=Object.freeze([startup,identification,traction,coasting,braking,stopping,doors,emergency]);
export function listScenarios(){return scenarios.map(s=>structuredClone(s))}
export function getScenario(id){const found=scenarios.find(s=>s.id===id);return found?structuredClone(found):null}
