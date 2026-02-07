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
        <div className="max-w-5xl mx-auto space-y-5 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header */}
            <div className="space-y-3">
                <Link href="/admin/opportunities" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    Back to Log
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">Post Opportunity</h1>
                        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                            Create and publish a new listing for matched candidates.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowParser(!showParser)}
                        className="inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm w-full md:w-auto"
                    >
                        <BoltIcon className="w-4 h-4 mr-2" />
                        Auto-Fill Text
                    </button>
                </div>
            </div>

            {/* Auto-Fill Section */}
            {showParser && (
                <div className="bg-muted/30 border border-border rounded-lg p-4 md:p-5 shadow-sm animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <BoltIcon className="w-4 h-4 text-primary" />
                                Mission Briefing
                            </h3>
                            <button onClick={() => setShowParser(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase">
                                Close
                            </button>
                        </div>
                        <textarea
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            placeholder="Paste the job description here..."
                            className="w-full min-h-[140px] p-3 text-sm rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                        <button
                            onClick={handleAutoFill}
                            disabled={isParsing || !pastedText.trim()}
                            className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-md transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isParsing ? (
                                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                                <BoltIcon className="w-4 h-4" />
                            )}
                            {isParsing ? 'Processing...' : 'Deploy Data to Form'}
                        </button>
                    </div>
                </div>
            )}


            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                {/* Type Selection */}
                <div className="space-y-3">
                    <h3 className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                        <InformationCircleIcon className="w-4 h-4 text-muted-foreground" />
                        Classification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {(['JOB', 'INTERNSHIP', 'WALKIN'] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all text-center ${type === t
                                    ? 'bg-primary/5 border-primary ring-1 ring-primary shadow-sm'
                                    : 'bg-card border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                                    }`}
                            >
                                <span className={`text-xs md:text-sm font-semibold uppercase tracking-wider ${type === t ? 'text-primary' : 'text-foreground'}`}>{t}</span>
                                <span className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                                    {t === 'WALKIN' ? 'Physical' : 'Direct'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Details */}
                <div className="space-y-5 md:space-y-6 border border-border rounded-lg p-4 md:p-5 bg-card shadow-sm">
                    <h3 className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                        <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
                        Core Identity
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
                                placeholder="e.g. Senior Frontend Engineer"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company *</label>
                            <input
                                required
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
                                placeholder="e.g. Google India"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Functional Role</label>
                            <input
                                value={jobFunction}
                                onChange={(e) => setJobFunction(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
                                placeholder="e.g. Sales, Banking, IT"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Incentives</label>
                            <input
                                value={incentives}
                                onChange={(e) => setIncentives(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
                                placeholder="e.g. Rs. 20,000 to 1,00,000"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={8}
                            className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-all shadow-sm"
                            placeholder="Roles and responsibilities..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Salary Configuration</label>
                        <div className="flex gap-2">
                            {(['YEARLY', 'MONTHLY'] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setSalaryPeriod(p)}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-all border ${salaryPeriod === p
                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                        : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Floor</label>
                            <input
                                type="number"
                                value={salaryMin}
                                onChange={(e) => setSalaryMin(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                placeholder="3,00,000"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ceiling</label>
                            <input
                                type="number"
                                value={salaryMax}
                                onChange={(e) => setSalaryMax(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                placeholder="12,00,000"
                            />
                        </div>
                        <div className="space-y-1.5 relative group">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                Expiration Node
                            </label>
                            <input
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                min={new Date().toISOString().split('T')[0] + "T00:00"}
                                max="2099-12-31T23:59"
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                            />
                            <div className="flex gap-1.5 mt-1.5">
                                <button
                                    type="button"
                                    onClick={() => toggleAmPm('AM')}
                                    className="px-2 py-1 rounded bg-muted hover:bg-muted-foreground/10 text-[10px] font-bold uppercase transition-colors"
                                >
                                    Force AM
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleAmPm('PM')}
                                    className="px-2 py-1 rounded bg-muted hover:bg-muted-foreground/10 text-[10px] font-bold uppercase transition-colors"
                                >
                                    Force PM
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Requirements */}
                <div className="space-y-5 md:space-y-6 border border-border rounded-lg p-4 md:p-5 bg-card shadow-sm">
                    <h3 className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                        <AcademicCapIcon className="w-4 h-4 text-muted-foreground" />
                        Target Parameters
                    </h3>

                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Academic Spectrum
                            <span className="ml-2 text-[10px] font-normal lowercase opacity-70 italic">(Optional)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['DIPLOMA', 'DEGREE', 'PG'].map((deg) => (
                                <button
                                    key={deg}
                                    type="button"
                                    onClick={() => handleDegreeToggle(deg)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all flex flex-col items-start gap-0.5 ${allowedDegrees.includes(deg)
                                        ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                        : 'bg-background border-input text-muted-foreground hover:border-primary/40 hover:text-primary/70'
                                        }`}
                                >
                                    <span>{deg === 'DEGREE' ? 'UG' : deg === 'PG' ? 'PG' : 'Diploma'}</span>
                                    <span className="text-[10px] opacity-60 font-medium whitespace-nowrap">
                                        {deg === 'DEGREE' ? 'Graduate' : deg === 'PG' ? 'Postgrad' : 'Specialized'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Min Exp</label>
                            <input
                                type="number"
                                value={experienceMin}
                                onChange={(e) => setExperienceMin(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Exp</label>
                            <input
                                type="number"
                                value={experienceMax}
                                onChange={(e) => setExperienceMax(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                placeholder="3"
                            />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Courses
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {COMMON_COURSES.map((course) => (
                                <button
                                    key={course}
                                    type="button"
                                    onClick={() => handleCourseToggle(course)}
                                    className={`px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold transition-all border ${allowedCourses.includes(course)
                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                        : 'bg-muted/50 border-muted-foreground/10 text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    {course}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Passout Years
                            </label>
                            <input
                                value={passoutYears.join(', ')}
                                onChange={(e) => setPassoutYears(e.target.value.split(',').map(y => parseInt(y.trim())).filter(Boolean))}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                placeholder="e.g. 2024, 2025"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills</label>
                            <input
                                value={requiredSkills}
                                onChange={(e) => setRequiredSkills(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                placeholder="React, Node.js..."
                            />
                        </div>
                    </div>
                </div>

                {/* Logistics */}
                <div className="space-y-5 md:space-y-6 border border-border rounded-lg p-4 md:p-5 bg-card shadow-sm">
                    <h3 className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                        Operations
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Locations</label>
                        <input
                            required
                            value={locations}
                            onChange={(e) => setLocations(e.target.value)}
                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                            placeholder="Mumbai, Bangalore, Remote"
                        />
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {['Pan India', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Remote'].map(loc => (
                                <button
                                    key={loc}
                                    type="button"
                                    onClick={() => handleQuickLocation(loc)}
                                    className="px-2 py-1 rounded bg-muted/50 hover:bg-primary/10 hover:text-primary text-[10px] font-bold uppercase transition-all border border-transparent hover:border-primary/20"
                                >
                                    + {loc}
                                </button>
                            ))}
                        </div>
                    </div>

                    {type !== 'WALKIN' && (
                        <div className="space-y-2.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Work Mode</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['ONSITE', 'HYBRID', 'REMOTE'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setWorkMode(mode)}
                                        className={`h-10 rounded-md text-xs font-semibold border transition-all ${workMode === mode
                                            ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                            : 'bg-background border-input text-muted-foreground hover:border-primary/40'
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
                <div className="space-y-5 md:space-y-6 border border-border rounded-lg p-4 md:p-5 bg-card shadow-sm">
                    <h3 className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-muted-foreground" />
                        Channel
                    </h3>

                    {type === 'WALKIN' ? (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 md:p-5 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Drive Dates *</label>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <input
                                            type="date"
                                            required
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="flex h-11 w-full rounded-md border border-amber-500/30 bg-background px-3 text-sm focus-visible:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                        <span className="text-amber-700/50 text-center text-xs font-bold">{">>"}</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="flex h-11 w-full rounded-md border border-amber-500/30 bg-background px-3 text-sm focus-visible:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Reporting Window *</label>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <input
                                            type="time"
                                            required
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="flex h-11 w-full rounded-md border border-amber-500/30 bg-background px-3 text-sm focus-visible:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                        <span className="text-amber-700/50 text-center text-xs font-bold">{">>"}</span>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="flex h-11 w-full rounded-md border border-amber-500/30 bg-background px-3 text-sm focus-visible:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Venue Address *</label>
                                    <textarea
                                        required
                                        value={venueAddress}
                                        onChange={(e) => setVenueAddress(e.target.value)}
                                        rows={2}
                                        className="flex min-h-[60px] w-full rounded-md border border-amber-500/30 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none transition-all"
                                        placeholder="Complete street address..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Maps Link</label>
                                    <input
                                        value={venueLink}
                                        onChange={(e) => setVenueLink(e.target.value)}
                                        className="flex h-11 w-full rounded-md border border-amber-500/30 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-sm"
                                        placeholder="Google Maps link..."
                                    />
                                </div>
                            </div>
                        </div>
                    )
                        : (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gateway URL *</label>
                                <input
                                    type="url"
                                    required
                                    value={applyLink}
                                    onChange={(e) => setApplyLink(e.target.value)}
                                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                    placeholder="https://careers.company.com/..."
                                />
                            </div>
                        )}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col md:flex-row items-center justify-end gap-3 pt-5 border-t border-border/50">
                    <Link
                        href="/admin/opportunities"
                        className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-semibold text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus:ring-ring focus:ring-offset-2 w-full md:w-auto order-2 md:order-1"
                    >
                        Abort
                    </Link>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus:ring-ring focus:ring-offset-2 w-full md:w-auto order-1 md:order-2"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                            <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                        )}
                        {isLoading ? 'Wait...' : 'Deploy'}
                    </button>
                </div>
            </form>
        </div>
    );
}
