import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { useAuth } from './contexts/AuthContext';", "import { useAuth } from './contexts/AuthContext';\nimport WarehouseMap from './components/WarehouseMap';")

map_block_old = """            case 'map':
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                        className="h-full flex flex-col space-y-8"
                    >
                        <SectionHeader title="Logistics Topography" subtitle="Fleet spatial distribution center" icon={MapIcon} />
                        <div className="flex-1 glass-card border-none bg-[#0d1425]/30 relative overflow-hidden flex items-center justify-center p-12 border border-white/5">
                            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                            <div className="w-full h-full relative border border-well-green/10 rounded-[4rem] bg-[#0a0f1c]/90 flex items-center justify-center shadow-2xl overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>

                                <span className="absolute top-10 left-12 text-[11px] font-black text-well-green italic tracking-[0.5em] opacity-40">CALGARY_FACILITY_SECURE_MAP</span>

                                {/* Distribution Layout */}
                                <div className="grid grid-cols-6 grid-rows-4 gap-12 w-full h-full p-24 opacity-20">
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <div key={i} className="border border-white/10 rounded-3xl bg-white/2 flex items-center justify-center text-[9px] font-black text-slate-500 uppercase">ZONE_{i + 10}</div>
                                    ))}
                                </div>

                                {/* Live Device Pings */}
                                {fleet.map((dev, i) => (
                                    <motion.div
                                        key={dev.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute cursor-pointer group z-20"
                                        style={{ top: `${25 + (i * 10)}%`, left: `${20 + (i * 12)}%` }}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0a0f1c] ${dev.status === 'Critical' ? 'bg-well-red animate-ping' : 'bg-well-green shadow-[0_0_20px_#22c55e]'}`}>
                                            <div className="w-2 h-2 bg-white rounded-full opacity-50"></div>
                                        </div>
                                        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none transform group-hover:-translate-y-2">
                                            <div className="glass-card p-5 bg-[#0d1425] border-well-green/40 w-48 shadow-2xl rounded-2xl text-center">
                                                <p className="text-[12px] font-black text-white italic tracking-tighter mb-1">{dev.name}</p>
                                                <p className="text-[9px] font-black text-well-green uppercase tracking-widest mb-3">{dev.status}</p>
                                                <div className="flex justify-between text-[8px] font-bold text-slate-500 pt-2 border-t border-white/5">
                                                    <span>IP: {dev.ip}</span>
                                                    <span>{dev.battery}% BAT</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );"""

map_block_new = """            case 'map':
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
                );"""

content = content.replace(map_block_old, map_block_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
