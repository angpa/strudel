import React, { useState, useMemo } from 'react';
import { getTonnetzGrid, getMunsellColor } from '../utils/harmonyEngine';
import { audioSystem } from '../audioSystem';

export default function TonnetzVisualizer({ rootNote = 'c', activeNotes = [] }) {
  const [selectedNode, setSelectedNode] = useState('c');
  const [tuningMode, setTuningMode] = useState('just'); // 'just' (Plane) or 'equal' (Torus 12-TET)
  const [hoveredTriad, setHoveredTriad] = useState(null);

  // Generar red de Tonnetz 7x5 centrada en la nota raíz
  const grid = useMemo(() => {
    return getTonnetzGrid(7, 5, rootNote);
  }, [rootNote]);

  // Dimensiones del canvas SVG
  const width = 720;
  const height = 360;
  const colSpacing = 90;
  const rowSpacing = 65;
  const originX = width / 2;
  const originY = height / 2;

  // Mapear coordenadas (x, y) del Tonnetz a SVG (px, py)
  const getNodePos = (x, y) => {
    // Escalar en coordenadas oblicuas romboidales del Tonnetz de Tanaka/Riemann
    const px = originX + x * colSpacing + y * (colSpacing * 0.4);
    const py = originY - y * rowSpacing;
    return { px, py };
  };

  const handleNodeClick = (pitch) => {
    setSelectedNode(pitch);
    audioSystem.playPreviewNote(`${pitch}3`);
  };

  // Construir conexiones de la red (Lattice Edges)
  const edges = useMemo(() => {
    const lines = [];
    grid.forEach((n1) => {
      grid.forEach((n2) => {
        // Quinta justa (Horizontal: x1 - x2 = 1, y1 - y2 = 0)
        if (n2.x === n1.x + 1 && n2.y === n1.y) {
          lines.push({ n1, n2, type: 'fifth', label: '3:2 (Quinta)' });
        }
        // Tercera mayor (Diagonal arriba: x1 - x2 = 0, y1 - y2 = -1)
        if (n2.x === n1.x && n2.y === n1.y + 1) {
          lines.push({ n1, n2, type: 'majorThird', label: '5:4 (3ra Mayor)' });
        }
        // Tercera menor (Diagonal oblicua: x1 - x2 = -1, y1 - y2 = 1)
        if (n2.x === n1.x - 1 && n2.y === n1.y + 1) {
          lines.push({ n1, n2, type: 'minorThird', label: '6:5 (3ra Menor)' });
        }
      });
    });
    return lines;
  }, [grid]);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl mb-8 relative overflow-hidden">
      {/* HEADER PEDAGÓGICO */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/20">
            🕸️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-white tracking-wide">The Global Tonnetz Visualizer</h3>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono">
                JAMS 2024 (Walden / Tanaka / Riemann)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Red geométrica topológica de consonancias armónicas (Quintas 3:2, 3ras Mayores 5:4, 3ras Menores 6:5)
            </p>
          </div>
        </div>

        {/* CONTROLES DE GEOMETRÍA Y AFINACIÓN */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex text-xs font-mono">
            <button
              onClick={() => setTuningMode('just')}
              className={`px-3 py-1 rounded-lg transition-all ${tuningMode === 'just' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Plano (Afinación Justa 3:2)
            </button>
            <button
              onClick={() => setTuningMode('equal')}
              className={`px-3 py-1 rounded-lg transition-all ${tuningMode === 'equal' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Torus 3D (12-TET Equal)
            </button>
          </div>
        </div>
      </div>

      {/* SVG INTERACTIVO TONNETZ LATTICE */}
      <div className="relative bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 shadow-inner flex items-center justify-center overflow-x-auto">
        <svg width={width} height={height} className="overflow-visible select-none">
          {/* Defs for gradients */}
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* LATTICE EDGES (LINEAS CONECTORAS ESTRUCTURALES) */}
          {edges.map((edge, idx) => {
            const pos1 = getNodePos(edge.n1.x, edge.n1.y);
            const pos2 = getNodePos(edge.n2.x, edge.n2.y);
            
            const isSelectedEdge = edge.n1.pitch === selectedNode || edge.n2.pitch === selectedNode;

            let strokeColor = '#334155'; // Slate 700
            let strokeWidth = 1.5;

            if (edge.type === 'fifth') strokeColor = isSelectedEdge ? '#38bdf8' : '#1e293b'; // Cyan for 5ths
            if (edge.type === 'majorThird') strokeColor = isSelectedEdge ? '#f43f5e' : '#334155'; // Rose for M3
            if (edge.type === 'minorThird') strokeColor = isSelectedEdge ? '#10b981' : '#1e293b'; // Emerald for m3

            if (isSelectedEdge) strokeWidth = 3;

            return (
              <g key={idx}>
                <line
                  x1={pos1.px}
                  y1={pos1.py}
                  x2={pos2.px}
                  y2={pos2.py}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={tuningMode === 'equal' ? '4,4' : 'none'}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}

          {/* TONNETZ NODES (NOTAS CROMÁTICAS MUNSELL) */}
          {grid.map((node) => {
            const { px, py } = getNodePos(node.x, node.y);
            const isSelected = selectedNode.toLowerCase() === node.pitch.toLowerCase();
            const isActivePlaying = activeNotes.some(n => n.toLowerCase().startsWith(node.pitch.toLowerCase()));
            const munsellColor = getMunsellColor(node.pitch, 55);

            return (
              <g
                key={`${node.x}-${node.y}`}
                transform={`translate(${px}, ${py})`}
                onClick={() => handleNodeClick(node.pitch)}
                className="cursor-pointer group"
              >
                {/* Selection Glow */}
                {(isSelected || isActivePlaying) && (
                  <circle r="26" fill="url(#nodeGlow)" className="animate-pulse" />
                )}

                {/* Node Circle */}
                <circle
                  r="18"
                  fill={munsellColor}
                  stroke={isSelected ? '#ffffff' : '#0f172a'}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-transform duration-200 group-hover:scale-125 shadow-lg"
                />

                {/* Pitch Label */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="#020617"
                  className="font-mono font-black text-xs uppercase pointer-events-none select-none"
                >
                  {node.pitch}
                </text>
              </g>
            );
          })}
        </svg>

        {/* AXIS PEDAGOGICAL LEGEND */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl backdrop-blur text-[11px] font-mono space-y-1.5 shadow-xl">
          <div className="text-slate-400 font-bold mb-1 border-b border-slate-800 pb-1">Ejes del Tonnetz (Shohei Tanaka 1890)</div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-sky-400 rounded-full inline-block"></span>
            <span className="text-slate-300">Eje Horizontal ($\leftrightarrow$): Quintas Justas (3:2)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-rose-500 rounded-full inline-block"></span>
            <span className="text-slate-300">Eje Diagonal Asc. ($\nearrow$): 3ras Mayores (5:4)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-emerald-400 rounded-full inline-block"></span>
            <span className="text-slate-300">Eje Diagonal Desc. ($\searrow$): 3ras Menores (6:5)</span>
          </div>
        </div>
      </div>

      {/* FOOTER & HISTORICAL CONTEXT */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
          <strong className="text-indigo-400">Pedagogía Armónica:</strong> Cada triángulo en el retículo forma una triada armónica. Haz clic en cualquier nodo para resaltar su estrella de quintas y terceras consustanciales según el círculo Munsell.
        </p>
        <div className="text-right text-[10px] font-mono text-slate-500">
          Fuente: <em>Walden, D. K. S. (2024). JAMS 77(2), 447–510.</em>
        </div>
      </div>
    </div>
  );
}
