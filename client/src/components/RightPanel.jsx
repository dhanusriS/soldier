import React from 'react';
import { Heart, Thermometer, Battery, Wifi, WifiOff, Activity, Mic, Cpu } from 'lucide-react';
import ControlPanel from './ControlPanel';

export default function RightPanel({ selectedNodeId, nodes, socket }) {
    const node = selectedNodeId ? nodes[selectedNodeId] : null;

    const renderNodeStats = () => {
        if (!node) return (
             <div className="flex-1 flex flex-col items-center justify-center text-text-dim border border-dashed border-text-dim/20 rounded p-4 font-mono">
                 <Cpu size={32} className="mb-2 opacity-50"/>
                 <span>AWAITING UNIT SELECTION</span>
             </div>
        );

        const isCritical = node.hr > 120 || node.spo2 < 90;
        const statusColor = node.failed ? 'text-gray-500' : (isCritical ? 'text-status-critical' : 'text-status-active');
        
        // Risk Score Mock (0-100)
        let riskScore = 10;
        if (node.hr > 100) riskScore += 30;
        if (node.spo2 < 95) riskScore += 30;
        if (node.failed) riskScore = 100;

        let riskLabel = 'STABLE';
        if (riskScore > 40) riskLabel = 'WARNING';
        if (riskScore > 70) riskLabel = 'CRITICAL';

        return (
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* Header Profile */}
                 <div className="flex items-center justify-between border-b border-brand-green/20 pb-4">
                     <div>
                         <div className="text-2xl font-bold font-mono tracking-widest text-text-main">
                             {node.id.toUpperCase()}
                         </div>
                         <div className="text-[10px] font-bold tracking-widest text-text-dim uppercase mt-1">
                             ROLE: {node.role}
                         </div>
                     </div>
                     <div className="text-right flex flex-col items-end">
                         <span className={`text-xl font-bold font-mono ${statusColor}`}>{riskScore}</span>
                         <span className="text-[10px] font-bold tracking-widest text-text-dim">RISK SCORE: {riskLabel}</span>
                     </div>
                 </div>

                 {/* Vitals Grid */}
                 <div className="grid grid-cols-2 gap-2 mt-2">
                     <div className="bg-brand-green/5 border border-brand-green/10 rounded p-3">
                         <div className="text-[10px] text-text-dim tracking-widest font-bold mb-1 flex items-center gap-1"><Heart size={10}/> HEART RATE</div>
                         <div className={`text-xl font-mono font-bold ${isCritical ? 'text-status-critical' : 'text-text-main'}`}>
                            {node.failed ? '---' : node.hr.toFixed(0)} <span className="text-xs text-text-dim">BPM</span>
                         </div>
                     </div>
                     <div className="bg-brand-green/5 border border-brand-green/10 rounded p-3">
                         <div className="text-[10px] text-text-dim tracking-widest font-bold mb-1 flex items-center gap-1"><Activity size={10}/> O2 LEVEL</div>
                         <div className={`text-xl font-mono font-bold ${node.spo2 < 94 ? 'text-status-critical' : 'text-text-main'}`}>
                            {node.failed ? '---' : node.spo2} <span className="text-xs text-text-dim">%</span>
                         </div>
                     </div>
                     <div className="bg-brand-green/5 border border-brand-green/10 rounded p-3">
                         <div className="text-[10px] text-text-dim tracking-widest font-bold mb-1 flex items-center gap-1"><Thermometer size={10}/> TEMP</div>
                         <div className="text-xl font-mono font-bold text-text-main">
                            {node.failed ? '---' : node.temp.toFixed(1)} <span className="text-xs text-text-dim">°C</span>
                         </div>
                     </div>
                     <div className="bg-brand-green/5 border border-brand-green/10 rounded p-3">
                         <div className="text-[10px] text-text-dim tracking-widest font-bold mb-1 flex items-center gap-1"><Battery size={10}/> BATTERY</div>
                         <div className="text-xl font-mono font-bold text-text-main">
                            {node.failed ? '---' : node.bat} <span className="text-xs text-text-dim">%</span>
                         </div>
                     </div>
                 </div>

                 {/* Connectivity Info */}
                 <div className="bg-brand-green/5 border border-brand-green/10 rounded p-3 mt-2">
                     <div className="flex justify-between items-center mb-2">
                         <div className="text-[10px] text-text-dim tracking-widest font-bold flex items-center gap-2">
                             {node.connected ? <Wifi size={12} className="text-[#32e061]" /> : <WifiOff size={12} className="text-status-critical" />}
                             SIGNAL / PATH
                         </div>
                         <div className="text-xs font-mono font-bold text-text-dim">
                            RSSI: {node.failed ? 'N/A' : '-74dBm'}
                         </div>
                     </div>
                     <div className="text-xs font-mono font-bold text-brand-green tracking-widest">
                         {node.path.length > 0 ? node.path.join(' → ').toUpperCase() : 'ISOLATED'}
                     </div>
                 </div>
                 
                 {/* Movement & Last Updated */}
                 <div className="flex justify-between items-center text-[10px] text-text-dim font-mono font-bold mt-2">
                     <span>MOV: {node.failed ? 'IMMOBILE' : 'ACTIVE'}</span>
                     <span>UPDATED: {new Date().toLocaleTimeString()}</span>
                 </div>
            </div>
        );
    }

    return (
        <div className="w-80 flex flex-col gap-4 h-full">
            {/* Selected Profile Card */}
            <div className="corner-brackets bg-bg-card border border-brand-green/20 p-4 flex flex-col flex-1 min-h-0">
                <h3 className="text-[10px] font-bold text-brand-green tracking-widest mb-3 uppercase">Unit Telemetry</h3>
                {renderNodeStats()}
            </div>

            {/* Comm Panel */}
            <div className="corner-brackets bg-bg-card border border-brand-green/20 p-4 h-32 flex-shrink-0 flex flex-col justify-center">
                <h3 className="text-[10px] font-bold text-brand-green tracking-widest mb-3 flex items-center justify-between">
                   <span>SECURE COMM</span>
                   <span className="text-status-active">CH-09 ACTIVE</span>
                </h3>
                <button className="h-12 bg-brand-green/10 hover:bg-brand-green/20 border border-brand-green/30 rounded flex flex-1 items-center justify-center gap-3 transition-colors active:bg-brand-green/40 min-h-12">
                   <Mic size={20} className="text-brand-green" />
                   <span className="font-mono font-bold text-brand-green tracking-widest">HOLD TO SPEAK</span>
                </button>
            </div>
            
            {/* Action controls reuse existing control panel but we pass the ID if needed? Or just render the generic one */}
            <div className="corner-brackets bg-bg-card border border-brand-green/20 p-4 flex-shrink-0">
                <ControlPanel socket={socket} nodes={nodes} />
            </div>
        </div>
    );
}
