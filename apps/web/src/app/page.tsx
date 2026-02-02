'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, ArrowRight, Zap, MapPin, ShieldCheck, TrendingUp, ChevronRight } from 'lucide-react';

export default function LandingPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (!isLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-slate-900 selection:text-white">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 transition-all">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-all duration-300">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-2xl tracking-tighter text-slate-900">FresherFlow</span>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-6">
                        {!isLoading && user ? (
                            <Link href="/dashboard" className="px-5 py-2.5 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                                Open Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/register" className="px-5 py-2.5 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                                    Join the Flow
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Stream Active: 1,400+ New Openings</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Engineering Your <br />
                        <span className="text-slate-400">First Offer.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200 leading-relaxed">
                        Every verified job, internship, and walk-in—merged into one high-speed stream. No spam, no expired links, just the flow.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
                        {user ? (
                            <Link href="/dashboard" className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white text-lg font-black rounded-[2rem] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-2 group">
                                Go to My Feed
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <>
                                <Link href="/register" className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white text-lg font-black rounded-[2rem] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-2 group">
                                    Enter the Feed
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/login" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border border-slate-200 text-lg font-black rounded-[2rem] hover:bg-slate-50 transition-all flex items-center justify-center">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-blue-50/20 via-slate-50/50 to-purple-50/20 rounded-full blur-3xl -z-10" />
            </section>

            {/* Core Pillars */}
            <section className="max-w-7xl mx-auto px-6 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: 'One Stream Hub',
                            desc: 'Jobs, Internships, and Walk-ins merged into a single interface. No more jumping tabs.',
                            icon: Zap,
                            color: 'bg-blue-600'
                        },
                        {
                            title: 'Smart Matching',
                            desc: 'We filter the mess. See only opportunities matching your degree, batch, and skills.',
                            icon: ShieldCheck,
                            color: 'bg-emerald-600'
                        },
                        {
                            title: 'Real-time City Sync',
                            desc: 'Instant notifications for walk-in drives and off-campus events in your specific city.',
                            icon: MapPin,
                            color: 'bg-orange-600'
                        }
                    ].map((pillar, i) => (
                        <div key={i} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                            <div className={`w-14 h-14 ${pillar.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:scale-110`}>
                                <pillar.icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{pillar.title}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">{pillar.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trust Section */}
            <section className="bg-white border-y border-slate-100 py-32">
                <div className="max-w-7xl mx-auto px-6 text-center space-y-20">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">The Transparency Index</p>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Built for the Batch of 2024-2026.</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {[
                            { label: 'Live Data', val: '100%' },
                            { label: 'Verification Rate', val: '99.8%' },
                            { label: 'Mass Success', val: '12k+' },
                            { label: 'Spam Blocked', val: '∞' }
                        ].map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <p className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 py-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-slate-900" />
                                <span className="font-black text-xl tracking-tighter text-slate-900">FresherFlow</span>
                            </div>
                            <p className="text-sm font-bold text-slate-400">Engineering the future of entry-level hiring.</p>
                        </div>
                        <div className="flex items-center gap-8">
                            <Link href="/privacy" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">Privacy</Link>
                            <Link href="/terms" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">Terms</Link>
                            <Link href="/login" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">Admin</Link>
                        </div>
                    </div>
                    <div className="mt-20 pt-10 border-t border-slate-200/50 text-center">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">© 2026 FresherFlow. All systems operational.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

