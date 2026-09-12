export function initDepecheModeKit() {
  const registerSound = window.registerSound;
  const samples = window.samples;
  const getAudioContext = window.getAudioContext;

  if (!registerSound || !samples || !getAudioContext) {
    console.error("Strudel globals not found. Make sure @strudel/repl is loaded.");
    return;
  }

  const ctx = getAudioContext();

  // ── 1. Alan Wilder Choir (Pad Vocal Sintetizado) ──
  registerSound('alan_wilder_choir', (time, value, onended) => {
    // Frecuencia desde Strudel (o 440 por defecto)
    const freq = value.freq || 440;
    const duration = value.duration || 1;
    
    // Crear osciladores (sawtooth + triangle)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    
    // Desafinación sutil para engrosar el sonido
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.01;

    // Filtro Lowpass (ajustable desde Strudel)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = value.cutoff || 1500;
    
    // Ganancia / ADSR
    const gainNode = ctx.createGain();
    const attack = value.attack || 0.4;
    const release = value.release || 1.2;
    
    // Envolvente
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.5, time + attack);
    gainNode.gain.setValueAtTime(0.5, time + duration);
    gainNode.gain.linearRampToValueAtTime(0, time + duration + release);

    // Conexiones
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    // Para conectar al destino principal de Strudel, retornamos el nodo
    // gainNode.connect(ctx.destination); // NO hacer esto, Strudel se encarga

    // Iniciar y detener
    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + release);
    osc2.stop(time + duration + release);
    
    // Avisar a Strudel cuando termine para limpiar memoria
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
    const freq = value.freq || 110;
    const duration = value.duration || 0.5;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = freq;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    
    // Envelope para el filtro (característico del bajo de Enjoy the Silence)
    filter.frequency.setValueAtTime(value.cutoff || 2000, time);
    filter.frequency.exponentialRampToValueAtTime(200, time + 0.3);

    const gainNode = ctx.createGain();
    const attack = value.attack || 0.01;
    const release = value.release || 0.2;

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.8, time + attack);
    gainNode.gain.setValueAtTime(0.8, time + duration);
    gainNode.gain.linearRampToValueAtTime(0, time + duration + release);

    osc.connect(filter);
    filter.connect(gainNode);
    // gainNode.connect(ctx.destination); // Strudel lo conecta

    osc.start(time);
    osc.stop(time + duration + release);

    setTimeout(() => {
      osc.disconnect();
      filter.disconnect();
      gainNode.disconnect();
      onended();
    }, (duration + release) * 1000 + 100);

    return { node: gainNode };
  });

  // ── 3. Instrumentos Acústicos y Samplers (Christian Eigner / Martin Gore) ──
  // Usamos samples() nativo de Strudel para apuntar a URLs genéricas
  samples({
    'martin_gore_guitar': 'https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/guit/000_guit.wav',
    'christian_eigner_kick': 'https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/bd/000_bd.wav',
    'christian_eigner_snare': 'https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/sd/000_sd.wav',
    'christian_eigner_hihat': 'https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/hc/000_hc.wav'
  });
}
