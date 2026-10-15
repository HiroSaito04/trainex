
export class BuzzerAudio {
  #context = null;
  #oscillator = null;
  #gain = null;

  async unlock() {
    if (!this.#context) {
      this.#context = new AudioContext();

      this.#oscillator =
        this.#context.createOscillator();

      this.#gain =
        this.#context.createGain();

      this.#oscillator.type = "square";
      this.#gain.gain.value = 0;

      this.#oscillator.connect(this.#gain);
      this.#gain.connect(this.#context.destination);

      this.#oscillator.start();
    }

    if (this.#context.state === "suspended") {
      await this.#context.resume();
    }
  }

  setFrequency(frequency) {
    if (!this.#context) return;

    const now = this.#context.currentTime;

    const active =
      Number.isFinite(frequency) &&
      frequency >= 100 &&
      frequency <= 5000;

    if (active) {
      this.#oscillator.frequency.setTargetAtTime(
        frequency,
        now,
        0.005
      );
    }

    this.#gain.gain.setTargetAtTime(
      active ? 0.025 : 0,
      now,
      0.01
    );
  }

  stop() {
    this.setFrequency(0);
  }

  async dispose() {
    if (this.#oscillator) {
      this.#oscillator.stop();
    }

    if (this.#context) {
      await this.#context.close();
    }

    this.#oscillator = null;
    this.#gain = null;
    this.#context = null;
  }
}
