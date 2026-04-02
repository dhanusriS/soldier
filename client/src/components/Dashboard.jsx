import React, { useState, useEffect, useMemo } from 'react';
import { getStatus } from '../utils/status';
import MapView from './MapView';
import TopPanel from './TopPanel';
import LeftPanel from './LeftPanel';
import VitalsPanel from './VitalsPanel';
import BottomPanel from './BottomPanel';

export default function Dashboard({ state, socket }) {
  const { nodes, events } = state;
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const criticalList = useMemo(() => {
     if (!nodes) return [];
     return Object.values(nodes)
        .filter(node => node.role !== 'Base Camp' && getStatus(node.hr, node.temp, node.movement, node.connected) === 'CRITICAL')
        .sort((a, b) => {
            const getSeverity = (n) => !n.connected ? 10 : (n.hr > 120 || n.hr < 50 ? 8 : 5);
            return getSeverity(b) - getSeverity(a);
        });
  }, [nodes]);

  useEffect(() => {
    if (nodes) {
        console.log('--- SYSTEM UPDATE ---');
        console.log('Current helmet dataset:', nodes);
        console.log('Number of critical units:', criticalList.length);
        
        const computedStatus = {};
        Object.values(nodes).forEach(n => {
            if (n.role !== 'Base Camp') {
                computedStatus[n.id] = getStatus(n.hr, n.temp, n.movement, n.connected);
            }
        });
        console.log('Computed status per soldier:', computedStatus);
        console.log('Critical list (before rendering):', criticalList);
    }
  }, [nodes, criticalList]);

  return (
    <div className="flex flex-col h-full w-full bg-bg-base p-4 overflow-hidden text-text-main">
      <TopPanel nodes={nodes} criticalCount={criticalList.length} />

      <main className="flex-1 w-full flex gap-4 mt-4 min-h-0 overflow-hidden">
        {/* Left Priority & Alerts */}
        <LeftPanel nodes={nodes} socket={socket} criticalList={criticalList} />

        {/* Center Canvas */}
        <div className="flex-1 border border-brand-green/20 bg-white rounded corner-brackets p-4 relative flex flex-col shadow-sm">
            <h3 className="text-xs font-bold text-brand-green tracking-widest mb-3 absolute top-6 left-6 z-10">BATTLEFIELD GRID</h3>
            <div className="absolute top-6 right-6 z-10 flex gap-4 text-[10px] font-bold tracking-widest font-mono">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-status-active"></div> SAFE</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-status-warning"></div> WARNING</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-status-critical"></div> CRITICAL</div>
            </div>
            <div className="flex-1 w-full h-full relative cursor-crosshair mt-8">
                <MapView 
                   nodes={nodes} 
                   selectedNodeId={selectedNodeId} 
                   onSelectNode={setSelectedNodeId} 
                />
            </div>
        </div>

        {/* Right Details - Now Vitals Panel entirely */}
        <VitalsPanel 
            nodes={nodes} 
            socket={socket} 
        />
      </main>

      <BottomPanel events={events} />
    </div>
  );
}
