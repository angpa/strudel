import React, { useState, useMemo, useRef, useEffect } from 'react';
import { getHarmonicSuggestions, getHarmonicThreadConnections } from '../utils/harmonyEngine';
import { audioSystem } from '../audioSystem';

export default function AccordionKeyboard({ keyNote = 'C', scaleType = 'major', onSelectNote }) {
  const [activeNote, setActiveNote] = useState('c3');
  const [selectedOctave, setSelectedOctave] = useState(3);
  const [threadLines, setThreadLines] = useState([]);
  
  const containerRef = useRef(null);
  const buttonRefs = useRef({});

  // Calcular sugerencias armónicas (12 notas cromáticas Munsell)
  const suggestions = useMemo(() => {
    return getHarmonicSuggestions(activeNote, keyNote, scaleType);
  }, [activeNote, keyNote, scaleType]);

  // Calcular conexiones de Hilos Blancos Armónicos
  const threadConnections = useMemo(() => {
    return getHarmonicThreadConnections(activeNote, keyNote, scaleType);
  }, [activeNote, keyNote, scaleType]);

  // Recalcular las coordenadas de los hilos blancos en tiempo real
  useEffect(() => {
    if (!containerRef.current || !activeNote) {
      setThreadLines([]);
      return;
    }

    const updateLines = () => {
      const containerRect = containerRef.current.getBoundingClientRect();
      const activeEl = buttonRefs.current[activeNote.toLowerCase()];
      if (!activeEl) {
        setThreadLines([]);
        return;
      }

      const activeRect = activeEl.getBoundingClientRect();
      const x1 = activeRect.left + activeRect.width / 2 - containerRect.left;
      const y1 = activeRect.top + activeRect.height / 2 - containerRect.top;

      const lines = [];
      threadConnections.forEach((conn) => {
        const targetEl = buttonRefs.current[conn.toNote.toLowerCase()];
        if (targetEl) {
          const targetRect = targetEl.getBoundingClientRect();
          const x2 = targetRect.left + targetRect.width / 2 - containerRect.left;
          const y2 = targetRect.top + targetRect.height / 2 - containerRect.top;

          lines.push({
            id: `${conn.fromNote}-${conn.toNote}`,
            x1, y1, x2, y2,
            label: conn.relation
          });
        }
      });

      setThreadLines(lines);
    };

    updateLines();
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [activeNote, threadConnections, selectedOctave]);

  const handleKeyPress = (noteStr) => {
    setActiveNote(noteStr);
    audioSystem.playPreviewNote(noteStr);
  };

  const handleInsert = (noteStr) => {
    if (onSelectNote) {
      onSelectNote(noteStr);
    }
  };

  const pitchNames = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
  const displayOctaves = [selectedOctave, selectedOctave + 1];

  return (
    <div ref={containerRef} className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md mb-8 relative">
      
      {/* CAPA DE HILOS BLANCOS ARMÓNICOS (SVG OVERLAY) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
        <defs>
          <filter id="whiteGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {threadLines.map((t) => (
          <g key={t.id}>
            {/* Hilo Blanco Brillante Resplandeciente */}
            <line
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#whiteGlow)"
              className="animate-pulse"
            />
            {/* Pequeña Línea Interna de Contraste */}
            <line
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {/* Etiqueta Armónica Flotante */}
            <g transform={`translate(${(t.x1 + t.x2) / 2}, ${(t.y1 + t.y2) / 2})`}>
              <rect x="-35" y="-10" width="70" height="20" rx="6" fill="#020617" stroke="#ffffff" strokeWidth="1.5" className="shadow-lg" />
              <text textAnchor="middle" dy="4" fill="#38bdf8" fontSize="9" fontWeight="900" fontFamily="monospace">
                {t.label}
              </text>
            </g>
          </g>
        ))}
      </svg>

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-amber-500/20">
            🪗
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <span>Teclado de Acordeón & Hilo Blanco Armónico</span>
              <span className="text-[10px] bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-full font-mono font-normal">
                Visual Guider
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Escala Activa: <span className="text-amber-400 font-semibold">{keyNote} {scaleType}</span> | Los hilos blancos unen las notas de mejor armonía
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

      {/* GRID DE BOTONES DEL ACORDEÓN */}
      <div className="space-y-4 relative z-10">
        {displayOctaves.map((oct) => (
          <div key={oct} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">Octava {oct} - Botonera Cromática</span>
              <span className="text-[10px] text-slate-500">Espectro Munsell & Hilos Blancos</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2.5">
              {pitchNames.map((pitch) => {
                const noteStr = `${pitch}${oct}`;
                const info = suggestions[noteStr] || { isScaleMember: false, isSuggested: false, relation: '', munsellColor: 'hsl(0,0%,30%)' };
                const isActive = activeNote.toLowerCase() === noteStr.toLowerCase();

                return (
                  <div key={noteStr} className="relative group">
                    <button
                      ref={(el) => (buttonRefs.current[noteStr.toLowerCase()] = el)}
                      onClick={() => handleKeyPress(noteStr)}
                      style={{
                        backgroundColor: info.munsellColor,
                        boxShadow: isActive ? '0 0 20px rgba(255, 255, 255, 0.9)' : info.isSuggested ? '0 0 10px rgba(56, 189, 248, 0.6)' : 'none'
                      }}
                      className={`
                        w-full aspect-square rounded-2xl flex flex-col items-center justify-between p-1.5 transition-all duration-200 cursor-pointer relative overflow-hidden text-slate-950 font-extrabold shadow-md hover:scale-105 hover:brightness-125
                        ${isActive 
                          ? 'ring-4 ring-white ring-offset-2 ring-offset-slate-950 scale-105 z-30 font-black' 
                          : info.isSuggested
                          ? 'ring-2 ring-sky-300 scale-102 z-10'
                          : 'border border-white/20'
                        }
                      `}
                    >
                      <div className="w-full flex justify-between items-center text-[10px] opacity-90 px-0.5">
                        <span className="uppercase font-mono tracking-tighter">{pitch}</span>
                        <span className="font-mono text-[9px]">{oct}</span>
                      </div>

                      {info.relation && (
                        <div className={`text-[9px] px-1 py-0.5 rounded font-black tracking-tighter shadow-sm ${isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-950/80 text-white'}`}>
                          {info.relation.split(' ')[0]}
                        </div>
                      )}

                      <div className="text-[8px] font-mono opacity-75">
                        {info.isScaleMember ? '● Escala' : '○ Extra'}
                      </div>
                    </button>

                    {onSelectNote && (
                      <button
                        onClick={() => handleInsert(noteStr)}
                        title={`Insertar ${noteStr} en secuencia`}
                        className="absolute -top-1 -right-1 bg-white text-slate-950 w-5 h-5 rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center shadow-lg border border-slate-950 z-40"
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

      {/* FOOTER LEYENDA HILO BLANCO */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 relative z-10">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-white shadow-sm shadow-white inline-block rounded-full"></span>
            <span className="text-white font-bold">Hilo Blanco Armónico</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-300 ring-2 ring-sky-300/50 inline-block"></span>
            <span className="text-sky-300 font-medium">Nota Consonante Sugerida</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">Los hilos blancos muestran visualmente los mejores saltos de nota para sonar en armonía perfecta.</p>
      </div>
    </div>
  );
}
