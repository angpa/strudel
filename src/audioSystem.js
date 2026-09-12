import { getAudioContext } from '@strudel/webaudio';
import '@strudel/repl/index.mjs'; // MUST import from source to deduplicate superdough
import { initDepecheModeKit } from './depecheModeKit.js';

class AudioSystem {
  get editorEl() {
    return document.querySelector('strudel-editor');
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

  playPreviewNote(noteStr) {
    if (!noteStr || noteStr === '~') return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const match = noteStr.match(/^([a-g]s?b?)(\d)$/i);
      if (!match) return;

      const offsets = { 'c': 0, 'cs': 1, 'db': 1, 'd': 2, 'ds': 3, 'eb': 3, 'e': 4, 'f': 5, 'fs': 6, 'gb': 6, 'g': 7, 'gs': 8, 'ab': 8, 'a': 9, 'as': 10, 'bb': 10, 'b': 11 };
      const noteName = match[1].toLowerCase();
      const octave = parseInt(match[2], 10);
      const midi = (octave + 1) * 12 + (offsets[noteName] ?? 0);
      const freq = 440 * Math.pow(2, (midi - 69) / 12);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio preview error:', e);
    }
  }
}

export const audioSystem = new AudioSystem();

