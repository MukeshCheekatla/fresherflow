'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileApi } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { AuthGate } from '@/components/gates/ProfileGate';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
    AcademicCapIcon,
    ViewfinderCircleIcon,
    BoltIcon,
    XMarkIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    SparklesIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

type Step = 'education' | 'preferences' | 'readiness';

const EDUCATION_LEVELS = ['DIPLOMA', 'DEGREE', 'PG'];
const OPPORTUNITY_TYPES = ['JOB', 'INTERNSHIP', 'WALKIN'];
const WORK_MODES = ['ONSITE', 'HYBRID', 'REMOTE'];
const AVAILABILITY_OPTIONS = ['IMMEDIATE', 'DAYS_15', 'MONTH_1'];

const DIPLOMA_DEGREES = [
    'Diploma in Computer Science',
    'Diploma in IT',
    'Diploma in Electronics',
    'Diploma in Mechanical',
    'Diploma in Civil',
    'Diploma in Electrical',
    'Diploma in Artificial Intelligence',
    'Other'
];

const UG_DEGREES = [
    'B.Tech / B.E.',
    'B.Sc.',
    'BCA',
    'BBA',
    'B.Com',
    'B.A.',
    'Other'
];

const PG_DEGREES = [
    'M.Tech / M.E.',
    'M.Sc.',
    'MCA',
    'MBA',
    'M.Com',
    'M.A.',
    'Other'
];

const DEGREE_SPECIALIZATIONS: Record<string, string[]> = {
    'B.Tech / B.E.': ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical', 'Mechanical', 'Civil', 'AI & ML', 'Data Science', 'Other'],
    'B.Sc.': ['Computer Science', 'Physics', 'Mathematics', 'Chemistry', 'Information Technology', 'Other'],
    'BCA': ['Software Development', 'Web Applications', 'Database Systems', 'Other'],
    'M.Tech / M.E.': ['Computer Science', 'VLSI Design', 'Structural Engineering', 'Thermo Fluids', 'Cloud Computing', 'Other'],
    'MCA': ['Application Development', 'System Architecture', 'Cloud Tech', 'Other'],
    'MBA': ['Finance', 'Marketing', 'Human Resources', 'Operations', 'Business Analytics', 'Other'],
    'default': ['General', 'Computer Science', 'Business', 'Arts', 'Other']
};

