'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';
import {
    HomeIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    MapPinIcon,
    UserIcon,
    Squares2X2Icon,
    ArrowRightOnRectangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
    const context = useContext(AuthContext);
    const user = context?.user;
    const logout = context?.logout;
    const pathname = usePathname();
    const isAuthRoute = pathname === '/login' || pathname === '/register';
    const isAdminRoute = pathname?.startsWith('/admin');

    if (isAdminRoute || isAuthRoute) return null;

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
        { href: '/opportunities?type=JOB', label: 'Jobs' },
        { href: '/opportunities?type=INTERNSHIP', label: 'Internships' },
        { href: '/opportunities?type=WALKIN', label: 'Walk-Ins' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border z-[100] h-[64px] flex items-center shadow-sm">
            <div className="max-content w-full flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform text-primary-foreground shrink-0">
                        <BriefcaseIcon className="w-6 h-6" />
                    </div>
                    <span className="font-black text-xl md:text-2xl tracking-tighter text-foreground">FresherFlow</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    {user && navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-bold transition-colors ${pathname === link.href ? 'text-foreground border-b-2 border-primary pb-1' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {user && (
                        <div className="flex items-center gap-6">
                            <Link
                                href="/dashboard"
                                className={`text-sm font-bold transition-colors ${pathname === '/dashboard' ? 'text-foreground border-b-2 border-primary pb-1' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/profile/edit"
                                className={`text-sm font-bold transition-colors ${pathname === '/profile/edit' ? 'text-foreground border-b-2 border-primary pb-1' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Profile
                            </Link>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="hidden sm:block text-right">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Profile</p>
                                    <p className="text-xs font-bold text-foreground">{user.fullName.split(' ')[0]}</p>
                                </div>
                                <button onClick={handleLogout} className="p-2.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all">
                                    <ArrowRightOnRectangleIcon className="w-6 h-6" />
                                </button>
                            </>
                        ) : (
                            <Link href="/register" className="premium-button !h-[40px] px-6">
                                Get Started
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export function MobileNav() {
    const pathname = usePathname();
    const isAuthRoute = pathname === '/login' || pathname === '/register';
    const isAdminRoute = pathname?.startsWith('/admin');
    const context = useContext(AuthContext);
    const user = context?.user;

    if (isAdminRoute || isAuthRoute) return null;

    const tabs = user ? [
        { href: '/dashboard', label: 'Home', icon: Squares2X2Icon },
        { href: '/opportunities?type=JOB', label: 'Jobs', icon: BriefcaseIcon },
        { href: '/opportunities?type=INTERNSHIP', label: 'Interns', icon: AcademicCapIcon },
        { href: '/profile/edit', label: 'Profile', icon: UserIcon },
    ] : [
        { href: '/', label: 'Home', icon: HomeIcon },
        { href: '/register', label: 'Sign Up', icon: UserIcon },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 px-4 h-[56px] pb-safe flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-0.5 min-w-[56px] h-full justify-center tap-highlight-none">
                        <tab.icon className={`w-[22px] h-[22px] ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                            {tab.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
