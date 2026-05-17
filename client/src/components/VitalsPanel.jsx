import React, { useState, useEffect } from 'react';
import { Skull } from 'lucide-react';
import { getStatus } from '../utils/status';

export default function VitalsPanel({ nodes, socket }) {
    const [confirmId, setConfirmId] = useState(null);
    const [doubleConfirmId, setDoubleConfirmId] = useState(null);

    const handleKillClick = (id) => {
        if (!confirmId) {
            setConfirmId(id);
        } else if (confirmId === id && !doubleConfirmId) {
            setDoubleConfirmId(id);
        } else if (doubleConfirmId === id) {
            socket.emit('command:remove_node', id);
            setConfirmId(null);
            setDoubleConfirmId(null);
        }
    };

    const cancelKill = () => {
        setConfirmId(null);
        setDoubleConfirmId(null);
    };

    return (
        <div className="w-full lg:w-96 flex flex-col gap-4 lg:h-full shrink-0">
            <div className="corner-brackets bg-bg-card border border-brand-green/20 p-4 flex flex-col lg:flex-1 lg:min-h-0">
                <h3 className="text-xs font-bold text-brand-green tracking-widest mb-3 uppercase">Unit Vitals List</h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                   {Object.values(nodes).map(node => {
                       const status = getStatus(node.hr, node.temp, node.movement, node.connected);
                       const isCritical = status === 'CRITICAL';
                       const isWarning = status === 'WARNING';
                       let borderColor = 'border-brand-green/20';
                       let statusText = 'text-status-active';
                       if (isCritical) { borderColor = 'border-status-critical'; statusText = 'text-status-critical'; }
                       else if (isWarning) { borderColor = 'border-status-warning'; statusText = 'text-status-warning'; }

                       return (
                           <div key={node.id} className={`border ${borderColor} bg-white rounded p-3 relative shadow-sm`}>
                               <div className="flex justify-between items-center mb-2">
                                  <div className="font-bold text-lg">{node.id.toUpperCase()} <span className="text-xs text-text-dim font-normal">[{node.role}]</span></div>
                                  <div className={`text-xs font-bold ${statusText}`}>{node.connected ? 'CONNECTED' : 'LOST'}</div>
                               </div>
                               <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                   <div>HR: <span className={node.hr > 120 || node.hr < 50 ? 'text-status-critical font-bold' : ''}>{node.hr.toFixed(0)} BPM</span></div>
                                   <div>Temp: <span className={node.temp > 40 || node.temp < 30 ? 'text-status-critical font-bold' : ''}>{node.temp.toFixed(1)} °C</span></div>
                                   <div>MOV: <span className={node.movement === "No Movement" ? 'text-status-critical font-bold' : ''}>{node.movement}</span></div>
                                   <div>Bat: {node.bat}%</div>
                                   <div className="col-span-2 text-[10px] text-text-dim bg-gray-50 p-1 rounded border border-gray-100 flex items-center gap-1">📍 {node.lat ? `${node.lat.toFixed(4)}° N, ${node.lng.toFixed(4)}° E` : 'CALCULATING...'}</div>
                               </div>
                               
                               {/* Target Removal Actions */}
                               <div className="mt-3 border-t border-gray-100 pt-2 text-right">
                                   {doubleConfirmId === node.id ? (
                                       <div className="flex gap-2 justify-end items-center">
                                           <span className="text-[10px] text-status-critical font-bold uppercase">This action cannot be undone. Confirm removal?</span>
                                           <button onClick={() => handleKillClick(node.id)} className="bg-status-critical text-white px-3 py-1 text-xs rounded hover:bg-red-700">Yes</button>
                                           <button onClick={cancelKill} className="bg-gray-200 text-black px-3 py-1 text-xs rounded hover:bg-gray-300">No</button>
                                       </div>
                                   ) : confirmId === node.id ? (
                                       <div className="flex gap-2 justify-end items-center">
                                           <span className="text-[10px] text-status-warning font-bold uppercase">Are you sure you want to remove this soldier?</span>
                                           <button onClick={() => handleKillClick(node.id)} className="bg-status-warning text-white px-3 py-1 text-xs rounded hover:bg-yellow-600">Remove</button>
                                           <button onClick={cancelKill} className="bg-gray-200 text-black px-3 py-1 text-xs rounded hover:bg-gray-300">Cancel</button>
                                       </div>
                                   ) : (
                                       <button onClick={() => handleKillClick(node.id)} className="text-gray-400 hover:text-status-critical text-[10px] flex items-center gap-1 ml-auto font-bold uppercase transition-colors"><Skull size={10}/> Remove Soldier</button>
                                   )}
                               </div>
                           </div>
                       )
                   })}
                </div>
            </div>
            
            <CommPanel socket={socket} />
        </div>
    )
}

