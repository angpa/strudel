import React from 'react';
import { Camera, PlayCircle } from 'lucide-react';

export default function SnapshotManager({ currentTracks, onRestore }) {
  const [snapshots, setSnapshots] = React.useState([]);

  const saveSnapshot = () => {
    const newSnapshot = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      data: JSON.parse(JSON.stringify(currentTracks)) // Deep clone
    };
    setSnapshots([newSnapshot, ...snapshots].slice(0, 5));
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Memory Slots</h3>
        <button onClick={saveSnapshot} className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors">
          <Camera size={14} />
        </button>
      </div>
      <div className="space-y-2">
        {snapshots.map((s) => (
          <button 
            key={s.id} 
            onClick={() => onRestore(s.data)}
            className="w-full flex justify-between items-center p-2 text-[10px] bg-black/20 hover:bg-white/10 rounded-lg transition-all group"
          >
            <span className="text-slate-500 font-mono">{s.time}</span>
            <PlayCircle size={12} className="opacity-0 group-hover:opacity-100 text-green-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
