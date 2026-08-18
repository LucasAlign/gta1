// Procedural sound, synthesised with the Web Audio API so the game keeps its
// zero-external-asset promise (no .wav/.mp3 to load or 404). Everything is a
// defensive no-op if Web Audio is unavailable or the context can't start, so the
// game never depends on audio working.
export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;

  // Persistent engine voice (created while driving, torn down on exit).
  private engineOsc: OscillatorNode | null = null;
  private engineSub: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;

  // Persistent hose voice (created while spraying water).
  private sprayGain: GainNode | null = null;

  // Persistent siren voice (created while driving an emergency vehicle).
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenPhase = 0;

  constructor() {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.32;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  // Must be called from within a user gesture (browser autoplay policy).
  unlock() {
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
  }

  get isMuted(): boolean {
    return this.muted;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.32;
    return this.muted;
  }

  private now(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  // ---- one-shot blips -----------------------------------------------------

  private blip(freq: number, dur: number, type: OscillatorType, vol: number, at = 0) {
    if (!this.ctx || !this.master) return;
    const t = this.now() + at;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noiseBurst(dur: number, cutoff: number, vol: number) {
    if (!this.ctx || !this.master) return;
    const t = this.now();
    const frames = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, frames, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = cutoff;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filt).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  harvest() {
    this.blip(523, 0.12, "triangle", 0.18);
    this.blip(784, 0.16, "triangle", 0.16, 0.09);
  }

  sell() {
    this.blip(880, 0.08, "square", 0.14);
    this.blip(1320, 0.14, "square", 0.12, 0.06);
  }

  upgrade() {
    this.blip(523, 0.1, "square", 0.14);
    this.blip(659, 0.1, "square", 0.14, 0.08);
    this.blip(1047, 0.2, "square", 0.14, 0.16);
  }

  bust() {
    this.blip(740, 0.1, "sawtooth", 0.16);
    this.blip(560, 0.1, "sawtooth", 0.16, 0.1);
    this.blip(740, 0.14, "sawtooth", 0.16, 0.2);
  }

  // Collision thud + a short horn honk.
  thud() {
    this.noiseBurst(0.18, 400, 0.4);
    this.blip(180, 0.18, "sawtooth", 0.12, 0.02);
  }

  deny() {
    this.blip(140, 0.16, "square", 0.12);
  }

  // ---- engine (continuous) -----------------------------------------------

  // Called every frame. `frac` is speed/maxSpeed (0..1). `heavy` = tractor/truck
  // (lower, chuggier) vs car (higher, revvier).
  engine(active: boolean, frac: number, heavy: boolean) {
    if (!this.ctx || !this.master) return;

    if (!active) {
      if (this.engineGain) {
        const t = this.now();
        this.engineGain.gain.cancelScheduledValues(t);
        this.engineGain.gain.setValueAtTime(this.engineGain.gain.value, t);
        this.engineGain.gain.linearRampToValueAtTime(0.0001, t + 0.12);
        const osc = this.engineOsc;
        const sub = this.engineSub;
        window.setTimeout(() => {
          try { osc?.stop(); sub?.stop(); } catch { /* already stopped */ }
        }, 160);
        this.engineOsc = null;
        this.engineSub = null;
        this.engineGain = null;
        this.engineFilter = null;
      }
      return;
    }

    if (!this.engineOsc) {
      this.engineOsc = this.ctx.createOscillator();
      this.engineSub = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineOsc.type = "sawtooth";
      this.engineSub.type = "square";
      this.engineFilter.type = "lowpass";
      this.engineFilter.frequency.value = 900;
      this.engineGain.gain.value = 0.0001;
      this.engineOsc.connect(this.engineFilter);
      this.engineSub.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain).connect(this.master);
      this.engineOsc.start();
      this.engineSub.start();
    }

    const base = heavy ? 42 : 66;
    const range = heavy ? 46 : 150;
    const f = base + frac * range;
    const t = this.now();
    this.engineOsc!.frequency.setTargetAtTime(f * 2, t, 0.05);
    this.engineSub!.frequency.setTargetAtTime(f, t, 0.05);
    this.engineFilter!.frequency.setTargetAtTime(500 + frac * 1600, t, 0.08);
    // Idle hum plus load: a touch louder with speed.
    this.engineGain!.gain.setTargetAtTime(0.05 + frac * 0.05, t, 0.1);
  }

  // ---- water hose (continuous) -------------------------------------------

  spray(active: boolean) {
    if (!this.ctx || !this.master) return;
    if (active && !this.sprayGain) {
      // Looping filtered noise = hiss of water.
      const frames = Math.floor(this.ctx.sampleRate * 0.5);
      const buf = this.ctx.createBuffer(1, frames, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = "bandpass";
      filt.frequency.value = 1400;
      filt.Q.value = 0.7;
      this.sprayGain = this.ctx.createGain();
      this.sprayGain.gain.value = 0.0001;
      src.connect(filt).connect(this.sprayGain).connect(this.master);
      src.start();
      this.sprayGain.gain.setTargetAtTime(0.12, this.now(), 0.05);
      // Stash the source on the gain node so we can stop it later.
      (this.sprayGain as unknown as { _src: AudioBufferSourceNode })._src = src;
    } else if (!active && this.sprayGain) {
      const g = this.sprayGain;
      const src = (g as unknown as { _src: AudioBufferSourceNode })._src;
      const t = this.now();
      g.gain.setTargetAtTime(0.0001, t, 0.04);
      window.setTimeout(() => { try { src.stop(); } catch { /* stopped */ } }, 120);
      this.sprayGain = null;
    }
  }

  // ---- siren (continuous, wailing) ---------------------------------------

  siren(active: boolean) {
    if (!this.ctx || !this.master) return;
    if (active && !this.sirenOsc) {
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();
      this.sirenOsc.type = "sawtooth";
      this.sirenGain.gain.value = 0.0001;
      this.sirenOsc.connect(this.sirenGain).connect(this.master);
      this.sirenOsc.start();
      this.sirenGain.gain.setTargetAtTime(0.03, this.now(), 0.1);
    } else if (!active && this.sirenOsc) {
      const osc = this.sirenOsc;
      const g = this.sirenGain!;
      g.gain.setTargetAtTime(0.0001, this.now(), 0.08);
      window.setTimeout(() => { try { osc.stop(); } catch { /* stopped */ } }, 160);
      this.sirenOsc = null;
      this.sirenGain = null;
    }
  }

  // Drives the siren's wail; call each frame with dt seconds.
  update(dtSec: number) {
    if (this.sirenOsc) {
      this.sirenPhase += dtSec * 2.2;
      const wail = 620 + Math.sin(this.sirenPhase) * 260;
      this.sirenOsc.frequency.setTargetAtTime(wail, this.now(), 0.02);
    }
  }
}
