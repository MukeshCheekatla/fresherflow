'use client';

import { useSyncExternalStore } from 'react';
import WifiIcon from '@heroicons/react/24/outline/WifiIcon';
import Link from 'next/link';
import { getRecentViewedCount } from '@/lib/offline/recentViewed';

export default function OfflineNotification() {
    const isOffline = useSyncExternalStore(
        (callback) => {
            window.addEventListener('online', callback);
            window.addEventListener('offline', callback);
            return () => {
                window.removeEventListener('online', callback);
                window.removeEventListener('offline', callback);
            };
        },
        () => !navigator.onLine,
        () => false // Server-side assume online
    );

    if (!isOffline) return null;
    const cachedCount = getRecentViewedCount();

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300 md:bottom-8 md:right-8 md:left-auto md:max-w-xs">
            <div className="bg-amber-600/90 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/50">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <WifiIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold">You&apos;re Offline</p>
                    <p className="text-[10px] opacity-90 leading-tight">
                        {cachedCount > 0
                            ? `${cachedCount} recently viewed listing${cachedCount > 1 ? 's are' : ' is'} available offline.`
                            : 'Viewing cached pages only. Connect to load fresh listings.'}
                    </p>
                    {cachedCount > 0 && (
                        <Link href="/opportunities" className="inline-block mt-1 text-[10px] font-semibold underline">
                            Open opportunities
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
