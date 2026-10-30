import { Howl, Howler } from 'howler';

class SoundSystem {
  private currentBgm: Howl | null = null;
  private currentBgmName: string = '';
  private sfxPool: Map<string, Howl> = new Map();
  private audioCtx: AudioContext | null = null;
  private bgmVolume: number = 0.7;
  private sfxVolume: number = 0.8;

  constructor() {
    Howler.volume(1.0);
  }

  public setBgmVolume(val: number) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.currentBgm) {
      this.currentBgm.volume(this.bgmVolume);
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playBgm(pathOrFilename: string, loop: boolean = true) {
    let src = pathOrFilename;
    if (src.startsWith('/')) {
      src = src.slice(1);
    }
    if (!src.startsWith('assets/')) {
      src = `assets/music/${pathOrFilename}`;
    }

    if (this.currentBgmName === src && this.currentBgm?.playing()) {
      if (this.currentBgm.volume() < this.bgmVolume) {
        this.currentBgm.fade(this.currentBgm.volume(), this.bgmVolume, 1000);
      }
      return;
    }
    this.stopBgm();

    this.currentBgm = new Howl({
      src: [src],
      html5: true, // Stream long BGM
      loop: loop,
      volume: this.bgmVolume,
      onloaderror: (_id, err) => {
        console.warn(`[SoundSystem] Failed to load BGM ${src}:`, err);
      }
    });

    this.currentBgmName = src;
    this.currentBgm.play();
  }

  stopBgm() {
    if (this.currentBgm) {
      this.currentBgm.fade(this.currentBgm.volume(), 0, 150);
      const bgmToStop = this.currentBgm;
      setTimeout(() => {
        try {
          bgmToStop.stop();
          bgmToStop.unload();
        } catch (e) {}
      }, 150);
      this.currentBgm = null;
      this.currentBgmName = '';
    }
  }

  fadeBgm(targetVol: number, durationSeconds: number = 1.0) {
    if (this.currentBgm) {
      this.currentBgm.fade(this.currentBgm.volume(), targetVol, durationSeconds * 1000);
    }
  }

  // Tinnitus / Ring-out procedural synthesizer (Dual-frequency binaural acoustic resonance)
  playTinnitus(durationSeconds: number = 3.6) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const finalVol = this.sfxVolume * 0.45;

      // Master gain for the tinnitus sound
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);

      // Volume envelope: rise from 0.0001 to peak in 1.1s, sustain, then fade out
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(finalVol, now + 1.1);
      masterGain.gain.setValueAtTime(finalVol, now + 2.2);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

      // 1. Primary high-frequency sine tone (3920Hz - G7)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(3920, now);
      osc1.frequency.linearRampToValueAtTime(4050, now + 1.2);
      osc1.frequency.linearRampToValueAtTime(3980, now + durationSeconds);
      osc1.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + durationSeconds);

      // 2. Secondary detuned tone (4015Hz) creating authentic binaural acoustic resonance / beating
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(4015, now);
      osc2.frequency.linearRampToValueAtTime(4080, now + 1.2);
      osc2.frequency.linearRampToValueAtTime(4000, now + durationSeconds);
      gain2.gain.setValueAtTime(0.65, now);
      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc2.start(now);
      osc2.stop(now + durationSeconds);

      // 3. Subtle airy breath hiss / white noise cushion at very high frequencies
      const bufLen = Math.floor(ctx.sampleRate * durationSeconds);
      const noiseBuffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const chData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        chData[i] = Math.random() * 2 - 1;
      }
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(4000, now);
      bandpass.Q.setValueAtTime(8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);

      noiseSrc.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSrc.start(now);
      noiseSrc.stop(now + durationSeconds);
    } catch (e) {
      console.warn('[SoundSystem] playTinnitus failed:', e);
    }
  }

  // Authentic cinematic ground explosion with realistic shockwave expansion:
  // - High-pressure supersonic shockwave wavefront (rapid air displacement 0-140ms, no firecracker crackles)
  // - Expanding acoustic pressure envelope (shockwave spherical diffusion across open terrain)
  // - Deep subterranean brownian seismic rumble & rolling thunder tail (1.8s - 2.4s)
  playCinematicBoom(volume: number = 0.9, pitchMod: number = 1.0) {
    const ctx = this.getAudioContext();
    if (!ctx) {
      this.playSfx('boom', volume);
      return;
    }

    try {
      const now = ctx.currentTime;
      const finalVol = volume * this.sfxVolume;

      // Master gain for this explosion instance
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);

      const dur = 1.8 + Math.random() * 0.45; // 1.8s ~ 2.25s rolling atmospheric rumble
      const sampleRate = ctx.sampleRate;
      const numSamples = Math.floor(sampleRate * dur);

      // --- 1. Deep Brownian Seismic Noise (Subterranean rolling rumble with natural air turbulence) ---
      const noiseBuf = ctx.createBuffer(1, numSamples, sampleRate);
      const noiseData = noiseBuf.getChannelData(0);
      let brown = 0;
      for (let i = 0; i < numSamples; i++) {
        const white = Math.random() * 2 - 1;
        // Pure brownian random walk with leak factor 0.993 (eliminates harsh high fizz)
        brown = (brown * 0.993) + (white * 0.075);
        const t = i / sampleRate;

        // Turbulence LFO modulation (4.8Hz slow undulation of rolling acoustic reflections)
        const lfo = 1.0 + 0.22 * Math.sin(t * Math.PI * 2 * 4.8);

        // Smooth concussive envelope: rapid rise in 20ms, sustained shockwave expansion, then rolling decay
        let env = 0;
        if (t < 0.02) {
          env = t / 0.02;
        } else if (t < 0.22) {
          env = 1.0 - (t - 0.02) * 0.7; // Sustained shockwave dome
        } else {
          env = 0.86 * Math.exp(-(t - 0.22) * 1.5); // Natural atmospheric rolling tail
        }

        noiseData[i] = brown * env * lfo;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuf;

      // Resonant Lowpass Filter modeling spherical shockwave diffusion:
      // Starts open at ~950Hz for initial high-energy blast, then swiftly sweeps down to 55Hz deep rumble
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.Q.setValueAtTime(2.0, now);
      lpf.frequency.setValueAtTime(950 * pitchMod, now);
      lpf.frequency.exponentialRampToValueAtTime(55 * pitchMod, now + 0.65);

      // Warm analog saturation (gives dense acoustic pressure without digital clipping)
      const waveShaper = ctx.createWaveShaper();
      const n_pts = 256;
      const curve = new Float32Array(n_pts);
      const k = 10;
      for (let i = 0; i < n_pts; ++i) {
        const x = (i * 2) / n_pts - 1;
        curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
      }
      waveShaper.curve = curve;
      waveShaper.oversample = '2x';

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(1.15 * finalVol, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      noiseSource.connect(lpf);
      lpf.connect(waveShaper);
      waveShaper.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start(now);
      noiseSource.stop(now + dur);

      // --- 2. High-Pressure Shockwave Wavefront (Supersonic Air Shearing) ---
      // A swift broadband air-shearing sweep (1500Hz -> 180Hz over 140ms), simulating the wavefront hitting the listener
      const shockBufSize = Math.floor(sampleRate * 0.16);
      const shockBuf = ctx.createBuffer(1, shockBufSize, sampleRate);
      const shockData = shockBuf.getChannelData(0);
      for (let i = 0; i < shockBufSize; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * 22);
        shockData[i] = (Math.random() * 2 - 1) * env;
      }
      const shockSource = ctx.createBufferSource();
      shockSource.buffer = shockBuf;

      const shockFilter = ctx.createBiquadFilter();
      shockFilter.type = 'bandpass';
      shockFilter.frequency.setValueAtTime(1450 * pitchMod, now);
      shockFilter.frequency.exponentialRampToValueAtTime(190 * pitchMod, now + 0.14);
      shockFilter.Q.setValueAtTime(1.3, now);

      const shockGain = ctx.createGain();
      shockGain.gain.setValueAtTime(0.7 * finalVol, now);
      shockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      shockSource.connect(shockFilter);
      shockFilter.connect(shockGain);
      shockGain.connect(masterGain);
      shockSource.start(now);

      // --- 3. Sub-Acoustic Ground Concussion Punch (Acoustic Pressure Wave) ---
      // A weighted sub-harmonic pressure wave (64Hz -> 28Hz over 250ms), creates the physical thump of displaced air
      const subOsc = ctx.createOscillator();
      subOsc.type = 'triangle'; // Triangle provides smooth sub-weight with warm odd harmonics, much richer than sine!
      subOsc.frequency.setValueAtTime(64 * pitchMod, now);
      subOsc.frequency.exponentialRampToValueAtTime(28 * pitchMod, now + 0.28);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.85 * finalVol, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      subOsc.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start(now);
      subOsc.stop(now + 0.35);

    } catch (e) {
      this.playSfx('boom', volume);
    }
  }

  playSfx(name: string, volume: number = 0.7) {
    const finalVol = volume * this.sfxVolume;
    if (name === 'muyu') {
      let sound = this.sfxPool.get('muyu');
      if (!sound) {
        sound = new Howl({
          src: ['assets/music/muyu.mp3'],
          volume: finalVol
        });
        this.sfxPool.set('muyu', sound);
      }
      sound.volume(finalVol);
      sound.play();
      return;
    }

    // High quality synthetic SFX generator
    this.playSynthSfx(name, finalVol);
  }

  private playSynthSfx(type: string, volume: number = 0.5) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      if (type === 'shoot') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);
        gain.gain.setValueAtTime(0.25 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'laser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.22);
        gain.gain.setValueAtTime(0.22 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'boom') {
        const bufferSize = ctx.sampleRate * 0.45;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(50, now + 0.45);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.45 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
      } else if (type === 'tornado') {
        // Neo-Maxima Tornado Thunder: High-energy crisp laser shot + turbine whine + electric snap
        // 1. High-piercing main laser pulse (Square + Sawtooth 1800Hz -> 380Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(1850, now);
        osc1.frequency.exponentialRampToValueAtTime(380, now + 0.32);
        gain1.gain.setValueAtTime(0.55 * volume, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.32);

        // 2. Harmonic laser beam layer (Square wave for sci-fi laser bite)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(2200, now);
        osc2.frequency.exponentialRampToValueAtTime(440, now + 0.25);
        gain2.gain.setValueAtTime(0.35 * volume, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.25);

        // 3. Super Maxima turbine whistle chirp (800Hz -> 2600Hz transient rise)
        const chirpOsc = ctx.createOscillator();
        const chirpGain = ctx.createGain();
        chirpOsc.type = 'sine';
        chirpOsc.frequency.setValueAtTime(800, now);
        chirpOsc.frequency.exponentialRampToValueAtTime(2600, now + 0.14);
        chirpGain.gain.setValueAtTime(0.3 * volume, now);
        chirpGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        chirpOsc.connect(chirpGain);
        chirpGain.connect(ctx.destination);
        chirpOsc.start(now);
        chirpOsc.stop(now + 0.16);

        // 4. Crackling plasma discharge sizzle
        const bufferSize = ctx.sampleRate * 0.28;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1400, now);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.28 * volume, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
      } else if (type === 'alarm') {
        // High-pitch dual-tone emergency siren
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(950, now + 0.25);
        osc.frequency.linearRampToValueAtTime(600, now + 0.5);
        gain.gain.setValueAtTime(0.3 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      // AudioContext fallback ignored safely
    }
  }

  playMenu() {
    this.playBgm('thoughts.mp3');
  }

  playStageBgm(level: number) {
    if (level === 5) {
      this.playBgm('love_theme_from_tiga.mp3');
    } else if (level >= 6) {
      this.playBgm('valse_di_fantastica.mp3');
    } else if (level === 4) {
      this.playBgm('thedogs.mp3');
    } else {
      this.playBgm('night_crusing.mp3');
    }
  }

  playMuyu() {
    this.playSfx('muyu', 0.95);
  }

  playLian() {
    // Check if lian exists, else fallback to thoughts
    this.playBgm('lian.mp3', true);
  }

  playSysu() {
    this.playBgm('sysu.mp3', false);
  }
}

export const sounds = new SoundSystem();
