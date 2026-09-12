import React, { useEffect, useState, useRef } from 'react';
import { Play, Square } from 'lucide-react';
import { audioSystem } from './audioSystem';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState('Initializing Instruments...');
  const editorRef = useRef(null);
  
  useEffect(() => {
    try {
      audioSystem.init();
      setStatus('Ready. Press Play to listen.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }, []);

  const handlePlay = async () => {
    const success = await audioSystem.play();
    if (success) {
      setIsPlaying(true);
      setStatus('▶ Playing...');
    }
  };

  const handleStop = () => {
    const success = audioSystem.stop();
    if (success) {
      setIsPlaying(false);
      setStatus('■ Stopped.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080810] via-[#12121f] to-[#0d0d1a] text-slate-300 flex flex-col items-center py-10 px-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
          🎹 Enjoy The Silence
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-light">
          Depeche Mode · Martin Gore · Strudel Live Coding Cover
        </p>
      </header>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handlePlay}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-br from-green-400 to-green-600 text-green-950 hover:brightness-110 active:translate-y-px transition-all"
        >
          <Play size={18} /> Play
        </button>
        <button
          onClick={handleStop}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-br from-red-400 to-red-600 text-white hover:brightness-110 active:translate-y-px transition-all"
        >
          <Square size={18} fill="currentColor" /> Stop
        </button>
      </div>

      <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">
        Strudel Code · Live Editable
      </p>

      {/* Editor Container */}
      <div className="w-full max-w-4xl relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-50"></div>
        <div className="relative rounded-xl overflow-hidden border border-indigo-500/20 shadow-2xl bg-[#0c0c16]">
          <strudel-editor ref={editorRef} style={{ display: 'none' }}>
            {`<!--
// ═══════════════════════════════════════════════════
// Enjoy the Silence — Depeche Mode
// Eb minor · 113 BPM · Depeche Mode Custom Kit
// ═══════════════════════════════════════════════════

// ═══ ALAN WILDER (Choir Pad) ═══
const base01 = note("<[eb3,gb3,bb3] [b2,eb3,gb3] [gb3,bb3,db4] [db3,f3,ab3]>")
  .s("alan_wilder_choir")
  .cutoff(1500)
  .room(0.8)
  .gain(0.6);

// ═══ MARTIN GORE (Guitarra Principal) ═══
const arpegio01 = note("<[~ ~ bb4 bb4] [ab4 gb4 ~ ~] [~ ~ ab4 bb4] [~ ~ ~ ~]>")
  .s("martin_gore_guitar")
  .delay(0.25).delaytime(0.33)
  .gain(0.8)
  .room(0.4);

// ═══ PETER GORDENO (Bajo Sintetizado) ═══
const bajo01 = note("<[eb2 eb2 eb2 eb2] [b1 b1 b1 b1] [gb2 gb2 gb2 gb2] [db2 db2 db2 db2]>")
  .s("peter_gordeno_bass")
  .cutoff(1000)
  .gain(0.7);

// ═══ CHRISTIAN EIGNER (Batería Acústica / Híbrida) ═══
const ritmo01 = stack(
  s("christian_eigner_kick(4,4)").gain(1.0),
  s("~ christian_eigner_snare ~ christian_eigner_snare").gain(0.9),
  s("christian_eigner_hihat*8").gain(0.5).room(0.1)
);

// ═══ ENSAMBLE FINAL ═══
const pista01 = stack(
  base01,
  arpegio01,
  bajo01,
  ritmo01
).cpm(28.25);

pista01
            -->`}
          </strudel-editor>
          {/* We inject our Strudel editor contents directly in the React tree, 
              but remember the web component itself creates a sibling div!
              To correctly structure this in React without layout breaks, 
              we can just inject the raw custom element and let it do its thing. 
              The CSS in index.css will handle styling the sibling. */}
        </div>
      </div>

      {/* Footer / Status */}
      <div className="flex justify-between items-center w-full max-w-4xl mt-4">
        <p className={`text-sm ${isPlaying ? 'text-green-400' : 'text-slate-400'}`}>
          {status}
        </p>
        <div className="font-mono text-[10px] text-indigo-300/60 bg-[#0e0e1a] border border-indigo-500/20 px-3 py-1 rounded-md">
          {typeof __GIT_COUNT__ !== 'undefined' ? (
            <>push <span className="text-indigo-400">#{__GIT_COUNT__}</span> · {__GIT_HASH__}</>
          ) : (
            'Development Mode'
          )}
        </div>
      </div>
    </div>
  );
}
