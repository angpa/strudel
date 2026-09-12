export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
};

const NOTE_COLORS = {
  'c': 'bg-red-500',
  'cs': 'bg-red-700',
  'db': 'bg-red-700',
  'd': 'bg-orange-500',
  'ds': 'bg-orange-700',
  'eb': 'bg-amber-600',
  'e': 'bg-yellow-500',
  'f': 'bg-green-500',
  'fs': 'bg-green-700',
  'gb': 'bg-green-700',
  'g': 'bg-teal-500',
  'gs': 'bg-teal-700',
  'ab': 'bg-blue-600',
  'a': 'bg-blue-500',
  'as': 'bg-indigo-700',
  'bb': 'bg-indigo-500',
  'b': 'bg-purple-500',
  'cb': 'bg-purple-500',
  '~': 'bg-slate-800'
};

const NOTE_OFFSETS = {
  'c': 0, 'cs': 1, 'db': 1, 'd': 2, 'ds': 3, 'eb': 3, 'e': 4, 
  'f': 5, 'fs': 6, 'gb': 6, 'g': 7, 'gs': 8, 'ab': 8, 'a': 9, 
  'as': 10, 'bb': 10, 'b': 11, 'cb': 11
};

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

export function mutateNote(noteStr, steps = 1, rootNote = 'c', scaleType = 'major') {
  if (noteStr === '~' || noteStr === '') return noteStr;

  const match = noteStr.match(/^([a-g]s?b?)(\d)$/i);
  if (!match) return noteStr;

  const noteName = match[1].toLowerCase();
  const octave = parseInt(match[2], 10);
  const midi = noteToMidi(noteName, octave);
  
  const rootMidi = noteToMidi(rootNote.toLowerCase(), octave);
  const normalizedMidi = midi >= rootMidi ? midi : midi + 12;
  const diffFromRoot = normalizedMidi - rootMidi;

  const scaleIntervals = SCALES[scaleType] || SCALES.major;

  let scaleIndex = scaleIntervals.indexOf(diffFromRoot);
  
  if (scaleIndex === -1) {
    // Si la nota no está en la escala, la aproximamos
    return noteStr; 
  }

  let newScaleIndex = scaleIndex + steps;
  let octaveOffset = 0;

  while (newScaleIndex >= scaleIntervals.length) {
    newScaleIndex -= scaleIntervals.length;
    octaveOffset++;
  }
  while (newScaleIndex < 0) {
    newScaleIndex += scaleIntervals.length;
    octaveOffset--;
  }

  const newMidi = rootMidi + (octaveOffset * 12) + scaleIntervals[newScaleIndex];
  return midiToNoteStr(newMidi);
}

export function getNoteColor(noteStr) {
  if (noteStr === '~' || noteStr === '') return NOTE_COLORS['~'];
  const match = noteStr.match(/^([a-g]s?b?)(\d)$/i);
  if (!match) return 'bg-slate-600';
  const noteName = match[1].toLowerCase();
  return NOTE_COLORS[noteName] || 'bg-slate-600';
}

export function getMunsellColor(noteStr, lightness = 50) {
  if (!noteStr || noteStr === '~') return 'hsl(220, 15%, 15%)';
  const match = noteStr.match(/^([a-g]s?b?)(\d)?$/i);
  if (!match) return 'hsl(220, 15%, 25%)';
  const noteName = match[1].toLowerCase();
  const offset = NOTE_OFFSETS[noteName] ?? 0;
  const hue = (offset * 30) % 360;
  return `hsl(${hue}, 85%, ${lightness}%)`;
}

export function getScaleNotes(rootNote = 'c', scaleType = 'major') {
  const rootLower = rootNote.toLowerCase();
  const rootOffset = NOTE_OFFSETS[rootLower] ?? 0;
  const intervals = SCALES[scaleType] || SCALES.major;
  return intervals.map(interval => OFFSET_TO_NOTE[(rootOffset + interval) % 12]);
}

const INTERVAL_NAMES = {
  0: 'Tónica (Root)',
  1: '2da menor (m2)',
  2: '2da mayor (M2)',
  3: '3ra menor (m3)',
  4: '3ra mayor (M3)',
  5: '4ta justa (P4)',
  6: 'Tritono (TT)',
  7: '5ta justa (P5)',
  8: '6ta menor (m6)',
  9: '6ta mayor (M6)',
  10: '7ma menor (m7)',
  11: '7ma mayor (M7)',
  12: '8va (Octave)'
};

export function getHarmonicSuggestions(activeNoteStr, rootNote = 'c', scaleType = 'major') {
  const suggestions = {};
  const scalePitches = getScaleNotes(rootNote, scaleType);

  let activeMidi = null;
  if (activeNoteStr && activeNoteStr !== '~') {
    const match = activeNoteStr.match(/^([a-g]s?b?)(\d)$/i);
    if (match) {
      const noteName = match[1].toLowerCase();
      const oct = parseInt(match[2], 10);
      activeMidi = noteToMidi(noteName, oct);
    }
  }

  // Generar universo de notas entre octava 2 y octava 5 (teclado cromático Munsell extendido)
  for (let oct = 2; oct <= 5; oct++) {
    for (let offset = 0; offset < 12; offset++) {
      const pitchName = OFFSET_TO_NOTE[offset];
      const noteStr = `${pitchName}${oct}`;
      const targetMidi = noteToMidi(pitchName, oct);
      const isScaleMember = scalePitches.includes(pitchName);

      let relation = '';
      let isSuggested = false;

      if (activeMidi !== null) {
        const diff = targetMidi - activeMidi;
        if (diff >= 0 && diff <= 12) {
          relation = INTERVAL_NAMES[diff] || '';
          // Sugerencias principales: Tónica, 3ras, 4ta, 5ta, 8va o notas en escala
          if ([0, 3, 4, 5, 7, 12].includes(diff)) {
            isSuggested = true;
          }
        } else if (diff < 0 && Math.abs(diff) <= 12) {
          const absDiff = Math.abs(diff);
          relation = `-${INTERVAL_NAMES[absDiff]?.split(' ')[0] || absDiff}`;
        }
      }

      suggestions[noteStr] = {
        isScaleMember,
        isSuggested,
        relation,
        munsellColor: getMunsellColor(noteStr)
      };
    }
  }

  return suggestions;
}


