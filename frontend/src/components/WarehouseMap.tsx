import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Device {
    id: string;
    name: string;
    battery: number;
    signal: number;
    location: string;
    status: string;
}

interface WarehouseMapProps {
    devices: Device[];
}

export default function WarehouseMap({ devices }: WarehouseMapProps) {
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

    // Map locations to approximate SVG coordinate percentages
    const locationCoords: Record<string, { cx: string, cy: string }> = {
        'Aisle 4': { cx: '25%', cy: '30%' },
        'Aisle 12': { cx: '50%', cy: '20%' },
        'Loading Dock': { cx: '80%', cy: '80%' },
        'Packing Station': { cx: '75%', cy: '35%' },
        'Main Aisle': { cx: '50%', cy: '50%' },
        'San Dagno A1': { cx: '15%', cy: '60%' },
        'San Dagno B2': { cx: '35%', cy: '70%' },
        'Wirelno D4': { cx: '65%', cy: '65%' },
        'Wirelno C3': { cx: '45%', cy: '85%' },
        'San Dagno A2': { cx: '15%', cy: '45%' },
        'IT Desk': { cx: '10%', cy: '10%' }
    };

    return (
        <div className="relative w-full h-full bg-[#0a0f1c]/50 rounded-xl border border-white/5 overflow-hidden flex">
            {/* SVG MAP */}
            <div className="flex-grow p-4 relative">
                <svg width="100%" height="100%" viewBox="0 0 800 500" className="opacity-70 drop-shadow-2xl" preserveAspectRatio="xMidYMid meet">
                    {/* Warehouse Outline */}
                    <rect x="20" y="20" width="760" height="460" fill="none" stroke="#334155" strokeWidth="4" rx="8" />

                    {/* Aisles */}
                    <rect x="50" y="50" width="60" height="300" fill="#1e293b" rx="4" />
                    <rect x="150" y="50" width="60" height="300" fill="#1e293b" rx="4" />
                    <rect x="250" y="50" width="60" height="300" fill="#1e293b" rx="4" />
                    <rect x="350" y="50" width="60" height="300" fill="#1e293b" rx="4" />
                    <text x="80" y="370" fill="#475569" fontSize="12" textAnchor="middle" fontWeight="bold">AISLE 1-4</text>
                    <text x="280" y="370" fill="#475569" fontSize="12" textAnchor="middle" fontWeight="bold">AISLE 9-12</text>

                    {/* Packing Station */}
                    <rect x="500" y="50" width="250" height="150" fill="#0f172a" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
                    <text x="625" y="130" fill="#475569" fontSize="16" textAnchor="middle" fontWeight="bold" letterSpacing="4">PACKAGES</text>

                    {/* Loading Dock */}
                    <path d="M 500 300 L 780 300 L 780 480 L 500 480 Z" fill="#020617" />
                    <path d="M 780 330 L 760 330 M 780 380 L 760 380 M 780 430 L 760 430" stroke="#f59e0b" strokeWidth="4" />
                    <text x="640" y="400" fill="#f59e0b" fontSize="14" textAnchor="middle" fontWeight="bold" letterSpacing="2" opacity="0.6">LOADING ZONES</text>
                </svg>

                {/* Plotting Devices over SVG */}
                {devices.map(device => {
                    const coords = locationCoords[device.location] || { cx: `${10 + Math.random() * 80}%`, cy: `${10 + Math.random() * 80}%` };
                    const isCritical = device.status === 'Critical' || device.status === 'Warning';
                    return (
                        <motion.div
                            key={device.id}
                            className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full cursor-pointer z-10 transition-transform hover:scale-150 ${isCritical ? 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse' : 'bg-well-green shadow-[0_0_10px_#22c55e]'
                                }`}
                            style={{ left: coords.cx, top: coords.cy }}
                            onClick={() => setSelectedDevice(device)}
                            whileHover={{ scale: 1.5 }}
                        />
                    );
                })}
            </div>

            {/* SIdebar for Map Inspector */}
            {selectedDevice && (
                <div className="w-64 border-l border-white/5 bg-[#0f172a]/80 backdrop-blur p-6 shrink-0 flex flex-col slide-in-right">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Node Inspector</span>
                        <button onClick={() => setSelectedDevice(null)} className="text-slate-500 hover:text-white">&times;</button>
                    </div>

                    <div className="text-2xl font-black text-white italic tracking-tighter mb-1">{selectedDevice.id}</div>
                    <div className="text-xs text-well-green uppercase font-bold tracking-widest mb-8">{selectedDevice.name}</div>

                    <div className="space-y-6">
                        <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Status</span>
                            <span className={`text-sm font-bold uppercase tracking-wider ${selectedDevice.status === 'Critical' ? 'text-red-400' : 'text-slate-200'}`}>
                                {selectedDevice.status}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Location</span>
                            <span className="text-sm font-bold text-slate-200">{selectedDevice.location}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">RF Signal</span>
                            <span className="text-sm font-bold text-white">{selectedDevice.signal}%</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Battery Level</span>
                            <span className="text-sm font-bold text-white">{selectedDevice.battery}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
