'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function GoogleAnalytics({ ga_id }: { ga_id: string }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!ga_id) return;

        // Load gtag.js script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${ga_id}`;
        document.head.appendChild(script);

        // Initialize dataLayer and gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag(...args: unknown[]) {
            window.dataLayer.push(args);
        };
        window.gtag('js', new Date());
        window.gtag('config', ga_id, {
            page_path: window.location.pathname,
        });
    }, [ga_id]);

    useEffect(() => {
        if (!ga_id) return;

        const query = searchParams.toString();
        const url = pathname + (query ? `?${query}` : '');

        window.gtag('config', ga_id, {
            page_path: url,
        });
    }, [pathname, searchParams, ga_id]);

    return null;
}

declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (command: string, ...args: unknown[]) => void;
    }
}

// Utility to track custom events
export const trackGAEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, eventParams);
    }
};
