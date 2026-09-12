import { registerSound, samples, getAudioContext } from '@strudel/web';

export function initDepecheModeKit() {
  // ── 1. Alan Wilder Choir (Pad Vocal Sintetizado) ──
  registerSound('alan_wilder_choir', (time, value, onended) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const startTime = Math.max(time, ctx.currentTime);

    const freq = value.freq || 440;
    const duration = value.duration || 1;
    
    // Crear osciladores (sawtooth + triangle para sonido de coro rico)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    
    // Desafinación sutil para engrosar el sonido
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.006;

    // Filtro Lowpass
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = value.cutoff || 1500;
    
    // Ganancia / ADSR
    const gainNode = ctx.createGain();
    const attack = value.attack || 0.3;
    const release = value.release || 1.0;
    
    // Envolvente
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.5, startTime + attack);
    gainNode.gain.setValueAtTime(0.5, startTime + duration);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration + release);

    // Conexiones
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);

    // Iniciar y detener
    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + release);
    osc2.stop(startTime + duration + release);
    
    // Cleanup
    setTimeout(() => {
      osc1.disconnect();
      osc2.disconnect();
      filter.disconnect();
      gainNode.disconnect();
      onended();
    }, (duration + release) * 1000 + 100);

    return { node: gainNode };
  });

  // ── 2. Peter Gordeno Bass (Bajo de Sintetizador) ──
  registerSound('peter_gordeno_bass', (time, value, onended) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const startTime = Math.max(time, ctx.currentTime);

    const freq = value.freq || 110;
    const duration = value.duration || 0.4;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    
    // Filter envelope característico del bajo de Enjoy the Silence
    filter.frequency.setValueAtTime(value.cutoff || 2500, startTime);
    filter.frequency.exponentialRampToValueAtTime(150, startTime + Math.min(duration, 0.3));

    const gainNode = ctx.createGain();
    const attack = value.attack || 0.01;
    const release = value.release || 0.15;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.8, startTime + attack);
    gainNode.gain.setValueAtTime(0.8, startTime + duration);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration + release);

    osc.connect(filter);
    filter.connect(gainNode);

    osc.start(startTime);
    osc.stop(startTime + duration + release);

    setTimeout(() => {
      osc.disconnect();
      filter.disconnect();
      gainNode.disconnect();
      onended();
    }, (duration + release) * 1000 + 100);

    return { node: gainNode };
  });

  // ── 3. Martin Gore Guitar (Sintetizador Pluck Riff) ──
  registerSound('martin_gore_guitar', (time, value, onended) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const startTime = Math.max(time, ctx.currentTime);

    const freq = value.freq || 330;
    const duration = value.duration || 0.5;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc2.type = 'sawtooth';

    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.003; // Chorus effect

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, startTime);
    filter.frequency.exponentialRampToValueAtTime(600, startTime + 0.2);

    const gainNode = ctx.createGain();
    const attack = 0.005;
    const release = value.release || 0.4;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.7, startTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration + release);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + release);
    osc2.stop(startTime + duration + release);

    setTimeout(() => {
      osc1.disconnect();
      osc2.disconnect();
      filter.disconnect();
      gainNode.disconnect();
      onended();
    }, (duration + release) * 1000 + 100);

    return { node: gainNode };
  });

  // ── 4. Christian Eigner (Batería Acústica / Híbrida) ──
  samples({
    'christian_eigner_kick': 'https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/jazz/000_BD.wav',
    'christian_eigner_snare': 'https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/jazz/007_SN.wav',
    'christian_eigner_hihat': 'https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/jazz/003_HH.wav'
  });
}
