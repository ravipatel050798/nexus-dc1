import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
    ShieldCheck, AlertTriangle, Globe, Smartphone, LayoutDashboard,
    Zap, Bell, Map as MapIcon, Settings, Search, Activity, ExternalLink,
    ChevronRight, Filter, RefreshCw, Cpu, Database, Save, User,
    Lock, HardDrive, Wifi, Battery, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './components/Login';
import { useAuth } from './contexts/AuthContext';
import WarehouseMap from './components/WarehouseMap';

// --- MOCK DATA GENERATORS ---
const generateChartData = () => {
    const data = [];
    for (let i = 0; i <= 48; i += 6) {
        data.push({
            time: `${i}H`,
            signal: Math.round(30 + Math.random() * 40),
            battery: Math.round(20 + Math.random() * 50),
            load: Math.round(10 + Math.random() * 80),
        });
    }
    return data;
};

interface Device {
    id: string;
    name: string;
    battery: number;
    signal: number;
    location: string;
    status: 'Healthy' | 'Warning' | 'Critical';
    lastSeen: string;
    ip: string;
}

const INITIAL_FLEET: Device[] = [
    { id: 'DC1-001', name: 'RG1-030-A', battery: 92, signal: 88, location: 'San Dagno A1', status: 'Healthy', lastSeen: '2m ago', ip: '10.0.4.12' },
    { id: 'DC1-002', name: 'RG1-030-B', battery: 18, signal: 42, location: 'Wirelno D4', status: 'Critical', lastSeen: '12s ago', ip: '10.0.4.15' },
    { id: 'DC1-003', name: 'RG1-030-C', battery: 74, signal: 78, location: 'San Dagno B2', status: 'Healthy', lastSeen: '1h ago', ip: '10.0.4.18' },
    { id: 'DC1-004', name: 'RG1-030-D', battery: 45, signal: 55, location: 'Wirelno C3', status: 'Warning', lastSeen: '5m ago', ip: '10.0.4.21' },
    { id: 'DC1-005', name: 'RS1-030-X', battery: 88, signal: 95, location: 'San Dagno A2', status: 'Healthy', lastSeen: 'Just now', ip: '10.0.4.25' },
    { id: 'DC1-006', name: 'RS1-030-Y', battery: 5, signal: 12, location: 'Loading Dock', status: 'Critical', lastSeen: 'Disconnected', ip: '10.0.4.29' },
];

const INITIAL_ALERTS = [
    { id: 1, type: 'Hardware Failure', msg: 'Fan assembly stall in DC1-006', severity: 'Critical', time: '2m ago', jira: 'WMS-7742' },
    { id: 2, type: 'Signal Drop', msg: 'WiFi latency spike > 500ms', severity: 'Warning', time: '15m ago', jira: 'WMS-8812' },
    { id: 3, type: 'Battery Drain', msg: 'Anomalous discharge rate detected', severity: 'Healthy', time: '1h ago', jira: 'WMS-9921' },
];

// --- SUB-COMPONENTS ---

const SectionHeader = ({ title, subtitle, icon: Icon }: any) => (
    <div className="flex justify-between items-center mb-10">
        <div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                <Icon className="w-6 h-6 text-well-green not-italic" /> {title}
            </h2>
            <p className="text-slate-600 text-[10px] mt-2 font-black uppercase tracking-[0.3em]">{subtitle}</p>
        </div>
        <div className="flex gap-4 items-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-well-green mr-4 border-r border-white/10 pr-4">
                Built by Ravi Patel
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/2 rounded-lg border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all">
                <RefreshCw className="w-3 h-3" /> Sync Ref
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-well-green/5 rounded-lg border border-well-green/20 text-[9px] font-black uppercase tracking-widest text-well-green hover:shadow-well-neon transition-all">
                <Filter className="w-3 h-3" /> Filter Log
            </button>
        </div>
    </div>
);

// --- MAIN APP COMPONENT ---

