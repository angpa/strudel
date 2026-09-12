import { getAudioContext } from '@strudel/webaudio';
import '@strudel/repl/index.mjs'; // Usamos la fuente original para que Vite no duplique módulos
import { initDepecheModeKit } from './depecheModeKit.js';

// ── Elementos del DOM ──
const statusEl = document.getElementById('status');
const playBtn = document.getElementById('play');
const stopBtn = document.getElementById('stop');
const gitInfo = document.getElementById('git-info');
const editorEl = document.querySelector('strudel-editor');

// ── Git version badge ──
if (typeof __GIT_COUNT__ !== 'undefined') {
  gitInfo.innerHTML = `push <span>#${__GIT_COUNT__}</span> · <span>${__GIT_HASH__}</span> · ${__GIT_MESSAGE__}`;
}

// ── Inicializar Strudel ──
statusEl.textContent = 'Inicializando Instrumentos...';

try {
  // Ahora inicializamos el kit de forma síncrona/directa ya que estamos compartiendo
  // el mismo módulo '@strudel/webaudio' con el repl.
  initDepecheModeKit();
  statusEl.textContent = 'Listo. Presiona Play para escuchar.';
} catch (err) {
  statusEl.textContent = 'Error al inicializar: ' + err.message;
  statusEl.className = 'error';
}

// ── Play ──
playBtn.addEventListener('click', async () => {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
  } catch (e) {
    console.warn('AudioContext resume exception:', e);
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
