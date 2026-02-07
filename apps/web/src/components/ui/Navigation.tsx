'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useContext, useState } from 'react';
import {
    HomeIcon,
    BriefcaseIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    MagnifyingGlassIcon,
    BookmarkIcon,
    Bars3Icon,
    XMarkIcon,
    AcademicCapIcon,
    QuestionMarkCircleIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
    const context = useContext(AuthContext);
    const user = context?.user;
    const isLoading = context?.isLoading;
    const logout = context?.logout;
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/jobs', label: 'Jobs' },
        { href: '/internships', label: 'Internships' },
        { href: '/walk-ins', label: 'Walk-ins' },
        { href: '/account/saved', label: 'Saved' },
    ];

    return (
        <>
            <nav suppressHydrationWarning
                className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b bg-card border-border py-2.5 shadow-sm translate-y-0 opacity-100"
            >
                <div className="w-full px-4 md:px-6 max-w-7xl mx-auto flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-4">
                        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-1 group shrink-0" suppressHydrationWarning>
                            <div className="w-9 h-9 relative flex items-center justify-center transition-all duration-300 transform group-hover:scale-110">
                                <div
                                    suppressHydrationWarning
                                    className="w-full h-full bg-contain bg-center bg-no-repeat"
                                    style={{ backgroundImage: 'var(--logo-image)' }}
                                />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-foreground" suppressHydrationWarning>FresherFlow</span>
                        </Link>
                    </div>

                    {/* Desktop Nav Links */}
                    {!isLoading && user && (
                        <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                            {navLinks.map((link) => {
                                const currentSearchParams = searchParams.toString();
                                const fullPath = pathname + (currentSearchParams ? `?${currentSearchParams}` : '');
                                const isActive = fullPath === link.href || pathname === link.href;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded ${isActive
                                            ? 'bg-background text-primary border border-border shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <ThemeToggle />

                        {!isLoading && (
                            <>
                                {user ? (
                                    <div className="flex items-center gap-1 md:gap-3">
                                        <div className="h-4 w-[1px] bg-border mx-1 hidden md:block" />

                                        <Link href="/profile/edit" className="p-2 text-muted-foreground hover:text-primary transition-colors hidden md:block">
                                            <UserIcon className="w-5 h-5" />
                                        </Link>

                                        <Link
                                            href="/logout"
                                            className="p-2 text-muted-foreground hover:text-error transition-colors hidden md:block"
                                            title="Logout"
                                        >
                                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                        </Link>

                                        {/* Mobile Hamburger Button */}
                                        <button
                                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                                            aria-label="Toggle menu"
                                        >
                                            {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Link href="/login" className="hidden md:flex premium-button !h-9 !px-6 !text-[10px] uppercase tracking-widest italic">
                                            Access Feed
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* User Mobile Hamburger Menu */}
            {mobileMenuOpen && user && (
                <div className="md:hidden fixed inset-0 top-16 z-[90] bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border-b border-border shadow-2xl overflow-y-auto max-h-[calc(100vh-4rem)]">
                        <div className="p-6 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-black uppercase tracking-tight italic">{user.fullName || 'User Identity'}</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider truncate max-w-[200px]">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        <nav className="p-4 space-y-1">
                            {[
                                { href: '/dashboard', label: 'Feed Dashboard', icon: HomeIcon },
                                { href: '/account/saved', label: 'My Saved Jobs', icon: BookmarkIcon },
                                { href: '/profile/edit', label: 'Profile Completion', icon: AcademicCapIcon },
                                { href: '/opportunities', label: 'Global Search', icon: MagnifyingGlassIcon },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-black uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                >
                                    <item.icon className="w-5 h-5 text-primary" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}

                            <div className="pt-4 mt-4 border-t border-border">
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        logout?.();
                                    }}
                                    className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-sm font-black uppercase tracking-wider text-destructive hover:bg-destructive/10 transition-all"
                                >
                                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                    <span>Sign Out Securely</span>
                                </button>
                            </div>

                            <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <QuestionMarkCircleIcon className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Support & Info</span>
                                </div>
                                <p className="text-[9px] font-bold text-muted-foreground/60 leading-relaxed uppercase">Need help? Contact our verification team for priority eligibility support at verified@fresherflow.in</p>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}

export function MobileNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const context = useContext(AuthContext);
    const user = context?.user;
    const isLoading = context?.isLoading;

    if (isLoading || !user) return null;

    const tabs = [
        { href: '/dashboard', label: 'Home', icon: HomeIcon },
        { href: '/jobs', label: 'Jobs', icon: BriefcaseIcon },
        { href: '/internships', label: 'Intern', icon: AcademicCapIcon },
        { href: '/walk-ins', label: 'Drives', icon: UserGroupIcon },
        { href: '/account/saved', label: 'Saved', icon: BookmarkIcon },
    ];

    return (
        <div className={cn(
            "md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 pb-safe transition-all duration-300",
            "translate-y-0 opacity-100"
        )}>
            <div className="flex justify-around items-center h-14 px-1">
                {tabs.map((tab) => {
                    const currentSearchParams = searchParams.toString();
                    const fullPath = pathname + (currentSearchParams ? `?${currentSearchParams}` : '');
                    const isActive = fullPath === tab.href;

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-300",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className={cn(
                                "p-1 rounded-lg transition-all",
                                isActive && "bg-primary/10"
                            )}>
                                <tab.icon className={cn("w-5 h-5", isActive && "fill-primary/20")} strokeWidth={isActive ? 2 : 1.5} />
                            </div>
                            <span className={cn(
                                "text-[9px] transition-all uppercase tracking-tight",
                                isActive ? "font-bold" : "font-medium"
                            )}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

