import React, { useState, useMemo } from 'react';
import { getHarmonicSuggestions } from '../utils/harmonyEngine';
import { audioSystem } from '../audioSystem';

export default function AccordionKeyboard({ keyNote = 'C', scaleType = 'major', onSelectNote }) {
  const [activeNote, setActiveNote] = useState('c3');
  const [selectedOctave, setSelectedOctave] = useState(3);

  // Calcular sugerencias armónicas en tiempo real (12 notas cromáticas Munsell)
  const suggestions = useMemo(() => {
    return getHarmonicSuggestions(activeNote, keyNote, scaleType);
  }, [activeNote, keyNote, scaleType]);

  const handleKeyPress = (noteStr) => {
    setActiveNote(noteStr);
    audioSystem.playPreviewNote(noteStr);
  };

  const handleInsert = (noteStr) => {
    if (onSelectNote) {
      onSelectNote(noteStr);
    }
  };

  // Generar las 12 notas cromáticas completas por octava
  const pitchNames = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
  const displayOctaves = [selectedOctave, selectedOctave + 1];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md mb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-amber-500/20">
            🪗
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Teclado de Acordeón Cromático (Espectro Munsell 12-Tonos)</h3>
            <p className="text-xs text-slate-400">
              Escala de Referencia: <span className="text-amber-400 font-semibold">{keyNote} {scaleType}</span> | Mapeo continuo de 12 notas armónicas
            </p>
          </div>
        </div>

        {/* Octave Selector & Active Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50 flex items-center gap-2">
            <span className="text-xs text-slate-400">Octava Base:</span>
            <select
              value={selectedOctave}
              onChange={(e) => setSelectedOctave(parseInt(e.target.value, 10))}
              className="bg-slate-900 text-amber-300 font-mono text-sm px-2 py-0.5 rounded border border-slate-700 focus:outline-none focus:border-amber-500"
            >
              <option value={2}>Octavas 2 - 3</option>
              <option value={3}>Octavas 3 - 4 (Estándar)</option>
              <option value={4}>Octavas 4 - 5</option>
            </select>
          </div>

          {activeNote && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
              <span>Nota Presionada:</span>
              <span className="uppercase text-sm bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black">{activeNote}</span>
            </div>
          )}
        </div>
      </div>

      {/* Accordion Munsell Chromatic Grid Layout */}
      <div className="space-y-4">
        {displayOctaves.map((oct) => (
          <div key={oct} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">Octava {oct} - Espectro Munsell Completo</span>
              <span className="text-[10px] text-slate-500">12 Botones Cromáticos</span>
            </div>

            {/* Grid of 12 Chromatic Buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2.5">
              {pitchNames.map((pitch) => {
                const noteStr = `${pitch}${oct}`;
                const info = suggestions[noteStr] || { isScaleMember: false, isSuggested: false, relation: '', munsellColor: 'hsl(0,0%,30%)' };
                const isActive = activeNote.toLowerCase() === noteStr.toLowerCase();

                return (
                  <div key={noteStr} className="relative group">
                    <button
                      onClick={() => handleKeyPress(noteStr)}
                      style={{
                        backgroundColor: info.munsellColor,
                        boxShadow: isActive ? '0 0 15px rgba(251, 191, 36, 0.8)' : info.isSuggested ? '0 0 10px rgba(52, 211, 153, 0.5)' : 'none'
                      }}
                      className={`
                        w-full aspect-square rounded-2xl flex flex-col items-center justify-between p-1.5 transition-all duration-200 cursor-pointer relative overflow-hidden text-slate-950 font-extrabold shadow-md hover:scale-105 hover:brightness-125
                        ${isActive 
                          ? 'ring-4 ring-amber-300 ring-offset-2 ring-offset-slate-950 scale-105 z-10 font-black' 
                          : info.isSuggested
                          ? 'ring-2 ring-emerald-300 scale-102'
                          : 'border border-white/20'
                        }
                      `}
                    >
                      {/* Top note header */}
                      <div className="w-full flex justify-between items-center text-[10px] opacity-90 px-0.5">
                        <span className="uppercase font-mono tracking-tighter">{pitch}</span>
                        <span className="font-mono text-[9px]">{oct}</span>
                      </div>

                      {/* Harmonic Relation Center Badge */}
                      {info.relation && (
                        <div className={`text-[9px] px-1 py-0.5 rounded font-black tracking-tighter shadow-sm ${isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-950/80 text-white'}`}>
                          {info.relation.split(' ')[0]}
                        </div>
                      )}

                      {/* Bottom Scale Tag */}
                      <div className="text-[8px] font-mono opacity-75">
                        {info.isScaleMember ? '● Escala' : '○ Extra'}
                      </div>
                    </button>

                    {/* Action hover overlay to insert directly into active step */}
                    {onSelectNote && (
                      <button
                        onClick={() => handleInsert(noteStr)}
                        title={`Insertar ${noteStr} en secuencia`}
                        className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 w-5 h-5 rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center shadow-lg border border-slate-950 z-20"
                      >
                        +
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend / Guidance Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-400/50 inline-block"></span>
            <span className="text-amber-300 font-semibold">Nota Tónica/Presionada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-emerald-400/50 inline-block"></span>
            <span className="text-emerald-300 font-medium">Acorde/Consonancia (3ra / 5ta / 8va)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-gradient-to-r from-red-500 via-green-500 to-purple-500 inline-block"></span>
            <span>Rueda Munsell 12-Tonos</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500">Cada botón muestra la relación de intervalo armónico respecto a la nota tocada.</p>
      </div>
    </div>
  );
}
