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
    TrashIcon,
    InformationCircleIcon,
    ClockIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { adminApi } from '@/lib/api/admin';

export default function EditOpportunityPage() {
    const router = useRouter();
    const params = useParams();
    const { isAuthenticated, token } = useAdmin();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [type, setType] = useState<'JOB' | 'INTERNSHIP' | 'WALKIN'>('JOB');
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [description, setDescription] = useState('');
    const [locations, setLocations] = useState('');
    const [requiredSkills, setRequiredSkills] = useState('');
    const [allowedDegrees, setAllowedDegrees] = useState<string[]>([]);
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
        if (!token) return;
        try {
            const data = await adminApi.getOpportunity(token, params.id as string);
            const opp = data.opportunity;

            setType(opp.type);
            setTitle(opp.title);
            setCompany(opp.company);
            setDescription(opp.description || '');
            setLocations(opp.locations.join(', '));
            setRequiredSkills(opp.requiredSkills.join(', '));
            setAllowedDegrees(opp.allowedDegrees);
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
            toast.error(`❌ Failed to load: ${error.message}`);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const loadingToast = toast.loading('⏳ Saving changes...');

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

            await adminApi.updateOpportunity(token as string, params.id as string, payload);

            toast.success('✅ Changes saved successfully!', { id: loadingToast });
            router.push('/admin/opportunities');
        } catch (error: any) {
            toast.error(`❌ Failed: ${error.message}`, { id: loadingToast });
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/admin/opportunities" className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-200 transition-colors mb-4 uppercase tracking-widest leading-none">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to Log
                    </Link>
                    <h1 className="tracking-tighter text-slate-200">Edit Opportunity</h1>
                    <p className="text-slate-400 font-medium tracking-tight">Modify entry Details and requirements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase ${type === 'WALKIN' ? 'bg-orange-900/30 text-orange-400 border border-orange-900/50' :
                        type === 'INTERNSHIP' ? 'bg-purple-900/30 text-purple-400 border border-purple-900/50' :
                            'bg-blue-900/30 text-blue-400 border border-blue-900/50'
                        }`}>
                        {type} Protocol Active
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main Details */}
                <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 space-y-8 shadow-sm">
                    <h3 className="font-extrabold text-slate-200 mb-2 flex items-center gap-2 tracking-tight">
                        <BriefcaseIcon className="w-5 h-5 text-slate-500" />
                        Base Specifications
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 font-display">Job Title *</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400">Company Name *</label>
                            <input
                                required
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 font-display">Full Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            className="premium-input resize-none bg-slate-950 border-slate-800 text-slate-300 focus:border-blue-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <CurrencyRupeeIcon className="w-4 h-4" /> Entry Point
                            </label>
                            <input
                                type="number"
                                value={salaryMin}
                                onChange={(e) => setSalaryMin(e.target.value)}
                                className="premium-input bg-slate-950/50 border-slate-800 text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <CurrencyRupeeIcon className="w-4 h-4" /> Upper Bound
                            </label>
                            <input
                                type="number"
                                value={salaryMax}
                                onChange={(e) => setSalaryMax(e.target.value)}
                                className="premium-input bg-slate-950/50 border-slate-800 text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" /> Deactivation Mark
                            </label>
                            <input
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                className="premium-input bg-slate-950/50 border-slate-800 text-slate-200 p-2.5"
                            />
                        </div>
                    </div>
                </div>

                {/* Requirements */}
                <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 space-y-8 shadow-sm">
                    <h3 className="font-extrabold text-slate-200 mb-2 flex items-center gap-2 tracking-tight">
                        <AcademicCapIcon className="w-5 h-5 text-slate-500" />
                        Credential Criteria
                    </h3>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-400">Allowed Education Levels</label>
                        <div className="flex flex-wrap gap-3">
                            {['DIPLOMA', 'DEGREE', 'PG'].map((deg) => (
                                <button
                                    key={deg}
                                    type="button"
                                    onClick={() => handleDegreeToggle(deg)}
                                    className={`px-6 py-2 rounded-xl font-bold border-2 transition-all ${allowedDegrees.includes(deg)
                                        ? 'bg-blue-900/30 border-blue-500 text-blue-400'
                                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                                        }`}
                                >
                                    {deg}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400">Passout Years (comma separated)</label>
                            <input
                                required
                                value={passoutYears.join(', ')}
                                onChange={(e) => setPassoutYears(e.target.value.split(',').map(y => parseInt(y.trim())).filter(Boolean))}
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400">Key Skills Required</label>
                            <input
                                value={requiredSkills}
                                onChange={(e) => setRequiredSkills(e.target.value)}
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Logistics */}
                <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 space-y-8 shadow-sm">
                    <h3 className="font-extrabold text-slate-200 mb-2 flex items-center gap-2 tracking-tight">
                        <MapPinIcon className="w-5 h-5 text-slate-500" />
                        Logistics & Presence
                    </h3>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400">Locations (comma separated)</label>
                        <input
                            required
                            value={locations}
                            onChange={(e) => setLocations(e.target.value)}
                            className="premium-input bg-slate-950 border-slate-800 text-slate-200"
                        />
                    </div>

                    {type !== 'WALKIN' && (
                        <div className="space-y-3 pt-2">
                            <label className="text-sm font-bold text-slate-400">Primary Work Mode</label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['ONSITE', 'HYBRID', 'REMOTE'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setWorkMode(mode)}
                                        className={`py-3 rounded-xl font-bold border-2 transition-all ${workMode === mode
                                            ? 'bg-indigo-900/30 border-indigo-500 text-indigo-400'
                                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
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
                <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 space-y-8 shadow-sm">
                    <h3 className="font-extrabold text-slate-200 mb-2 flex items-center gap-2 tracking-tight">
                        <LinkIcon className="w-5 h-5 text-slate-500" />
                        Engagement Path
                    </h3>

                    {type === 'WALKIN' ? (
                        <div className="bg-orange-950/20 border border-orange-900/50 rounded-2xl p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-orange-400 tracking-tight">Walk-in Dates *</label>
                                    <input
                                        required
                                        value={walkInDates}
                                        onChange={(e) => setWalkInDates(e.target.value)}
                                        className="premium-input bg-slate-950 border-orange-900/50 text-orange-100 placeholder:text-orange-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-orange-400 tracking-tight">Reporting Time *</label>
                                    <input
                                        required
                                        value={reportingTime}
                                        onChange={(e) => setReportingTime(e.target.value)}
                                        className="premium-input bg-slate-950 border-orange-900/50 text-orange-100 placeholder:text-orange-500/50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-orange-400 tracking-tight">Venue Address *</label>
                                <textarea
                                    required
                                    value={venueAddress}
                                    onChange={(e) => setVenueAddress(e.target.value)}
                                    rows={3}
                                    className="premium-input bg-slate-950 border-orange-900/50 text-orange-100 placeholder:text-orange-500/50 resize-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400">Official Apply URL *</label>
                            <input
                                type="url"
                                required
                                value={applyLink}
                                onChange={(e) => setApplyLink(e.target.value)}
                                className="premium-input bg-slate-950 border-slate-800 text-slate-200"
                            />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-10">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 premium-button bg-emerald-600 hover:bg-emerald-500 h-[64px] shadow-2xl shadow-emerald-900/20"
                    >
                        {saving ? (
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CheckIcon className="w-6 h-6" />
                        )}
                        {saving ? 'Synchronizing...' : 'Update Listing'}
                    </button>
                    <Link
                        href="/admin/opportunities"
                        className="premium-button-outline py-5 px-10 text-center border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 hover:bg-slate-900"
                    >
                        Discard
                    </Link>
                </div>
            </form>
        </div>
    );
}
