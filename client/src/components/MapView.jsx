import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getStatus } from '../utils/status';

// Custom icons based on status
const createCustomIcon = (color, label) => {
    return L.divIcon({
        className: 'custom-icon border-none bg-transparent',
        html: `
            <div style="
                background-color: ${color};
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 5px rgba(0,0,0,0.5);
                position: relative;
            ">
               <div style="position: absolute; top: 18px; left: -10px; color: #333; font-weight: bold; font-size: 10px; font-family: monospace; white-space: nowrap; text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;">
                   ${label}
               </div>
            </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
};

export default function MapView({ nodes, selectedNodeId, onSelectNode }) {
    // Focus around Ladakh coordinates
    const defaultCenter = [34.1525, 77.5770];
    
    // Bounds for Indian territory approximation
    const isValidIndiaCoord = (lat, lng) => lat >= 8.4 && lat <= 37.6 && lng >= 68.7 && lng <= 97.25;

    return (
        <div style={{ width: '100%', height: '100%', zIndex: 1, position: 'relative' }}>
            <MapContainer center={defaultCenter} zoom={13} style={{ width: '100%', height: '100%', zIndex: 0 }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                
                {Object.values(nodes).map(node => {
                    if (!node.lat || !node.lng || !isValidIndiaCoord(node.lat, node.lng)) {
                        return null; // Ensure markers don't render out of bounds
                    }
                    
                    let color = '#2b7042'; // green default (SAFE)
                    if (node.role !== 'Base Camp') {
                        const status = getStatus(node.hr, node.temp, node.movement, node.connected);
                        if (status === 'WARNING') color = '#eab308'; // yellow
                        if (status === 'CRITICAL') color = '#d32f2f'; // red
                    }

                    const icon = createCustomIcon(color, node.id.toUpperCase());

                    return (
                        <Marker 
                            key={node.id} 
                            position={[node.lat, node.lng]} 
                            icon={icon}
                            eventHandlers={{
                                click: () => {
                                    if (onSelectNode) onSelectNode(node.id);
                                }
                            }}
                        >
                            <Popup>
                                <div className="text-xs font-mono min-w-[150px]">
                                    <div className="font-bold text-sm border-b pb-1 mb-1">{node.id.toUpperCase()} <span className="text-[10px] text-gray-500 font-normal">[{node.role}]</span></div>
                                    <div>HR: <span className={node.hr < 50 || node.hr > 120 ? 'text-red-500 font-bold' : ''}>{node.hr.toFixed(0)} BPM</span></div>
                                    <div>Temp: <span className={node.temp < 30 || node.temp > 40 ? 'text-red-500 font-bold' : ''}>{node.temp.toFixed(1)} °C</span></div>
                                    <div>Battery: {node.bat}%</div>
                                    <div>Status: <span className={node.connected ? 'text-green-600' : 'text-red-600 font-bold'}>{node.connected ? 'ACTIVE' : 'LOST'}</span></div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>
        </div>
    );
}
