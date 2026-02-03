'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api/admin';
import {
    ArrowLeftIcon,
    PlusCircleIcon,
    BriefcaseIcon,
    MapPinIcon,
    CurrencyRupeeIcon,
    AcademicCapIcon,
    CalendarIcon,
    LinkIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    TrashIcon,
    InformationCircleIcon,
    BoltIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function CreateOpportunityPage() {
    const { isAuthenticated } = useAdmin();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [type, setType] = useState<'JOB' | 'INTERNSHIP' | 'WALKIN'>('JOB');
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [description, setDescription] = useState('');
    const [allowedDegrees, setAllowedDegrees] = useState<string[]>([]);
    const [passoutYears, setPassoutYears] = useState<number[]>([]);
    const [requiredSkills, setRequiredSkills] = useState<string>('');
    const [locations, setLocations] = useState<string>('');
    const [workMode, setWorkMode] = useState<'ONSITE' | 'HYBRID' | 'REMOTE'>('ONSITE');
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');
    const [applyLink, setApplyLink] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    // Walk-in specific
    const [walkInDates, setWalkInDates] = useState<string>('');
    const [venueAddress, setVenueAddress] = useState('');
    const [reportingTime, setReportingTime] = useState('');
    const [requiredDocuments, setRequiredDocuments] = useState<string>('');
    const [contactPerson, setContactPerson] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    const typeParamToEnum = (value: string) => {
        const v = value.toLowerCase();
        if (v === 'job' || v === 'jobs') return 'JOB';
        if (v === 'internship' || v === 'internships') return 'INTERNSHIP';
        if (v === 'walk-in' || v === 'walkin' || v === 'walkins' || v === 'walk-ins') return 'WALKIN';
        return value.toUpperCase();
    };

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (!typeParam) return;
        const normalized = typeParamToEnum(typeParam);
        if (normalized === 'JOB' || normalized === 'INTERNSHIP' || normalized === 'WALKIN') {
            setType(normalized as 'JOB' | 'INTERNSHIP' | 'WALKIN');
        }
    }, [searchParams]);

    const handleDegreeToggle = (degree: string) => {
        setAllowedDegrees(prev =>
            prev.includes(degree)
                ? prev.filter(d => d !== degree)
                : [...prev, degree]
        );
    };

    // Auto-fill parser
    const [showParser, setShowParser] = useState(false);
    const [pastedText, setPastedText] = useState('');

    const parseJobPosting = () => {
        if (!pastedText.trim()) return;

        const text = pastedText;
        const loadingToast = toast.loading('✨ Analyzing text...');

        setTimeout(() => {
            // Extract title
            const titleMatch = text.match(/^([A-Z][^\n]{10,80}?)$/m);
            if (titleMatch) setTitle(titleMatch[1].trim());

            // Extract company
            const companyMatch = text.match(/\b((?:[A-Z][a-z]+\s?){1,4}(?:Inc|Ltd|LLC|Corporation|Corp|Company|Group|Technologies|Systems)?)/);
            if (companyMatch) setCompany(companyMatch[1].trim());

            // Extract location
            const locationMatch = text.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*([A-Z][a-z]+)/);
            if (locationMatch) setLocations(`${locationMatch[1]}, ${locationMatch[2]}`);

            // Extract skills
            const skillsPool = ['JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node', 'Python', 'Java', 'C#', 'C\\+\\+',
                'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
                'Git', 'REST', 'API', 'GraphQL', 'HTML', 'CSS', 'Next.js', 'Express', 'ASP.NET', 'VB', 'MVC', 'SSIS', 'Blazor'];
            const found = skillsPool.filter(s => new RegExp(`\\b${s}\\b`, 'gi').test(text));
            if (found.length > 0) setRequiredSkills(found.join(', '));

            // Detect work mode
            if (/\b(remote|work from home|wfh)\b/i.test(text)) setWorkMode('REMOTE');
            else if (/\b(hybrid)\b/i.test(text)) setWorkMode('HYBRID');
            else setWorkMode('ONSITE');

            // Set description
            setDescription(text.trim().substring(0, 2000));

            // Auto-detect degrees
            if (/\b(bachelor|B\.?E|B\.?Tech|graduation|graduate)\b/i.test(text) && !allowedDegrees.includes('DEGREE')) {
                setAllowedDegrees(prev => [...prev.filter(d => d !== 'DEGREE'), 'DEGREE']);
            }
            if (/\b(master|M\.?E|M\.?Tech|post.?graduate|PG)\b/i.test(text) && !allowedDegrees.includes('PG')) {
                setAllowedDegrees(prev => [...prev.filter(d => d !== 'PG'), 'PG']);
            }

            // Default passout years
            const year = new Date().getFullYear();
            setPassoutYears([year - 1, year, year + 1]);

            toast.success('Form auto-filled.', {
                id: loadingToast,
                icon: <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
            });
            setShowParser(false);
            setPastedText('');
        }, 1000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const loadingToast = toast.loading('⏳ Publishing to platform...');

        try {
            const payload: any = {
                type,
                title,
                company,
                description,
                allowedDegrees,
                allowedPassoutYears: passoutYears,
                requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
                locations: locations.split(',').map(s => s.trim()).filter(Boolean),
                workMode: type === 'WALKIN' ? undefined : workMode,
                salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
                salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
                applyLink: type === 'WALKIN' ? undefined : applyLink,
                expiresAt: expiresAt || undefined,
            };


            if (type === 'WALKIN') {
                payload.walkInDetails = {
                    dates: walkInDates.split(',').map(d => d.trim()).filter(Boolean),
                    venueAddress,
                    reportingTime,
                    requiredDocuments: requiredDocuments.split(',').map(s => s.trim()).filter(Boolean),
                    contactPerson: contactPerson || undefined,
                    contactPhone: contactPhone || undefined,
                };
            }

            await adminApi.createOpportunity(payload);

            toast.success('🚀 Opportunity published!', { id: loadingToast });
            router.push('/admin/opportunities');
        } catch (err: any) {
            toast.error(`❌ Error: ${err.message}`, { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2 md:pb-24">
            {/* Header */}
            <div className="space-y-3 md:space-y-4">
                <Link href="/admin/opportunities" className="hidden md:inline-flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeftIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    Back to Log
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">Post Opportunity</h1>
                        <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                            Create and publish a new listing for matched candidates.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowParser(!showParser)}
                        className="inline-flex items-center justify-center h-9 md:h-10 px-3 md:px-4 rounded-md text-xs md:text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm w-full md:w-auto"
                    >
                        <BoltIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                        Auto-Fill
                    </button>
                </div>
            </div>

            {/* AI Parser Overlay */}
            {showParser && (
                <div className="bg-muted/30 border border-border/50 rounded-xl p-4 md:p-6 relative overflow-hidden">
                    <div className="relative z-10 space-y-3 md:space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm md:text-base font-medium flex items-center gap-2">
                                <BoltIcon className="w-4 h-4" />
                                Paste Content
                            </h3>
                            <button onClick={() => setShowParser(false)} className="text-muted-foreground hover:text-foreground">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <textarea
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            rows={6}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs md:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Paste job description here..."
                        />
                        <button
                            onClick={parseJobPosting}
                            disabled={!pastedText.trim()}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 w-full md:w-auto"
                        >
                            <BoltIcon className="w-4 h-4 mr-2" />
                            Parse
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Type Selection */}
                <div className="space-y-2 md:space-y-4">
                    <h3 className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                        <InformationCircleIcon className="w-4 h-4 text-muted-foreground" />
                        Listing Type
                    </h3>
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                        {(['JOB', 'INTERNSHIP', 'WALKIN'] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`flex flex-col items-center justify-center p-2 md:p-4 rounded-lg border transition-all text-center ${type === t
                                    ? 'bg-primary/5 border-primary ring-1 ring-primary'
                                    : 'bg-card border-border hover:bg-accent/50 hover:border-accent-foreground/50'
                                    }`}
                            >
                                <span className={`text-xs md:text-sm font-medium ${type === t ? 'text-primary' : 'text-foreground'}`}>{t}</span>
                                <span className="text-[9px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 leading-none">
                                    {t === 'WALKIN' ? 'On-site' : 'Direct'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Details */}
                <div className="space-y-4 md:space-y-6 border border-border rounded-lg p-4 md:p-6 bg-card">
                    <h3 className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                        <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
                        Core Identity
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">JOB TITLE *</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g. Senior Frontend Engineer"
                            />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">COMPANY NAME *</label>
                            <input
                                required
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g. Google India"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">FULL DESCRIPTION</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            placeholder="Roles and responsibilities..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">MIN SALARY</label>
                            <input
                                type="number"
                                value={salaryMin}
                                onChange={(e) => setSalaryMin(e.target.value)}
                                className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="3,00,000"
                            />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">MAX SALARY</label>
                            <input
                                type="number"
                                value={salaryMax}
                                onChange={(e) => setSalaryMax(e.target.value)}
                                className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="12,00,000"
                            />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">EXPIRY DATE</label>
                            <input
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>

                {/* Requirements */}
                <div className="space-y-4 md:space-y-6 border border-border rounded-lg p-4 md:p-6 bg-card">
                    <h3 className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                        <AcademicCapIcon className="w-4 h-4 text-muted-foreground" />
                        Target Parameters
                    </h3>

                    <div className="space-y-2 md:space-y-3">
                        <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">EDUCATION LEVELS</label>
                        <div className="flex flex-wrap gap-2">
                            {['DIPLOMA', 'DEGREE', 'PG'].map((deg) => (
                                <button
                                    key={deg}
                                    type="button"
                                    onClick={() => handleDegreeToggle(deg)}
                                    className={`px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium border transition-colors ${allowedDegrees.includes(deg)
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        }`}
                                >
                                    {deg}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">PASSOUT YEARS</label>
                            <input
                                required
                                value={passoutYears.join(', ')}
                                onChange={(e) => setPassoutYears(e.target.value.split(',').map(y => parseInt(y.trim())).filter(Boolean))}
                                className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="2024, 2025"
                            />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">KEY SKILLS</label>
                            <input
                                value={requiredSkills}
                                onChange={(e) => setRequiredSkills(e.target.value)}
                                className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="React, Node.js, AWS..."
                            />
                        </div>
                    </div>
                </div>

                {/* Logistics */}
                <div className="space-y-4 md:space-y-6 border border-border rounded-lg p-4 md:p-6 bg-card">
                    <h3 className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                        Logistics
                    </h3>

                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">LOCATIONS</label>
                        <input
                            required
                            value={locations}
                            onChange={(e) => setLocations(e.target.value)}
                            className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Mumbai, Bangalore, Remote"
                        />
                    </div>

                    {type !== 'WALKIN' && (
                        <div className="space-y-2 md:space-y-3">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">WORK MODE</label>
                            <div className="grid grid-cols-3 gap-2 md:gap-3">
                                {(['ONSITE', 'HYBRID', 'REMOTE'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setWorkMode(mode)}
                                        className={`h-8 md:h-9 rounded-md text-xs md:text-sm font-medium border transition-colors ${workMode === mode
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                            }`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Apply Settings */}
                <div className="space-y-4 md:space-y-6 border border-border rounded-lg p-4 md:p-6 bg-card">
                    <h3 className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-muted-foreground" />
                        Application Channel
                    </h3>

                    {type === 'WALKIN' ? (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[10px] md:text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide">WALK-IN DATES *</label>
                                    <input
                                        required
                                        value={walkInDates}
                                        onChange={(e) => setWalkInDates(e.target.value)}
                                        className="flex h-10 md:h-11 w-full rounded-md border border-amber-500/30 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="2024-05-10, 2024-05-11"
                                    />
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[10px] md:text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide">REPORTING TIME *</label>
                                    <input
                                        required
                                        value={reportingTime}
                                        onChange={(e) => setReportingTime(e.target.value)}
                                        className="flex h-10 md:h-11 w-full rounded-md border border-amber-500/30 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="09:00 AM - 12:00 PM"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 md:space-y-2">
                                <label className="text-[10px] md:text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide">VENUE ADDRESS *</label>
                                <textarea
                                    required
                                    value={venueAddress}
                                    onChange={(e) => setVenueAddress(e.target.value)}
                                    rows={3}
                                    className="flex min-h-[60px] w-full rounded-md border border-amber-500/30 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    placeholder="Complete street address..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">OFFICIAL APPLY URL *</label>
                            <input
                                type="url"
                                required
                                value={applyLink}
                                onChange={(e) => setApplyLink(e.target.value)}
                                className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="https://careers.company.com/..."
                            />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                    <Link
                        href="/admin/opportunities"
                        className="inline-flex h-9 md:h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full md:w-auto order-1"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex h-9 md:h-10 items-center justify-center rounded-md bg-primary px-4 md:px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full md:w-auto order-2"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                            <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                        )}
                        {isLoading ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </form>
        </div>
    );
}
