'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileApi } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { AuthGate } from '@/components/gates/ProfileGate';
import toast from 'react-hot-toast';
import {
    AcademicCapIcon,
    ViewfinderCircleIcon,
    BoltIcon,
    ChevronRightIcon,
    MapPinIcon,
    BriefcaseIcon,
    ClockIcon,
    PlusIcon,
    XMarkIcon,
    ArrowPathIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

type Step = 'education' | 'preferences' | 'readiness';

const EDUCATION_LEVELS = ['DIPLOMA', 'DEGREE', 'PG'];

// Exact degree names for job matching
const DIPLOMA_DEGREES = [
    'Diploma in Engineering',
    'Diploma in Computer Science',
    'Diploma in Information Technology',
    'Diploma in Electronics',
    'Diploma in Mechanical',
    'Diploma in Civil',
    'Diploma in Electrical',
    'Other Diploma'
];

const UG_DEGREES = [
    'B.Tech (Bachelor of Technology)',
    'B.E. (Bachelor of Engineering)',
    'B.Sc. (Bachelor of Science)',
    'BCA (Bachelor of Computer Applications)',
    'BBA (Bachelor of Business Administration)',
    'B.Com (Bachelor of Commerce)',
    'B.A. (Bachelor of Arts)',
    'Other UG Degree'
];

const PG_DEGREES = [
    'M.Tech (Master of Technology)',
    'M.E. (Master of Engineering)',
    'M.Sc. (Master of Science)',
    'MCA (Master of Computer Applications)',
    'MBA (Master of Business Administration)',
    'M.Com (Master of Commerce)',
    'M.A. (Master of Arts)',
    'Other PG Degree'
];

// Common Engineering/CS Specializations
const SPECIALIZATIONS = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
    'Artificial Intelligence & Machine Learning',
    'Data Science',
    'Cyber Security',
    'Software Engineering',
    'Computer Applications',
    'Business Administration',
    'Finance & Accounting',
    'Marketing',
    'Human Resources',
    'Other'
];

const OPPORTUNITY_TYPES = ['JOB', 'INTERNSHIP', 'WALKIN'];
const WORK_MODES = ['ONSITE', 'HYBRID', 'REMOTE'];
const AVAILABILITY_OPTIONS = ['IMMEDIATE', 'DAYS_15', 'MONTH_1'];

