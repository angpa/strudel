import { expect, test } from 'vitest';
import { mutateNote, getNoteColor } from './harmonyEngine.js';

test('mutates note up the scale', () => {
  expect(mutateNote('eb3', 1)).toBe('f3');
  expect(mutateNote('f3', 1)).toBe('gb3');
  expect(mutateNote('b3', 1)).toBe('d4'); // octave up
});

test('mutates note down the scale', () => {
  expect(mutateNote('f3', -1)).toBe('eb3');
  expect(mutateNote('eb3', -1)).toBe('d3'); // below Eb3 is D3
});

test('ignores rests', () => {
  expect(mutateNote('~', 1)).toBe('~');
});

test('getNoteColor returns valid tailwind colors', () => {
  expect(getNoteColor('eb3')).toContain('bg-');
  expect(getNoteColor('~')).toContain('bg-');
});
