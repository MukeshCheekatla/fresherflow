'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LoadingScreen from '@/components/ui/LoadingScreen';
import {
    ArrowLeftIcon,
    BriefcaseIcon,
    MapPinIcon,
    CurrencyRupeeIcon,
    AcademicCapIcon,
    CalendarIcon,
    LinkIcon,
    CheckIcon,
    InformationCircleIcon,
    ClockIcon,
    BoltIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { adminApi } from '@/lib/api/admin';

export default function EditOpportunityPage() {
    const router = useRouter();
    const params = useParams();
    const { isAuthenticated } = useAdmin();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [type, setType] = useState<'JOB' | 'INTERNSHIP' | 'WALKIN'>('JOB');
    const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED');
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [description, setDescription] = useState('');
    const [locations, setLocations] = useState('');
    const [requiredSkills, setRequiredSkills] = useState('');
    const [allowedDegrees, setAllowedDegrees] = useState<string[]>([]);
    const [allowedCourses, setAllowedCourses] = useState<string[]>([]);
    const [passoutYears, setPassoutYears] = useState<number[]>([]);
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
    const [walkInDates, setWalkInDates] = useState<string>('');
    const [venueAddress, setVenueAddress] = useState('');
    const [reportingTime, setReportingTime] = useState('');
    const [requiredDocuments, setRequiredDocuments] = useState<string>('');
    const [contactPerson, setContactPerson] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [walkInDateRange, setWalkInDateRange] = useState('');
    const [walkInTimeRange, setWalkInTimeRange] = useState('');
    const [venueLink, setVenueLink] = useState('');

    // Picker states for simpler UI
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('10:00');
    const [endTime, setEndTime] = useState('13:00');

    // Simple formatting utilities
    // Helper to format Date to 'YYYY-MM-DDTHH:mm' using Local Time
    const toLocalISOString = (dateInput: Date | string) => {
        const date = new Date(dateInput);
        const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
        const localTime = new Date(date.getTime() - tzOffset);
        return localTime.toISOString().slice(0, 16);
    };

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

    const fetchOpportunity = useCallback(async () => {
        try {
            const data = await adminApi.getOpportunity(params.id as string);
            const opp = data.opportunity;

            setType(opp.type);
            // If it's a DRAFT, assume the admin is here to finish it and promote to PUBLISHED
            setStatus(opp.status === 'DRAFT' ? 'PUBLISHED' : opp.status);
            setTitle(opp.title);
            setCompany(opp.company);
            setDescription(opp.description || '');
            setLocations(opp.locations.join(', '));
            setRequiredSkills(opp.requiredSkills.join(', '));
            setAllowedDegrees(opp.allowedDegrees);
            setAllowedCourses(opp.allowedCourses || []);
            setPassoutYears(opp.allowedPassoutYears);
            setWorkMode(opp.workMode || 'ONSITE');
            setSalaryMin(opp.salaryMin?.toString() || '');
            setSalaryMax(opp.salaryMax?.toString() || '');
            setJobFunction(opp.jobFunction || '');
            setIncentives(opp.incentives || '');
            setSalaryPeriod(opp.salaryPeriod || 'YEARLY');
            setExperienceMin(opp.experienceMin?.toString() || '');
            setExperienceMax(opp.experienceMax?.toString() || '');
            setApplyLink(opp.applyLink || '');
            setExpiresAt(opp.expiresAt ? toLocalISOString(opp.expiresAt) : '');

            if (opp.walkInDetails) {
                setWalkInDates(opp.walkInDetails.dates?.join(', ') || '');
                setVenueAddress(opp.walkInDetails.venueAddress);
                setReportingTime(opp.walkInDetails.reportingTime);
                setRequiredDocuments(opp.walkInDetails.requiredDocuments?.join(', ') || '');
                setContactPerson(opp.walkInDetails.contactPerson || '');
                setContactPhone(opp.walkInDetails.contactPhone || '');
                setWalkInDateRange(opp.walkInDetails.dateRange || '');
                setWalkInTimeRange(opp.walkInDetails.timeRange || '');
                setVenueLink(opp.walkInDetails.venueLink || '');

                // Reverse parse dates from the 'dates' array if available
                if (opp.walkInDetails.dates && opp.walkInDetails.dates.length > 0) {
                    const sorted = opp.walkInDetails.dates.sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());
                    setStartDate(new Date(sorted[0]).toISOString().split('T')[0]);
                    setEndDate(new Date(sorted[sorted.length - 1]).toISOString().split('T')[0]);
                }

                // Basic time recovery check
                const tRange = opp.walkInDetails.timeRange || '';
                const parts = tRange.split('-').map((s: string) => s.trim());
                if (parts.length === 2) {
                    // This is crude but handles simple recovery like "11:00 AM - 1:00 PM"
                    const parseTimeStr = (s: string) => {
                        const m = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                        if (m) {
                            let h = parseInt(m[1]);
                            const mins = m[2];
                            const ampm = m[3].toUpperCase();
                            if (ampm === 'PM' && h < 12) h += 12;
                            if (ampm === 'AM' && h === 12) h = 0;
                            return `${String(h).padStart(2, '0')}:${mins}`;
                        }
                        return null;
                    };
                    const start = parseTimeStr(parts[0]);
                    const end = parseTimeStr(parts[1]);
                    if (start) setStartTime(start);
                    if (end) setEndTime(end);
                }
            }

            setLoading(false);
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(`Failed to load: ${error.message}`);
            router.push('/admin/opportunities');
        }
    }, [params.id, router]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
            return;
        }

        void fetchOpportunity();
    }, [isAuthenticated, router, fetchOpportunity]);

    const handleQuickLocation = (loc: string) => {
        if (locations.toLowerCase().includes(loc.toLowerCase())) return;
        setLocations(prev => prev ? `${prev}, ${loc}` : loc);
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

    const handleDegreeToggle = (degree: string) => {
        setAllowedDegrees(prev =>
            prev.includes(degree)
                ? prev.filter(d => d !== degree)
                : [...prev, degree]
        );
    };

    const handleCourseToggle = (course: string) => {
        setAllowedCourses(prev =>
            prev.includes(course)
                ? prev.filter(c => c !== course)
                : [...prev, course]
        );
    };

    const COMMON_COURSES = [
        'B.Tech / B.E.', 'B.Sc.', 'BCA', 'BBA', 'B.Com', 'B.A.',
        'M.Tech / M.E.', 'M.Sc.', 'MCA', 'MBA', 'M.Com', 'M.A.'
    ];

    const handleExpire = async () => {
        if (!confirm('Are you sure you want to expire this opportunity immediately?')) return;
        const loadingToast = toast.loading('Expiring opportunity...');
        try {
            const { opportunity } = await adminApi.expireOpportunity(params.id as string);
            // Use the returned time, or fallback to current local time
            const newExpiry = opportunity.expiresAt ? toLocalISOString(opportunity.expiresAt) : toLocalISOString(new Date());
            setExpiresAt(newExpiry);
            toast.success('Opportunity expired', { id: loadingToast });
            // Force reload to ensure all states (including backend timestamps) are perfectly synced and visible
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            const error = err as Error;
            toast.error(`Failed: ${error.message}`, { id: loadingToast });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const loadingToast = toast.loading('Saving changes...');

        try {
            const payload: Record<string, unknown> = {
                type,
                status,
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
                    dates: walkInDates.split(',').map(d => d.trim()).filter(Boolean),
                    dateRange: autoDateRange || walkInDateRange || undefined,
                    timeRange: autoTimeRange || walkInTimeRange || undefined,
                    venueAddress,
                    venueLink: venueLink || undefined,
                    reportingTime: reportingTime || autoTimeRange || undefined,
                    requiredDocuments: requiredDocuments.split(',').map(s => s.trim()).filter(Boolean),
                    contactPerson: contactPerson || undefined,
                    contactPhone: contactPhone || undefined,
                };
            }

            await adminApi.updateOpportunity(params.id as string, payload);

            toast.success('Changes saved.', { id: loadingToast });
            router.push('/admin/opportunities');
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(`Failed: ${error.message}`, { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingScreen message="Loading listing..." fullScreen={false} />;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/admin/opportunities" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-3">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to listings
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit listing</h1>
                    <p className="text-sm text-muted-foreground">Update details and requirements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium ${type === 'WALKIN' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30' :
                        type === 'INTERNSHIP' ? 'bg-purple-500/10 text-purple-700 border border-purple-500/30' :
                            'bg-blue-500/10 text-blue-700 border border-blue-500/30'
                        }`}>
                        {type} listing
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <InformationCircleIcon className="w-4 h-4 text-muted-foreground" />
                        Listing type
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        {(['JOB', 'INTERNSHIP', 'WALKIN'] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all text-center ${type === t
                                    ? 'bg-primary/5 border-primary ring-1 ring-primary'
                                    : 'bg-background border-border hover:bg-accent/50 hover:border-accent-foreground/50'
                                    }`}
                            >
                                <span className={`text-sm font-medium ${type === t ? 'text-primary' : 'text-foreground'}`}>{t}</span>
                                <span className="text-xs text-muted-foreground mt-1 leading-none">
                                    {t === 'WALKIN' ? 'On-site' : 'Direct'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Selection (Compact) */}
                <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status:</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        {(['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStatus(s)}
                                className={`px-3 py-1 rounded-full border text-[10px] font-bold transition-all ${status === s
                                    ? s === 'PUBLISHED' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' :
                                        s === 'ARCHIVED' ? 'bg-rose-500/10 border-rose-500 text-rose-600' :
                                            'bg-slate-500/10 border-slate-500 text-slate-600'
                                    : 'bg-background border-border text-muted-foreground hover:bg-accent'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                        <div className="w-px h-6 bg-border mx-1" />
                        {expiresAt && new Date(expiresAt) < new Date() ? (
                            <button
                                type="button"
                                disabled
                                className="px-3 py-1 rounded-full border border-destructive/50 bg-destructive/10 text-[10px] font-bold text-destructive cursor-not-allowed flex items-center gap-1"
                                title="This opportunity has expired"
                            >
                                <ClockIcon className="w-3 h-3" />
                                EXPIRED
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleExpire}
                                className="px-3 py-1 rounded-full border border-orange-500/50 text-[10px] font-bold text-orange-600 hover:bg-orange-500/10 transition-all flex items-center gap-1"
                                title="Mark as expired immediately"
                            >
                                <ClockIcon className="w-3 h-3" />
                                EXPIRE NOW
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Details */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
                        Base Specifications
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide">Job Title *</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase flex items-center gap-2">
                                <BoltIcon className="w-3 h-3 text-primary animate-pulse" />
                                Job Function
                            </label>
                            <input
                                value={jobFunction}
                                onChange={(e) => setJobFunction(e.target.value)}
                                placeholder="e.g. Sales, Banking, IT"
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide">Company Name *</label>
                            <input
                                required
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase flex items-center gap-2">
                                Incentives
                            </label>
                            <input
                                value={incentives}
                                onChange={(e) => setIncentives(e.target.value)}
                                placeholder="e.g. Rs. 2k - 10k Targets"
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground tracking-wide">Full Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={12}
                            className="flex min-h-62.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide flex items-center gap-2 uppercase">
                                <CurrencyRupeeIcon className="w-4 h-4" /> Min Salary
                            </label>
                            <input
                                type="text"
                                value={salaryMin}
                                onChange={(e) => setSalaryMin(e.target.value)}
                                placeholder="e.g. 15,000"
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide flex items-center gap-2 uppercase">
                                <CurrencyRupeeIcon className="w-4 h-4" /> Max Salary
                            </label>
                            <input
                                type="text"
                                value={salaryMax}
                                onChange={(e) => setSalaryMax(e.target.value)}
                                placeholder="e.g. 40,000"
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide flex items-center gap-2 uppercase">
                                Period
                            </label>
                            <div className="flex h-11 rounded-md border border-input bg-muted/30 p-1">
                                <button
                                    type="button"
                                    onClick={() => setSalaryPeriod('YEARLY')}
                                    className={`flex-1 rounded-sm px-2 text-[10px] font-bold transition-all ${salaryPeriod === 'YEARLY' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                                >
                                    ANNUAL (LPA)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSalaryPeriod('MONTHLY')}
                                    className={`flex-1 rounded-sm px-2 text-[10px] font-bold transition-all ${salaryPeriod === 'MONTHLY' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                                >
                                    MONTHLY
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide flex items-center gap-2 uppercase">
                                <CalendarIcon className="w-4 h-4" /> Expiry
                            </label>
                            <div className="relative">
                                <input
                                    type="datetime-local"
                                    value={expiresAt}
                                    max="2099-12-31T23:59"
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {expiresAt && (
                                    <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => toggleAmPm('AM')}
                                            className="h-7 px-2 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold rounded border border-slate-200"
                                        >
                                            AM
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleAmPm('PM')}
                                            className="h-7 px-2 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold rounded border border-slate-200"
                                        >
                                            PM
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {expiresAt && (
                        <div className="bg-primary/5 border border-primary/20 rounded-md p-2 flex items-center gap-3">
                            <CheckCircleIcon className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-primary tracking-wide">
                                Friendly Time Preview: {getFriendlyExpiry()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Requirements */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <AcademicCapIcon className="w-4 h-4 text-muted-foreground" />
                        Requirements
                    </h3>

                    <div className="space-y-3">
                        <label className="text-xs font-medium text-muted-foreground tracking-wide">
                            Allowed Education Levels
                            <span className="ml-1 text-[9px] lowercase opacity-70">(Optional - leave empty for any degree)</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {['DIPLOMA', 'DEGREE', 'PG'].map((deg) => (
                                <button
                                    key={deg}
                                    type="button"
                                    onClick={() => handleDegreeToggle(deg)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex flex-col items-start gap-0.5 ${allowedDegrees.includes(deg)
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

                    <div className="space-y-3">
                        <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                            Restrict to Specific Courses
                            <span className="ml-1 text-[9px] lowercase opacity-70">(Optional - Select to filter strictly)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                                Min experience (years)
                            </label>
                            <input
                                type="text"
                                value={experienceMin}
                                onChange={(e) => setExperienceMin(e.target.value)}
                                placeholder="0 for Fresher"
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                                Max experience (years)
                            </label>
                            <input
                                type="text"
                                value={experienceMax}
                                onChange={(e) => setExperienceMax(e.target.value)}
                                placeholder="Leave empty for No Limit"
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide">
                                Passout Years
                                <span className="ml-1 text-[9px] lowercase opacity-70">(Optional for general freshers)</span>
                            </label>
                            <input
                                value={passoutYears.join(', ')}
                                onChange={(e) => setPassoutYears(e.target.value.split(',').map(y => parseInt(y.trim())).filter(Boolean))}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g. 2024, 2025"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide">Key Skills Required</label>
                            <input
                                value={requiredSkills}
                                onChange={(e) => setRequiredSkills(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>

                {/* Logistics */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                        Logistics
                    </h3>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide">Locations (comma separated)</label>
                            <div className="flex gap-2">
                                {['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Remote', 'Pan India'].map(loc => (
                                    <button
                                        key={loc}
                                        type="button"
                                        onClick={() => handleQuickLocation(loc)}
                                        className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-border bg-muted/30 hover:bg-muted transition-colors uppercase"
                                    >
                                        + {loc}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <input
                            required
                            value={locations}
                            onChange={(e) => setLocations(e.target.value)}
                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    {type !== 'WALKIN' && (
                        <div className="space-y-3 pt-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide">Primary Work Mode</label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['ONSITE', 'HYBRID', 'REMOTE'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setWorkMode(mode)}
                                        className={`h-9 rounded-md text-xs font-medium border transition-colors ${workMode === mode
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
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-muted-foreground" />
                        Apply link
                    </h3>

                    {type === 'WALKIN' ? (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase">Drive Dates *</label>
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
                                    <p className="text-[9px] font-bold text-amber-600/60 uppercase">Preview: {formatDateRange(startDate, endDate)}</p>
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase">Reporting Window *</label>
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
                                    <p className="text-[9px] font-bold text-amber-600/60 uppercase">Preview: {formatTime(startTime)} - {formatTime(endTime)}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase">Venue Address *</label>
                                    <textarea
                                        required
                                        value={venueAddress}
                                        onChange={(e) => setVenueAddress(e.target.value)}
                                        rows={2}
                                        className="flex min-h-11 w-full rounded-md border border-amber-500/30 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 resize-none"
                                        placeholder="Complete street address..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase">Venue Link (Maps URL)</label>
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
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground tracking-wide">Apply URL *</label>
                                <input
                                    type="url"
                                    required
                                    value={applyLink}
                                    onChange={(e) => setApplyLink(e.target.value)}
                                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                        )}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 inline-flex items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-11"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        ) : (
                            <CheckIcon className="w-5 h-5 mr-2" />
                        )}
                        {saving ? 'Saving...' : 'Update listing'}
                    </button>
                    <Link
                        href="/admin/opportunities"
                        className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
