import React from 'react';
import { mutateNote, getNoteColor } from '../utils/harmonyEngine';

export default function TrackMixer({ tracks, setTracks }) {
  
  const handleNoteClick = (trackIndex, stepIndex, noteIndex, currentNote) => {
    // Si la nota es silencio (~), no hacemos nada (podríamos implementar cambiar a nota, pero no por ahora)
    if (currentNote === '~') return;

    // Mutate the note by 1 step in the scale
    const newNote = mutateNote(currentNote, 1);

    const newTracks = [...tracks];
    const track = { ...newTracks[trackIndex] };
    const steps = [...track.steps];
    const stepNotes = [...steps[stepIndex]];
    
    stepNotes[noteIndex] = newNote;
    steps[stepIndex] = stepNotes;
    track.steps = steps;
    newTracks[trackIndex] = track;

    setTracks(newTracks);
  };

  return (
    <div className="flex flex-col gap-4">
      {tracks.map((track, trackIndex) => (
        <div key={track.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-center">
          
          <div className="w-32 flex-shrink-0">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">{track.id}</h3>
            <p className="text-[10px] text-slate-500 truncate">{track.instrument}</p>
          </div>

          <div className="flex-1 flex gap-2 overflow-x-auto">
            {track.steps.map((stepNotes, stepIndex) => (
              <div key={stepIndex} className="flex gap-1 p-2 bg-black/20 rounded-xl border border-white/5 min-w-[60px] items-center justify-center">
                {stepNotes.map((note, noteIndex) => (
                  <button
                    key={noteIndex}
                    onClick={() => handleNoteClick(trackIndex, stepIndex, noteIndex, note)}
                    className={`px-2 py-1 text-xs font-mono font-bold rounded shadow-lg transition-transform hover:scale-110 active:scale-95 ${getNoteColor(note)} text-white/90`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="w-20 text-right">
            <span className="text-[10px] text-slate-500 font-mono">GAIN: {track.gain}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
