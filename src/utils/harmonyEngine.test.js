import { expect, test } from 'vitest';
import { mutateNote, getNoteColor, SCALES } from './harmonyEngine.js';

test('mutates note up the scale (C Major)', () => {
  // C Major: C, D, E, F, G, A, B
  expect(mutateNote('c3', 1, 'c', 'major')).toBe('d3');
  expect(mutateNote('e3', 1, 'c', 'major')).toBe('f3');
  expect(mutateNote('b3', 1, 'c', 'major')).toBe('c4'); // octave up
});

test('mutates note down the scale (C Major)', () => {
  expect(mutateNote('f3', -1, 'c', 'major')).toBe('e3');
  expect(mutateNote('c3', -1, 'c', 'major')).toBe('b2'); // octave down
});

test('mutates note in Eb Minor Harmonic', () => {
  expect(mutateNote('eb3', 1, 'eb', 'harmonicMinor')).toBe('f3');
  expect(mutateNote('eb3', -1, 'eb', 'harmonicMinor')).toBe('d3'); 
});

test('ignores rests', () => {
  expect(mutateNote('~', 1, 'c', 'major')).toBe('~');
});

test('getNoteColor returns valid tailwind colors', () => {
  expect(getNoteColor('eb3')).toContain('bg-');
  expect(getNoteColor('~')).toContain('bg-');
});
