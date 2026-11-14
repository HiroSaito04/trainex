let context;
let enabled = false;
let vigilanceOscillator = null;
let vigilanceGain = null;

function stopVigilance() {
  if (!vigilanceOscillator) return;
  try {
    vigilanceOscillator.stop();
  } catch {}
  vigilanceOscillator.disconnect();
  vigilanceGain?.disconnect();
  vigilanceOscillator = null;
  vigilanceGain = null;
}

export const audioService = {
  isEnabled: () => enabled,

  async enable() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass)
      throw new Error("Web Audio is unsupported in this browser.");
    context ??= new AudioContextClass();
    await context.resume();
    enabled = true;
  },

  mute() {
    enabled = false;
    stopVigilance();
  },

  /** Read-only warning output. The Simulation Engine owns all timing. */
  setVigilanceAlert(active) {
    if (!active || !enabled || !context) {
      stopVigilance();
      return;
    }
    if (vigilanceOscillator) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    gain.gain.setValueAtTime(0.08, context.currentTime);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    vigilanceOscillator = oscillator;
    vigilanceGain = gain;
  },

  async playTestTone() {
    if (!enabled || !context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.1, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.23);
  },
};