export default function ProfileCompletePage() {
    const { profile, refreshUser } = useAuth();
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState<Step>('education');
    const [isLoading, setIsLoading] = useState(false);

    // Education state
    const [tenthYear, setTenthYear] = useState('');
    const [twelfthYear, setTwelfthYear] = useState('');
    const [educationLevel, setEducationLevel] = useState('');
    const [gradCourse, setGradCourse] = useState('');
    const [gradSpecialization, setGradSpecialization] = useState('');
    const [gradYear, setGradYear] = useState('');

    // Optional PG
    const [hasPG, setHasPG] = useState(false);
    const [pgCourse, setPgCourse] = useState('');
    const [pgSpecialization, setPgSpecialization] = useState('');
    const [pgYear, setPgYear] = useState('');

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
        if (!tenthYear || !twelfthYear || !educationLevel || !gradCourse || !gradSpecialization || !gradYear) {
            toast.error('❌ Please fill all required education fields');
            return;
        }

        if (tenthYear.length !== 4 || twelfthYear.length !== 4 || gradYear.length !== 4 || (hasPG && pgYear && pgYear.length !== 4)) {
            toast.error('❌ Years must be exactly 4 digits');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('🛰️ Syncing academic foundation...');
        try {
            await profileApi.updateEducation({
                educationLevel,
                tenthYear: parseInt(tenthYear),
                twelfthYear: parseInt(twelfthYear),
                gradCourse,
                gradSpecialization,
                gradYear: parseInt(gradYear),
                ...(hasPG && {
                    pgCourse,
                    pgSpecialization,
                    pgYear: pgYear ? parseInt(pgYear) : undefined
                })
            });
            await refreshUser();
            toast.success('Academy profile locked!', { id: loadingToast });
            setCurrentStep('preferences');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            toast.error(err.message || 'Update failed', { id: loadingToast });
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
        const loadingToast = toast.loading('🎯 Optimizing career stream...');
        try {
            await profileApi.updatePreferences({ interestedIn, preferredCities, workModes });
            await refreshUser();
            toast.success('Interests mapped!', { id: loadingToast });
            setCurrentStep('readiness');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            toast.error(err.message || 'Update failed', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReadinessSubmit = async () => {
        if (!availability || skills.length === 0) {
            toast.error('❌ Skills & availability required');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('🏆 Finalizing professional profile...');
        try {
            await profileApi.updateReadiness({ availability, skills });
            await refreshUser();
            toast.success('Profile setup complete!', { id: loadingToast });
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Finalization failed', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    const addSkill = () => {
        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => setSkills(skills.filter(s => s !== skill));

    const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
        setArray(array.includes(item) ? array.filter(i => i !== item) : [...array, item]);
    };

    const getSpecializations = (course: string) => {
        return DEGREE_SPECIALIZATIONS[course] || DEGREE_SPECIALIZATIONS['default'];
    };

    return (
        <AuthGate>
            <div className="max-w-6xl mx-auto px-2 md:px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Sticky Sidebar */}
                    <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
                        <div className="premium-card !p-6 space-y-6 shadow-xl border-primary/5">
                            <div>
                                <h1 className="text-2xl font-black tracking-tighter mb-2 italic">Complete Profile</h1>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.05em]">Setup your account for job matching.</p>
                            </div>

                            {/* Circular Progress */}
                            <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-2xl border border-border/50">
                                <div className="relative w-16 h-16 shrink-0">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="none" className="text-muted" />
                                        <circle
                                            cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="none"
                                            strokeDasharray={175.9}
                                            strokeDashoffset={175.9 * (1 - completion / 100)}
                                            className="text-primary transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-base font-black italic">
                                        {completion}%
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none">Completion</p>
                                    <p className="text-lg font-black text-foreground italic">{completion}% Finished</p>
                                </div>
                            </div>

                            {/* Nav Steps */}
                            <div className="space-y-3">
                                {[
                                    { id: 'education', label: 'Academic Foundation', desc: 'Detailed History', icon: AcademicCapIcon },
                                    { id: 'preferences', label: 'Match Parameters', desc: 'Interests & Role types', icon: ViewfinderCircleIcon },
                                    { id: 'readiness', label: 'Talent Showcase', desc: 'Skills & Availability', icon: BoltIcon }
                                ].map((s, i) => {
                                    const isActive = currentStep === s.id;
                                    const isDone = completion >= (i === 0 ? 40 : i === 1 ? 80 : 100);
                                    return (
                                        <div
                                            key={s.id}
                                            className={cn(
                                                "p-4 rounded-2xl flex items-center gap-4 transition-all border",
                                                isActive ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" :
                                                    isDone ? "bg-primary/5 border-primary/20 text-primary" :
                                                        "bg-card border-border text-muted-foreground"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-xl", isActive ? "bg-white/20" : "bg-muted/50")}>
                                                <s.icon className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black uppercase tracking-wider leading-none mb-1">{s.label}</p>
                                                <p className={cn("text-xs font-medium opacity-70 truncate", isActive ? "text-white/80" : "text-muted-foreground")}>{s.desc}</p>
                                            </div>
                                            {isDone && !isActive && <CheckCircleIcon className="w-5 h-5 ml-auto text-primary" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* Main Form Content */}
                    <main className="lg:col-span-8">
                        <div className="premium-card !p-6 md:!p-8 shadow-2xl border-border/50 min-h-[500px] flex flex-col">

                            {/* Header Intro */}
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1 h-8 bg-primary rounded-full" />
                                <div>
                                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2 italic">
                                        {currentStep === 'education' && "Academic Foundation"}
                                        {currentStep === 'preferences' && "Match Parameters"}
                                        {currentStep === 'readiness' && "Talent Showcase"}
                                        <SparklesIcon className="w-4 h-4 text-primary animate-pulse" />
                                    </h2>
                                    <p className="text-[11px] text-muted-foreground font-medium">
                                        {currentStep === 'education' && "Define your complete education history for strict eligibility matching."}
                                        {currentStep === 'preferences' && "Tell us what excites you to personalize your job feed."}
                                        {currentStep === 'readiness' && "Finalize your technical skills and job hunting status."}
                                    </p>
                                </div>
                            </div>

                            {/* Forms Rendering */}
                            <div className="flex-1">
                                {currentStep === 'education' && (
                                    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* 10th Standard */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-bold">10th</div>
                                                    <h3 className="text-sm font-black italic uppercase tracking-wider">Secondary</h3>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Year of Passing</label>
                                                    <Input type="text" maxLength={4} value={tenthYear} onChange={(e) => setTenthYear(e.target.value.replace(/\D/g, ''))} placeholder="2018" />
                                                </div>
                                            </div>

                                            {/* 12th / Diploma */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-bold">12th</div>
                                                    <h3 className="text-sm font-black italic uppercase tracking-wider">Higher Secondary</h3>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Year of Passing</label>
                                                    <Input type="text" maxLength={4} value={twelfthYear} onChange={(e) => setTwelfthYear(e.target.value.replace(/\D/g, ''))} placeholder="2020" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Higher Education */}
                                        <div className="space-y-6 pt-4 border-t border-border/50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">UG</div>
                                                <h3 className="text-sm font-black italic uppercase tracking-wider">Graduation (Primary)</h3>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Education Level</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {EDUCATION_LEVELS.map(level => (
                                                        <button
                                                            key={level}
                                                            onClick={() => setEducationLevel(level)}
                                                            className={cn(
                                                                "h-10 rounded-xl font-bold border-2 transition-all text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-0.5",
                                                                educationLevel === level ? "bg-primary border-primary text-white shadow-lg" : "bg-muted/50 border-border text-muted-foreground hover:border-primary/40"
                                                            )}
                                                        >
                                                            <span>{level === 'DEGREE' ? 'UG' : level}</span>
                                                            <span className="text-[7px] font-medium opacity-70 uppercase tracking-tighter">
                                                                {level === 'DIPLOMA' && 'Technical'}
                                                                {level === 'DEGREE' && 'Undergrad'}
                                                                {level === 'PG' && 'Postgrad'}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">UG Course</label>
                                                    <Select value={gradCourse} onChange={(e) => { setGradCourse(e.target.value); setGradSpecialization(''); }}>
                                                        <option value="">Select UG</option>
                                                        {(educationLevel === 'DIPLOMA' ? DIPLOMA_DEGREES : educationLevel === 'DEGREE' ? UG_DEGREES : educationLevel === 'PG' ? PG_DEGREES : []).map(d => <option key={d}>{d}</option>)}
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Specialization</label>
                                                    <Select value={gradSpecialization} onChange={(e) => setGradSpecialization(e.target.value)} disabled={!gradCourse}>
                                                        <option value="">Select Field</option>
                                                        {getSpecializations(gradCourse).map(s => <option key={s}>{s}</option>)}
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">UG Passout Year</label>
                                                <Input type="text" maxLength={4} value={gradYear} onChange={(e) => setGradYear(e.target.value.replace(/\D/g, ''))} placeholder="2024" />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-border mt-4">
                                            <label className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors border border-border/50">
                                                <input type="checkbox" checked={hasPG} onChange={(e) => setHasPG(e.target.checked)} className="w-5 h-5 rounded-md border-border text-primary" />
                                                <span className="text-sm font-bold text-foreground italic">Add Postgraduate (PG) Details</span>
                                            </label>
                                        </div>

                                        {hasPG && (
                                            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500 pt-2 pb-6 border-b border-border/50">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">PG Course</label>
                                                        <Select value={pgCourse} onChange={(e) => setPgCourse(e.target.value)}>
                                                            <option value="">Select PG</option>
                                                            {PG_DEGREES.map(d => <option key={d}>{d}</option>)}
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">PG Specialization</label>
                                                        <Select value={pgSpecialization} onChange={(e) => setPgSpecialization(e.target.value)}>
                                                            <option value="">Select Field</option>
                                                            {getSpecializations(pgCourse).map(s => <option key={s}>{s}</option>)}
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">PG Passout Year</label>
                                                    <Input type="text" maxLength={4} value={pgYear} onChange={(e) => setPgYear(e.target.value.replace(/\D/g, ''))} placeholder="2026" />
                                                </div>
                                            </div>
                                        )}

                                        <Button onClick={handleEducationSubmit} disabled={isLoading} className="w-full text-base shadow-xl shadow-primary/20 italic font-black">
                                            {isLoading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <span>Step 1: Lockdown Foundations</span>}
                                        </Button>
                                    </div>
                                )}

                                {currentStep === 'preferences' && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Stream Selection</p>
                                            <div className="flex flex-wrap gap-2">
                                                {OPPORTUNITY_TYPES.map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => toggleArrayItem(interestedIn, setInterestedIn, type)}
                                                        className={cn(
                                                            "h-10 rounded-xl font-bold border-2 transition-all text-[10px] uppercase tracking-widest",
                                                            interestedIn.includes(type) ? "bg-primary border-primary text-white shadow-lg" : "bg-muted/50 border-border text-muted-foreground hover:border-primary/40"
                                                        )}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Work Ecosystem</p>
                                            <div className="flex flex-wrap gap-2">
                                                {WORK_MODES.map(t => (
                                                    <button
                                                        key={t} onClick={() => toggleArrayItem(workModes, setWorkModes, t)}
                                                        className={cn("px-6 h-10 rounded-xl font-black text-xs uppercase tracking-widest transition-all border", workModes.includes(t) ? "bg-foreground text-background border-foreground shadow-lg" : "bg-muted/50 border-border text-muted-foreground hover:border-primary/50")}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Primary Locations</p>
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="Type city and hit Enter"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const val = (e.target as HTMLInputElement).value;
                                                            if (val) { toggleArrayItem(preferredCities, setPreferredCities, val); (e.target as HTMLInputElement).value = ''; }
                                                        }
                                                    }}
                                                    className="premium-input !h-10 text-[11px]"
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-2 min-h-6">
                                                {preferredCities.map(c => (
                                                    <span key={c} className="bg-primary text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-primary/20">
                                                        {c}
                                                        <XMarkIcon onClick={() => toggleArrayItem(preferredCities, setPreferredCities, c)} className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <Button onClick={handlePreferencesSubmit} disabled={isLoading} className="w-full text-base shadow-xl shadow-primary/20 italic font-black">
                                            {isLoading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <span>Step 2: Map Interests</span>}
                                        </Button>
                                    </div>
                                )}

                                {currentStep === 'readiness' && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Availability Window</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {AVAILABILITY_OPTIONS.map(val => (
                                                    <button
                                                        key={val} onClick={() => setAvailability(val)}
                                                        className={cn("h-14 rounded-xl flex flex-col items-center justify-center border-2 transition-all gap-0.5", availability === val ? "border-primary bg-primary text-white shadow-xl shadow-primary/20" : "bg-muted/50 border-border text-muted-foreground hover:border-primary/40")}
                                                    >
                                                        <span className="font-black text-xs uppercase tracking-tighter italic">{val.replace('_', ' ')}</span>
                                                        <span className="text-[8px] opacity-60 font-medium uppercase tracking-widest">Horizon</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Skill Catalog</p>
                                            <div className="flex gap-2">
                                                <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addSkill()} className="premium-input !h-10 text-[11px]" placeholder="e.g. React, Node.js" />
                                                <button onClick={addSkill} className="premium-button shrink-0 px-4 !h-10"><PlusIcon className="w-4 h-4" /></button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 min-h-6">
                                                {skills.map(s => (
                                                    <span key={s} className="bg-success/10 text-success border border-success/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                        {s}
                                                        <XMarkIcon onClick={() => removeSkill(s)} className="w-3 h-3 cursor-pointer opacity-50 hover:opacity-100" />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <Button onClick={handleReadinessSubmit} disabled={isLoading} className="w-full h-12 text-sm bg-foreground text-background hover:bg-foreground/90 shadow-xl italic font-black">
                                            {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <div className="flex items-center gap-2"><span>Finish Entire Setup</span><CheckCircleIcon className="w-5 h-5" /></div>}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </AuthGate>
    );
}

