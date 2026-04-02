import React, { useState, useEffect } from 'react';

export default function TopPanel({ nodes, criticalCount }) {
  const totalCount = Object.keys(nodes).length;
  const activeCount = Object.values(nodes).filter(n => n.connected).length;
  const disconnectedCount = Object.values(nodes).filter(n => !n.connected).length;

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const int = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="corner-brackets bg-bg-card p-3 px-6 flex justify-between items-center text-sm font-mono border border-brand-green/20">
      <div className="flex items-center gap-8">
        <div className="text-2xl font-bold tracking-widest text-brand-green">RAKSHAK TACTICAL</div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-text-main">{time.toLocaleTimeString()}</span>
          <span className="text-[10px] text-text-dim font-bold tracking-widest">MISSION CLOCK (LOCAL)</span>
        </div>
      </div>
      
      <div className="flex gap-10 text-center items-center">
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-text-main">{totalCount}</span>
          <span className="text-[10px] text-text-dim font-bold tracking-widest">TOTAL</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-status-active">{activeCount}</span>
          <span className="text-[10px] text-status-active font-bold tracking-widest">CONNECTED</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-gray-500">{disconnectedCount}</span>
          <span className="text-[10px] text-gray-500 font-bold tracking-widest">DISCONNECTED</span>
        </div>
        <div className="flex flex-col items-center">
          <span className={`text-xl font-bold ${criticalCount > 0 ? 'text-status-critical animate-pulse' : 'text-text-main'}`}>
            {criticalCount}
          </span>
          <span className="text-[10px] text-text-dim font-bold tracking-widest">CRITICAL (VITAL)</span>
        </div>
      </div>
    </div>
  );
}
