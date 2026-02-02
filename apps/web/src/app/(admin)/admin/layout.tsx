'use client';

import { useAdmin } from '@/contexts/AdminContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Squares2X2Icon,
    BriefcaseIcon,
    ChatBubbleBottomCenterTextIcon,
    AdjustmentsHorizontalIcon,
    ArrowRightOnRectangleIcon,
    PlusCircleIcon,
    UsersIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { logout, isAuthenticated } = useAdmin();
    const pathname = usePathname();

    if (!isAuthenticated && !pathname.includes('/login')) return <>{children}</>;

    const navItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: Squares2X2Icon },
        { href: '/admin/opportunities', label: 'Opportunities', icon: BriefcaseIcon },
        { href: '/admin/opportunities/create', label: 'Post New', icon: PlusCircleIcon },
        { href: '/admin/feedback', label: 'Feedback', icon: ChatBubbleBottomCenterTextIcon },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 sticky top-0 h-screen hidden md:flex flex-col">
                <div className="p-6">
                    <Link href="/admin/dashboard" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">FresherFlow <span className="text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-1">ADMIN</span></span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 mb-4">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
                    <Link href="/admin/dashboard" className="text-xl font-bold tracking-tight">FresherFlow</Link>
                    <button onClick={logout} className="p-2 text-slate-600"><ArrowRightOnRectangleIcon className="w-5 h-5" /></button>
                </header>

                <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
