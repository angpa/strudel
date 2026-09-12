import React, { useState, useRef } from 'react';
import TrackMixer from './components/TrackMixer';
import SnapshotManager from './components/SnapshotManager';
import SpectrumCanvas from './components/SpectrumCanvas';
import AccordionKeyboard from './components/AccordionKeyboard';
import TonnetzVisualizer from './components/TonnetzVisualizer';
import { audioSystem } from './audioSystem';
import { Play, Square, Settings2 } from 'lucide-react';

import { SCALES } from './utils/harmonyEngine';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(113);
  const [rootNote, setRootNote] = useState('eb');
  const [scaleType, setScaleType] = useState('harmonicMinor');
  const [showTonnetz, setShowTonnetz] = useState(true);
  
  // INIT PATCH
  const [tracks, setTracks] = useState([
    { id: 'beat', instrument: 'bd', gain: 0.9, fx: { cutoff: 20000, room: 0.1, delay: 0 }, steps: [['c2'], ['~'], ['c2'], ['~']] },
    { id: 'synth', instrument: 'supersaw', gain: 0.5, fx: { cutoff: 1500, room: 0.8, delay: 0 }, steps: [['eb3', 'gb3'], ['b2', 'eb3'], ['gb3', 'bb3'], ['db3', 'f3']] }
  ]);
  const editorRef = useRef(null);

  React.useEffect(() => {
    try {
      audioSystem.init();
    } catch (err) {
      console.error('Failed to init audioSystem', err);
    }
  }, []);

  // Update Strudel engine dynamically when tracks change
  React.useEffect(() => {
    if (!editorRef.current || !editorRef.current.editor) return;

    // Generate Strudel code
    let code = `// ════ GENERATED DAW ENGINE ════\n\n`;
    const trackNames = [];

    tracks.forEach((track, i) => {
      // Build the pattern string: "<[step1] [step2]>"
      const patternInner = track.steps.map(step => `[${step.join(',')}]`).join(' ');
      const trackVarName = `track_${i}`;
      trackNames.push(trackVarName);
      
      // Parse standard effects
      let fxString = `.gain(${track.gain})`;
      if (track.fx && track.fx.cutoff < 20000) fxString += `.cutoff(${track.fx.cutoff})`;
      if (track.fx && track.fx.room > 0) fxString += `.room(${track.fx.room})`;
      if (track.fx && track.fx.delay > 0) {
        fxString += `.delay(${track.fx.delay}).delaytime(0.25)`; // Default delaytime for simplicity
      }
      
      code += `const ${trackVarName} = note("<${patternInner}>").s("${track.instrument}")${fxString};\n`;
    });

    const cpm = bpm / 4;
    code += `\nconst master = stack(${trackNames.join(', ')}).cpm(${cpm});\nmaster\n`;
    
    // Inject and evaluate silently if playing
    editorRef.current.editor.code = code;
    if (isPlaying) {
      editorRef.current.editor.evaluate();
    }
  }, [tracks, isPlaying, bpm]);

  const handleAddTrack = () => {
    setTracks([...tracks, { 
      id: `track-${tracks.length + 1}`, 
      instrument: 'piano', 
      gain: 0.8, 
      fx: { cutoff: 20000, room: 0, delay: 0 }, 
      steps: [['c3'], ['~'], ['~'], ['~']] 
    }]);
  };

  const handleNoteSelectFromKeyboard = (noteStr) => {
    if (!tracks || tracks.length === 0) return;
    setTracks(prevTracks => {
      const updated = [...prevTracks];
      const targetIndex = updated.findIndex(t => t.id === 'synth' || t.instrument === 'supersaw' || t.instrument === 'piano');
      const idx = targetIndex !== -1 ? targetIndex : updated.length - 1;
      
      const targetTrack = { ...updated[idx] };
      targetTrack.steps = [...targetTrack.steps, [noteStr]];
      updated[idx] = targetTrack;
      return updated;
    });
  };

  // Extract active notes playing across all tracks
  const activeNotesList = tracks.flatMap(t => t.steps.flatMap(s => s));

  return (
    <div className="min-h-screen bg-[#020205] text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-900/10 blur-[100px] rounded-full" />
      </div>

      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {/* TOP BAR */}
        <header className="flex justify-between items-center mb-8">
        {/* HEADER CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 p-4 lg:p-6 rounded-2xl border border-white/5 backdrop-blur-md w-full gap-6 shadow-2xl">
          <div className="flex items-center gap-6">
            {/* Play Button */}
            <div className="relative group">
              <div className={`absolute -inset-2 rounded-full blur opacity-20 group-hover:opacity-100 transition-opacity ${isPlaying ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
              <button 
                onClick={() => { audioSystem.play(); setIsPlaying(true); }}
                className={`p-3 rounded-xl transition-all relative ${isPlaying ? 'bg-green-500 text-black shadow-lg shadow-green-500/40' : 'hover:bg-white/5'}`}
              >
                <Play size={20} fill={isPlaying ? "currentColor" : "none"} />
              </button>
            </div>
            
            {/* Transport Info */}
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">Strudel Web DAW</h1>
              <div className="flex gap-2 text-xs text-slate-400 font-mono items-center mt-1">
                <span>BPM:</span>
                <input type="number" value={bpm} onChange={e => setBpm(Number(e.target.value))} className="bg-transparent border-b border-slate-600 w-12 text-white outline-none" />
                <span className="mx-2">•</span>
                <span>KEY:</span>
                <select value={rootNote} onChange={e => setRootNote(e.target.value)} className="bg-transparent text-white border-b border-slate-600 outline-none">
                  {['c','cs','d','eb','e','f','fs','g','ab','a','bb','b'].map(n => <option key={n} value={n} className="bg-slate-900">{n.toUpperCase()}</option>)}
                </select>
                <select value={scaleType} onChange={e => setScaleType(e.target.value)} className="bg-transparent text-white border-b border-slate-600 outline-none ml-1">
                  {Object.keys(SCALES).map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowTonnetz(!showTonnetz)}
              className={`text-xs px-3 py-2 rounded-xl border font-mono transition-all ${showTonnetz ? 'bg-indigo-600/40 border-indigo-400 text-indigo-200' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'}`}
            >
              {showTonnetz ? '🕸️ Tonnetz (Activo)' : '🕸️ Ver Tonnetz'}
            </button>

            <SpectrumCanvas />
            <div className="h-10 w-px bg-white/10" />
            <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
              <button 
                onClick={() => { audioSystem.play(); setIsPlaying(true); }}
                className={`p-3 rounded-xl transition-all ${isPlaying ? 'bg-green-500 text-black shadow-lg shadow-green-500/40' : 'hover:bg-white/5'}`}
              >
                <Play size={20} fill={isPlaying ? "currentColor" : "none"} />
              </button>
              <button 
                onClick={() => { audioSystem.stop(); setIsPlaying(false); }}
                className="p-3 rounded-xl hover:bg-white/5 transition-all text-red-500"
              >
                <Square size={20} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
        </header>

        {/* TONNETZ VISUALIZER (JAMS 2024 - DANIEL K. S. WALDEN) */}
        {showTonnetz && (
          <TonnetzVisualizer 
            rootNote={rootNote} 
            activeNotes={activeNotesList} 
          />
        )}

        {/* ACCORDION KEYBOARD & HARMONIC ASSISTANT */}
        <AccordionKeyboard 
          keyNote={rootNote} 
          scaleType={scaleType} 
          onSelectNote={handleNoteSelectFromKeyboard} 
        />

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">


          {/* LEFT: MIXER */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sequencer</h2>
              <button onClick={handleAddTrack} className="text-xs px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 rounded-lg transition-colors border border-indigo-500/30">
                + Add Track
              </button>
            </div>
            <TrackMixer 
              editorRef={editorRef} 
              tracks={tracks} 
              setTracks={setTracks} 
              rootNote={rootNote} 
              scaleType={scaleType} 
            />
          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            <SnapshotManager 
              currentTracks={tracks} 
              onRestore={(savedData) => {
                setTracks(savedData);
                // Forzar re-evaluación en el editor oculto
                // (Implementar lógica de sync aquí)
              }} 
            />
            
            <div className="p-6 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-3xl border border-indigo-500/10">
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-4">Master Info</h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Engine</span><span className="text-slate-300">Superdough</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Latency</span><span className="text-slate-300">Low (AudioWorklet)</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Mode</span><span className="text-green-500 font-bold">Quantized</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* STRUDEL ENGINE (RESTORED TO VIEW) */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl transition-all opacity-50"></div>
          <div className="relative rounded-xl overflow-hidden shadow-2xl bg-[#0c0c16]">
            <strudel-editor 
                ref={editorRef} 
                style={{ display: 'none' }}
              ></strudel-editor>
          </div>
        </div>
      </div>
    </div>
  );
}
