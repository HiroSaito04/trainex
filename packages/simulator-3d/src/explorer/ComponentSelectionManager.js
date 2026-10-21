import { COMPONENT_LABELS } from '../config/objectMappings.js';
export function getComponentLabel(id) { return COMPONENT_LABELS[id] ?? 'Driver Cabin'; }
