'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { profileApi } from '@/lib/api/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    ArrowLeftIcon,
    CheckIcon,
    AcademicCapIcon,
    BoltIcon,
    MapPinIcon,
    ArrowPathIcon,
    UserCircleIcon,
    IdentificationIcon,
    PlusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const EDUCATION_LEVELS = ['DIPLOMA', 'DEGREE', 'PG'];
const OPPORTUNITY_TYPES = ['JOB', 'INTERNSHIP', 'WALKIN'];
const WORK_MODES = ['ONSITE', 'HYBRID', 'REMOTE'];
const AVAILABILITY_OPTIONS = [
    { value: 'IMMEDIATE', label: 'Within 7 Days' },
    { value: 'DAYS_15', label: '15 Days' },
    { value: 'MONTH_1', label: '30 Days' }
];

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

export default function EditProfilePage() {
    const { profile, refreshUser } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    // Form state
    const [educationLevel, setEducationLevel] = useState('');

    // 10th
    const [tenthYear, setTenthYear] = useState('');

    // 12th
    const [twelfthYear, setTwelfthYear] = useState('');

    // Graduation
    const [gradCourse, setGradCourse] = useState('');
    const [gradSpecialization, setGradSpecialization] = useState('');
    const [gradYear, setGradYear] = useState('');

    // PG
    const [hasPG, setHasPG] = useState(false);
    const [pgCourse, setPgCourse] = useState('');
    const [pgSpecialization, setPgSpecialization] = useState('');
    const [pgYear, setPgYear] = useState('');

    const [interestedIn, setInterestedIn] = useState<string[]>([]);
    const [preferredCities, setPreferredCities] = useState<string[]>([]);
    const [workModes, setWorkModes] = useState<string[]>([]);
    const [availability, setAvailability] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        if (profile) {
            setEducationLevel(profile.educationLevel || '');
            setTenthYear(profile.tenthYear?.toString() || '');
            setTwelfthYear(profile.twelfthYear?.toString() || '');
            setGradCourse(profile.gradCourse || '');
            setGradSpecialization(profile.gradSpecialization || '');
            setGradYear(profile.gradYear?.toString() || '');

            if (profile.pgCourse) {
                setHasPG(true);
                setPgCourse(profile.pgCourse);
                setPgSpecialization(profile.pgSpecialization || '');
                setPgYear(profile.pgYear?.toString() || '');
            }

            setInterestedIn(profile.interestedIn || []);
            setPreferredCities(profile.preferredCities || []);
            setWorkModes(profile.workModes || []);
            setAvailability(profile.availability || '');
            setSkills(profile.skills || []);
        }
    }, [profile]);

    const handleEducationUpdate = async () => {
        if (!tenthYear || !twelfthYear || !educationLevel || !gradCourse || !gradSpecialization || !gradYear) {
            toast.error('❌ Education fields incomplete');
            return;
        }

        if (tenthYear.length !== 4 || twelfthYear.length !== 4 || gradYear.length !== 4 || (hasPG && pgYear && pgYear.length !== 4)) {
            toast.error('❌ Years must be exactly 4 digits');
            return;
        }

        setSaving(true);
        const loadingToast = toast.loading('🛰️ Syncing academic records...');
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
            toast.success('Academy updated!', { id: loadingToast });
        } catch (err: any) {
            toast.error(err.message || 'Update failed', { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    const handlePreferencesUpdate = async () => {
        if (interestedIn.length === 0 || preferredCities.length === 0 || workModes.length === 0) {
            toast.error('❌ Preferences incomplete');
            return;
        }

        setSaving(true);
        const loadingToast = toast.loading('🎯 Updating career stream...');
        try {
            await profileApi.updatePreferences({ interestedIn, preferredCities, workModes });
            await refreshUser();
            toast.success('Interests synced!', { id: loadingToast });
        } catch (err: any) {
            toast.error(err.message || 'Update failed', { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    const handleReadinessUpdate = async () => {
        if (!availability || skills.length === 0) {
            toast.error('❌ Skills & availability required');
            return;
        }

        setSaving(true);
        const loadingToast = toast.loading('🏆 Finalizing matrix...');
        try {
            await profileApi.updateReadiness({ availability, skills });
            await refreshUser();
            toast.success('Talent profile updated!', { id: loadingToast });
        } catch (err: any) {
            toast.error(err.message || 'Finalization failed', { id: loadingToast });
        } finally {
            setSaving(false);
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
            <ProfileGate>
                <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 pb-24">
                    {/* Header */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Link href="/dashboard" className="p-2 hover:bg-muted rounded-xl transition-colors">
                                    <ArrowLeftIcon className="w-5 h-5 text-muted-foreground" />
                                </Link>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Settings</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic">Profile Settings</h1>
                            <p className="text-muted-foreground font-medium">Update your academic and professional parameters.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* Academic Section */}
                            <section className="premium-card !p-8 space-y-8">
                                <div className="flex items-center gap-3 pb-4 border-b border-border">
                                    <AcademicCapIcon className="w-6 h-6 text-primary" />
                                    <h2 className="text-xl font-black tracking-tight italic uppercase">Academic Foundation</h2>
                                </div>

                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">10th Passout Year</label>
                                            <input type="text" maxLength={4} value={tenthYear} onChange={(e) => setTenthYear(e.target.value.replace(/\D/g, ''))} className="premium-input !h-12" placeholder="2018" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">12th Passout Year</label>
                                            <input type="text" maxLength={4} value={twelfthYear} onChange={(e) => setTwelfthYear(e.target.value.replace(/\D/g, ''))} className="premium-input !h-12" placeholder="2020" />
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4 border-t border-border/50">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Highest Education Level</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {EDUCATION_LEVELS.map(level => (
                                                    <button
                                                        key={level} onClick={() => setEducationLevel(level)}
                                                        className={cn("h-11 rounded-xl font-bold border transition-all text-xs uppercase tracking-widest", educationLevel === level ? "bg-primary border-primary text-white shadow-lg" : "bg-muted/50 border-border text-muted-foreground hover:border-primary/40")}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">UG Course</label>
                                                <select value={gradCourse} onChange={(e) => { setGradCourse(e.target.value); setGradSpecialization(''); }} className="premium-input !h-12">
                                                    <option value="">Select UG</option>
                                                    {(educationLevel === 'DIPLOMA' ? DIPLOMA_DEGREES : educationLevel === 'DEGREE' ? UG_DEGREES : educationLevel === 'PG' ? PG_DEGREES : []).map(d => <option key={d}>{d}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Specialization</label>
                                                <select value={gradSpecialization} onChange={(e) => setGradSpecialization(e.target.value)} className="premium-input !h-12" disabled={!gradCourse}>
                                                    <option value="">Select Field</option>
                                                    {getSpecializations(gradCourse).map(s => <option key={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">UG Passout Year</label>
                                            <input type="text" maxLength={4} value={gradYear} onChange={(e) => setGradYear(e.target.value.replace(/\D/g, ''))} className="premium-input !h-12" placeholder="2024" />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <label className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors">
                                            <input type="checkbox" checked={hasPG} onChange={(e) => setHasPG(e.target.checked)} className="w-5 h-5 rounded-md border-border text-primary" />
                                            <span className="text-sm font-bold text-foreground italic">Update Postgraduate (PG) Details</span>
                                        </label>
                                    </div>

                                    {hasPG && (
                                        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500 pt-2 pb-6 border-b border-border/50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">PG Course</label>
                                                    <select value={pgCourse} onChange={(e) => setPgCourse(e.target.value)} className="premium-input !h-11">
                                                        <option value="">Select PG</option>
                                                        {PG_DEGREES.map(d => <option key={d}>{d}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">PG Specialization</label>
                                                    <select value={pgSpecialization} onChange={(e) => setPgSpecialization(e.target.value)} className="premium-input !h-11">
                                                        <option value="">Select Field</option>
                                                        {getSpecializations(pgCourse).map(s => <option key={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">PG Passout Year</label>
                                                <input type="text" maxLength={4} value={pgYear} onChange={(e) => setPgYear(e.target.value.replace(/\D/g, ''))} className="premium-input !h-11" placeholder="2026" />
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={handleEducationUpdate} disabled={saving} className="w-full premium-button !h-14">
                                        {saving ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <span>Update Academic Matrix</span>}
                                    </button>
                                </div>
                            </section>

                            {/* Talent Matrix Section */}
                            <section className="premium-card !p-8 space-y-8">
                                <div className="flex items-center gap-3 pb-4 border-b border-border">
                                    <BoltIcon className="w-6 h-6 text-primary" />
                                    <h2 className="text-xl font-black tracking-tight italic uppercase">Talent Catalog</h2>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Availability Horizon</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {AVAILABILITY_OPTIONS.map(opt => (
                                                <button
                                                    key={opt.value} onClick={() => setAvailability(opt.value)}
                                                    className={cn("h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all gap-1", availability === opt.value ? "border-primary bg-primary text-white shadow-xl shadow-primary/20" : "bg-muted/50 border-border text-muted-foreground hover:border-primary/40")}
                                                >
                                                    <span className="font-black text-sm uppercase tracking-tighter italic">{opt.label}</span>
                                                    <span className="text-[9px] opacity-60 font-medium uppercase tracking-[0.2em]">Switch</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-border/50">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Professional Skills</p>
                                        <div className="flex gap-2">
                                            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addSkill()} className="premium-input !h-12" placeholder="e.g. React, Python" />
                                            <button onClick={addSkill} className="premium-button shrink-0 px-6 !h-12"><PlusIcon className="w-5 h-5" /></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 min-h-6">
                                            {skills.map(s => (
                                                <span key={s} className="bg-success/10 text-success border border-success/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    {s}
                                                    <XMarkIcon onClick={() => removeSkill(s)} className="w-3.5 h-3.5 cursor-pointer opacity-50 hover:opacity-100" />
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <button onClick={handleReadinessUpdate} disabled={saving} className="w-full premium-button !h-14">
                                        {saving ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <span>Update Readiness Matrix</span>}
                                    </button>
                                </div>
                            </section>
                        </div>

                        {/* Sidebar Preferences */}
                        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                            <div className="premium-card !p-8 space-y-8 shadow-xl">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Career Stream</label>
                                        <div className="flex flex-wrap gap-2">
                                            {OPPORTUNITY_TYPES.map(t => (
                                                <button
                                                    key={t} onClick={() => toggleArrayItem(interestedIn, setInterestedIn, t)}
                                                    className={cn("px-4 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all", interestedIn.includes(t) ? "bg-foreground text-background border-foreground shadow-lg" : "bg-card border-border text-muted-foreground hover:border-primary/50")}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Work Ecosystem</label>
                                        <div className="flex flex-wrap gap-2">
                                            {WORK_MODES.map(t => (
                                                <button
                                                    key={t} onClick={() => toggleArrayItem(workModes, setWorkModes, t)}
                                                    className={cn("px-4 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all", workModes.includes(t) ? "bg-foreground text-background border-foreground shadow-lg" : "bg-card border-border text-muted-foreground hover:border-primary/50")}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Target Locations</label>
                                        <div className="flex gap-2">
                                            <input
                                                placeholder="Type city + Enter"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = (e.target as HTMLInputElement).value;
                                                        if (val) { toggleArrayItem(preferredCities, setPreferredCities, val); (e.target as HTMLInputElement).value = ''; }
                                                    }
                                                }}
                                                className="premium-input !h-11 !text-xs"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {preferredCities.map(c => (
                                                <span key={c} className="bg-primary text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    {c}
                                                    <XMarkIcon onClick={() => toggleArrayItem(preferredCities, setPreferredCities, c)} className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handlePreferencesUpdate} disabled={saving} className="w-full premium-button !h-14">
                                    {saving ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <div className="flex items-center gap-2"><span>Sync Preferences</span><CheckIcon className="w-5 h-5" /></div>}
                                </button>
                            </div>

                            <div className="premium-card !bg-muted/30 !p-6 flex items-start gap-3 border-none">
                                <IdentificationIcon className="w-6 h-6 text-primary shrink-0" />
                                <p className="text-[11px] font-medium text-muted-foreground italic leading-relaxed">
                                    Strategic profile updates increase match visibility by up to 300%. Ensure all criteria are current.
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </ProfileGate>
        </AuthGate>
    );
}

