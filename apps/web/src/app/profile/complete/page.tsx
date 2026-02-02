'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileApi } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { AuthGate } from '@/components/gates/ProfileGate';
import toast from 'react-hot-toast';
import {
    GraduationCap,
    Target,
    Zap,
    ChevronRight,
    MapPin,
    Briefcase,
    Clock,
    Plus,
    X,
    Loader2,
    CheckCircle2
} from 'lucide-react';

type Step = 'education' | 'preferences' | 'readiness';

const EDUCATION_LEVELS = ['DIPLOMA', 'DEGREE', 'PG'];
const OPPORTUNITY_TYPES = ['JOB', 'INTERNSHIP', 'WALKIN'];
const WORK_MODES = ['ONSITE', 'HYBRID', 'REMOTE'];
const AVAILABILITY_OPTIONS = ['IMMEDIATE', 'DAYS_15', 'MONTH_1'];

export default function ProfileCompletePage() {
    const { profile, refreshUser } = useAuth();
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState<Step>('education');
    const [isLoading, setIsLoading] = useState(false);

    // Education state
    const [educationLevel, setEducationLevel] = useState('');
    const [courseName, setCourseName] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [passoutYear, setPassoutYear] = useState('');

    // Preferences state
    const [interestedIn, setInterestedIn] = useState<string[]>([]);
    const [preferredCities, setPreferredCities] = useState<string[]>([]);
    const [workModes, setWorkModes] = useState<string[]>([]);

    // Readiness state
    const [availability, setAvailability] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');

    const [completion, setCompletion] = useState(0);

    useEffect(() => {
        if (profile) {
            setCompletion(profile.completionPercentage);
            if (profile.completionPercentage === 100) {
                router.push('/dashboard');
            }
        }
    }, [profile, router]);

    const handleEducationSubmit = async () => {
        if (!educationLevel || !courseName || !specialization || !passoutYear) {
            toast.error('❌ Please fill all education fields');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('📚 Saving education details...');

        try {
            await profileApi.updateEducation({
                educationLevel,
                courseName,
                specialization,
                passoutYear: parseInt(passoutYear)
            });
            await refreshUser();
            toast.success('Step 1 complete!', { id: loadingToast });
            setCurrentStep('preferences');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreferencesSubmit = async () => {
        if (interestedIn.length === 0 || preferredCities.length === 0 || workModes.length === 0) {
            toast.error('❌ Preferences incomplete');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('🎯 Saving your interests...');

        try {
            await profileApi.updatePreferences({
                interestedIn,
                preferredCities,
                workModes
            });
            await refreshUser();
            toast.success('Middle of the way!', { id: loadingToast });
            setCurrentStep('readiness');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReadinessSubmit = async () => {
        if (!availability || skills.length === 0) {
            toast.error('❌ Skills & Availability required');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('✨ Finalizing your profile...');

        try {
            await profileApi.updateReadiness({
                availability,
                skills
            });
            await refreshUser();
            toast.success('🏆 You are in the Flow!', { id: loadingToast });
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Failed to complete', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    const addSkill = () => {
        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
            toast.success('Added');
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
        if (array.includes(item)) {
            setArray(array.filter(i => i !== item));
        } else {
            setArray([...array, item]);
        }
    };

    return (
        <AuthGate>
            <div className="min-h-screen bg-slate-50 py-12 px-4 animate-in fade-in duration-1000">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* Header Progress */}
                    <div className="glass-card rounded-[2.5rem] p-10 border-white shadow-2xl shadow-slate-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                                    Finalizing Your Flow
                                </h1>
                                <p className="text-slate-500 font-medium tracking-tight">
                                    Connecting your skills to the engineering stream.
                                </p>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100">
                                <div className="relative w-12 h-12 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="24" cy="24" r="20" className="stroke-slate-200 fill-none" strokeWidth="4" />
                                        <circle cx="24" cy="24" r="20" className="stroke-slate-900 fill-none" strokeWidth="4" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * completion) / 100} strokeLinecap="round" />
                                    </svg>
                                    <span className="absolute text-[10px] font-black">{completion}%</span>
                                </div>
                                <div className="text-sm font-bold text-slate-900">Completion</div>
                            </div>
                        </div>

                        {/* Step Navigation */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'education', label: 'College', icon: GraduationCap },
                                { id: 'preferences', label: 'Interests', icon: Target },
                                { id: 'readiness', label: 'Skills', icon: Zap }
                            ].map((s, i) => {
                                const isActive = currentStep === s.id;
                                const isDone = completion >= (i === 0 ? 40 : i === 1 ? 80 : 100);
                                return (
                                    <div key={s.id} className="relative group">
                                        <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-500 ${isActive ? 'bg-slate-900 shadow-xl' : 'opacity-40'}`}>
                                            <s.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="glass-card rounded-[2.5rem] p-10 border-white shadow-2xl shadow-slate-100 min-h-[500px] flex flex-col">

                        {currentStep === 'education' && (
                            <div className="space-y-8 flex-1 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900">Education</h2>
                                    <p className="text-slate-400 font-medium">Verify your degree status.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Degree Level</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {EDUCATION_LEVELS.map(level => (
                                                <button
                                                    key={level}
                                                    onClick={() => setEducationLevel(level)}
                                                    className={`py-3 rounded-2xl font-bold border-2 transition-all ${educationLevel === level ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Identity</label>
                                            <input
                                                value={courseName}
                                                onChange={(e) => setCourseName(e.target.value)}
                                                className="premium-input"
                                                placeholder="e.g. B.Tech Engineering"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch/Specialization</label>
                                            <input
                                                value={specialization}
                                                onChange={(e) => setSpecialization(e.target.value)}
                                                className="premium-input"
                                                placeholder="e.g. Computer Science"
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
                                            placeholder="2024"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        onClick={handleEducationSubmit}
                                        disabled={isLoading}
                                        className="w-full premium-button py-5 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ChevronRight className="w-6 h-6" />}
                                        <span>{isLoading ? 'Storing Data...' : 'Submit & Continue'}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 'preferences' && (
                            <div className="space-y-8 flex-1 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900">Preferences</h2>
                                    <p className="text-slate-400 font-medium">What are you looking for?</p>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Types of Opportunities</label>
                                        <div className="flex flex-wrap gap-3">
                                            {OPPORTUNITY_TYPES.map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => toggleArrayItem(interestedIn, setInterestedIn, t)}
                                                    className={`px-6 py-2.5 rounded-2xl font-bold border-2 transition-all ${interestedIn.includes(t) ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Ecosystem</label>
                                        <div className="flex flex-wrap gap-3">
                                            {WORK_MODES.map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => toggleArrayItem(workModes, setWorkModes, t)}
                                                    className={`px-6 py-2.5 rounded-2xl font-bold border-2 transition-all ${workModes.includes(t) ? 'bg-indigo-900 border-indigo-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Locations</label>
                                        <div className="flex gap-2">
                                            <input
                                                placeholder="Type city and hit Enter"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = (e.target as HTMLInputElement).value;
                                                        if (val) {
                                                            toggleArrayItem(preferredCities, setPreferredCities, val);
                                                            (e.target as HTMLInputElement).value = '';
                                                        }
                                                    }
                                                }}
                                                className="premium-input bg-slate-50"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {preferredCities.map(c => (
                                                <span key={c} className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                                                    {c}
                                                    <X onClick={() => toggleArrayItem(preferredCities, setPreferredCities, c)} className="w-3 h-3 cursor-pointer opacity-60 hover:opacity-100" />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        onClick={handlePreferencesSubmit}
                                        disabled={isLoading}
                                        className="w-full premium-button py-5 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ChevronRight className="w-6 h-6" />}
                                        <span>Proceed to Skills</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 'readiness' && (
                            <div className="space-y-8 flex-1 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900">Readiness</h2>
                                    <p className="text-slate-400 font-medium">Verify your skills and availability.</p>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Availability Window</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {AVAILABILITY_OPTIONS.map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => setAvailability(val)}
                                                    className={`py-5 rounded-3xl flex flex-col items-center justify-center border-2 transition-all ${availability === val ? 'bg-emerald-900 border-emerald-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                                >
                                                    <span className="font-black text-sm">{val.replace('_', ' ')}</span>
                                                    <span className="text-[8px] opacity-60 uppercase font-black tracking-widest">Horizon</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Skill Catalog</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                                className="premium-input bg-slate-50"
                                                placeholder="e.g. React.js, Python"
                                            />
                                            <button onClick={addSkill} className="premium-button px-8"><Plus className="w-6 h-6" /></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map(s => (
                                                <div key={s} className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2">
                                                    {s}
                                                    <X onClick={() => removeSkill(s)} className="w-3 h-3 cursor-pointer opacity-40 hover:opacity-100" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10">
                                    <button
                                        onClick={handleReadinessSubmit}
                                        disabled={isLoading}
                                        className="w-full premium-button py-6 bg-emerald-950 hover:bg-black text-white flex items-center justify-center gap-3 text-lg"
                                    >
                                        {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <CheckCircle2 className="w-7 h-7" />}
                                        <span>Finish Entire Setup</span>
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AuthGate>
    );
}
