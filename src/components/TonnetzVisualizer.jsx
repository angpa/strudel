import React, { useState, useMemo } from 'react';
import { getTonnetzGrid, getLeviGraphData, getTristanTonnetzData, getMunsellColor } from '../utils/harmonyEngine';
import { audioSystem } from '../audioSystem';

export default function TonnetzVisualizer({ rootNote = 'c', activeNotes = [] }) {
  const [viewMode, setViewMode] = useState('eulerian'); // 'eulerian', 'levi', 'tristan'
  const [selectedNode, setSelectedNode] = useState('c');

  // Datos para cada modo teórico (Boland & Hughston, 2026)
  const eulerianGrid = useMemo(() => getTonnetzGrid(7, 5, rootNote), [rootNote]);
  const leviData = useMemo(() => getLeviGraphData(), []);
  const tristanData = useMemo(() => getTristanTonnetzData(), []);

  // SVG Canvas Config
  const width = 740;
  const height = 360;

  const handleNodeClick = (noteOrChord) => {
    setSelectedNode(noteOrChord);
    audioSystem.playPreviewNote(`${noteOrChord.split('_')[0]}3`);
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl mb-8 relative overflow-hidden">
      {/* HEADER PEDAGÓGICO & GEOMETRÍA COMBINATORIA */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/20">
            🕸️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-white tracking-wide">Tonnetz Theory & Combinatorial Geometry</h3>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono">
                Boland & Hughston (2026) / JAMS (Walden 2024)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Redes de tonos, Grafo de Levi y Configuración D228 para armonías clásicas y wagnerianas
            </p>
          </div>
        </div>

        {/* SELECTOR DE MODOS TEÓRICOS (BOLAND & HUGHSTON 2026) */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setViewMode('eulerian')}
            className={`px-3 py-1.5 rounded-xl transition-all ${viewMode === 'eulerian' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Eulerian Tonnetz
          </button>
          <button
            onClick={() => setViewMode('levi')}
            className={`px-3 py-1.5 rounded-xl transition-all ${viewMode === 'levi' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Grafo de Levi (24 Triadas)
          </button>
          <button
            onClick={() => setViewMode('tristan')}
            className={`px-3 py-1.5 rounded-xl transition-all ${viewMode === 'tristan' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Género Tristan (Wagner D228)
          </button>
        </div>
      </div>

      {/* SVG INTERACTIVO */}
      <div className="relative bg-slate-950/90 rounded-2xl border border-slate-800/80 p-4 shadow-inner flex items-center justify-center overflow-x-auto min-h-[360px]">
        
        {/* MODO 1: EULERIAN PITCH TONNETZ (2D LATTICE DE QUINTAS Y TERCERAS) */}
        {viewMode === 'eulerian' && (
          <svg width={width} height={height} className="overflow-visible select-none">
            {eulerianGrid.map((node) => {
              const colSpacing = 90;
              const rowSpacing = 65;
              const px = width / 2 + node.x * colSpacing + node.y * (colSpacing * 0.4);
              const py = height / 2 - node.y * rowSpacing;
              const isSelected = selectedNode.toLowerCase() === node.pitch.toLowerCase();

              return (
                <g key={`${node.x}-${node.y}`} transform={`translate(${px}, ${py})`} onClick={() => handleNodeClick(node.pitch)} className="cursor-pointer group">
                  {isSelected && <circle r="26" fill="#fbbf24" opacity="0.3" className="animate-pulse" />}
                  <circle r="18" fill={node.munsellColor} stroke={isSelected ? '#ffffff' : '#0f172a'} strokeWidth="2" className="transition-transform group-hover:scale-125 shadow-lg" />
                  <text textAnchor="middle" dy="4" fill="#020617" className="font-mono font-black text-xs uppercase pointer-events-none">{node.pitch}</text>
                </g>
              );
            })}
          </svg>
        )}

        {/* MODO 2: TRIAD LEVI GRAPH (RED BIREGULAR DE 24 TRIADAS MAYOR/MENOR - D222) */}
        {viewMode === 'levi' && (
          <svg width={width} height={height} className="overflow-visible select-none">
            {leviData.nodes.map((node, i) => {
              const angle = (i / 24) * 2 * Math.PI;
              const radius = node.type === 'major' ? 140 : 90;
              const px = width / 2 + Math.cos(angle) * radius;
              const py = height / 2 + Math.sin(angle) * radius;
              const isSelected = selectedNode === node.id;

              return (
                <g key={node.id} transform={`translate(${px}, ${py})`} onClick={() => handleNodeClick(node.root)} className="cursor-pointer group">
                  {isSelected && <circle r="24" fill="#fbbf24" opacity="0.4" className="animate-pulse" />}
                  <circle r="16" fill={node.color} stroke={node.type === 'major' ? '#ffffff' : '#94a3b8'} strokeWidth="2" className="transition-transform group-hover:scale-125 shadow-lg" />
                  <text textAnchor="middle" dy="4" fill={node.type === 'major' ? '#020617' : '#ffffff'} className="font-mono font-black text-[10px] uppercase pointer-events-none">{node.name}</text>
                </g>
              );
            })}
          </svg>
        )}

        {/* MODO 3: TRISTAN-GENUS TONNETZ (CONFIGURACIÓN D228 - ACORDES DE WAGNER) */}
        {viewMode === 'tristan' && (
          <svg width={width} height={height} className="overflow-visible select-none">
            {tristanData.nodes.map((node, i) => {
              const angle = (i / 24) * 2 * Math.PI;
              const radius = node.type === 'dom7' ? 145 : 95;
              const px = width / 2 + Math.cos(angle) * radius;
              const py = height / 2 + Math.sin(angle) * radius;
              const isSelected = selectedNode === node.id;

              return (
                <g key={node.id} transform={`translate(${px}, ${py})`} onClick={() => handleNodeClick(node.root)} className="cursor-pointer group">
                  {isSelected && <circle r="26" fill="#ec4899" opacity="0.4" className="animate-pulse" />}
                  <circle r="18" fill={node.color} stroke={node.type === 'dom7' ? '#f472b6' : '#38bdf8'} strokeWidth="2" className="transition-transform group-hover:scale-125 shadow-lg" />
                  <text textAnchor="middle" dy="4" fill="#020617" className="font-mono font-black text-[10px] uppercase pointer-events-none">{node.name}</text>
                </g>
              );
            })}
          </svg>
        )}

        {/* PEDAGOGICAL FOOTER LEGEND */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl backdrop-blur text-[11px] font-mono shadow-xl">
          <div className="text-indigo-300 font-bold mb-1">
            {viewMode === 'eulerian' && 'Eulerian Tonnetz: Quintas (3:2) & Terceras (5:4 / 6:5)'}
            {viewMode === 'levi' && 'Grafo de Levi {12_3} D222: 12 Triadas Mayores (Exterior) y 12 Menores (Interior)'}
            {viewMode === 'tristan' && 'Tonnetz Género Tristan D228: Dominantes 7 y Semidisminuidos (Octaciclos Wagnerianos)'}
          </div>
          <div className="text-slate-400 text-[10px]">
            {viewMode === 'eulerian' && 'Cada triángulo forma una triada consustancial.'}
            {viewMode === 'levi' && 'Las aristas conectan acordes que comparten 2 notas (Transiciones P, L, R).'}
            {viewMode === 'tristan' && 'Modela la conducción de voces de la aria final de Brünnhilde en Götterdämmerung.'}
          </div>
        </div>
      </div>

      {/* HISTORICAL CONTEXT FOOTER */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
          <strong className="text-indigo-400">Teoría Combinatoria (Boland & Hughston 2026):</strong> El Tonnetz no es solo una tabla cromática, sino un grafo biregular que conecta la geometría combinatoria abstracta con la música del Romanticismo y Período Clásico.
        </p>
        <div className="text-right text-[10px] font-mono text-slate-500">
          Boland, J. R. & Hughston, L. P. (2026). <em>arXiv:2604.19960v2.</em>
        </div>
      </div>
    </div>
  );
}
