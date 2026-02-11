'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!('serviceWorker' in navigator)) return;

        const isLocalhost =
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        // Avoid SW navigation/cache side effects in local dev.
        if (isLocalhost || process.env.NODE_ENV !== 'production') {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                registrations.forEach((registration) => {
                    void registration.unregister();
                });
            }).catch(() => {
                // Ignore cleanup errors in dev
            });
            return;
        }

        const register = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js?v=1.4.7');
                await registration.update();

                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
            } catch (err) {
                // Silent fail - app should still work without SW
                console.warn('Service worker registration failed', err);
            }
        };

        register();
    }, []);

    return null;
}
