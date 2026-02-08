export type SharePlatform = 'instagram' | 'linkedin' | 'x' | 'telegram' | 'facebook' | 'other';

type ShareLinkOptions = {
    platform?: SharePlatform;
    source?: string;
    medium?: string;
    campaign?: string;
    ref?: string;
};

const PLATFORM_MEDIUM: Record<SharePlatform, string> = {
    instagram: 'bio',
    linkedin: 'post',
    x: 'post',
    telegram: 'channel',
    facebook: 'post',
    other: 'share',
};

export function buildShareUrl(rawUrl: string, options: ShareLinkOptions = {}) {
    try {
        const url = new URL(rawUrl);
        const platform = options.platform || 'other';

        url.searchParams.set('ref', options.ref || 'share');
        url.searchParams.set('source', options.source || 'opportunity_share');
        url.searchParams.set('utm_source', platform === 'other' ? 'fresherflow' : platform);
        url.searchParams.set('utm_medium', options.medium || PLATFORM_MEDIUM[platform]);
        url.searchParams.set('utm_campaign', options.campaign || 'opportunity_share');

        return url.toString();
    } catch {
        return rawUrl;
    }
}

