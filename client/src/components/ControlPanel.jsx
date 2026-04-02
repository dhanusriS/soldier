import React from 'react';
import { Skull, Power, Play, FastForward } from 'lucide-react';

export default function ControlPanel({ socket, nodes }) {
    
  const handleKill = (id) => {
     if (nodes[id].failed) {
         socket.emit('command:revive_node', id);
     } else {
         socket.emit('command:kill_node', id);
     }
  };

  const handleSpeed = (s) => {
      socket.emit('command:set_speed', s);
  }

  return (
    <div className="flex flex-col h-full gap-2">
      <h3 className="text-xs font-bold text-brand-green tracking-widest mb-2">SIMULATION CONTROLS</h3>
      
      <div className="grid grid-cols-2 gap-2">
         {Object.values(nodes).map(node => (
             <button 
                key={node.id}
                onClick={() => handleKill(node.id)}
                className={`flex items-center justify-center gap-2 p-2 rounded text-[10px] font-bold font-mono border transition-all ${
                    node.failed 
                      ? 'bg-[#e7f3eb] border-brand-green text-brand-green hover:bg-[#d0e8d8]' 
                      : 'bg-[#fff5f5] border-status-critical text-status-critical hover:bg-status-critical hover:text-white'
                }`}
             >
                {node.failed ? <Power size={14}/> : <Skull size={14} />}
                {node.failed ? `REVIVE ${node.id.toUpperCase()}` : `KILL ${node.id.toUpperCase()}`}
             </button>
         ))}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[#d3e0d7] pt-2">
          <button 
             onClick={() => handleSpeed(1.0)}
             className="flex items-center justify-center gap-2 p-2 bg-[#e5ede8] rounded font-mono text-xs font-bold text-brand-green hover:bg-[#d0e8d8]"
          >
              <Play size={14} /> 1x Speed
          </button>
          <button 
             onClick={() => handleSpeed(5.0)}
             className="flex items-center justify-center gap-2 p-2 bg-[#e5ede8] rounded font-mono text-xs font-bold text-brand-green hover:bg-[#d0e8d8]"
          >
              <FastForward size={14} /> 5x Speed
          </button>
      </div>

    </div>
  );
}
