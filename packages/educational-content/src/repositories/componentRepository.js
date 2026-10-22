import frontDisplayPanel from '../data/components/frontDisplayPanel.json' with { type: 'json' };
import allDoorsClosedLamp from '../data/components/allDoorsClosedLamp.json' with { type: 'json' };
import masterControlHandle from '../data/components/masterControlHandle.json' with { type: 'json' };
import emergencyBrakeSwitch from '../data/components/emergencyBrakeSwitch.json' with { type: 'json' };
import passengerDoorControls from '../data/components/passengerDoorControls.json' with { type: 'json' };

const components = Object.freeze([
  frontDisplayPanel, allDoorsClosedLamp, masterControlHandle,
  emergencyBrakeSwitch, passengerDoorControls,
]);

export function listComponents() { return [...components]; }
export function getComponent(idOrSlug) {
  if (typeof idOrSlug !== 'string' || !idOrSlug.trim()) return null;
  const query=idOrSlug.trim().toLowerCase();
  return components.find(item=>item.id.toLowerCase()===query || item.slug===query) ?? null;
}
export function listComponentsForLesson(lessonId) {
  return components.filter(item=>item.relatedLessonIds.includes(lessonId));
}
