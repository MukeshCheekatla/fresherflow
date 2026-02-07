'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useContext, useEffect, useRef, useState } from 'react';
import HomeIcon from '@heroicons/react/24/outline/HomeIcon';
import BriefcaseIcon from '@heroicons/react/24/outline/BriefcaseIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import ArrowRightOnRectangleIcon from '@heroicons/react/24/outline/ArrowRightOnRectangleIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import BookmarkIcon from '@heroicons/react/24/outline/BookmarkIcon';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import AcademicCapIcon from '@heroicons/react/24/outline/AcademicCapIcon';
import QuestionMarkCircleIcon from '@heroicons/react/24/outline/QuestionMarkCircleIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
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
        { href: '/opportunities', label: 'Search' },
        { href: '/jobs', label: 'Jobs' },
        { href: '/internships', label: 'Internships' },
        { href: '/walk-ins', label: 'Walk-ins' },
        { href: '/account/saved', label: 'Saved' },
    ];

    return (
        <>
            <nav suppressHydrationWarning
                className="fixed top-0 left-0 right-0 z-100 border-b bg-card border-border py-2 shadow-sm translate-y-0 opacity-100"
            >
                <div className="w-full px-4 md:px-6 max-w-7xl mx-auto flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-4">
                        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-1 group shrink-0" suppressHydrationWarning>
                            <div className="w-8 h-8 relative flex items-center justify-center transition-all duration-300 transform group-hover:scale-110">
                                <div
                                    suppressHydrationWarning
                                    className="w-full h-full bg-contain bg-center bg-no-repeat"
                                    style={{ backgroundImage: 'var(--logo-image)' }}
                                />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-foreground" suppressHydrationWarning>FresherFlow</span>
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
                                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded ${isActive
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
                                        <div className="h-4 w-px bg-border mx-1 hidden md:block" />

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
                                        <Link href="/login" className="hidden md:flex premium-button !h-8 !px-5 !text-[10px] uppercase tracking-widest italic">
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
                <div className="md:hidden fixed inset-0 top-14 z-90 bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border-b border-border shadow-2xl overflow-y-auto max-h-[calc(100vh-4rem)]">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold uppercase tracking-tight italic">{user.fullName || 'User Identity'}</h3>
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase opacity-60 tracking-wider truncate max-w-50">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        <nav className="p-3 space-y-1">
                            {[
                                { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
                                { href: '/opportunities', label: 'Search Feed', icon: MagnifyingGlassIcon },
                                { href: '/jobs', label: 'Latest Jobs', icon: BriefcaseIcon },
                                { href: '/internships', label: 'Internships', icon: AcademicCapIcon },
                                { href: '/walk-ins', label: 'Walk-in Drives', icon: UserGroupIcon },
                                { href: '/account/saved', label: 'My Saved', icon: BookmarkIcon },
                                { href: '/profile/edit', label: 'My Profile', icon: UserIcon },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <item.icon className="w-4 h-4 text-primary" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}

                            <div className="pt-3 mt-3 border-t border-border">
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        logout?.();
                                    }}
                                    className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider text-destructive hover:bg-destructive/10 transition-all"
                                >
                                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                    <span>Sign Out Securely</span>
                                </button>
                            </div>

                            <div className="mt-6 p-3 bg-muted/50 rounded-lg border border-border">
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
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollYRef = useRef(0);
    const tickingRef = useRef(false);

    useEffect(() => {
        if (isLoading || !user) return;
        const handleScroll = () => {
            if (tickingRef.current) return;
            tickingRef.current = true;

            requestAnimationFrame(() => {
                const currentY = window.scrollY;
                const delta = currentY - lastScrollYRef.current;

                if (currentY < 64) {
                    setIsVisible(true);
                } else if (delta > 6) {
                    setIsVisible(false);
                } else if (delta < -6) {
                    setIsVisible(true);
                }

                lastScrollYRef.current = currentY;
                tickingRef.current = false;
            });
        };

        lastScrollYRef.current = window.scrollY;
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading, user]);

    if (isLoading || !user) return null;

    const tabs = [
        { href: '/dashboard', label: 'Home', icon: HomeIcon },
        { href: '/opportunities', label: 'Search', icon: MagnifyingGlassIcon },
        { href: '/jobs', label: 'Jobs', icon: BriefcaseIcon },
        { href: '/internships', label: 'Intern', icon: AcademicCapIcon },
        { href: '/walk-ins', label: 'Drives', icon: UserGroupIcon },
        { href: '/account/saved', label: 'Saved', icon: BookmarkIcon },
    ];

    return (
        <div className={cn(
            "md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 pb-safe transition-transform duration-200",
            isVisible ? "translate-y-0" : "translate-y-full"
        )}>
            <div className="flex justify-between items-center h-12 px-0.5">
                {tabs.map((tab) => {
                    const currentSearchParams = searchParams.toString();
                    const fullPath = pathname + (currentSearchParams ? `?${currentSearchParams}` : '');
                    const isActive = fullPath === tab.href;

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-0",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <div className={cn(
                                "p-0.5 rounded-md",
                                isActive && "bg-primary/10"
                            )}>
                                <tab.icon className={cn("w-4 h-4", isActive && "fill-primary/20")} strokeWidth={isActive ? 2 : 1.5} />
                            </div>
                            <span className={cn(
                                "text-[8px] uppercase tracking-tighter",
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

