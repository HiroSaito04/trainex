export function validateScenario(scenario) {
  if (!scenario || typeof scenario.id !== 'string' || !scenario.id.trim())
    return { valid: false, reason: 'Scenario ID is required.' };
  if (!Array.isArray(scenario.steps))
    return { valid: false, reason: 'Scenario steps must be an array.' };
  return { valid: true };
}
