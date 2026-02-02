'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { profileApi } from '@/lib/api/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    ArrowLeftIcon,
    CheckIcon,
    AcademicCapIcon,
    ViewfinderCircleIcon,
    BoltIcon,
    MapPinIcon,
    BriefcaseIcon,
    ClockIcon,
    ArrowPathIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

export default function EditProfilePage() {
    const { profile, refreshProfile } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    // Form state
    const [educationLevel, setEducationLevel] = useState('');
    const [courseName, setCourseName] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [passoutYear, setPassoutYear] = useState('');
    const [interestedIn, setInterestedIn] = useState<string[]>([]);
    const [preferredCities, setPreferredCities] = useState('');
    const [workModes, setWorkModes] = useState<string[]>([]);
    const [availability, setAvailability] = useState('');
    const [skills, setSkills] = useState('');

    useEffect(() => {
        if (profile) {
            setEducationLevel(profile.educationLevel || '');
            setCourseName(profile.courseName || '');
            setSpecialization(profile.specialization || '');
            setPassoutYear(profile.passoutYear?.toString() || '');
            setInterestedIn(profile.interestedIn || []);
            setPreferredCities(profile.preferredCities?.join(', ') || '');
            setWorkModes(profile.workModes || []);
            setAvailability(profile.availability || '');
            setSkills(profile.skills?.join(', ') || '');
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const loadingToast = toast.loading('🛰️ Syncing profile changes...');
        try {
            await profileApi.updateProfile({
                educationLevel: educationLevel || undefined,
                courseName: courseName || undefined,
                specialization: specialization || undefined,
                passoutYear: passoutYear ? parseInt(passoutYear) : undefined,
                interestedIn,
                preferredCities: preferredCities.split(',').map(c => c.trim()).filter(Boolean),
                workModes,
                availability: availability || undefined,
                skills: skills.split(',').map(s => s.trim()).filter(Boolean),
            });

            await refreshProfile();
            toast.success('Profile synchronized with the Flow!', { id: loadingToast });
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(`❌ Sync failed: ${error.message}`, { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthGate>
            <ProfileGate>
                <div className="min-h-screen bg-slate-50 animate-in fade-in duration-700 pb-20 md:pb-10">
                    <main className="max-content py-10">
                        <div className="mb-10 space-y-2">
                            <h1 className="tracking-tighter">Profile Engineering</h1>
                            <p className="text-slate-500 font-medium tracking-tight">Fine-tune your readiness parameters for higher match accuracy.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Education Block */}
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-8">
                                <h2 className="flex items-center gap-3">
                                    <AcademicCapIcon className="w-5 h-5 text-slate-400" />
                                    Academic Foundation
                                </h2>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Degree Tier</label>
                                        <div className="flex flex-wrap gap-3">
                                            {['DIPLOMA', 'DEGREE', 'PG'].map((level) => (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    onClick={() => setEducationLevel(level)}
                                                    className={`h-[48px] px-6 rounded-xl font-bold border-2 transition-all text-sm ${educationLevel === level
                                                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                                        }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Name</label>
                                            <input
                                                type="text"
                                                value={courseName}
                                                onChange={(e) => setCourseName(e.target.value)}
                                                className="premium-input"
                                                placeholder="e.g. Computer Science"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialization</label>
                                            <input
                                                type="text"
                                                value={specialization}
                                                onChange={(e) => setSpecialization(e.target.value)}
                                                className="premium-input"
                                                placeholder="e.g. Machine Learning"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passout Year</label>
                                        <input
                                            type="number"
                                            value={passoutYear}
                                            onChange={(e) => setPassoutYear(e.target.value)}
                                            className="premium-input"
                                            placeholder="2025"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preferences Block */}
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-8">
                                <h2 className="flex items-center gap-3">
                                    <ViewfinderCircleIcon className="w-5 h-5 text-slate-400" />
                                    Target Parameters
                                </h2>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Opportunity Stream</label>
                                        <div className="flex flex-wrap gap-3">
                                            {['JOB', 'INTERNSHIP', 'WALKIN'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => {
                                                        setInterestedIn(prev =>
                                                            prev.includes(type)
                                                                ? prev.filter(t => t !== type)
                                                                : [...prev, type]
                                                        );
                                                    }}
                                                    className={`h-[44px] px-6 rounded-xl font-bold border-2 transition-all text-sm ${interestedIn.includes(type)
                                                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location Targets (comma-separated)</label>
                                        <div className="relative">
                                            <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={preferredCities}
                                                onChange={(e) => setPreferredCities(e.target.value)}
                                                className="premium-input pl-11"
                                                placeholder="Mumbai, Bangalore, Remote"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Working Ecosystem</label>
                                        <div className="flex flex-wrap gap-3">
                                            {['ONSITE', 'HYBRID', 'REMOTE'].map((mode) => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => {
                                                        setWorkModes(prev =>
                                                            prev.includes(mode)
                                                                ? prev.filter(m => m !== mode)
                                                                : [...prev, mode]
                                                        );
                                                    }}
                                                    className={`h-[44px] px-6 rounded-xl font-bold border-2 transition-all text-sm ${workModes.includes(mode)
                                                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                                        }`}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Availability Window</label>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { value: 'IMMEDIATE', label: 'Immediate' },
                                                { value: 'DAYS_15', label: '15 Days' },
                                                { value: 'MONTH_1', label: '1 Month' }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => setAvailability(opt.value)}
                                                    className={`h-[44px] px-6 rounded-xl font-bold border-2 transition-all text-sm ${availability === opt.value
                                                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                                        }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t border-slate-50">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <BoltIcon className="w-4 h-4" />
                                            Skill Catalog (Core Competencies)
                                        </label>
                                        <textarea
                                            value={skills}
                                            onChange={(e) => setSkills(e.target.value)}
                                            rows={4}
                                            className="premium-input py-4"
                                            placeholder="React, Node.js, Python, Project Management..."
                                        />
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-1 italic">Separate skills with commas for optimal indexing</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full premium-button !h-[64px] text-lg"
                                >
                                    {saving ? (
                                        <ArrowPathIcon className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <CheckIcon className="w-6 h-6" />
                                    )}
                                    <span>{saving ? 'Synchronizing Data Hub...' : 'Save & Propagate Changes'}</span>
                                </button>
                            </div>
                        </form>
                    </main>
                </div>
            </ProfileGate>
        </AuthGate>
    );
}
