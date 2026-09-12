import { initStrudel, evaluate, hush } from '@strudel/web';

// ── Elementos del DOM ──
const statusEl = document.getElementById('status');
const playBtn = document.getElementById('play');
const stopBtn = document.getElementById('stop');
const codeInput = document.getElementById('code');
const gitInfo = document.getElementById('git-info');

// ── Git version badge ──
// __GIT_HASH__, __GIT_COUNT__, __GIT_MESSAGE__ se inyectan por vite.config.js
gitInfo.innerHTML = `push <span>#${__GIT_COUNT__}</span> · <span>${__GIT_HASH__}</span> · ${__GIT_MESSAGE__}`;

// ── Inicializar Strudel ──
statusEl.textContent = 'Inicializando Strudel...';
const ready = initStrudel();

ready.then(() => {
  statusEl.textContent = 'Listo. Presiona Play para escuchar.';
}).catch((err) => {
  statusEl.textContent = 'Error al inicializar: ' + err.message;
  statusEl.className = 'error';
});

// ── Play ──
playBtn.addEventListener('click', async () => {
  try {
    await ready;
    statusEl.textContent = '▶ Reproduciendo...';
    statusEl.className = 'playing';
    await evaluate(codeInput.value);
  } catch (error) {
    console.error('Error:', error);
    statusEl.textContent = 'Error: ' + error.message;
    statusEl.className = 'error';
  }
});

// ── Stop ──
stopBtn.addEventListener('click', () => {
  hush();
  statusEl.textContent = '■ Detenido.';
  statusEl.className = '';
});