export default function ProfileCompletePage() {
    const { profile, refreshUser } = useAuth();
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState<Step>('education');
    const [isLoading, setIsLoading] = useState(false);

    // Education state - Main Graduation
    const [educationLevel, setEducationLevel] = useState('');
    const [institutionName, setInstitutionName] = useState('');
    const [institutionLocation, setInstitutionLocation] = useState('');
    const [courseName, setCourseName] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [passoutYear, setPassoutYear] = useState('');
    const [cgpa, setCgpa] = useState('');

    // Optional PG (Postgraduate)
    const [hasPG, setHasPG] = useState(false);
    const [pg_institutionName, setPg_institutionName] = useState('');
    const [pg_institutionLocation, setPg_institutionLocation] = useState('');
    const [pg_courseName, setPg_courseName] = useState('');
    const [pg_specialization, setPg_specialization] = useState('');
    const [pg_passoutYear, setPg_passoutYear] = useState('');
    const [pg_cgpa, setPg_cgpa] = useState('');

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
        // Validate required graduation fields
        if (!educationLevel || !institutionName || !institutionLocation || !courseName || !specialization || !passoutYear || !cgpa) {
            toast.error('❌ Please fill all graduation fields');
            return;
        }

        // Validate PG if applicable
        if (hasPG && (!pg_institutionName || !pg_courseName || !pg_passoutYear)) {
            toast.error('❌ Please complete PG details or uncheck the option');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('📚 Saving education details...');

        try {
            await profileApi.updateEducation({
                educationLevel,
                institutionName,
                institutionLocation,
                courseName,
                specialization,
                passoutYear: parseInt(passoutYear),
                cgpa: parseFloat(cgpa),
                ...(hasPG && {
                    pg_institutionName,
                    pg_institutionLocation,
                    pg_courseName,
                    pg_specialization,
                    pg_passoutYear: parseInt(pg_passoutYear),
                    pg_cgpa: pg_cgpa ? parseFloat(pg_cgpa) : undefined
                })
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
            <div className="bg-background px-4 pb-10 md:pb-4">
                <div className="max-w-6xl mx-auto">

                    {/* 2-Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                        {/* LEFT SIDEBAR - Progress & Navigation */}
                        <div className="md:col-span-4 space-y-4">
                            {/* Header Card - Sticky */}
                            <div className="premium-card p-4 border border-border md:sticky md:top-24">
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-xl font-bold tracking-tight mb-1">
                                            Complete Your Profile
                                        </h2>
                                        <p className="text-xs text-muted-foreground">Quick setup to get started</p>
                                    </div>

                                    {/* Progress Circle */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16">
                                            <svg className="w-16 h-16 transform -rotate-90">
                                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted" />
                                                <circle
                                                    cx="32"
                                                    cy="32"
                                                    r="28"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    strokeDasharray={`${2 * Math.PI * 28}`}
                                                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - completion / 100)}`}
                                                    className="text-primary transition-all duration-500"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-sm font-black">{completion}%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Completion</p>
                                            <p className="text-lg font-black text-foreground">{completion}% Done</p>
                                        </div>
                                    </div>

                                    {/* Step Navigation */}
                                    <div className="space-y-2">
                                        {[
                                            { id: 'education', label: 'College & Degree', icon: AcademicCapIcon },
                                            { id: 'preferences', label: 'Job Interests', icon: ViewfinderCircleIcon },
                                            { id: 'readiness', label: 'Skills & Availability', icon: BoltIcon }
                                        ].map((s, i) => {
                                            const isActive = currentStep === s.id;
                                            const isDone = completion >= (i === 0 ? 40 : i === 1 ? 80 : 100);
                                            return (
                                                <div
                                                    key={s.id}
                                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive ? 'bg-primary text-primary-foreground shadow-md' :
                                                        isDone ? 'bg-primary/10 text-primary' :
                                                            'bg-muted/50 text-muted-foreground'
                                                        }`}
                                                >
                                                    <s.icon className="w-5 h-5 shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold uppercase tracking-wide truncate">{s.label}</p>
                                                        {isDone && !isActive && (
                                                            <p className="text-[10px] opacity-70">✓ Complete</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT CONTENT - Form Fields */}
                        <div className="md:col-span-8">
                            <div className="premium-card p-6 border border-border min-h-[450px]">

                                {currentStep === 'education' && (
                                    <div className="space-y-4 flex-1 animate-in slide-in-from-right-4 duration-500">
                                        <div className="space-y-1">
                                            <h3 className="text-base font-bold">Education</h3>
                                            <p className="text-xs text-muted-foreground">Your degree details.</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Degree Level</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {EDUCATION_LEVELS.map(level => (
                                                        <button
                                                            key={level}
                                                            onClick={() => setEducationLevel(level)}
                                                            className={`h-[40px] rounded-lg font-semibold border transition-all text-sm ${educationLevel === level ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border text-muted-foreground hover:border-primary/50'}`}
                                                        >
                                                            {level}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Institution Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Institution Name *</label>
                                                    <input
                                                        value={institutionName}
                                                        onChange={(e) => setInstitutionName(e.target.value)}
                                                        className="premium-input"
                                                        placeholder="e.g. IIT Delhi, VIT, BITS"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Location (City) *</label>
                                                    <input
                                                        value={institutionLocation}
                                                        onChange={(e) => setInstitutionLocation(e.target.value)}
                                                        className="premium-input"
                                                        placeholder="e.g. Mumbai, Bangalore"
                                                    />
                                                </div>
                                            </div>

                                            {/* Degree & Specialization */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="space-y-2"
                                                >
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Exact Degree *</label>
                                                    <select
                                                        value={courseName}
                                                        onChange={(e) => setCourseName(e.target.value)}
                                                        className="premium-input"
                                                    >
                                                        <option value="">Select Degree</option>
                                                        {(educationLevel === 'DIPLOMA' ? DIPLOMA_DEGREES :
                                                            educationLevel === 'DEGREE' ? UG_DEGREES :
                                                                educationLevel === 'PG' ? PG_DEGREES : []).map(deg => (
                                                                    <option key={deg} value={deg}>{deg}</option>
                                                                ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Specialization *</label>
                                                    <select
                                                        value={specialization}
                                                        onChange={(e) => setSpecialization(e.target.value)}
                                                        className="premium-input"
                                                    >
                                                        <option value="">Select Specialization</option>
                                                        {SPECIALIZATIONS.map(spec => (
                                                            <option key={spec} value={spec}>{spec}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Year & CGPA */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Passout Year *</label>
                                                    <input
                                                        type="number"
                                                        value={passoutYear}
                                                        onChange={(e) => setPassoutYear(e.target.value)}
                                                        className="premium-input"
                                                        placeholder="2024"
                                                        min="2000"
                                                        max="2030"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">CGPA/Percentage *</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={cgpa}
                                                        onChange={(e) => setCgpa(e.target.value)}
                                                        className="premium-input"
                                                        placeholder="8.5 or 85%"
                                                    />
                                                </div>
                                            </div>

                                            {/* Optional PG Section */}
                                            <div className="pt-3 border-t border-border">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={hasPG}
                                                        onChange={(e) => setHasPG(e.target.checked)}
                                                        className="w-4 h-4 rounded border-border"
                                                    />
                                                    <span className="text-sm font-semibold">I have a Postgraduate (PG) Degree</span>
                                                </label>
                                            </div>

                                            {hasPG && (
                                                <div className="space-y-3 pl-6 border-l-2 border-primary/20">
                                                    <p className="text-xs font-bold text-primary uppercase">PG Details</p>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">PG Institution</label>
                                                            <input
                                                                value={pg_institutionName}
                                                                onChange={(e) => setPg_institutionName(e.target.value)}
                                                                className="premium-input"
                                                                placeholder="e.g. IIM, NIT"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">PG Location</label>
                                                            <input
                                                                value={pg_institutionLocation}
                                                                onChange={(e) => setPg_institutionLocation(e.target.value)}
                                                                className="premium-input"
                                                                placeholder="City"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">PG Degree</label>
                                                            <select
                                                                value={pg_courseName}
                                                                onChange={(e) => setPg_courseName(e.target.value)}
                                                                className="premium-input"
                                                            >
                                                                <option value="">Select PG Degree</option>
                                                                {PG_DEGREES.map(deg => (
                                                                    <option key={deg} value={deg}>{deg}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">PG Specialization</label>
                                                            <select
                                                                value={pg_specialization}
                                                                onChange={(e) => setPg_specialization(e.target.value)}
                                                                className="premium-input"
                                                            >
                                                                <option value="">Select</option>
                                                                {SPECIALIZATIONS.map(spec => (
                                                                    <option key={spec} value={spec}>{spec}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">PG Passout Year</label>
                                                            <input
                                                                type="number"
                                                                value={pg_passoutYear}
                                                                onChange={(e) => setPg_passoutYear(e.target.value)}
                                                                className="premium-input"
                                                                placeholder="2026"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">PG CGPA (Optional)</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={pg_cgpa}
                                                                onChange={(e) => setPg_cgpa(e.target.value)}
                                                                className="premium-input"
                                                                placeholder="8.5"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                onClick={handleEducationSubmit}
                                                disabled={isLoading}
                                                className="w-full premium-button h-[44px]"
                                            >
                                                {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <ChevronRightIcon className="w-5 h-5" />}
                                                <span>{isLoading ? 'Storing Data...' : 'Submit & Continue'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 'preferences' && (
                                    <div className="space-y-8 flex-1 animate-in slide-in-from-right-4 duration-500">
                                        <div className="space-y-2">
                                            <h2 className="tracking-tighter">Preferences</h2>
                                            <p className="text-slate-400 font-medium">What are you looking for?</p>
                                        </div>

                                        <div className="space-y-10">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Types of Opportunities</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {OPPORTUNITY_TYPES.map(t => (
                                                        <button
                                                            key={t}
                                                            onClick={() => toggleArrayItem(interestedIn, setInterestedIn, t)}
                                                            className={`px-6 h-[44px] rounded-xl font-bold border-2 transition-all text-sm ${interestedIn.includes(t) ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                                        >
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Ecosystem</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {WORK_MODES.map(t => (
                                                        <button
                                                            key={t}
                                                            onClick={() => toggleArrayItem(workModes, setWorkModes, t)}
                                                            className={`px-6 h-[44px] rounded-xl font-bold border-2 transition-all text-sm ${workModes.includes(t) ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
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
                                                        className="premium-input"
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {preferredCities.map(c => (
                                                        <span key={c} className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                                                            {c}
                                                            <XMarkIcon onClick={() => toggleArrayItem(preferredCities, setPreferredCities, c)} className="w-3 h-3 cursor-pointer opacity-60 hover:opacity-100" />
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <button
                                                onClick={handlePreferencesSubmit}
                                                disabled={isLoading}
                                                className="w-full premium-button h-[56px]"
                                            >
                                                {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <ChevronRightIcon className="w-5 h-5" />}
                                                <span>Proceed to Skills</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 'readiness' && (
                                    <div className="space-y-8 flex-1 animate-in slide-in-from-right-4 duration-500">
                                        <div className="space-y-2">
                                            <h2 className="tracking-tighter">Readiness</h2>
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
                                                            className={`h-[72px] rounded-xl flex flex-col items-center justify-center border-2 transition-all ${availability === val ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                                        >
                                                            <span className="font-bold text-sm">{val.replace('_', ' ')}</span>
                                                            <span className="text-[10px] opacity-60 uppercase font-black tracking-widest">Horizon</span>
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
                                                        className="premium-input"
                                                        placeholder="e.g. React.js, Python"
                                                    />
                                                    <button onClick={addSkill} className="premium-button shrink-0 px-6"><PlusIcon className="w-5 h-5" /></button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {skills.map(s => (
                                                        <div key={s} className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2">
                                                            {s}
                                                            <XMarkIcon onClick={() => removeSkill(s)} className="w-3 h-3 cursor-pointer opacity-40 hover:opacity-100" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-10">
                                            <button
                                                onClick={handleReadinessSubmit}
                                                disabled={isLoading}
                                                className="w-full premium-button h-[64px] text-lg bg-emerald-900 hover:bg-emerald-800"
                                            >
                                                {isLoading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <CheckCircleIcon className="w-6 h-6" />}
                                                <span>Finish Entire Setup</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthGate>
    );
}
