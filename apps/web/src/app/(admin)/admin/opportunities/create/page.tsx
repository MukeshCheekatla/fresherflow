'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api/admin';
import {
    ArrowLeft,
    Sparkles,
    Briefcase,
    MapPin,
    IndianRupee,
    GraduationCap,
    Calendar,
    Link as LinkIcon,
    Plus,
    X,
    Send,
    Wand2,
    Trash2,
    Info
} from 'lucide-react';

export default function CreateOpportunityPage() {
    const { isAuthenticated, token } = useAdmin();
    const router = useRouter();
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

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
        }
    }, [isAuthenticated, router]);

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

            toast.success('✅ Magic! Form auto-filled.', { id: loadingToast });
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

            await adminApi.createOpportunity(token as string, payload);

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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/admin/opportunities" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to List
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Post Opportunity</h1>
                    <p className="text-slate-500 font-medium">Create and publish a new listing for matched candidates.</p>
                </div>
                <button
                    onClick={() => setShowParser(!showParser)}
                    className="premium-button flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                    <Wand2 className="w-5 h-5" />
                    Auto-Fill (AI Content Parser)
                </button>
            </div>

            {/* AI Parser Overlay */}
            {showParser && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Paste Content
                            </h3>
                            <button onClick={() => setShowParser(false)} className="text-blue-400 hover:text-blue-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <p className="text-blue-700 text-sm mb-6">Paste the raw job description, and we'll extract the details for you.</p>
                        <textarea
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            rows={8}
                            className="premium-input bg-white/80 border-blue-100 placeholder:text-blue-200 text-blue-900 focus:border-blue-400 mb-6"
                            placeholder="Example: Software Engineer at Google, Mumbai. Req: React, Node.js..."
                        />
                        <button
                            onClick={parseJobPosting}
                            disabled={!pastedText.trim()}
                            className="premium-button w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                            <Wand2 className="w-5 h-5" />
                            Run Magic Parser
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Info className="w-5 h-5 text-slate-400" />
                        What are you posting?
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {(['JOB', 'INTERNSHIP', 'WALKIN'] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`flex flex-col items-center justify-center py-6 px-4 rounded-2xl border-2 transition-all duration-300 ${type === t
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                                    }`}
                            >
                                <span className="font-black text-xl tracking-tighter mb-1">{t}</span>
                                <span className="text-xs font-bold opacity-60 uppercase tracking-widest">
                                    {t === 'WALKIN' ? 'On-site Drive' : 'Direct Hire'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Details */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-slate-400" />
                        General Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Job Title *</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="premium-input"
                                placeholder="e.g. Senior Frontend Engineer"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Company Name *</label>
                            <input
                                required
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="premium-input"
                                placeholder="e.g. Google India"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Full Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            className="premium-input resize-none"
                            placeholder="Roles and responsibilities..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <IndianRupee className="w-4 h-4" /> Min Salary
                            </label>
                            <input
                                type="number"
                                value={salaryMin}
                                onChange={(e) => setSalaryMin(e.target.value)}
                                className="premium-input"
                                placeholder="3,00,000"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <IndianRupee className="w-4 h-4" /> Max Salary
                            </label>
                            <input
                                type="number"
                                value={salaryMax}
                                onChange={(e) => setSalaryMax(e.target.value)}
                                className="premium-input"
                                placeholder="12,00,000"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Final Date
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
                                placeholder="2024, 2025"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Key Skills Required</label>
                            <input
                                value={requiredSkills}
                                onChange={(e) => setRequiredSkills(e.target.value)}
                                className="premium-input"
                                placeholder="React, Node.js, AWS..."
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
                            placeholder="Mumbai, Bangalore, Remote"
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
                                        placeholder="2024-05-10, 2024-05-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-orange-800 tracking-tight">Reporting Time *</label>
                                    <input
                                        required
                                        value={reportingTime}
                                        onChange={(e) => setReportingTime(e.target.value)}
                                        className="premium-input bg-white border-orange-100"
                                        placeholder="09:00 AM - 12:00 PM"
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
                                    placeholder="Complete street address..."
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
                                placeholder="https://careers.google.com/jobs/..."
                            />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-10">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 premium-button bg-slate-900 text-white flex items-center justify-center gap-2 py-5 text-lg"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Plus className="w-6 h-6" />
                        )}
                        {isLoading ? 'Publishing...' : 'Publish Listing Now'}
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
