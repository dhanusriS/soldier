import React from 'react';
import { Heart, Thermometer, Droplets, Battery, Wifi, WifiOff, Route } from 'lucide-react';
import { getStatus } from '../utils/status';

export default function UnitCard({ unit }) {
  const statusType = getStatus(unit.hr, unit.temp, unit.movement, unit.connected);
  const isCritical = statusType === 'CRITICAL';
  const isWarning = statusType === 'WARNING';
  
  let borderColor = 'border-transparent'; // Managed by corner-brackets
  let statusText = 'text-status-active';
  let iconColor = 'text-status-active';
  let statusStr = "CONNECTED";
  
  if (unit.failed) {
      statusText = 'text-gray-400';
      iconColor = 'text-gray-400';
      statusStr = "NO SIGNAL";
  } else if (isCritical) {
      statusText = 'text-status-critical animate-pulse';
      iconColor = 'text-status-critical';
      statusStr = "CRITICAL";
  } else if (isWarning) {
      statusText = 'text-status-warning';
      iconColor = 'text-status-warning';
      statusStr = "WARNING";
  }

  return (
    <div className={`corner-brackets p-5 transition-all duration-300 ${borderColor}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wider text-text-main flex items-center gap-2">
             {unit.id.toUpperCase()} <span className="text-[10px] font-bold text-text-dim">[{unit.role}]</span>
          </h2>
          
          <div className="mt-1 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
            {unit.connected ? (
                <>
                  <Wifi size={12} className={iconColor} />
                  <span className={statusText}>{statusStr}</span>
                </>
            ) : (
                 <>
                  <WifiOff size={12} className="text-status-critical" />
                  <span className="text-status-critical">NO SIGNAL</span>
                </>
            )}
          </div>
        </div>
        
        <div className="text-right">
           {!unit.connected || unit.path.length === 0 ? (
               <span className="text-[10px] text-text-dim font-bold">ISOLATED</span>
           ) : (
               <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1 text-[10px] text-text-dim font-bold">
                       <Route size={10}/> PATH
                   </div>
                   <div className="font-mono text-[10px] mt-1 text-brand-green font-bold tracking-wider">
                      {unit.path.join(' → ').toUpperCase()}
                   </div>
               </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <StatBox 
            label="HEART" 
            value={unit.hr.toFixed(0)} 
            dead={unit.failed}
            alert={isCritical}
         />
         <StatBox 
            label="TEMP" 
            value={unit.temp.toFixed(1) + '°'} 
            dead={unit.failed}
         />
         <StatBox 
            label="SPO2" 
            value={unit.spo2 + '%'} 
            dead={unit.failed}
         />
         <StatBox 
            label="BATTERY" 
            value={unit.bat + '%'} 
            dead={unit.failed}
         />
      </div>
    </div>
  );
}

function StatBox({ label, value, dead, alert }) {
    if (dead) value = '---';
    return (
        <div className="bg-[#f0f5f1] rounded p-3 flex flex-col items-start gap-1">
            <div className="text-[10px] text-text-dim font-bold tracking-widest">{label}</div>
            <div className={`font-mono text-lg text-text-main ${alert ? 'text-status-critical font-bold' : ''} ${dead ? 'opacity-30' : ''}`}>
                {value}
            </div>
        </div>
    );
}
