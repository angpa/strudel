import React, { useState, useRef } from 'react';
import TrackMixer from './components/TrackMixer';
import SnapshotManager from './components/SnapshotManager';
import SpectrumCanvas from './components/SpectrumCanvas';
import { audioSystem } from './audioSystem';
import { Play, Square, Settings2 } from 'lucide-react';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState([
    { id: 'bass', instrument: 'peter_gordeno_bass', gain: 0.7, steps: [['eb2'], ['eb2'], ['b1'], ['db2']] },
    { id: 'synth', instrument: 'alan_wilder_choir', gain: 0.5, steps: [['eb3', 'gb3'], ['b2', 'eb3'], ['gb3', 'bb3'], ['db3', 'f3']] },
    { id: 'drums', instrument: 'christian_eigner_kick', gain: 0.9, steps: [['~'], ['~'], ['~'], ['~']] }
  ]);
  const editorRef = useRef(null);

  return (
    <div className="min-h-screen bg-[#020205] text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-900/10 blur-[100px] rounded-full" />
      </div>

      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {/* TOP BAR */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Settings2 className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">STRUDEL <span className="text-indigo-500">MIXER</span></h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Hybrid Live Coding Environment</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
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
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT: MIXER (8 cols) */}
          <div className="col-span-9 space-y-6">
            <TrackMixer 
              editorRef={editorRef} 
              tracks={tracks} 
              setTracks={setTracks} 
            />
          </div>

          {/* RIGHT: SIDEBAR (3 cols) */}
          <div className="col-span-3 space-y-6">
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

      {/* STRUDEL ENGINE (HIDDEN) */}
      <div className="sr-only">
        <strudel-editor ref={editorRef}></strudel-editor>
      </div>
    </div>
  );
}
