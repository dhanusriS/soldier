import React, { useRef, useEffect } from 'react';

export default function BottomPanel({ events }) {
    const listRef = useRef(null);

    useEffect(() => {
       if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [events]);

    return (
        <div className="h-40 flex-shrink-0 corner-brackets bg-bg-card border border-brand-green/20 p-4 flex flex-col mt-4 w-full">
            <h3 className="text-[10px] font-bold text-brand-green tracking-widest mb-2 uppercase">MISSION EVENT TIMELINE</h3>
            <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-1 pr-2">
               <div className="text-[#32e061] py-1">System: Tracking 6 Live Mesh Nodes on independent mesh...</div>
               {[...events].map((ev, idx) => {
                    let color = "text-text-dim";
                    if (ev.msg.includes('LOST') || ev.msg.includes('kill')) color = "text-status-critical";
                    if (ev.msg.includes('restored') || ev.msg.includes('revived')) color = "text-status-active";
                    if (ev.msg.includes('WARNING')) color = "text-status-warning";
                    return (
                        <div key={idx} className={`${color} flex gap-4 uppercase py-1 border-b border-brand-green/5`}>
                           <span className="text-gray-500 w-24 flex-shrink-0">[{new Date(ev.time).toLocaleTimeString()}]</span> 
                           <span className="flex-1">{ev.msg}</span>
                        </div>
                    );
               })}
            </div>
        </div>
    );
}
