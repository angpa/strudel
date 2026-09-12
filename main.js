import { audioSystem } from './audioSystem.js';

// ── Elementos del DOM ──
const statusEl = document.getElementById('status');
const playBtn = document.getElementById('play');
const stopBtn = document.getElementById('stop');
const gitInfo = document.getElementById('git-info');

// ── Git version badge ──
if (typeof __GIT_COUNT__ !== 'undefined') {
  gitInfo.innerHTML = `push <span>#${__GIT_COUNT__}</span> · <span>${__GIT_HASH__}</span> · ${__GIT_MESSAGE__}`;
}

// ── Inicializar Audio ──
statusEl.textContent = 'Inicializando Instrumentos...';

try {
  // Toda la lógica crítica de importaciones de Strudel y registro de sonidos
  // está encapsulada en audioSystem.js para proteger la arquitectura.
  audioSystem.init();
  statusEl.textContent = 'Listo. Presiona Play para escuchar.';
} catch (err) {
  statusEl.textContent = 'Error al inicializar: ' + err.message;
  statusEl.className = 'error';
}

// ── Eventos de UI ──
playBtn.addEventListener('click', async () => {
  const success = await audioSystem.play();
  if (success) {
    statusEl.textContent = '▶ Reproduciendo...';
    statusEl.className = 'playing';
  }
});

stopBtn.addEventListener('click', () => {
  const success = audioSystem.stop();
  if (success) {
    statusEl.textContent = '■ Detenido.';
    statusEl.className = '';
  }
});
