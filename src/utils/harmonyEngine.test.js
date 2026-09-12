import { expect, test } from 'vitest';
import { mutateNote, getNoteColor, SCALES, getScaleNotes, getHarmonicSuggestions, getMunsellColor, getTonnetzGrid } from './harmonyEngine.js';

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

test('getMunsellColor generates a valid HSL string based on 12-pitch wheel', () => {
  const cColor = getMunsellColor('c3');
  expect(cColor).toContain('hsl(');
  expect(cColor).toContain('0,'); // 0 deg for C

  const fSharpColor = getMunsellColor('gb3');
  expect(fSharpColor).toContain('hsl(');
  expect(fSharpColor).toContain('180,'); // 180 deg for F#/Gb
});

test('getScaleNotes returns pitch names belonging to key and scale', () => {
  const cMajorPitches = getScaleNotes('c', 'major');
  expect(cMajorPitches).toEqual(['c', 'd', 'e', 'f', 'g', 'a', 'b']);

  const aMinorPitches = getScaleNotes('a', 'minor');
  expect(aMinorPitches).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
});

test('getHarmonicSuggestions maps all 12 chromatic intervals correctly', () => {
  // Pressed note: c3 -> should calculate relative intervals for all 12 chromatic notes
  const suggestions = getHarmonicSuggestions('c3', 'c', 'major');
  
  expect(suggestions['c3'].relation).toBe('Tónica (Root)');
  expect(suggestions['eb3']?.relation || suggestions['ds3']?.relation).toBe('3ra menor (m3)');
  expect(suggestions['e3'].relation).toBe('3ra mayor (M3)');
  expect(suggestions['g3'].relation).toBe('5ta justa (P5)');
  expect(suggestions['c4'].relation).toBe('8va (Octave)');
});

test('getTonnetzGrid calculates 2D Tonnetz lattice with fifths and thirds', () => {
  const grid = getTonnetzGrid(3, 3, 'c');
  expect(grid.length).toBe(9); // 3x3 grid
  
  // Center node at (0,0) should be 'c'
  const centerNode = grid.find(n => n.x === 0 && n.y === 0);
  expect(centerNode.pitch).toBe('c');

  // Node to the right (x=1, y=0) should be perfect fifth above C -> G
  const fifthNode = grid.find(n => n.x === 1 && n.y === 0);
  expect(fifthNode.pitch).toBe('g');

  // Node diagonally up (x=0, y=1) should be major third above C -> E
  const thirdNode = grid.find(n => n.x === 0 && n.y === 1);
  expect(thirdNode.pitch).toBe('e');
});



