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

export function getTonnetzGrid(cols = 5, rows = 5, centerPitch = 'c') {
  const nodes = [];
  const rootOffset = NOTE_OFFSETS[centerPitch.toLowerCase()] ?? 0;
  
  const halfCols = Math.floor(cols / 2);
  const halfRows = Math.floor(rows / 2);

  for (let r = -halfRows; r <= halfRows; r++) {
    for (let c = -halfCols; c <= halfCols; c++) {
      // x axis = Perfect Fifths (+7 semitones per step)
      // y axis = Major Thirds (+4 semitones per step)
      const semitoneOffset = (rootOffset + (c * 7) + (r * 4)) % 12;
      const normalizedOffset = (semitoneOffset + 12) % 12;
      const pitch = OFFSET_TO_NOTE[normalizedOffset];
      const noteStr = `${pitch}3`;

      nodes.push({
        x: c,
        y: r,
        pitch,
        noteStr,
        munsellColor: getMunsellColor(pitch)
      });
    }
  }

  return nodes;
}

export function getLeviGraphData() {
  const pitches = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
  const nodes = [];
  const edges = [];

  // 12 Major triads & 12 Minor triads (Boland & Hughston 2026, Sterneck D222)
  pitches.forEach((root, idx) => {
    // Major triad: root, root+4, root+7
    const rootMidi = NOTE_OFFSETS[root];
    const m3_1 = OFFSET_TO_NOTE[(rootMidi + 4) % 12];
    const m5_1 = OFFSET_TO_NOTE[(rootMidi + 7) % 12];
    const majId = `${root}_M`;

    nodes.push({
      id: majId,
      name: `${root.toUpperCase()} M`,
      root,
      type: 'major',
      pitches: [root, m3_1, m5_1],
      color: getMunsellColor(root, 65)
    });

    // Minor triad: root, root+3, root+7
    const m3_2 = OFFSET_TO_NOTE[(rootMidi + 3) % 12];
    const minId = `${root}_m`;

    nodes.push({
      id: minId,
      name: `${root.toUpperCase()} m`,
      root,
      type: 'minor',
      pitches: [root, m3_2, m5_1],
      color: getMunsellColor(root, 35)
    });
  });

  // Conexiones de la red de Levi entre triadas que comparten 2 notas (Operaciones Neo-Riemannianas P, L, R)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i];
      const n2 = nodes[j];
      if (n1.type !== n2.type) {
        const commonPitches = n1.pitches.filter(p => n2.pitches.includes(p));
        if (commonPitches.length >= 2) {
          edges.push({ from: n1.id, to: n2.id, common: commonPitches });
        }
      }
    }
  }

  return { nodes, edges };
}

export function getTristanTonnetzData() {
  const pitches = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
  const nodes = [];
  const edges = [];

  // Acordes de Género Tristan (Dominante 7 y Semidisminuido 7 - Configuración Sterneck D228)
  pitches.forEach((root) => {
    const rootMidi = NOTE_OFFSETS[root];
    const domId = `${root}_dom7`;
    const halfId = `${root}_halfDim`;

    nodes.push({
      id: domId,
      name: `${root.toUpperCase()}7`,
      root,
      type: 'dom7',
      label: '7ma Dominante',
      pitches: [root, OFFSET_TO_NOTE[(rootMidi + 4) % 12], OFFSET_TO_NOTE[(rootMidi + 7) % 12], OFFSET_TO_NOTE[(rootMidi + 10) % 12]],
      color: getMunsellColor(root, 60)
    });

    nodes.push({
      id: halfId,
      name: `${root.toUpperCase()}ø7`,
      root,
      type: 'halfDim',
      label: 'Acorde Tristan (ø7)',
      pitches: [root, OFFSET_TO_NOTE[(rootMidi + 3) % 12], OFFSET_TO_NOTE[(rootMidi + 6) % 12], OFFSET_TO_NOTE[(rootMidi + 10) % 12]],
      color: getMunsellColor(root, 40)
    });
  });

  // Conexiones de voz Wagnerianas (Octaciclos de Sterneck D228)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i];
      const n2 = nodes[j];
      const common = n1.pitches.filter(p => n2.pitches.includes(p));
      if (common.length >= 2) {
        edges.push({ from: n1.id, to: n2.id, common });
      }
    }
  }

  return { nodes, edges };
}

export function getHarmonicThreadConnections(activeNoteStr, rootNote = 'c', scaleType = 'major') {
  if (!activeNoteStr || activeNoteStr === '~') return [];

  const match = activeNoteStr.match(/^([a-g]s?b?)(\d)$/i);
  if (!match) return [];

  const noteName = match[1].toLowerCase();
  const octave = parseInt(match[2], 10);
  const connections = [];

  // 1. Paso Siguiente (Scale Step +1)
  const nextStep = mutateNote(activeNoteStr, 1, rootNote, scaleType);
  if (nextStep && nextStep !== activeNoteStr) {
    connections.push({ fromNote: activeNoteStr, toNote: nextStep, relation: 'Siguiente Paso', type: 'step' });
  }

  // 2. Tercera en Escala (+2 pasos)
  const third = mutateNote(activeNoteStr, 2, rootNote, scaleType);
  if (third && third !== activeNoteStr) {
    connections.push({ fromNote: activeNoteStr, toNote: third, relation: '3ra Armónica', type: 'third' });
  }

  // 3. Quinta en Escala (+4 pasos)
  const fifth = mutateNote(activeNoteStr, 4, rootNote, scaleType);
  if (fifth && fifth !== activeNoteStr) {
    connections.push({ fromNote: activeNoteStr, toNote: fifth, relation: '5ta Consonante', type: 'fifth' });
  }

  // 4. Octava Superior (+12 semitonos)
  const octaveUp = `${noteName}${octave + 1}`;
  if (octaveUp) {
    connections.push({ fromNote: activeNoteStr, toNote: octaveUp, relation: '8va Octava', type: 'octave' });
  }

  return connections;
}


