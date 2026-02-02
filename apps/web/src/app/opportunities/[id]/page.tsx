'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { opportunitiesApi, actionsApi } from '@/lib/api/client';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { Opportunity } from '@/types/api';
import toast from 'react-hot-toast';
import {
    MapPinIcon,
    BriefcaseIcon,
    ClockIcon,
    CalendarDaysIcon,
    BuildingOfficeIcon,
    ArrowLeftIcon,
    ArrowTopRightOnSquareIcon,
    ShieldCheckIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function OpportunityDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [opp, setOpp] = useState<Opportunity | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) loadOpportunity();
    }, [id]);

    const loadOpportunity = async () => {
        setIsLoading(true);
        try {
            const data = await opportunitiesApi.getById(id as string);
            setOpp(data);
        } catch (error: any) {
            toast.error('Failed to load listing.');
            router.push('/opportunities');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async () => {
        if (!opp || !opp.applyLink) {
            toast.error('Apply link not available.');
            return;
        }
        try {
            await actionsApi.track(opp.id, 'APPLIED');
            window.open(opp.applyLink, '_blank');
        } catch (error) {
            console.error('Track failed', error);
            window.open(opp.applyLink, '_blank');
        }
    };

    if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" /></div>;
    if (!opp) return null;

    return (
        <AuthGate>
            <ProfileGate>
                <div className="min-h-screen bg-slate-50 animate-in fade-in duration-700 pb-32 md:pb-0">
                    <main className="max-content py-8 space-y-8">
                        {/* Header Section */}
                        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
                            <div className="relative z-10">
                                <Link href="/opportunities" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold text-[11px] uppercase tracking-widest mb-8">
                                    <ArrowLeftIcon className="w-[18px] h-[18px]" />
                                    Back to Stream
                                </Link>

                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${opp.type === 'WALKIN' ? 'bg-orange-100 text-orange-600' :
                                                opp.type === 'INTERNSHIP' ? 'bg-purple-100 text-purple-600' :
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                {opp.type}
                                            </span>
                                            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <ClockIcon className="w-4 h-4" />
                                                {opp.workMode || 'ONSITE'}
                                            </div>
                                        </div>
                                        <h1>
                                            {opp.title}
                                        </h1>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                                                <BuildingOfficeIcon className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-900 tracking-tight">{opp.company}</p>
                                                <p className="text-slate-500 font-bold text-sm tracking-tight">{opp.locations.join(' • ')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:block">
                                        <button
                                            onClick={handleApply}
                                            className="premium-button bg-slate-900 text-white !h-[56px] px-8 rounded-2xl shadow-xl shadow-slate-200"
                                        >
                                            Apply on Company Site
                                            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Decor */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rotate-45 translate-x-32 -translate-y-32 pointer-events-none" />
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="md:col-span-2 space-y-10">
                                <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-6">
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                        <BriefcaseIcon className="w-6 h-6 text-slate-400" />
                                        Job Description
                                    </h2>
                                    <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                                        {opp.description}
                                    </div>
                                </section>

                                <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-6">
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                        <ShieldCheckIcon className="w-6 h-6 text-slate-400" />
                                        Eligibility & Requirements
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allowed Degrees</p>
                                            <p className="text-slate-900 font-bold">{opp.allowedDegrees.join(', ') || 'Any Degree'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passout Years</p>
                                            <p className="text-slate-900 font-bold">{opp.allowedPassoutYears.join(', ') || 'All Batches'}</p>
                                        </div>
                                        <div className="col-span-full space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Skills</p>
                                            <p className="text-slate-900 font-bold">{opp.requiredSkills.join(' • ')}</p>
                                        </div>
                                    </div>
                                </section>

                                {opp.type === 'WALKIN' && (
                                    <section className="bg-orange-50 border border-orange-100 rounded-[2.5rem] p-10 space-y-6">
                                        <h2 className="text-xl font-black text-orange-900 flex items-center gap-3">
                                            <MapPinIcon className="w-6 h-6" />
                                            Walk-In Details
                                        </h2>
                                        <div className="space-y-4">
                                            <p className="text-orange-800 font-medium leading-relaxed">
                                                This is a direct walk-in drive. Please ensure you have all required documents.
                                            </p>
                                            {opp.expiresAt && (
                                                <div className="flex items-center gap-2 text-orange-900 font-black">
                                                    <CalendarDaysIcon className="w-5 h-5" />
                                                    <span>Drive Date: {new Date(opp.expiresAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}
                            </div>

                            <aside className="space-y-8">
                                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
                                    <h3 className="font-black tracking-widest uppercase text-[10px] text-slate-400">Listing Insights</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400">Stream Status</p>
                                            <p className="text-lg font-black text-emerald-400">Currently Active</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400">Verification</p>
                                            <p className="text-lg font-black text-blue-400">100% Flow Verified</p>
                                        </div>
                                        <div className="pt-4 border-t border-white/10">
                                            <p className="text-[10px] font-black text-slate-500 uppercase">Engineering your first offer with FresherFlow.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 space-y-4">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <InformationCircleIcon className="w-6 h-6 flex-shrink-0" />
                                        <p className="text-xs font-medium italic">
                                            Always apply through the official company portal. FresherFlow never asks for money.
                                        </p>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </main>

                    {/* Mobile Sticky Apply Button */}
                    <div className="md:hidden fixed bottom-[64px] left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 z-40 pb-safe">
                        <button
                            onClick={handleApply}
                            className="w-full premium-button !h-[52px]"
                        >
                            Apply on Company Site
                            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </ProfileGate>
        </AuthGate>
    );
}
