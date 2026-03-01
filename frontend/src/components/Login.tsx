import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, ShieldAlert, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:10000'}/api/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            login(data.access_token);
        } catch (err: any) {
            setError(err.message || 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#060a12] flex items-center justify-center p-4">
            {/* Background elements to match Nexus vibe */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-well-blue/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-card border-white/10 p-10 bg-[#0d1425]/80 backdrop-blur-2xl">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-well-green to-emerald-600 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            <span className="text-3xl font-black text-white italic tracking-tighter">N</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-2">Nexus Command</h1>
                        <p className="text-xs text-slate-400 tracking-[0.2em] uppercase">Secure Login Required</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded p-4 flex items-center gap-3 text-red-400 text-xs uppercase tracking-widest font-bold">
                            <ShieldAlert className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-well-green transition-colors" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="admin"
                                    className="w-full bg-[#0a0f1c] border border-white/5 rounded-lg py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-well-green/50 placeholder-slate-600 tracking-widest uppercase"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-well-green transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="nexus123"
                                    className="w-full bg-[#0a0f1c] border border-white/5 rounded-lg py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-well-green/50 placeholder-slate-600 tracking-widest uppercase"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden bg-well-green text-black font-black uppercase tracking-[0.2em] py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-well-green/90 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="animate-pulse">Authenticating...</span>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Initialize Uplink
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mb-2">
                            Default Access: admin / nexus123
                        </p>
                        <p className="text-[10px] text-well-green uppercase tracking-[0.3em] font-bold">
                            Built by Ravi Patel
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