const AppContent = () => {
    const { logout } = useAuth();
    const [fleet, setFleet] = useState<Device[]>(INITIAL_FLEET);
    const [alerts] = useState(INITIAL_ALERTS);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [onboarding, setOnboarding] = useState(false);
    const [progress, setProgress] = useState(0);
    const [search, setSearch] = useState('');

    const filteredFleet = fleet.filter(d =>
        d.id.toLowerCase().includes(search.toLowerCase()) ||
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    const { token } = useAuth();
    
    useEffect(() => {
        const fetchDevices = async () => {
            if (!token) return;
            try {
                const response = await fetch('http://localhost:8000/api/devices', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 401) { logout(); return; }
                if (response.ok) {
                    const data = await response.json();
                    setFleet(data.map((d: any) => ({
                        id: d.id.toString(),
                        name: d.name,
                        battery: Math.round(d.battery),
                        signal: Math.round(d.signal),
                        location: d.location,
                        status: Math.round(d.battery) < 20 ? 'Critical' : (Math.round(d.battery) < 50 ? 'Warning' : 'Healthy'),
                        lastSeen: '13 days ago',
                        ip: d.ip_address
                    })));
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        };
        fetchDevices();
        const interval = setInterval(fetchDevices, 5000);
        return () => clearInterval(interval);
    }, [token, logout]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!token || activeTab !== 'analytics') return;
            try {
                const response = await fetch('http://localhost:8000/api/analytics', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 401) { logout(); return; }
                if (response.ok) {
                    const data = await response.json();
                    setAnalytics(data);
                }
            } catch (error) {
                console.error("Fetch analytics error:", error);
            }
        };
        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 5000);
        return () => clearInterval(interval);
    }, [activeTab, token, logout]);

    const handleOnboard = async () => {
        setOnboarding(true);
        setProgress(0);

        // Concurrent progress bar and API call
        const apiPromise = fetch('http://localhost:8000/api/onboard', { method: 'POST' });

        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setOnboarding(false), 1200);
                    return 100;
                }
                return p + 2;
            });
        }, 40);

        try {
            await apiPromise;
            // Optionally refresh fleet here too
        } catch (e) {
            console.error("Onboarding API error:", e);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* ZERO-TOUCH ONBOARDING STATUS BAR */}
                        <section className="glass-card p-6 border-well-green/10 bg-[#111827]/40">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Zero-Touch Onboarding Status</h3>
                                <div className="flex items-center gap-6">
                                    <span className="text-[10px] font-bold text-well-green tracking-[0.2em] uppercase">Active: 89% SYNC_READY</span>
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i <= 5 ? 'bg-well-green shadow-[0_0_5px_#22c55e]' : 'bg-slate-800'}`}></div>)}
                                    </div>
                                </div>
                            </div>
                            <div className="h-10 bg-[#0a0f1c] rounded-lg overflow-hidden border border-white/5 p-1 relative flex items-center shadow-inner">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#22c55e] rounded shadow-[0_0_25px_rgba(34,197,94,0.4)]"
                                    initial={{ width: '89%' }}
                                    animate={{ width: onboarding ? `${progress}%` : '89%' }}
                                    transition={{ type: 'spring', stiffness: 40 }}
                                />
                                <div className="absolute inset-0 flex items-center justify-between px-10 pointer-events-none">
                                    <div className="flex gap-4 text-well-green/30 text-[9px] font-black tracking-[0.4em] animate-pulse">
                                        {">>> SYNC_STREAM_ACTIVE >>>"}
                                    </div>
                                    <div className="text-well-green text-[9px] font-black tracking-widest bg-[#0a0f1c]/80 px-4 py-1 rounded border border-well-green/20">
                                        {onboarding ? `${Math.round(progress)}%` : '89%'}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-col xl:flex-row gap-6">
                            {/* Device Health Monitor - Takes up roughly 2/3 width */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                                className="flex-grow xl:w-2/3 glass-card border-none bg-nexus-card overflow-hidden"
                            >
                                <div className="px-6 py-4 flex justify-between items-center border-b border-white/5">
                                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Device Health Monitor</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-slate-500 mr-2 uppercase tracking-wider">Real-time list:</span>
                                        <div className="bg-[#1e293b] border border-white/10 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                                            3 real time <ChevronRight className="w-3 h-3 rotate-90" />
                                        </div>
                                        <button className="p-1.5 bg-well-green/10 border border-well-green/20 rounded-lg shrink-0">
                                            <Settings className="w-3 h-3 text-well-green" />
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-[11.5px] whitespace-nowrap">
                                        <thead>
                                            <tr className="text-[10px] font-medium text-slate-400 capitalize tracking-wide border-b border-white/5 bg-[#1a2333]/40">
                                                <th className="px-6 py-3.5 w-12 text-center"></th>
                                                <th className="px-6 py-3.5 font-medium">Device ID</th>
                                                <th className="px-2 py-3.5"></th>
                                                <th className="px-6 py-3.5 font-medium">Device ID</th>
                                                <th className="px-6 py-3.5 font-medium">Model</th>
                                                <th className="px-6 py-3.5 font-medium">Battery (%)</th>
                                                <th className="px-6 py-3.5 font-medium">WIFI (%)</th>
                                                <th className="px-6 py-3.5 font-medium">Location</th>
                                                <th className="px-6 py-3.5 font-medium">Last Seen</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 bg-[#1a2333]/20">
                                            {fleet.slice(0, 5).map((device, i) => (
                                                <tr key={i} className="hover:bg-white/[0.04] transition-colors group">
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col items-center justify-center text-well-blue/80 group-hover:text-well-blue transition-colors">
                                                            <Radio className="w-[14px] h-[14px]" />
                                                            <span className="text-[9px] font-black leading-none mt-0.5">B</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">#{device.id}</td>
                                                    <td className="px-2 py-4">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'Healthy' ? 'bg-[#22c55e] shadow-[0_0_8px_#22c55e]' : device.status === 'Warning' ? 'bg-[#facc15] shadow-[0_0_8px_#facc15]' : 'bg-[#ef4444] animate-pulse'}`}></div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">#{device.id}</td>
                                                    <td className="px-6 py-4 text-slate-300">RG1-030</td>
                                                    <td className="px-6 py-4 text-slate-300">{device.battery}%</td>
                                                    <td className="px-6 py-4 text-slate-300">{device.signal}%</td>
                                                    <td className="px-6 py-4 text-slate-300">{device.location}</td>
                                                    <td className="px-6 py-4 text-slate-300">{13 + i} days ago</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>

                            {/* Alerts Feed - Takes up roughly 1/3 width */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                                className="xl:w-1/3 flex flex-col gap-4"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-sm font-black text-white tracking-wide">Alerts Feed</h3>
                                    <button className="bg-[#1e293b] border border-white/10 px-4 py-1.5 rounded-lg text-[10px] font-medium text-slate-300 flex items-center gap-2 hover:bg-white/5 transition-colors tracking-widest uppercase">
                                        Real Time <ChevronRight className="w-3 h-3 rotate-90" />
                                    </button>
                                </div>

                                {/* Yellow Alert */}
                                <div className="glass-card bg-[#111827] border-l-4 border-l-[#f59e0b] p-5 shrink-0 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 text-[10px] font-bold text-[#f59e0b]/60 uppercase tracking-widest p-4">Warning</div>
                                    <div className="flex items-start gap-4">
                                        <AlertTriangle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-[#f59e0b] font-bold text-sm tracking-wide mb-1 uppercase">High Temp</h4>
                                            <p className="text-[11px] text-[#f59e0b]/80">High Temp is morning recently.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Green Alerts */}
                                {[...Array(2)].map((_, idx) => (
                                    <div key={idx} className="glass-card bg-[#111827]/40 border-l-4 border-l-well-green p-5 shrink-0 relative overflow-hidden">
                                        <div className="absolute right-0 top-0 text-[10px] font-bold text-well-green/60 uppercase tracking-widest p-4">Wait</div>
                                        <div className="flex items-start gap-4">
                                            <AlertTriangle className="w-5 h-5 text-well-green shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-well-green font-bold text-sm tracking-wide mb-1 uppercase">Signal Drop</h4>
                                                <p className="text-[11px] text-well-green/80">Signal Drop is morning recently.</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Bottom Row: Predictive Trends and Fleet Overview */}
                        <div className="flex flex-col xl:flex-row gap-6 mt-6">
                            {/* Predictive Trends */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="flex-grow xl:w-2/3 glass-card bg-nexus-card border-none p-6"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Predictive Trends: Battery & WiFi Signal</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-[#1e293b] border border-white/10 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                                            Predictive Analytics <ChevronRight className="w-3 h-3 rotate-90" />
                                        </div>
                                        <div className="bg-well-green/10 text-well-green border border-well-green/20 px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase">
                                            For next 24 hours
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mb-4 text-[11px] font-bold">
                                    <div className="flex items-center gap-2 text-white">
                                        <div className="w-2 h-2 rounded-full bg-well-green"></div> Battery
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <div className="w-2 h-2 rounded-full bg-well-blue"></div> WiFi
                                    </div>
                                </div>

                                <div className="h-[250px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={generateChartData()} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorBattery" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorSignal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                                            <XAxis dataKey="time" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
                                            <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}`} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />

                                            {/* Historical Data Line (Solid) */}
                                            <Area type="monotone" dataKey="battery" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorBattery)" dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }} activeDot={{ r: 6 }} isAnimationActive={true} animationDuration={1500} />
                                            <Area type="monotone" dataKey="signal" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSignal)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} isAnimationActive={true} animationDuration={1500} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    {/* Overlay for Future Prediction (Dashed Line) - Simulating the visual effect */}
                                    <div className="absolute right-0 top-0 bottom-[20px] w-1/4 bg-[#0d1425]/40 backdrop-blur-[1px] border-l border-white/5 pointer-events-none flex items-center justify-center">
                                        {/* This area simulates the 'predicted' dashed region */}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Fleet Overview */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                                className="xl:w-1/3 glass-card bg-nexus-card border-none p-6"
                            >
                                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                    <h3 className="text-sm font-black text-white tracking-wide">Fleet Overview</h3>
                                    <button className="w-6 h-6 rounded bg-[#1e293b] flex items-center justify-center text-slate-400 hover:text-white transition-colors">...</button>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center group">
                                        <div>
                                            <p className="text-[11px] text-slate-400 mb-1">Active</p>
                                            <p className="text-3xl font-light text-white tracking-tight group-hover:translate-x-1 transition-transform">1,432</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-well-green/10 flex items-center justify-center overflow-hidden">
                                            <div className="w-full h-1 bg-well-green/30 self-end mb-3 transform rotate-45 scale-150"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center group">
                                        <div>
                                            <p className="text-[11px] text-slate-400 mb-1">Alerts</p>
                                            <p className="text-3xl font-light text-white tracking-tight group-hover:translate-x-1 transition-transform">14</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden opacity-50"></div>
                                    </div>
                                    <div className="flex justify-between items-center group">
                                        <div>
                                            <p className="text-[11px] text-slate-400 mb-1">Onboarding</p>
                                            <p className="text-3xl font-light text-white tracking-tight group-hover:translate-x-1 transition-transform">45</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden opacity-30"></div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                );
            case 'devices':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <SectionHeader title="Fleet Assets" subtitle="Infrastructure device directory" icon={Smartphone} />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredFleet.map(device => (
                                <motion.div
                                    key={device.id}
                                    whileHover={{ y: -5 }}
                                    className="glass-card p-8 hover:bg-white/[0.03] transition-all cursor-pointer group border-white/5 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                        <Smartphone className="w-16 h-16 text-white" />
                                    </div>

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className={`p-4 rounded-2xl ${device.status === 'Critical' ? 'bg-well-red/10 text-well-red shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-well-green/10 text-well-green shadow-[0_0_15px_rgba(34,197,94,0.2)]'}`}>
                                            <Cpu className="w-6 h-6" />
                                        </div>
                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-full border tracking-widest uppercase ${device.status === 'Healthy' ? 'bg-well-green/10 text-well-green border-well-green/20' :
                                            device.status === 'Warning' ? 'bg-well-yellow/10 text-well-yellow border-well-yellow/20' :
                                                'bg-well-red/10 text-well-red border-well-red/20'
                                            }`}>
                                            {device.status}
                                        </span>
                                    </div>

                                    <div className="relative z-10">
                                        <h4 className="text-white font-black text-xl italic mb-1 tracking-tighter">{device.name}</h4>
                                        <p className="text-slate-500 text-[10px] font-black font-mono mb-8 uppercase tracking-widest">ID: {device.id} // {device.ip}</p>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                                                    <span>Battery Capacity</span>
                                                    <span className={device.battery < 20 ? 'text-well-red animate-pulse' : 'text-slate-300'}>{device.battery}%</span>
                                                </div>
                                                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                                    <div className={`h-full rounded-full transition-all duration-1000 ${device.battery < 20 ? 'bg-well-red' : 'bg-well-green shadow-[0_0_10px_#22c55e]'}`} style={{ width: `${device.battery}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500 pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="w-3.5 h-3.5 text-well-blue" /> {device.location}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Activity className="w-3.5 h-3.5 text-well-green" /> {device.lastSeen}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'map':
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                        className="h-full flex flex-col space-y-8"
                    >
                        <SectionHeader title="Logistics Topography" subtitle="Fleet spatial distribution center" icon={MapIcon} />
                        <div className="flex-1 overflow-hidden">
                            <WarehouseMap devices={fleet} />
                        </div>
                    </motion.div>
                );
            case 'alerts':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        className="max-w-5xl mx-auto space-y-10"
                    >
                        <SectionHeader title="System Incidents" subtitle="Automated triage & ticketing" icon={Bell} />
                        <div className="grid gap-6">
                            {alerts.map(alert => (
                                <motion.div
                                    key={alert.id}
                                    whileHover={{ x: 10 }}
                                    className="glass-card p-10 border-none bg-nexus-card hover:bg-white/[0.04] transition-all group flex gap-10 items-start relative overflow-hidden"
                                >
                                    <div className={`absolute left-0 top-0 h-full w-1.5 ${alert.severity === 'Critical' ? 'bg-well-red shadow-[0_0_15px_#ef4444]' :
                                        alert.severity === 'Warning' ? 'bg-well-yellow shadow-[0_0_15px_#f59e0b]' :
                                            'bg-well-green shadow-[0_0_15px_#22c55e]'
                                        }`}></div>

                                    <div className={`p-5 rounded-3xl ${alert.severity === 'Critical' ? 'bg-well-red/10 text-well-red' :
                                        alert.severity === 'Warning' ? 'bg-well-yellow/10 text-well-yellow' :
                                            'bg-well-green/10 text-well-green'
                                        }`}>
                                        <AlertTriangle className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">INCIDENT_HASH: XA-449_{alert.id}</span>
                                                <span className={`text-[9px] font-black px-3 py-1 rounded bg-slate-900 border border-white/5 text-slate-500 uppercase tracking-widest`}>{alert.severity} Threshold</span>
                                            </div>
                                            <span className="text-[10px] font-black font-mono text-slate-700 tracking-[0.2em]">{alert.time}</span>
                                        </div>
                                        <h4 className="text-2xl font-black text-white italic mb-3 tracking-tighter uppercase">{alert.type}</h4>
                                        <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">Protocol detected anomaly: {alert.msg}. Immediate verification recommended for Calgary Facility Node YYC-01.</p>

                                        <div className="flex items-center gap-6 pt-8 border-t border-white/5">
                                            <div className="flex items-center gap-3 px-5 py-2.5 bg-[#0a0f1c] rounded-xl border border-white/10">
                                                <Database className="w-4 h-4 text-well-blue" />
                                                <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Jira Ticket:</span>
                                                <span className="text-well-blue font-black underline tracking-tighter">{alert.jira}</span>
                                            </div>
                                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-well-green hover:underline group-hover:translate-x-2 transition-transform">
                                                EXECUTE_RESOLUTION_PROTOCOL <ExternalLink className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-slate-800 group-hover:text-well-green transition-colors mt-4" />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'analytics':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                        <SectionHeader title="Fleet Intelligence" subtitle="Deep performance metrics" icon={Activity} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="glass-card p-10 bg-nexus-card border-none h-[400px]">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Load Efficiency // 24H Forecast</h3>
                                <ResponsiveContainer width="100%" height="80%">
                                    <BarChart data={analytics}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                                        <XAxis dataKey="time" stroke="#475569" fontSize={9} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#475569" fontSize={9} axisLine={false} tickLine={false} />
                                        <Bar dataKey="load" fill="#22c55e" radius={[4, 4, 0, 0]} fillOpacity={0.6} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="glass-card p-10 bg-nexus-card border-none h-[400px]">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Signal Stability // Node Health</h3>
                                <ResponsiveContainer width="100%" height="80%">
                                    <AreaChart data={analytics}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                                        <XAxis dataKey="time" stroke="#475569" fontSize={9} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#475569" fontSize={9} axisLine={false} tickLine={false} />
                                        <Area type="step" dataKey="signal" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'settings':
                return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                        <SectionHeader title="System Core" subtitle="Infrastructure & security nodes" icon={Settings} />
                        <div className="space-y-6">
                            {[
                                {
                                    group: 'Administrative Sync', icon: User, items: [
                                        { label: 'Site Lead Credentials', desc: 'Secure OAuth2 & Microsoft Intune Bridge', status: 'VERIFIED' },
                                        { label: 'Facility Notification Path', desc: 'Alert forwarding to Jira Service Desk', status: 'ACTIVE' }
                                    ]
                                },
                                {
                                    group: 'Fleet Protocols', icon: HardDrive, items: [
                                        { label: 'Zero-Touch Lifecycle', desc: 'Auto-provisioning DC-1 assets on boot', status: 'ENABLED' },
                                        { label: 'Data Retention Policy', desc: 'Secure AES-256 encrypted local storage', status: '30 DAYS' }
                                    ]
                                },
                                {
                                    group: 'Network Topology', icon: Wifi, items: [
                                        { label: 'Node Clustering', desc: 'High-availability load balancing across YYC DC', status: 'YYC_01' },
                                        { label: 'Signal Encryption', desc: 'WPA3 enterprise with Dynamic Tokenization', status: 'SECURE' }
                                    ]
                                }
                            ].map((group, i) => (
                                <div key={i} className="glass-card bg-nexus-card border-none p-10 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                        <group.icon className="w-32 h-32 text-white" />
                                    </div>
                                    <h3 className="text-xs font-black text-white italic uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                        <div className="p-2 bg-well-green/10 rounded-lg"><group.icon className="w-4 h-4 text-well-green" /></div>
                                        {group.group}
                                    </h3>
                                    <div className="space-y-8 relative z-10">
                                        {group.items.map((item, j) => (
                                            <div key={j} className="flex justify-between items-center group cursor-pointer hover:bg-white/[0.01] p-4 rounded-xl -mx-4 transition-all">
                                                <div>
                                                    <p className="text-white font-black text-sm uppercase italic tracking-tighter mb-1">{item.label}</p>
                                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{item.desc}</p>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className="text-[10px] font-black text-well-green bg-well-green/5 border border-well-green/20 px-4 py-1.5 rounded uppercase tracking-[0.2em]">{item.status}</span>
                                                    <ChevronRight className="w-4 h-4 text-slate-800 transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="pt-10 flex justify-end gap-6">
                                <button className="px-10 py-4 bg-white/2 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all rounded italic">Revert State</button>
                                <button className="px-10 py-4 bg-well-green text-[#0a0f1c] text-[10px] font-black uppercase tracking-widest rounded shadow-[0_0_30px_rgba(34,197,94,0.35)] hover:bg-[#4ade80] transition-all flex items-center gap-3">
                                    <Save className="w-3.5 h-3.5" /> Commit Config
                                </button>
                            </div>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-[#0a0f1c] text-[#94a3b8] font-sans selection:bg-well-green/30 overflow-hidden">
            {/* Slim Sidebar */}
            <aside className="w-[90px] border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-[#0d1425] z-50 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col items-center group cursor-pointer hover:scale-105 transition-all mb-4 mt-2">
                    <div className="w-10 h-10 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-well-green/20 rounded transform rotate-45"></div>
                        <span className="text-well-green font-black text-2xl italic z-10">N</span>
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-3 w-full px-3">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                        { id: 'devices', icon: Smartphone, label: 'Devices' },
                        { id: 'map', icon: MapIcon, label: 'Map' },
                        { id: 'alerts', icon: Bell, label: 'Alerts' },
                        { id: 'analytics', icon: Activity, label: 'Analytics' },
                        { id: 'settings', icon: Settings, label: 'Settings' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full py-3 rounded-xl transition-all relative group flex flex-col items-center justify-center gap-1.5 ${activeTab === item.id ? 'bg-well-green/10' : 'hover:bg-white/[0.02]'}`}
                        >
                            {activeTab === item.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-well-green rounded-r shadow-[0_0_10px_#22c55e]"></div>
                            )}
                            <item.icon className={`w-5 h-5 transition-all duration-300 ${activeTab === item.id ? 'text-well-green drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span className={`text-[10px] font-medium transition-colors ${activeTab === item.id ? 'text-well-green' : 'text-slate-500 group-hover:text-slate-300'}`}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="flex flex-col gap-6 items-center pb-4">
                    <button onClick={handleOnboard} className="w-10 h-10 bg-well-green/10 rounded-xl border border-well-green/40 hover:shadow-well-neon transition-all hover:scale-110 flex items-center justify-center group relative title='Provision Device'">
                        <Zap className="w-5 h-5 text-well-green" />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative">

                {/* Global Glow Backgrounds */}
                <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-well-green/3 blur-[150px] rounded-full pointer-events-none z-0"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-well-blue/3 blur-[120px] rounded-full pointer-events-none z-0"></div>

                {/* Top Header */}
                <header className="h-20 px-10 flex items-center justify-between border-b border-white/5 bg-[#0a0f1c]/70 backdrop-blur-3xl z-40 relative shadow-sm">
                    <div className="flex items-center gap-3">
                        <h1 className="text-[22px] font-normal tracking-wide text-slate-100 uppercase flex items-center gap-2">
                            <span className="text-well-green font-black tracking-wider">NEXUS DC-1</span> FLEET MANAGER
                        </h1>
                    </div>

                    <div className="flex items-center gap-8">
                        <button className="w-10 h-10 rounded-[10px] bg-[#1a2333]/80 flex items-center justify-center border border-white/5 relative hover:bg-white/10 transition-colors shadow-inner">
                            <Bell className="w-[18px] h-[18px] text-slate-400" />
                            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-well-red rounded-full shadow-[0_0_5px_#ef4444]"></div>
                        </button>

                        <div className="relative group flex items-center">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-slate-500 transition-colors group-hover:text-well-green" />
                            <input
                                type="text"
                                placeholder="Search Camera..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-[#1a2333]/80 border border-white/5 rounded-[10px] py-[10px] pl-[38px] pr-4 w-64 text-[13px] focus:outline-none focus:border-well-green/50 transition-all font-medium text-slate-300 placeholder:text-slate-500 shadow-inner"
                            />
                        </div>

                        <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                                {/* Just the custom avatar */}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#1a2333] flex items-center justify-center text-[10px] font-black text-slate-300 border border-white/5">RP</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Viewport */}
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar z-10 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.99, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 1.01, filter: 'blur(10px)' }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* FOOTER BAR */}
                <footer className="h-12 border-t border-white/5 bg-[#0d1425]/50 backdrop-blur-xl px-12 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.4em] text-slate-700 z-50">
                    <div className="flex gap-12">
                        <span className="flex items-center gap-2.5"><Database className="w-3.5 h-3.5 text-well-green" /> DB_LATENCY: 4MS</span>
                        <span className="flex items-center gap-2.5 text-well-blue/60"><Radio className="w-3.5 h-3.5" /> SECURE_UPLINK_STABLE</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-well-green/40 font-mono tracking-tighter">DC-1_REVISION_V1.0.4_BETA</span>
                        <HardDrive className="w-3.5 h-3.5" />
                    </div>
                </footer>

                {/* Onboarding Sync Overlay */}
                <AnimatePresence>
                    {onboarding && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#0a0f1c]/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-8"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: -30 }}
                                className="max-w-3xl w-full glass-card p-20 border-well-green/30 relative overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.1)]"
                            >
                                {/* Digital Grain Overlay */}
                                <div className="absolute inset-0 pointer-events-none bg-scanline opacity-[0.03] z-0"></div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="relative mb-14">
                                        <div className="absolute inset-0 bg-well-green/20 blur-[40px] rounded-full animate-pulse"></div>
                                        <div className="w-28 h-28 bg-[#0a0f1c] rounded-[2.5rem] border border-well-green/40 flex items-center justify-center relative z-10 shadow-2xl">
                                            <Zap className="w-14 h-14 text-well-green animate-bounce" />
                                        </div>
                                    </div>

                                    <h2 className="text-4xl font-black text-white mb-3 uppercase italic tracking-tighter">DC-1 Provisioning</h2>
                                    <p className="text-well-green font-mono text-[12px] mb-16 uppercase tracking-[0.5em] font-black animate-pulse">Establishing Microsoft Intune Secure Uplink...</p>

                                    <div className="w-full max-w-lg space-y-12">
                                        <div className="relative">
                                            <div className="h-2.5 w-full bg-[#111827] rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-well-green via-[#4ade80] to-well-green rounded-full shadow-[0_0_20px_#22c55e]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <div className="absolute top-full mt-4 flex justify-between w-full text-[11px] font-black font-mono text-well-green tracking-widest">
                                                <span>STREAM_PROGRESS</span>
                                                <span>{progress}%</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 pt-10">
                                            {[
                                                { l: 'BIOS Setup Hook', ok: progress > 25 },
                                                { l: 'Intune Token Root', ok: progress > 50 },
                                                { l: 'Asset Mapping YYC', ok: progress > 75 },
                                                { l: 'SecOps Handshake', ok: progress > 95 },
                                            ].map((s, i) => (
                                                <div key={i} className={`p-5 rounded-2xl border font-mono text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-between ${s.ok ? 'border-well-green/40 bg-well-green/10 text-well-green shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-white/5 bg-white/2 text-slate-800'}`}>
                                                    <span>{s.l}</span>
                                                    {s.ok ? <ShieldCheck className="w-4 h-4" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-20 text-[11px] font-black text-slate-800 tracking-[0.8em] font-mono select-none">
                                        ENCRYPTED_DATA_BURST_STABLE_004x21
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
};

const App = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <AppContent /> : <Login />;
};

export default App;
