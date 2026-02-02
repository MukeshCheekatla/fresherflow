'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { opportunitiesApi, actionsApi, feedbackApi } from '@/lib/api/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Opportunity } from '@/types/api';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    MapPin,
    Clock,
    IndianRupee,
    Building2,
    GraduationCap,
    Calendar,
    ExternalLink,
    CheckCircle2,
    AlertTriangle,
    Info,
    Flag,
    Sparkles,
    ClipboardList,
    Users,
    XCircle
} from 'lucide-react';

export default function OpportunityDetailPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userAction, setUserAction] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadOpportunity();
    }, [params.id]);

    const loadOpportunity = async () => {
        try {
            const response = await opportunitiesApi.getById(params.id as string);
            setOpportunity(response.opportunity);
        } catch (err: any) {
            toast.error(`❌ Load failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (actionType: string) => {
        if (!opportunity) return;

        setIsSubmitting(true);
        const loadingToast = toast.loading(`📡 Syncing ${actionType.toLowerCase()} status...`);
        try {
            await actionsApi.track(opportunity.id, actionType);
            setUserAction(actionType);
            toast.success(`✅ Marked as ${actionType.replace('_', ' ')}`, { id: loadingToast });
        } catch (err: any) {
            toast.error(err.message || 'Action failed', { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFeedback = async (reason: string) => {
        if (!opportunity) return;

        setIsSubmitting(true);
        const loadingToast = toast.loading('🚩 Filing community report...');
        try {
            await feedbackApi.submit(opportunity.id, reason);
            toast.success('✅ Report filed. We will investigate.', { id: loadingToast });
        } catch (err: any) {
            toast.error(err.message || 'Feedback failed', { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">Scanning Listing Hub</p>
            </div>
        );
    }

    if (!opportunity) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full glass-card p-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                        <XCircle className="w-10 h-10 text-rose-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Listing Removed</h2>
                        <p className="text-slate-500 font-medium">This opportunity is no longer reachable or you are not eligible to view it.</p>
                    </div>
                    <Link href="/opportunities" className="premium-button py-4 w-full inline-flex justify-center items-center gap-2">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Opportunities
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <AuthGate>
            <ProfileGate>
                <div className="min-h-screen bg-slate-50 animate-in fade-in duration-700 pb-20">
                    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                            <Link href="/opportunities" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm">
                                <ArrowLeft className="w-4 h-4" />
                                Return to Feed
                            </Link>
                            <div className="hidden sm:flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-slate-900" />
                                <span className="font-black text-sm tracking-tighter text-slate-900">YearHire Premium Detail</span>
                            </div>
                        </div>
                    </nav>

                    <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
                        {/* Header Section */}
                        <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                            <div className="relative z-10 space-y-8">
                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${opportunity.type === 'WALKIN' ? 'bg-orange-100 text-orange-600' :
                                            opportunity.type === 'INTERNSHIP' ? 'bg-purple-100 text-purple-600' :
                                                'bg-blue-100 text-blue-600'
                                        }`}>
                                        {opportunity.type}
                                    </span>
                                    {opportunity.workMode && (
                                        <span className="px-4 py-1.5 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                                            {opportunity.workMode}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                                        {opportunity.title}
                                    </h1>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-100">
                                            {opportunity.company[0]}
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-500">{opportunity.company}</h2>
                                    </div>
                                </div>

                                {opportunity.salaryMin && (
                                    <div className="inline-block bg-emerald-50 px-6 py-4 rounded-3xl border border-emerald-100 text-emerald-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Estimated Comp</p>
                                        <p className="text-3xl font-black tracking-tighter">
                                            ₹{(opportunity.salaryMin / 100000).toFixed(1)} - {(opportunity.salaryMax || 0 / 100000).toFixed(1)} LPA
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-100">
                                    {[
                                        { label: 'Location Hub', val: opportunity.locations.join(', '), icon: MapPin },
                                        { label: 'Posted At', val: new Date(opportunity.postedAt).toLocaleDateString(), icon: Calendar },
                                        { label: 'Expiry Sync', val: opportunity.expiresAt ? new Date(opportunity.expiresAt).toLocaleDateString() : 'N/A', icon: Clock },
                                        { label: 'Verified By', val: opportunity.admin?.fullName || 'YearHire HQ', icon: Info }
                                    ].map((item, i) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <item.icon className="w-3 h-3" />
                                                {item.label}
                                            </div>
                                            <p className="font-bold text-slate-900 text-sm truncate">{item.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Walk-in Core (Only if applicable) */}
                        {opportunity.type === 'WALKIN' && opportunity.walkInDetails && (
                            <div className="bg-orange-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-orange-100 overflow-hidden relative group">
                                <div className="relative z-10 flex flex-col md:flex-row gap-10">
                                    <div className="flex-1 space-y-6">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                            <MapPin className="w-3 h-3" />
                                            On-site Event Hub
                                        </div>
                                        <h3 className="text-3xl font-black tracking-tighter">Venue & Logistics</h3>
                                        <p className="text-orange-100 font-medium leading-relaxed">{opportunity.walkInDetails.venueAddress}</p>
                                    </div>
                                    <div className="w-full md:w-64 space-y-6">
                                        <div className="bg-white/10 p-6 rounded-3xl border border-white/5 space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Reporting Time</p>
                                            <p className="text-xl font-black">{opportunity.walkInDetails.reportingTime}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {opportunity.walkInDetails.dates.map((d: string, i: number) => (
                                                <span key={i} className="bg-white/20 px-3 py-1 rounded-lg text-xs font-black uppercase">{new Date(d).toLocaleDateString()}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Content Column */}
                            <div className="md:col-span-2 space-y-8">
                                {/* Description */}
                                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                        <ClipboardList className="w-5 h-5 text-slate-400" />
                                        Role Blueprint
                                    </h3>
                                    <div className="prose max-w-none text-slate-600 font-medium leading-loose whitespace-pre-wrap">
                                        {opportunity.description}
                                    </div>
                                </div>

                                {/* Eligibility */}
                                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-8">
                                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-slate-400" />
                                        Requirement Core
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Education Horizon</p>
                                            <div className="flex flex-wrap gap-2">
                                                {opportunity.allowedDegrees.map(d => <span key={d} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black">{d}</span>)}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passout Years</p>
                                            <div className="flex flex-wrap gap-2">
                                                {opportunity.allowedPassoutYears.map(y => <span key={y} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-black">{y}</span>)}
                                            </div>
                                        </div>
                                        {opportunity.requiredSkills.length > 0 && (
                                            <div className="md:col-span-2 space-y-3 pt-4 border-t border-slate-50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skill Stack Verified</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {opportunity.requiredSkills.map(s => <span key={s} className="px-3 py-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-black">{s}</span>)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Sidebar */}
                            <div className="space-y-6">
                                <div className="sticky top-28 space-y-6">
                                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200">
                                        <h3 className="text-lg font-black tracking-tight mb-6">Interaction Hub</h3>

                                        {userAction && (
                                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/5 flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                <span className="text-xs font-black uppercase tracking-widest">Synced: {userAction}</span>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            {opportunity.applyLink && (
                                                <a
                                                    href={opportunity.applyLink}
                                                    target="_blank"
                                                    onClick={() => handleAction('APPLIED')}
                                                    className="premium-button w-full bg-white text-slate-900 hover:bg-slate-100 py-4 flex items-center justify-center gap-2 group"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                    Launch Application
                                                </a>
                                            )}

                                            <div className="grid grid-cols-1 gap-2">
                                                <button
                                                    onClick={() => handleAction('PLANNING')}
                                                    disabled={isSubmitting || userAction === 'PLANNING'}
                                                    className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-black uppercase tracking-widest"
                                                >
                                                    Mark as Planning
                                                    <ClipboardList className="w-4 h-4 opacity-40" />
                                                </button>

                                                {opportunity.type === 'WALKIN' && (
                                                    <button
                                                        onClick={() => handleAction('ATTENDED')}
                                                        disabled={isSubmitting || userAction === 'ATTENDED'}
                                                        className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-black uppercase tracking-widest"
                                                    >
                                                        Mark as Attended
                                                        <Users className="w-4 h-4 opacity-40" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Community Shield</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Help us keep data clean</p>
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { id: 'LINK_BROKEN', label: 'Broken Link' },
                                                { id: 'EXPIRED', label: 'Already Closed' },
                                                { id: 'DUPLICATE', label: 'Duplicate hub' }
                                            ].map(report => (
                                                <button
                                                    key={report.id}
                                                    onClick={() => handleFeedback(report.id)}
                                                    disabled={isSubmitting}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all text-xs font-black text-slate-400 uppercase tracking-widest border border-transparent hover:border-rose-100"
                                                >
                                                    <Flag className="w-4 h-4" />
                                                    {report.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </ProfileGate>
        </AuthGate>
    );
}
