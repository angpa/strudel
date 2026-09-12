import { initStrudel } from '@strudel/web';
import '@strudel/repl';

import { initDepecheModeKit } from './depecheModeKit.js';

// ── Elementos del DOM ──
const statusEl = document.getElementById('status');
const playBtn = document.getElementById('play');
const stopBtn = document.getElementById('stop');
const gitInfo = document.getElementById('git-info');
const editorEl = document.querySelector('strudel-editor');

// ── Git version badge ──
gitInfo.innerHTML = `push <span>#${__GIT_COUNT__}</span> · <span>${__GIT_HASH__}</span> · ${__GIT_MESSAGE__}`;

// ── Inicializar Instrumentos Personalizados ──
initDepecheModeKit();

// ── Inicializar Strudel ──
statusEl.textContent = 'Inicializando Strudel...';

initStrudel().then(() => {
  statusEl.textContent = 'Listo. Presiona Play para escuchar.';
}).catch((err) => {
  statusEl.textContent = 'Error al inicializar: ' + err.message;
  statusEl.className = 'error';
});

// ── Play ──
playBtn.addEventListener('click', async () => {
  if (window.getAudioContext) {
    window.getAudioContext().resume();
  }
  if (editorEl && editorEl.editor) {
    statusEl.textContent = '▶ Reproduciendo...';
    statusEl.className = 'playing';
    editorEl.editor.evaluate();
  }
});

// ── Stop ──
stopBtn.addEventListener('click', () => {
  if (editorEl && editorEl.editor) {
    editorEl.editor.stop();
    statusEl.textContent = '■ Detenido.';
    statusEl.className = '';
  }
});
