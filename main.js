import { initStrudel, evaluate, hush } from '@strudel/web';

const statusEl = document.getElementById('status');
const playBtn = document.getElementById('play');
const stopBtn = document.getElementById('stop');
const codeInput = document.getElementById('code');

// Inicializar strudel y esperar a que esté listo
statusEl.textContent = 'Inicializando Strudel...';
const ready = initStrudel();

ready.then(() => {
  statusEl.textContent = 'Listo. Presiona Play para escuchar.';
}).catch((err) => {
  statusEl.textContent = 'Error al inicializar: ' + err.message;
  statusEl.className = 'error';
});

playBtn.addEventListener('click', async () => {
  try {
    // Asegurarse de que strudel esté completamente inicializado
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

stopBtn.addEventListener('click', () => {
  hush();
  statusEl.textContent = '■ Detenido.';
  statusEl.className = '';
});
