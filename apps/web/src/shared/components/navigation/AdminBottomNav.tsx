'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Squares2X2Icon,
    PlusCircleIcon,
    MagnifyingGlassIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const NAV_ITEMS = [
    {
        label: 'Dashboard',
        href: '/admin',
        icon: Squares2X2Icon,
    },
    {
        label: 'Search',
        href: '/admin/opportunities',
        icon: MagnifyingGlassIcon,
    },
    {
        label: 'Post',
        href: '/admin/opportunities/create',
        icon: PlusCircleIcon,
    },
    {
        label: 'Feedback',
        href: '/admin/feedback',
        icon: ChatBubbleLeftRightIcon,
    }
];

export default function AdminBottomNav() {
    const pathname = usePathname();

    return (
        <nav className={cn(
            "fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden transition-all duration-300 pb-safe shadow-2xl",
            "translate-y-0 opacity-100"
        )}>
            <div className="flex justify-around items-center h-16 px-2">
                {NAV_ITEMS.map((item) => {
                    let isActive = false;

                    if (item.label === 'Dashboard') {
                        // Active for /admin and /admin/dashboard
                        isActive = pathname === '/admin' || pathname === '/admin/dashboard';
                    } else if (item.label === 'Post') {
                        // Active ONLY for create page
                        isActive = pathname === '/admin/opportunities/create';
                    } else if (item.label === 'Search') {
                        // Active for opportunities list, but NOT create page
                        isActive = pathname === '/admin/opportunities' || (pathname.startsWith('/admin/opportunities') && pathname !== '/admin/opportunities/create');
                    } else if (item.label === 'Feedback') {
                        isActive = pathname.startsWith('/admin/feedback');
                    }

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 grouping",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className={cn(
                                "p-1 rounded-xl transition-all",
                                isActive && "bg-primary/10"
                            )}>
                                <item.icon className={cn("w-6 h-6", isActive && "fill-primary/20 value-icon")} strokeWidth={isActive ? 2 : 1.5} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium transition-all",
                                isActive ? "font-semibold" : "font-normal"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
