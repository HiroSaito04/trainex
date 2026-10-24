/** The web runtime owns session status; this module only selects HUD actions. */
export function getHudState(status='IDLE'){
  const normalized=typeof status==='string'?status.toUpperCase():'IDLE';
  const running=normalized==='RUNNING';
  const paused=normalized==='PAUSED';
  return Object.freeze({
    label:normalized,
    running,
    paused,
    startLabel:paused?'Resume':'Start',
    startAction:paused?'resume':'start',
    canStart:!running,
    canPause:running,
    canEnd:running||paused,
  });
}

export const SESSION_ACTIONS=Object.freeze(['start','resume','pause','reset','end']);
