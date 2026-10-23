/**
 * Web Audio API Sound Synthesizer for Arcade Slap Fighter
 * Generates punchy, comedic, and retro sound effects procedurally without any external audio files.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  ensureContextRunning() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // --- 1. NORMAL SLAP SOUND ---
  // Crisp whip/snap with quick pitch-drop noise burst
  playSlap() {
    if (this.muted) return;
    this.ensureContextRunning();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Noise buffer for the sharp skin slap sound
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.015));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter to make it sound like a palm smack
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(1.8, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);

    // Add a low pop tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.06);

    oscGain.gain.setValueAtTime(0.8, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  // --- 2. TIGHT SLAP SOUND ---
  // Devastating loud thunderclap slap with heavy sub-bass & cartoon whip crack
  playTightSlap() {
    if (this.muted) return;
    this.ensureContextRunning();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Sharp high whip snap
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.035));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1800, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);

    // 2. Heavy Sub Bass Boom (The "TIGHT" weight)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(180, t);
    subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.22);

    subGain.gain.setValueAtTime(1.4, t);
    subGain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.24);

    // 3. Comedic cartoon spring/twang
    const twang = this.ctx.createOscillator();
    const twangGain = this.ctx.createGain();
    twang.type = "sawtooth";
    twang.frequency.setValueAtTime(450, t + 0.04);
    twang.frequency.linearRampToValueAtTime(900, t + 0.14);

    twangGain.gain.setValueAtTime(0, t);
    twangGain.gain.setValueAtTime(0.3, t + 0.04);
    twangGain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

    twang.connect(twangGain);
    twangGain.connect(this.ctx.destination);
    twang.start(t + 0.04);
    twang.stop(t + 0.17);
  }

  // --- 3. PUNCH SOUND ---
  // Heavy solid muscle gut punch with low thud & crunch
  playPunch() {
    if (this.muted) return;
    this.ensureContextRunning();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Low punch thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);

    gain.gain.setValueAtTime(1.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);

    // Punch impact crunch
    const bufferSize = this.ctx.sampleRate * 0.07;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.015));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(800, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  // --- 4. KICK SOUND ---
  // Swoosh followed by resonant body blow
  playKick() {
    if (this.muted) return;
    this.ensureContextRunning();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Whoosh
    const whoosh = this.ctx.createOscillator();
    const whooshGain = this.ctx.createGain();
    whoosh.type = "sine";
    whoosh.frequency.setValueAtTime(120, t);
    whoosh.frequency.linearRampToValueAtTime(380, t + 0.08);
    whoosh.frequency.exponentialRampToValueAtTime(60, t + 0.18);

    whooshGain.gain.setValueAtTime(0.4, t);
    whooshGain.gain.linearRampToValueAtTime(0.9, t + 0.08);
    whooshGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    whoosh.connect(whooshGain);
    whooshGain.connect(this.ctx.destination);
    whoosh.start(t);
    whoosh.stop(t + 0.21);

    // Deep heavy impact
    const kickOsc = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();
    kickOsc.type = "triangle";
    kickOsc.frequency.setValueAtTime(160, t + 0.06);
    kickOsc.frequency.exponentialRampToValueAtTime(30, t + 0.22);

    kickGain.gain.setValueAtTime(0, t);
    kickGain.gain.setValueAtTime(1.6, t + 0.06);
    kickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.24);

    kickOsc.connect(kickGain);
    kickGain.connect(this.ctx.destination);
    kickOsc.start(t + 0.06);
    kickOsc.stop(t + 0.25);
  }

  // --- 5. DIZZY BIRDS / STARS CHIME ---
  playDizzySound() {
    if (this.muted) return;
    this.ensureContextRunning();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [659.25, 783.99, 987.77, 1318.5]; // E5, G5, B5, E6 cartoon chimes

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.18, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.26);
    });
  }

  // --- 6. COMBO MILESTONE FANFARE ---
  playComboSound(level) {
    if (this.muted) return;
    this.ensureContextRunning();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreq = 440 + Math.min(level * 40, 400);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.15);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  // --- 7. ULTIMATE RAGE ACTIVATION ROAR ---
  playUltimateRoar() {
    if (this.muted) return;
    this.ensureContextRunning();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Ascending power sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(960, t + 0.4);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.52);
  }
  // --- 8. STREAK UPGRADE SOUND ---
  playStreakUp(level) {
    if (this.muted) return;
    this.ensureContextRunning();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const base = 523.25; // C5
    const freqs = [base, base * 1.25, base * 1.5, base * 2];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f + (level * 30), t + i * 0.04);
      gain.gain.setValueAtTime(0.2, t + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.04);
      osc.stop(t + i * 0.04 + 0.19);
    });
  }

  // --- 9. STREAK BREAK / WAH WAH SOUND ---
  playStreakLost() {
    if (this.muted) return;
    this.ensureContextRunning();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.35);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.35);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  // --- 10. CROWD BANTER / CHEER ROAR ---
  playCrowdBanter(isMob = true) {
    if (this.muted) return;
    this.ensureContextRunning();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Formant noise burst simulating a crowd shout
    const dur = isMob ? 0.22 : 0.28;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(isMob ? 850 : 500, t);
    filter.Q.setValueAtTime(2.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }
}

// Global audio singleton
const soundEngine = new SoundEngine();
