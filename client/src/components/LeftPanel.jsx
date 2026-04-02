import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import UnitCard from './UnitCard';

export default function LeftPanel({ nodes, socket, criticalList }) {
  return (
    <div className="w-80 flex flex-col gap-4 h-full">
      {/* Priority Actions & Critical List */}
      <div className="corner-brackets bg-bg-card border border-brand-green/20 p-4 flex flex-col flex-1 min-h-0">
        <h3 className="text-[10px] font-bold text-brand-green tracking-widest mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-status-warning" /> PRIORITY ATTENTION
        </h3>
        
        <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
            {criticalList.length === 0 ? (
                <div className="text-xs text-text-dim font-mono italic flex items-center gap-2 border border-gray-100 p-3 rounded bg-white">
                    <ShieldCheck size={14} className="text-status-active" /> All vitals stable.
                </div>
            ) : criticalList.map((crit) => (
                <UnitCard key={crit.id} unit={crit} />
            ))}
        </div>
      </div>

      {/* Sector Overview summary */}
      <div className="corner-brackets bg-bg-card border border-brand-green/20 p-4 h-48 flex-shrink-0">
          <h3 className="text-[10px] font-bold text-brand-green tracking-widest mb-3 uppercase">Sector Overview</h3>
          <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-text-main">
                  <span>Sector ALPHA</span>
                  <span className="text-brand-green font-bold">4 Units</span>
              </div>
              <div className="flex justify-between text-text-main">
                  <span>Sector BRAVO</span>
                  <span className="text-status-warning font-bold">0 Units</span>
              </div>
              <div className="flex justify-between text-text-main">
                  <span>Sector CHARLIE</span>
                  <span className="text-status-critical font-bold">1 Unit</span>
              </div>
          </div>
      </div>
    </div>
  );
}
