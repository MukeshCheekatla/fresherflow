'use client';

import { useSyncExternalStore } from 'react';
import WifiIcon from '@heroicons/react/24/outline/WifiIcon';

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

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300 md:bottom-8 md:right-8 md:left-auto md:max-w-xs">
            <div className="bg-amber-600/90 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/50">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <WifiIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold">You&apos;re Offline</p>
                    <p className="text-[10px] opacity-90 leading-tight">Viewing cached listings. Connect to see new updates.</p>
                </div>
            </div>
        </div>
    );
}
