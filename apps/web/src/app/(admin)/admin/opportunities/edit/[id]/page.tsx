'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    Briefcase,
    MapPin,
    IndianRupee,
    GraduationCap,
    Calendar,
    Link as LinkIcon,
    Save,
    Trash2,
    Info,
    Clock,
    Building2
} from 'lucide-react';
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
                    <Link href="/admin/opportunities" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to List
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Opportunity</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Modify entry Details and requirements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${type === 'WALKIN' ? 'bg-orange-100 text-orange-600' :
                            type === 'INTERNSHIP' ? 'bg-purple-100 text-purple-600' :
                                'bg-blue-100 text-blue-600'
                        }`}>
                        {type} Listing
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main Details */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-slate-400" />
                        General Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 font-display">Job Title *</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="premium-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Company Name *</label>
                            <input
                                required
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="premium-input"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 font-display">Full Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            className="premium-input resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 tracking-tight">
                                <IndianRupee className="w-4 h-4" /> Min Salary
                            </label>
                            <input
                                type="number"
                                value={salaryMin}
                                onChange={(e) => setSalaryMin(e.target.value)}
                                className="premium-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 tracking-tight">
                                <IndianRupee className="w-4 h-4" /> Max Salary
                            </label>
                            <input
                                type="number"
                                value={salaryMax}
                                onChange={(e) => setSalaryMax(e.target.value)}
                                className="premium-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 tracking-tight">
                                <Calendar className="w-4 h-4" /> Expiry Date
                            </label>
                            <input
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                className="premium-input p-2.5"
                            />
                        </div>
                    </div>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-slate-400" />
                        Candidate Requirements
                    </h3>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700">Allowed Education Levels</label>
                        <div className="flex flex-wrap gap-3">
                            {['DIPLOMA', 'DEGREE', 'PG'].map((deg) => (
                                <button
                                    key={deg}
                                    type="button"
                                    onClick={() => handleDegreeToggle(deg)}
                                    className={`px-6 py-2 rounded-xl font-bold border-2 transition-all ${allowedDegrees.includes(deg)
                                            ? 'bg-blue-50 border-blue-600 text-blue-700'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    {deg}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Passout Years (comma separated)</label>
                            <input
                                required
                                value={passoutYears.join(', ')}
                                onChange={(e) => setPassoutYears(e.target.value.split(',').map(y => parseInt(y.trim())).filter(Boolean))}
                                className="premium-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Key Skills Required</label>
                            <input
                                value={requiredSkills}
                                onChange={(e) => setRequiredSkills(e.target.value)}
                                className="premium-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Logistics */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-slate-400" />
                        Logistics
                    </h3>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Locations (comma separated)</label>
                        <input
                            required
                            value={locations}
                            onChange={(e) => setLocations(e.target.value)}
                            className="premium-input"
                        />
                    </div>

                    {type !== 'WALKIN' && (
                        <div className="space-y-3 pt-2">
                            <label className="text-sm font-bold text-slate-700">Primary Work Mode</label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['ONSITE', 'HYBRID', 'REMOTE'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setWorkMode(mode)}
                                        className={`py-3 rounded-xl font-bold border-2 transition-all ${workMode === mode
                                                ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
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
                <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-slate-400" />
                        Application Bridge
                    </h3>

                    {type === 'WALKIN' ? (
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-orange-800 tracking-tight">Walk-in Dates *</label>
                                    <input
                                        required
                                        value={walkInDates}
                                        onChange={(e) => setWalkInDates(e.target.value)}
                                        className="premium-input bg-white border-orange-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-orange-800 tracking-tight">Reporting Time *</label>
                                    <input
                                        required
                                        value={reportingTime}
                                        onChange={(e) => setReportingTime(e.target.value)}
                                        className="premium-input bg-white border-orange-100"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-orange-800 tracking-tight">Venue Address *</label>
                                <textarea
                                    required
                                    value={venueAddress}
                                    onChange={(e) => setVenueAddress(e.target.value)}
                                    rows={3}
                                    className="premium-input bg-white border-orange-100 resize-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Official Apply URL *</label>
                            <input
                                type="url"
                                required
                                value={applyLink}
                                onChange={(e) => setApplyLink(e.target.value)}
                                className="premium-input"
                            />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-10">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 premium-button bg-slate-900 text-white flex items-center justify-center gap-2 py-5 text-lg"
                    >
                        {saving ? (
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-6 h-6" />
                        )}
                        {saving ? 'Saving...' : 'Commit Changes'}
                    </button>
                    <Link
                        href="/admin/opportunities"
                        className="premium-button-outline py-5 px-10 text-center"
                    >
                        Discard
                    </Link>
                </div>
            </form>
        </div>
    );
}
