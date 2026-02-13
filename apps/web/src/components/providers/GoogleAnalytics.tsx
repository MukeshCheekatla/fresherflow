'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function GoogleAnalytics({ ga_id }: { ga_id: string }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!ga_id) return;

        const query = searchParams.toString();
        const url = pathname + (query ? `?${query}` : '');

        window.gtag('config', ga_id, {
            page_path: url,
        });
    }, [pathname, searchParams, ga_id]);

    if (!ga_id) return null;

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${ga_id}`}
            />
            <Script
                id="gtag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga_id}', {
              page_path: window.location.pathname,
            });
          `,
                }}
            />
        </>
    );
}

declare global {
    interface Window {
        gtag: (command: string, ...args: unknown[]) => void;
    }
}

// Utility to track custom events
export const trackGAEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, eventParams);
    }
};
