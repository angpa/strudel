import { getAudioContext } from '@strudel/webaudio';
import '@strudel/repl/index.mjs'; // MUST import from source to deduplicate superdough
import { initDepecheModeKit } from './depecheModeKit.js';

class AudioSystem {
  constructor() {
    this.editorEl = document.querySelector('strudel-editor');
  }

  init() {
    // Inicializa todos los kits y sonidos customizados
    initDepecheModeKit();
  }

  async play() {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
      }
    } catch (e) {
      console.warn('AudioContext resume exception:', e);
    }

    if (this.editorEl && this.editorEl.editor) {
      this.editorEl.editor.evaluate();
      return true;
    }
    return false;
  }

  stop() {
    if (this.editorEl && this.editorEl.editor) {
      this.editorEl.editor.stop();
      return true;
    }
    return false;
  }
}

export const audioSystem = new AudioSystem();
