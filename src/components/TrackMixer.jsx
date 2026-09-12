import React from 'react';
import { mutateNote, getNoteColor } from '../utils/harmonyEngine';

const AVAILABLE_INSTRUMENTS = [
  'piano', 'supersaw', 'sawtooth', 'sine', 'tb303', 'bd', 'sd', 'hh', 'cp',
  'alan_wilder_choir', 'martin_gore_guitar', 'peter_gordeno_bass', 'christian_eigner_kick', 'christian_eigner_snare', 'christian_eigner_hihat'
];

export default function TrackMixer({ tracks, setTracks, rootNote, scaleType }) {
  
  const handleNoteClick = (trackIndex, stepIndex, noteIndex, currentNote) => {
    // Si la nota es silencio (~), no hacemos nada (podríamos implementar cambiar a nota, pero no por ahora)
    if (currentNote === '~') return;

    // Mutate the note by 1 step in the current global scale
    const newNote = mutateNote(currentNote, 1, rootNote, scaleType);

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

  const handleFxChange = (trackIndex, fxType, value) => {
    const newTracks = [...tracks];
    const track = { ...newTracks[trackIndex] };
    track.fx = { ...track.fx, [fxType]: parseFloat(value) };
    newTracks[trackIndex] = track;
    setTracks(newTracks);
  };

  return (
    <div className="flex flex-col gap-4">
      {tracks.map((track, trackIndex) => (
        <div key={track.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-center group/track relative">
          
          <button 
            onClick={() => {
              const newTracks = tracks.filter((_, i) => i !== trackIndex);
              setTracks(newTracks);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover/track:opacity-100 transition-opacity flex items-center justify-center text-xs shadow-lg"
          >
            ×
          </button>

          <div className="w-32 flex-shrink-0 flex flex-col gap-1">
            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{track.id}</h3>
            <select 
              value={track.instrument}
              onChange={(e) => {
                const newTracks = [...tracks];
                newTracks[trackIndex].instrument = e.target.value;
                setTracks(newTracks);
              }}
              className="text-[10px] bg-black/40 border border-white/10 text-slate-300 rounded outline-none p-1 w-full"
            >
              {AVAILABLE_INSTRUMENTS.map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex gap-2 overflow-x-auto min-w-[200px] items-center">
            {track.steps.map((stepNotes, stepIndex) => (
              <div key={stepIndex} className="flex gap-1 p-2 bg-black/20 rounded-xl border border-white/5 min-w-[60px] items-center justify-center relative group/step">
                {stepNotes.map((note, noteIndex) => (
                  <button
                    key={noteIndex}
                    onClick={() => handleNoteClick(trackIndex, stepIndex, noteIndex, note)}
                    className={`px-2 py-1 text-xs font-mono font-bold rounded shadow-lg transition-transform hover:scale-110 active:scale-95 ${getNoteColor(note)} text-white/90`}
                  >
                    {note}
                  </button>
                ))}
                {track.steps.length > 1 && (
                  <button 
                    onClick={() => {
                      const newTracks = [...tracks];
                      newTracks[trackIndex].steps.splice(stepIndex, 1);
                      setTracks(newTracks);
                    }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover/step:opacity-100 text-[8px] flex items-center justify-center transition-opacity"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            <button 
              onClick={() => {
                const newTracks = [...tracks];
                newTracks[trackIndex].steps.push(['~']);
                setTracks(newTracks);
              }}
              className="w-8 h-8 rounded-lg border border-dashed border-white/20 text-white/40 hover:bg-white/5 hover:text-white flex items-center justify-center font-bold transition-all"
            >
              +
            </button>
          </div>

          {/* FX RACK */}
          {track.fx && (
            <div className="w-56 flex flex-col gap-2 pl-4 border-l border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <label className="text-[9px] text-slate-500 w-12 text-right uppercase tracking-wider font-bold">Cutoff</label>
                <input 
                  type="range" min="100" max="20000" step="100" 
                  value={track.fx.cutoff} 
                  onChange={(e) => handleFxChange(trackIndex, 'cutoff', e.target.value)}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[9px] text-slate-500 w-12 text-right uppercase tracking-wider font-bold">Reverb</label>
                <input 
                  type="range" min="0" max="1" step="0.1" 
                  value={track.fx.room} 
                  onChange={(e) => handleFxChange(trackIndex, 'room', e.target.value)}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[9px] text-slate-500 w-12 text-right uppercase tracking-wider font-bold">Delay</label>
                <input 
                  type="range" min="0" max="1" step="0.1" 
                  value={track.fx.delay} 
                  onChange={(e) => handleFxChange(trackIndex, 'delay', e.target.value)}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          )}

          <div className="w-20 text-right shrink-0">
            <span className="text-[10px] text-slate-500 font-mono">GAIN: {track.gain}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
