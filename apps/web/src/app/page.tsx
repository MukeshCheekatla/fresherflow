import type { Metadata } from 'next';
import Link from 'next/link';
import { HomeAuthGuard } from '@/components/auth/HomeAuthGuard';
import {
    ShieldCheckIcon,
    MapPinIcon,
    ArrowRightIcon,
    CheckBadgeIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
    title: 'FresherFlow | Verified Off-Campus Drives & Walk-ins for Freshers',
    description: 'The centralized architecture for entry-level careers. We aggregate, verify, and deploy walk-in drives, internships, and off-campus jobs with direct links. Zero friction.',
    keywords: ['off campus drives', 'walk-in interviews', 'fresher jobs', 'internships', 'verified jobs', 'software engineer jobs'],
    openGraph: {
        title: 'FresherFlow | Aggregate. Verify. Deploy.',
        description: 'The logic-first career feed for freshers. 100% manually verified opportunities.',
        type: 'website',
    }
};

export default function LandingPage() {
    return (
        <>
            <HomeAuthGuard />
            <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
                {/* Navbar Placeholder (transparent) */}
                <div className="absolute top-0 left-0 right-0 h-20 z-10" />

                <main className="flex-1 flex flex-col">
                    {/* Hero Section */}
                    <section className="relative pt-24 pb-16 md:pt-48 md:pb-32 px-6 border-b border-border overflow-hidden">
                        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-border animate-in fade-in slide-in-from-top-4 duration-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                <span className="text-xs font-medium text-foreground">System Operational</span>
                            </div>

                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                                    The new standard for <br className="hidden md:block" />
                                    <span className="text-muted-foreground">entry-level recruiting.</span>
                                </h1>
                                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                    FresherFlow removes the noise from job hunting. We aggregate verified off-campus drives, validate every single link, and deliver direct access to hiring portals.
                                </p>
                            </div>

                            <div className="flex flex-row items-center justify-center gap-2 md:gap-4 pt-4 md:pt-8 animate-in fade-in zoom-in-95 duration-500">
                                <Link
                                    href="/opportunities"
                                    className="premium-button !h-10 md:!h-12 px-4 md:px-8 text-[11px] md:text-sm !rounded-full whitespace-nowrap"
                                >
                                    Browse <span className="hidden sm:inline">Opportunities</span>
                                    <ArrowRightIcon className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="premium-button-outline !h-10 md:!h-12 px-4 md:px-8 text-[11px] md:text-sm !rounded-full bg-background hover:bg-muted whitespace-nowrap"
                                >
                                    Login <span className="hidden sm:inline">to Terminal</span>
                                </Link>
                            </div>
                        </div>

                        {/* Background Grid - Subtle Vercel-like Pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] -z-10" />
                    </section>

                    {/* What We Do - Bento Grid Style */}
                    <section className="py-24 px-6 bg-background border-b border-border/50">
                        <div className="max-w-6xl mx-auto space-y-16">
                            <div className="text-center space-y-4 max-w-2xl mx-auto">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The protocol for verified hiring.</h2>
                                <p className="text-muted-foreground text-base md:text-lg">We re-engineered the process of finding off-campus drives to be zero-latency and high-trust.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Feature 1 */}
                                <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 md:p-8 hover:shadow-lg transition-all duration-300">
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                                        <CpuChipIcon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-foreground">Algorithmic Aggregation</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Our engines continuously scan hundreds of career pages to consolidate listings into one unified, real-time stream.
                                    </p>
                                </div>

                                {/* Feature 2 */}
                                <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 md:p-8 hover:shadow-lg transition-all duration-300">
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                                        <ShieldCheckIcon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-foreground">Human Verified</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Technology scales, but humans verify. Every link is manually reviewed to ensure it&apos;s active, direct, and scam-free.
                                    </p>
                                </div>

                                {/* Feature 3 */}
                                <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 md:p-8 hover:shadow-lg transition-all duration-300">
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                                        <MapPinIcon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-foreground">Walk-in Intelligence</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Precise location data, reporting times, and venue details for walk-in drives. No more guessing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Problem / Solution Section */}
                    <section className="py-24 px-6 bg-muted/20 border-b border-border/50 overflow-hidden">
                        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Solving the entries level chaos.</h2>
                                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                                        Searching for a job shouldn&apos;t be a full-time job. Most platforms are cluttered with outdated listings, circular redirects, and unverified links.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { title: "No More Ghosting", desc: "We track job status in real-time. If it&apos;s expired, it&apos;s out." },
                                        { title: "Verified Links Only", desc: "Every application link leads directly to official company portals." },
                                        { title: "Centralized Intelligence", desc: "Jobs, internships, and walk-ins in one clean, distraction-free terminal." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="mt-1 flex-shrink-0 h-5 w-5 rounded-full bg-success/10 flex items-center justify-center">
                                                <CheckBadgeIcon className="h-3 w-3 text-success" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground">{item.title}</h4>
                                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="aspect-square rounded-2xl bg-card border border-border overflow-hidden p-0 shadow-2xl relative flex flex-col">
                                    {/* Mock Terminal Header */}
                                    <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-error/20 border border-error/30" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-warning/20 border border-warning/30" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-success/20 border border-success/30" />
                                        </div>
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Feed intelligence</div>
                                    </div>

                                    {/* Mock Feed Content */}
                                    <div className="flex-1 p-4 md:p-6 space-y-4 overflow-hidden">
                                        {[
                                            { company: "Google", role: "SDE-1 (Off Campus)", type: "Job", status: "Verified", time: "2m ago" },
                                            { company: "Amazon", role: "Front-end Intern", type: "Internship", status: "Active", time: "15m ago" },
                                            { company: "Zomato", role: "Graduate Engineer Trainee", type: "Walk-in", status: "Verified", time: "1h ago" }
                                        ].map((item, i) => (
                                            <div key={i} className={`p-4 rounded-xl border border-border bg-muted/10 space-y-3 animate-in fade-in slide-in-from-right-4 duration-500`} style={{ animationDelay: `${i * 150}ms` }}>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h5 className="font-semibold text-sm text-foreground">{item.role}</h5>
                                                        <p className="text-[11px] font-medium text-muted-foreground">{item.company}</p>
                                                    </div>
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.type === 'Walk-in' ? 'bg-warning/10 text-warning' : 'bg-primary/5 text-primary'
                                                        }`}>
                                                        {item.type}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between pt-1">
                                                    <div className="flex gap-2">
                                                        <span className="flex items-center gap-1 text-[9px] font-bold text-success uppercase tracking-wider">
                                                            <div className="w-1 h-1 rounded-full bg-success" />
                                                            {item.status}
                                                        </span>
                                                        <span className="text-[9px] font-medium text-muted-foreground uppercase">{item.time}</span>
                                                    </div>
                                                    <div className="h-6 w-16 bg-primary rounded flex items-center justify-center text-[9px] font-bold text-primary-foreground">
                                                        Apply
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mock Cursor */}
                                    <div className="absolute top-[60%] left-[70%] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
                                        <div className="relative">
                                            <ArrowRightIcon className="w-6 h-6 text-primary rotate-[-45deg] drop-shadow-lg" />
                                            <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 h-32 w-32 md:h-48 md:w-48 bg-primary/10 rounded-full blur-3xl -z-10" />
                            </div>
                        </div>
                    </section>

                    {/* How it Works / Transparency */}
                    <section className="py-24 px-6 bg-background border-b border-border/50">
                        <div className="max-w-6xl mx-auto space-y-16">
                            <div className="text-center space-y-4 max-w-2xl mx-auto">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Radical transparency.</h2>
                                <p className="text-muted-foreground text-base md:text-lg">We don&apos;t just list jobs; we orchestrate a verified hiring pipeline.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                {[
                                    { step: "01", title: "Index", desc: "Data is pulled from verified corporate ATS (Workday, Greenhouse, Lever)." },
                                    { step: "02", title: "Verify", desc: "Human agents confirm application link integrity and eligibility criteria." },
                                    { step: "03", title: "Enrich", desc: "We add critical context like walk-in coordinates and reporting windows." },
                                    { step: "04", title: "Deploy", desc: "Opportunities are pushed to your terminal with zero algorithmic delay." }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-4">
                                        <span className="text-4xl font-bold text-primary/10 tracking-tighter">{item.step}</span>
                                        <h4 className="font-bold text-lg">{item.title}</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Mission Callout */}
                    <section className="py-32 px-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/[0.02] -z-10" />
                        <div className="max-w-4xl mx-auto text-center space-y-10">
                            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">Engineered for the 1%.</h2>
                            <p className="text-muted-foreground text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
                                FresherFlow is not just a job board. It is the centralized logistics layer for entry-level engineering. We solve for friction, so you can solve for your career.
                            </p>
                            <div className="pt-6 flex justify-center">
                                <Link
                                    href="/opportunities"
                                    className="premium-button !h-12 md:!h-14 px-10 md:px-16 text-sm md:text-base !rounded-full shadow-2xl hover:scale-[1.05] transition-all"
                                >
                                    Experience the Feed
                                </Link>
                            </div>
                        </div>
                    </section>

                    <footer className="py-12 pb-36 md:pb-12 border-t border-border bg-muted/10">
                        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex flex-col items-center md:items-start gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 relative flex items-center justify-center">
                                        <div
                                            suppressHydrationWarning
                                            className="w-full h-full bg-contain bg-center bg-no-repeat"
                                            style={{ backgroundImage: 'var(--logo-image)' }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold tracking-tight">FresherFlow</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center md:items-end gap-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] text-center md:text-right leading-loose">
                                    © 2026 FresherFlow. <br className="md:hidden" /> Dedicated to Direct Careers.
                                </p>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </>
    );
}

