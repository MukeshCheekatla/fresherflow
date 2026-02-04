'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api/admin';
import {
    ArrowLeftIcon,
    InformationCircleIcon,
    BoltIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    MapPinIcon,
    LinkIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';

export default function CreateOpportunityPage() {
    const { isAuthenticated } = useAdmin();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [pastedText, setPastedText] = useState('');
    const [showParser, setShowParser] = useState(false);

    // Form state
    const [type, setType] = useState<'JOB' | 'INTERNSHIP' | 'WALKIN'>('JOB');
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [description, setDescription] = useState('');
    const [allowedDegrees, setAllowedDegrees] = useState<string[]>([]);
    const [allowedCourses, setAllowedCourses] = useState<string[]>([]);
    const [passoutYears, setPassoutYears] = useState<number[]>([]);
    const [requiredSkills, setRequiredSkills] = useState<string>('');
    const [locations, setLocations] = useState<string>('');
    const [workMode, setWorkMode] = useState<'ONSITE' | 'HYBRID' | 'REMOTE'>('ONSITE');
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');
    const [applyLink, setApplyLink] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [jobFunction, setJobFunction] = useState('');
    const [incentives, setIncentives] = useState('');
    const [salaryPeriod, setSalaryPeriod] = useState<'YEARLY' | 'MONTHLY'>('YEARLY');
    const [experienceMin, setExperienceMin] = useState('');
    const [experienceMax, setExperienceMax] = useState('');

    // Walk-in specific
    const [venueAddress, setVenueAddress] = useState('');
    const [walkInDateRange, setWalkInDateRange] = useState('');
    const [walkInTimeRange, setWalkInTimeRange] = useState('');
    const [venueLink, setVenueLink] = useState('');

    // Picker states for simpler UI
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('10:00');
    const [endTime, setEndTime] = useState('13:00');

    // Simple formatting utilities
    const getOrdinalNum = (n: number) => {
        return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 10 && n < 14) ? 0 : (n % 10 < 4 ? n % 10 : 0)] : '');
    };

    const formatDateRange = (start: string, end: string) => {
        if (!start) return '';
        const d1 = new Date(start);
        const m1 = d1.toLocaleString('en-IN', { month: 'short' });
        const day1 = getOrdinalNum(d1.getDate());

        if (!end || start === end) return `${day1} ${m1}`;

        const d2 = new Date(end);
        const m2 = d2.toLocaleString('en-IN', { month: 'short' });
        const day2 = getOrdinalNum(d2.getDate());

        if (m1 === m2) return `${day1} - ${day2} ${m1}`;
        return `${day1} ${m1} - ${day2} ${m2}`;
    };

    const formatTime = (time: string) => {
        if (!time) return '';
        const [h, m] = time.split(':');
        let hours = parseInt(h);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${m} ${ampm}`;
    };

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

    const handleCourseToggle = (course: string) => {
        setAllowedCourses(prev =>
            prev.includes(course) ? prev.filter(c => c !== course) : [...prev, course]
        );
    };

    const handleQuickLocation = (loc: string) => {
        if (locations.toLowerCase().includes(loc.toLowerCase())) return;
        setLocations(prev => prev ? `${prev}, ${loc}` : loc);
    };

    const handleAutoFill = async () => {
        if (!pastedText.trim()) {
            toast.error('Please paste some job content first');
            return;
        }

        setIsParsing(true);
        const toastId = toast.loading('🔍 Auto-filling...');

        try {
            const { parsed } = await adminApi.parseJobText(pastedText);

            if (parsed.title) setTitle(parsed.title);
            if (parsed.company) setCompany(parsed.company);
            if (parsed.type) setType(parsed.type);
            if (parsed.locations?.length) setLocations(parsed.locations.join(', '));
            if (parsed.skills?.length) setRequiredSkills(parsed.skills.join(', '));
            if (parsed.experienceMin !== undefined) setExperienceMin(String(parsed.experienceMin));
            if (parsed.experienceMax !== undefined) setExperienceMax(String(parsed.experienceMax));
            if (parsed.salaryMin !== undefined) setSalaryMin(String(parsed.salaryMin));
            if (parsed.salaryMax !== undefined) setSalaryMax(String(parsed.salaryMax));
            if (parsed.salaryPeriod) setSalaryPeriod(parsed.salaryPeriod);
            if (parsed.jobFunction) setJobFunction(parsed.jobFunction);
            if (parsed.incentives) setIncentives(parsed.incentives);
            if (parsed.allowedDegrees?.length) setAllowedDegrees(parsed.allowedDegrees);
            if (parsed.allowedPassoutYears?.length) setPassoutYears(parsed.allowedPassoutYears);

            // Set description to the raw text for reference
            setDescription(pastedText);

            if (parsed.type === 'WALKIN') {
                if (parsed.venueAddress) setVenueAddress(parsed.venueAddress);
                if (parsed.venueLink) setVenueLink(parsed.venueLink);
                if (parsed.dateRange) setWalkInDateRange(parsed.dateRange);
                if (parsed.timeRange) setWalkInTimeRange(parsed.timeRange);
            }

            toast.success('Successfully auto-filled from content!', { id: toastId });
            setShowParser(false);
        } catch {
            toast.error('Failed to parse text. Please fill manually.', { id: toastId });
        } finally {
            setIsParsing(false);
        }
    };

    const toggleAmPm = (target: 'AM' | 'PM') => {
        if (!expiresAt) return;
        const [date, time] = expiresAt.split('T');
        if (!time) return;
        const [hours, minutes] = time.split(':');
        let h = parseInt(hours);

        if (target === 'PM' && h < 12) h += 12;
        else if (target === 'AM' && h >= 12) h -= 12;

        const newTime = `${String(h).padStart(2, '0')}:${minutes}`;
        setExpiresAt(`${date}T${newTime}`);
    };

    const getFriendlyExpiry = () => {
        if (!expiresAt) return null;
        try {
            const d = new Date(expiresAt);
            return d.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return null;
        }
    };

    const COMMON_COURSES = [
        'B.Tech / B.E.', 'B.Sc.', 'BCA', 'BBA', 'B.Com', 'B.A.',
        'M.Tech / M.E.', 'M.Sc.', 'MCA', 'MBA', 'M.Com', 'M.A.'
    ];



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const loadingToast = toast.loading('⏳ Publishing to platform...');

        try {
            const payload: Record<string, unknown> = {
                type,
                title,
                company,
                description,
                allowedDegrees,
                allowedCourses,
                allowedPassoutYears: passoutYears,
                requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
                locations: locations.split(',').map(s => s.trim()).filter(Boolean),
                workMode: type === 'WALKIN' ? undefined : workMode,
                salaryMin: salaryMin ? parseInt(String(salaryMin).replace(/[^0-9]/g, '')) : undefined,
                salaryMax: salaryMax ? parseInt(String(salaryMax).replace(/[^0-9]/g, '')) : undefined,
                salaryPeriod,
                incentives: incentives || undefined,
                jobFunction: jobFunction || undefined,
                experienceMin: experienceMin ? parseInt(String(experienceMin).replace(/[^0-9]/g, '')) : undefined,
                experienceMax: experienceMax ? parseInt(String(experienceMax).replace(/[^0-9]/g, '')) : undefined,
                applyLink: type === 'WALKIN' ? undefined : applyLink,
                expiresAt: expiresAt || undefined,
            };


            if (type === 'WALKIN') {
                const autoDateRange = formatDateRange(startDate, endDate);
                const autoTimeRange = `${formatTime(startTime)} - ${formatTime(endTime)}`;

                payload.walkInDetails = {
                    dateRange: autoDateRange || walkInDateRange || undefined,
                    timeRange: autoTimeRange || walkInTimeRange || undefined,
                    venueAddress,
                    venueLink: venueLink || undefined,
                    reportingTime: autoTimeRange || undefined,
                };
            }

            await adminApi.createOpportunity(payload);

            toast.success('🚀 Opportunity published!', { id: loadingToast });
            router.push('/admin/opportunities');
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(`❌ Error: ${error.message}`, { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

            {/* Auto-Fill Section */}
            {showParser && (
                <div className="bg-muted/30 border border-border rounded-xl p-4 md:p-6 shadow-sm animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <BoltIcon className="w-4 h-4 text-primary" />
                                Paste Content
                            </h3>
                            <button onClick={() => setShowParser(false)} className="text-muted-foreground hover:text-foreground text-xs uppercase font-bold">
                                Close
                            </button>
                        </div>
                        <textarea
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            placeholder="Paste the job description here..."
                            className="w-full min-h-[150px] p-4 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                        <button
                            onClick={handleAutoFill}
                            disabled={isParsing || !pastedText.trim()}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isParsing ? (
                                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                                <BoltIcon className="w-4 h-4" />
                            )}
                            {isParsing ? 'Processing...' : 'Parse & Update Form'}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide uppercase">Job Function</label>
                            <input
                                value={jobFunction}
                                onChange={(e) => setJobFunction(e.target.value)}
                                className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g. Sales, Banking, IT"
                            />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide uppercase">Incentives / Variable</label>
                            <input
                                value={incentives}
                                onChange={(e) => setIncentives(e.target.value)}
                                className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g. Rs. 20,000 to 1,00,000"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">FULL DESCRIPTION</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={12}
                            className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                            placeholder="Roles and responsibilities..."
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide uppercase">Salary Structure</label>
                        <div className="flex gap-2">
                            {(['YEARLY', 'MONTHLY'] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setSalaryPeriod(p)}
                                    className={`px-3 py-1 rounded text-[10px] font-bold transition-all border ${salaryPeriod === p
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
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
                        <div className="space-y-1.5 md:space-y-2 relative group">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide uppercase flex items-center gap-1.5">
                                Expiry Date
                                <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-muted text-[8px] font-bold cursor-help">?</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                min={new Date().toISOString().split('T')[0] + "T00:00"}
                                max="2099-12-31T23:59"
                                className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <div className="absolute left-0 -top-8 hidden group-hover:flex items-center gap-2 bg-foreground text-background px-2 py-1 rounded text-[9px] font-bold animate-in fade-in slide-in-from-bottom-1 uppercase tracking-tighter shadow-xl z-50">
                                <span>Tip: Click buttons below or type A/P</span>
                            </div>
                            <div className="flex gap-1.5 mt-2">
                                <button
                                    type="button"
                                    onClick={() => toggleAmPm('AM')}
                                    className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-[9px] font-black uppercase tracking-widest transition-colors"
                                >
                                    Force AM
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleAmPm('PM')}
                                    className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-[9px] font-black uppercase tracking-widest transition-colors"
                                >
                                    Force PM
                                </button>
                            </div>
                            {getFriendlyExpiry() && (
                                <div className="mt-2 text-[11px] font-black text-primary italic bg-primary/5 px-2 py-1 rounded border border-primary/20 animate-in fade-in zoom-in-95">
                                    Selected: {getFriendlyExpiry()}
                                </div>
                            )}
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
                        <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">
                            EDUCATION LEVELS
                            <span className="ml-1 text-[9px] lowercase opacity-70">(Optional - leave empty for any degree)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['DIPLOMA', 'DEGREE', 'PG'].map((deg) => (
                                <button
                                    key={deg}
                                    type="button"
                                    onClick={() => handleDegreeToggle(deg)}
                                    className={`px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium border transition-colors flex flex-col items-start gap-0.5 ${allowedDegrees.includes(deg)
                                        ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                        : 'bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        }`}
                                >
                                    <span>{deg === 'DEGREE' ? 'UG' : deg}</span>
                                    {deg === 'DEGREE' && <span className="text-[8px] opacity-60">Any Graduate</span>}
                                    {deg === 'PG' && <span className="text-[8px] opacity-60">Any Postgrad</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide uppercase">Experience Required (Min Years)</label>
                            <input
                                type="number"
                                value={experienceMin}
                                onChange={(e) => setExperienceMin(e.target.value)}
                                className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g. 0"
                            />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide uppercase">Experience Required (Max Years)</label>
                            <input
                                type="number"
                                value={experienceMax}
                                onChange={(e) => setExperienceMax(e.target.value)}
                                className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g. 3"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                        <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide uppercase">
                            Restrict to Specific Courses
                            <span className="ml-1 text-[9px] lowercase opacity-70">(Optional - Select to filter strictly)</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                            {COMMON_COURSES.map((course) => (
                                <button
                                    key={course}
                                    type="button"
                                    onClick={() => handleCourseToggle(course)}
                                    className={`px-2 py-1 rounded-md text-[10px] md:text-xs font-bold transition-all border ${allowedCourses.includes(course)
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    {course}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">
                                PASSOUT YEARS
                                <span className="ml-1 text-[9px] lowercase opacity-70">(Optional for general freshers)</span>
                            </label>
                            <input
                                value={passoutYears.join(', ')}
                                onChange={(e) => setPassoutYears(e.target.value.split(',').map(y => parseInt(y.trim())).filter(Boolean))}
                                className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g. 2024, 2025"
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
                        <div className="flex flex-wrap gap-2 pt-1">
                            {['Pan India', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Remote'].map(loc => (
                                <button
                                    key={loc}
                                    type="button"
                                    onClick={() => handleQuickLocation(loc)}
                                    className="px-2 py-1 rounded-md bg-muted/50 hover:bg-primary/10 hover:text-primary text-[9px] font-bold uppercase transition-all border border-transparent hover:border-primary/20"
                                >
                                    + {loc}
                                </button>
                            ))}
                        </div>
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
                                    <label className="text-[10px] md:text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase">Drive Dates *</label>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <input
                                            type="date"
                                            required
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="flex h-10 w-full sm:w-auto rounded-md border border-amber-500/30 bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                        />
                                        <span className="text-amber-700/50 text-center text-xs">to</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="flex h-10 w-full sm:w-auto rounded-md border border-amber-500/30 bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                        />
                                    </div>
                                    <p className="text-[9px] font-black text-amber-600/60 uppercase">Preview: {formatDateRange(startDate, endDate)}</p>
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[10px] md:text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase">Reporting Window *</label>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <input
                                            type="time"
                                            required
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="flex h-10 w-full sm:w-auto rounded-md border border-amber-500/30 bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                        />
                                        <span className="text-amber-700/50 text-center text-xs">to</span>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="flex h-10 w-full sm:w-auto rounded-md border border-amber-500/30 bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                        />
                                    </div>
                                    <p className="text-[9px] font-black text-amber-600/60 uppercase">Preview: {formatTime(startTime)} - {formatTime(endTime)}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[10px] md:text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase">Venue Address *</label>
                                    <textarea
                                        required
                                        value={venueAddress}
                                        onChange={(e) => setVenueAddress(e.target.value)}
                                        rows={2}
                                        className="flex min-h-[44px] w-full rounded-md border border-amber-500/30 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 resize-none"
                                        placeholder="Complete street address..."
                                    />
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[10px] md:text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase">Venue Link (Maps URL)</label>
                                    <input
                                        value={venueLink}
                                        onChange={(e) => setVenueLink(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-amber-500/30 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                        placeholder="Google Maps or location link..."
                                    />
                                </div>
                            </div>
                        </div>
                    )
                        : (
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
