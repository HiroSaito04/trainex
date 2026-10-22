import introduction from '../data/lessons/introduction.json' with { type: 'json' };
import driverCabin from '../data/lessons/driverCabin.json' with { type: 'json' };
import masterControlHandle from '../data/lessons/masterControlHandle.json' with { type: 'json' };
import trainTraction from '../data/lessons/tractionAndBraking.json' with { type: 'json' };
import serviceBraking from '../data/lessons/serviceBraking.json' with { type: 'json' };
import emergencyBraking from '../data/lessons/emergencyBraking.json' with { type: 'json' };
import passengerDoorOperation from '../data/lessons/passengerDoorOperation.json' with { type: 'json' };
import driverDisplayPanel from '../data/lessons/driverDisplayPanel.json' with { type: 'json' };
import railwaySafety from '../data/lessons/railwaySafety.json' with { type: 'json' };

// Keep legacy lesson IDs intact so existing bookmarks/component links continue working.
const lessons = Object.freeze([introduction,driverCabin,masterControlHandle,trainTraction,serviceBraking,emergencyBraking,passengerDoorOperation,driverDisplayPanel,railwaySafety]);
export function listLessons(){return [...lessons];}
export function getLesson(id){return typeof id === 'string' ? (lessons.find(item=>item.id===id) ?? null) : null;}
export function listLessonsForComponent(componentId){return lessons.filter(item=>item.componentIds.includes(componentId));}
