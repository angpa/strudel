// Eb Minor Harmonic scale
const SCALE = ['eb', 'f', 'gb', 'ab', 'bb', 'b', 'd'];

const NOTE_COLORS = {
  'eb': 'bg-rose-500',
  'f': 'bg-orange-500',
  'gb': 'bg-amber-500',
  'ab': 'bg-green-500',
  'bb': 'bg-emerald-500',
  'b': 'bg-cyan-500',
  'd': 'bg-indigo-500',
  '~': 'bg-slate-800' // Rest
};

// Eb Minor Harmonic scale intervals (semitones from root)
const SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 11];

// Map note names to their semitone offset from C
const NOTE_OFFSETS = {
  'c': 0, 'cs': 1, 'db': 1, 'd': 2, 'ds': 3, 'eb': 3, 'e': 4, 
  'f': 5, 'fs': 6, 'gb': 6, 'g': 7, 'gs': 8, 'ab': 8, 'a': 9, 
  'as': 10, 'bb': 10, 'b': 11, 'cb': 11
};

// Reverse map (prefer flats for this scale)
const OFFSET_TO_NOTE = {
  0: 'c', 1: 'db', 2: 'd', 3: 'eb', 4: 'e', 5: 'f', 6: 'gb',
  7: 'g', 8: 'ab', 9: 'a', 10: 'bb', 11: 'b'
};

function noteToMidi(noteName, octave) {
  return (octave + 1) * 12 + NOTE_OFFSETS[noteName];
}

function midiToNoteStr(midi) {
  const octave = Math.floor(midi / 12) - 1;
  const noteName = OFFSET_TO_NOTE[midi % 12];
  return `${noteName}${octave}`;
}

export function mutateNote(noteStr, steps = 1) {
  if (noteStr === '~' || noteStr === '') return noteStr;

  const match = noteStr.match(/^([a-g]s?b?)(\d)$/i);
  if (!match) return noteStr;

  const noteName = match[1].toLowerCase();
  const octave = parseInt(match[2], 10);
  
  const midi = noteToMidi(noteName, octave);
  
  // Encontrar el root (Eb) más cercano hacia abajo
  const rootMidi = noteToMidi('eb', octave);
  const normalizedMidi = midi >= rootMidi ? midi : midi + 12;
  const diffFromRoot = normalizedMidi - rootMidi;

  // Encontrar en qué grado de la escala estamos
  let scaleIndex = SCALE_INTERVALS.indexOf(diffFromRoot);
  
  if (scaleIndex === -1) {
    // Si la nota no está en la escala exactamente, la aproximamos
    return noteStr; 
  }

  // Movernos N steps en la escala
  let newScaleIndex = scaleIndex + steps;
  let octaveOffset = 0;

  while (newScaleIndex >= SCALE_INTERVALS.length) {
    newScaleIndex -= SCALE_INTERVALS.length;
    octaveOffset++;
  }
  while (newScaleIndex < 0) {
    newScaleIndex += SCALE_INTERVALS.length;
    octaveOffset--;
  }

  const newMidi = rootMidi + (octaveOffset * 12) + SCALE_INTERVALS[newScaleIndex];
  return midiToNoteStr(newMidi);
}

export function getNoteColor(noteStr) {
  if (noteStr === '~' || noteStr === '') return NOTE_COLORS['~'];
  const match = noteStr.match(/^([a-g]b?)(\d)$/i);
  if (!match) return 'bg-slate-600';
  const noteName = match[1].toLowerCase();
  return NOTE_COLORS[noteName] || 'bg-slate-600';
}
