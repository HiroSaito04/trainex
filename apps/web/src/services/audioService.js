
let context;
let enabled = false;

export const audioService = {
  isEnabled: () => enabled,

  async enable() {
    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error(
        "Web Audio is unsupported in this browser."
      );
    }

    context ??= new AudioContextClass();

    await context.resume();

    enabled = true;
  },

  mute() {
    enabled = false;
  },

  // Test tone only.
  // Actual operating sounds will be
  // generated from simulation events.

  async playTestTone() {
    if (!enabled || !context) return;

    const oscillator =
      context.createOscillator();

    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 660;

    gain.gain.setValueAtTime(
      0.0001,
      context.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.1,
      context.currentTime + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.22
    );

    oscillator
      .connect(gain)
      .connect(context.destination);

    oscillator.start();

    oscillator.stop(
      context.currentTime + 0.23
    );
  },
};