function CommPanel({ socket }) {
    const [commsActive, setCommsActive] = useState(false);
    const [lastTime, setLastTime] = useState('N/A');
    const [recording, setRecording] = useState(false);
    const [outgoingMsg, setOutgoingMsg] = useState('');

    useEffect(() => {
        console.log('Voice communication state:', commsActive);
    }, [commsActive]);

    const toggleComms = () => {
        if (commsActive) setLastTime(new Date().toLocaleTimeString());
        setCommsActive(!commsActive);
    };

    const handleMicClick = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported in this browser. Please use Chrome.");
            return;
        }
        if (recording) return;

        setRecording(true);
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setOutgoingMsg(transcript);
            setRecording(false);
            if (socket) socket.emit('outgoing_voice', transcript);
        };

        recognition.onerror = () => setRecording(false);
        recognition.onend = () => setRecording(false);
        
        recognition.start();
    };

    return (
        <div className="corner-brackets bg-bg-card border border-brand-green/20 p-4 flex-shrink-0 flex flex-col justify-center h-48 relative overflow-hidden">
            {commsActive && <div className="absolute inset-x-0 top-0 h-1 bg-status-critical animate-pulse"></div>}
            <h3 className="text-[10px] font-bold text-brand-green tracking-widest mb-3 flex items-center justify-between">
               <span>VOICE COMMUNICATION</span>
               <span className={commsActive ? 'text-status-active' : 'text-text-dim'}>{commsActive ? 'ACTIVE' : 'INACTIVE'}</span>
            </h3>
            
            <button onClick={toggleComms} className={`relative h-10 w-full mb-3 rounded shadow flex items-center justify-center gap-2 font-bold text-sm tracking-wide text-white transition-all overflow-hidden ${commsActive ? 'bg-status-critical hover:bg-red-700' : 'bg-[#2b7042] hover:bg-[#1f5c34]'}`}>
               {commsActive && <span className="absolute left-0 w-full h-full bg-red-600 animate-ping opacity-20"></span>}
               {commsActive ? '🛑 STOP COMMUNICATION' : '🎙️ START COMMUNICATION'}
            </button>
            
            <div className="flex items-center gap-2 mb-2">
                <button 
                  onClick={handleMicClick}
                  disabled={!commsActive}
                  title={!commsActive ? "Start communication first" : "Speak to Squad"}
                  className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-colors shadow ${!commsActive ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50' : recording ? 'bg-blue-600 text-white animate-pulse outline outline-offset-2 outline-blue-400' : 'bg-blue-500 text-white hover:bg-blue-400 cursor-pointer'}`}>
                    🎤
                </button>
                <div className="flex-1 border border-gray-600/30 rounded p-2 h-10 bg-black/20 text-[10px] text-brand-green/80 overflow-hidden flex items-center italic whitespace-nowrap text-ellipsis">
                    {recording ? "Listening..." : outgoingMsg ? `Sent: "${outgoingMsg}"` : "Press mic to speak"}
                </div>
            </div>

            <div className="text-[10px] text-text-dim text-right mt-1 font-mono">Last Comm: {lastTime}</div>
        </div>
    );
}
