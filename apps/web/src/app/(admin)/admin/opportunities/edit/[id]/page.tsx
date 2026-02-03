'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
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
    BuildingOfficeIcon
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

    // Walk-in specific
    const [walkInDates, setWalkInDates] = useState<string>('');
    const [venueAddress, setVenueAddress] = useState('');
    const [reportingTime, setReportingTime] = useState('');
    const [requiredDocuments, setRequiredDocuments] = useState<string>('');
    const [contactPerson, setContactPerson] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
            return;
        }

        fetchOpportunity();
    }, [isAuthenticated]);

    const fetchOpportunity = async () => {
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
            setApplyLink(opp.applyLink || '');
            setExpiresAt(opp.expiresAt ? new Date(opp.expiresAt).toISOString().slice(0, 16) : '');

            if (opp.walkInDetails) {
                setWalkInDates(opp.walkInDetails.dates.join(', '));
                setVenueAddress(opp.walkInDetails.venueAddress);
                setReportingTime(opp.walkInDetails.reportingTime);
                setRequiredDocuments(opp.walkInDetails.requiredDocuments.join(', '));
                setContactPerson(opp.walkInDetails.contactPerson || '');
                setContactPhone(opp.walkInDetails.contactPhone || '');
            }

            setLoading(false);
        } catch (error: any) {
            toast.error(` Failed to load: ${error.message}`);
            router.push('/admin/opportunities');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const loadingToast = toast.loading(' Saving changes...');

        try {
            const payload: any = {
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

            await adminApi.updateOpportunity(params.id as string, payload);

            toast.success(' Changes saved successfully!', { id: loadingToast });
            router.push('/admin/opportunities');
        } catch (error: any) {
            toast.error(` Failed: ${error.message}`, { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Fetching details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/admin/opportunities" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-3">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to Log
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit Opportunity</h1>
                    <p className="text-sm text-muted-foreground">Modify entry details and requirements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium ${type === 'WALKIN' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30' :
                        type === 'INTERNSHIP' ? 'bg-purple-500/10 text-purple-700 border border-purple-500/30' :
                            'bg-blue-500/10 text-blue-700 border border-blue-500/30'
                        }`}>
                        {type} Protocol Active
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <InformationCircleIcon className="w-4 h-4 text-muted-foreground" />
                        Modify Listing Type
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
                    <div className="flex gap-2">
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
                            <label className="text-xs font-medium text-muted-foreground tracking-wide">Company Name *</label>
                            <input
                                required
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
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
                            className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide flex items-center gap-2">
                                <CurrencyRupeeIcon className="w-4 h-4" /> Entry Point
                            </label>
                            <input
                                type="number"
                                value={salaryMin}
                                onChange={(e) => setSalaryMin(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide flex items-center gap-2">
                                <CurrencyRupeeIcon className="w-4 h-4" /> Upper Bound
                            </label>
                            <input
                                type="number"
                                value={salaryMax}
                                onChange={(e) => setSalaryMax(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" /> Deactivation Mark
                            </label>
                            <input
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>

                {/* Requirements */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <AcademicCapIcon className="w-4 h-4 text-muted-foreground" />
                        Credential Criteria
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
                                    <span>{deg}</span>
                                    {deg === 'DEGREE' && <span className="text-[8px] opacity-60">Any UG</span>}
                                    {deg === 'PG' && <span className="text-[8px] opacity-60">Any PG</span>}
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
                        Logistics & Presence
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground tracking-wide">Locations (comma separated)</label>
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
                        Engagement Path
                    </h3>

                    {type === 'WALKIN' ? (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide">Walk-in Dates *</label>
                                    <input
                                        required
                                        value={walkInDates}
                                        onChange={(e) => setWalkInDates(e.target.value)}
                                        className="flex h-11 w-full rounded-md border border-amber-500/30 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide">Reporting Time *</label>
                                    <input
                                        required
                                        value={reportingTime}
                                        onChange={(e) => setReportingTime(e.target.value)}
                                        className="flex h-11 w-full rounded-md border border-amber-500/30 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide">Venue Address *</label>
                                <textarea
                                    required
                                    value={venueAddress}
                                    onChange={(e) => setVenueAddress(e.target.value)}
                                    rows={3}
                                    className="flex h-11 w-full rounded-md border border-amber-500/30 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground tracking-wide">Official Apply URL *</label>
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
                        {saving ? 'Synchronizing...' : 'Update Listing'}
                    </button>
                    <Link
                        href="/admin/opportunities"
                        className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        Discard
                    </Link>
                </div>
            </form>
        </div>
    );
}
