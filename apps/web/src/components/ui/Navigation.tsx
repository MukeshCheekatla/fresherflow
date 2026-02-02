'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { useContext, useState, useEffect } from 'react';
import {
    HomeIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    MagnifyingGlassIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
    const context = useContext(AuthContext);
    const user = context?.user;
    const logout = context?.logout;
    const isLoading = context?.isLoading;
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        const loading = toast.loading('🔒 Securing session...');
        try {
            if (logout) {
                await logout();
            }
            toast.success('Goodbye!', { id: loading });
            window.location.href = '/login';
        } catch (err) {
            toast.error('Logout error', { id: loading });
        }
    };

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/opportunities?type=Full-time', label: 'Jobs' },
        { href: '/opportunities?type=Internship', label: 'Internships' },
        { href: '/opportunities?type=WALKIN', label: 'Walk-ins' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b ${scrolled
                ? 'bg-background border-border py-2'
                : 'bg-background/50 border-transparent py-4'
                }`}
        >
            <div className="max-content w-full flex items-center justify-between">
                {/* Brand */}
                <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group shrink-0">
                    <div className="w-9 h-9 bg-foreground text-background rounded flex items-center justify-center transition-all duration-300">
                        <BriefcaseIcon className="w-5 h-5" />
                    </div>
                    <span className="font-black text-xl tracking-tighter text-foreground italic uppercase">FresherFlow</span>
                </Link>

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
                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    {!isLoading && (
                        <>
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <div className="h-4 w-[1px] bg-border mx-1 hidden md:block" />

                                    <Link href="/profile/edit" className="p-2 text-muted-foreground hover:text-primary transition-colors hidden md:block">
                                        <UserIcon className="w-5 h-5" />
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-muted-foreground hover:text-error transition-colors underline-offset-4 hover:underline"
                                        title="Logout"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="hidden md:flex items-center gap-2">
                                        <Link href="/login" className="text-xs font-black uppercase tracking-widest px-4 py-2 text-muted-foreground hover:text-foreground">
                                            Sign In
                                        </Link>
                                        <Link href="/register" className="premium-button !h-9 !px-5 !text-[10px] uppercase tracking-widest">
                                            Join Now
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export function MobileNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const context = useContext(AuthContext);
    const user = context?.user;
    const isLoading = context?.isLoading;

    if (isLoading) return null;

    const tabs = user ? [
        { href: '/dashboard', label: 'Home', icon: HomeIcon },
        { href: '/opportunities', label: 'Search', icon: MagnifyingGlassIcon },
        { href: '/opportunities?type=Full-time', label: 'Jobs', icon: BriefcaseIcon },
        { href: '/opportunities?type=WALKIN', label: 'Walk-ins', icon: MapPinIcon },
        { href: '/profile/edit', label: 'Profile', icon: UserIcon },
    ] : [
        { href: '/', label: 'Home', icon: HomeIcon },
        { href: '/register', label: 'Join', icon: UserIcon },
        { href: '/login', label: 'Sign In', icon: ArrowRightOnRectangleIcon },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
            <div className={`flex items-center justify-around ${user ? 'h-[56px]' : 'h-[50px]'}`}>
                {tabs.map((tab) => {
                    const currentSearchParams = searchParams.toString();
                    const fullPath = pathname + (currentSearchParams ? `?${currentSearchParams}` : '');
                    const isActive = fullPath === tab.href;

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            <div className="relative">
                                <tab.icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2]'}`} />
                                {isActive && (
                                    <div className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-primary" />
                                )}
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
