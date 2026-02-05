'use client';

import { useAdmin } from '@/contexts/AdminContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Squares2X2Icon,
    BriefcaseIcon,
    ChatBubbleBottomCenterTextIcon,
    PlusCircleIcon,
    ChartBarIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import AdminBottomNav from '@/shared/components/navigation/AdminBottomNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { logout, isAuthenticated, isLoading } = useAdmin();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Scroll tracking is disabled per user request to keep navigation constant

    const isLoginPage = pathname.includes('/login');

    // Security: Redirect unauthenticated users
    useEffect(() => {
        if (!isLoading && !isAuthenticated && !isLoginPage) {
            router.push('/admin/login');
        }
    }, [isAuthenticated, isLoading, isLoginPage, router]);


    if (isLoading) {
        return (
            <div className="dark min-h-screen bg-background flex items-center justify-center text-muted-foreground">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-12 h-12">
                        <Image src="/logo-white.png" alt="Loading..." fill className="object-contain opacity-50" />
                    </div>
                    <p className="text-sm font-medium">Loading Admin Portal...</p>
                </div>
            </div>
        );
    }

    // Don't render admin UI for unauthenticated users (except login page)
    if (!isAuthenticated && !isLoginPage) {
        return null;
    }

    if (isLoginPage) {
        return (
            <div className="dark min-h-screen bg-background text-foreground">
                {children}
            </div>
        );
    }

    const navItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: Squares2X2Icon },
        { href: '/admin/opportunities', label: 'Opportunities', icon: BriefcaseIcon },
        { href: '/admin/opportunities/create', label: 'Post New', icon: PlusCircleIcon },
        { href: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon },
        { href: '/admin/feedback', label: 'Feedback', icon: ChatBubbleBottomCenterTextIcon },
    ];

    return (
        <div className="dark flex h-[100dvh] overflow-hidden bg-background text-foreground">
            {/* Sidebar (Desktop) */}
            <aside className="w-64 bg-card border-r border-border sticky top-0 h-screen hidden md:flex flex-col">
                <div className="p-6">
                    <Link href="/admin/dashboard" className="flex items-center gap-3">
                        <div className="relative w-8 h-8">
                            <Image
                                src="/logo-white.png"
                                alt="FresherFlow"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-foreground">FresherFlow <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-1 tracking-wider">ADMIN</span></span>
                    </Link>
                </div>

                <nav className="flex-1 px-3 space-y-1 mt-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-border mb-4">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
                    >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background md:bg-muted/10">
                {/* Mobile Header - Fixed at Top with Hide/Show logic */}
                <header
                    className="md:hidden bg-card border-b border-border p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-20 h-16 transition-all duration-300 translate-y-0 opacity-100"
                >
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                            <Image
                                src="/logo-white.png"
                                alt="FresherFlow"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-foreground">FresherFlow</span>
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                    </button>
                </header>

                {/* Mobile Hamburger Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 top-16 z-[100] bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-card border-b border-border shadow-2xl overflow-y-auto max-h-[calc(100vh-4rem)]">
                            <nav className="p-4 space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-4 px-4 py-4 rounded-xl text-base font-bold transition-all ${isActive
                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}

                                <div className="pt-4 mt-4 border-t border-border">
                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            logout();
                                        }}
                                        className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-base font-bold text-destructive hover:bg-destructive/10 transition-all"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </div>
                )}

                <main
                    className="flex-1 overflow-y-auto pt-16 md:pb-8 p-4 md:p-8 md:pt-8 w-full pb-20 md:pb-8"
                >
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
                <AdminBottomNav />
            </div>
        </div>
    );
}
