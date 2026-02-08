import { AuthResponse, Profile, Admin } from '@fresherflow/types';
import type {
    PublicKeyCredentialCreationOptionsJSON,
    RegistrationResponseJSON,
    PublicKeyCredentialRequestOptionsJSON,
    AuthenticationResponseJSON
} from '@simplewebauthn/browser';
import { markDetailSyncedNow, markFeedSyncedNow } from '@/lib/offline/syncStatus';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Singleton promise to handle concurrent refresh requests
let isRefreshing: Promise<void> | null = null;

// API Client with automatic cookie handling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiClient<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    // Defaults: credentials include for cookies
    const fetchOptions: RequestInit = {
        ...options,
        headers,
        credentials: 'include', // CRITICAL: This sends/receives cookies
        cache: 'no-store', // CRITICAL: Prevent caching of API responses
        next: { revalidate: 0 }
    };
    const requestUrl = `${API_URL}${endpoint}`;
    const method = (fetchOptions.method || 'GET').toUpperCase();
    const canRetry = method === 'GET';

    const fetchWithRetry = async () => {
        try {
            return await fetch(requestUrl, fetchOptions);
        } catch (error) {
            if (!canRetry) throw error;
            await new Promise((resolve) => setTimeout(resolve, 300));
            return await fetch(requestUrl, fetchOptions);
        }
    };

    try {
        let response = await fetchWithRetry();

        // If 401, handle token refresh with a singleton lock (mutex)
        const isLoggingOut = typeof window !== 'undefined' && (window as unknown as { __isLoggingOut?: boolean }).__isLoggingOut;

        if (response.status === 401 && !isLoggingOut &&
            !endpoint.includes('/auth/login') &&
            !endpoint.includes('/auth/register') &&
            !endpoint.includes('/auth/refresh')) {

            if (!isRefreshing) {
                isRefreshing = (async () => {
                    try {
                        const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include'
                        });

                        if (!refreshResponse.ok) {
                            throw new Error('Refresh failed');
                        }
                        // Refresh successful
                    } catch (error) {
                        console.error('[Auth] Refresh failed:', error);
                        // Let the error propagate to the waiting requests so they can throw proper 401
                        throw error;
                    } finally {
                        isRefreshing = null; // Release lock
                    }
                })();
            } else {
                // Refresh in progress, waiting
            }

            // Wait for the single refresh to complete (success or fail)
            try {
                await isRefreshing;
                // Retry original request
                // Retry original request
                response = await fetchWithRetry();
            } catch {
                console.error('[Auth] Refresh failed, session expired.');
                throw new Error('Session expired');
            }
        }

        if (!response.ok) {
            let errorMessage = 'Request failed';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let errorData: any = {};

            try {
                errorData = await response.json();
                errorMessage = errorData.error?.message || errorData.error || errorMessage;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (jsonError) {
                // Fallback if response is not JSON
                errorMessage = `System Error (${response.status})`;
            }

            // Special handling for 403 profile incomplete errors
            if (response.status === 403 && errorData.completionPercentage !== undefined) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const error: any = new Error(errorMessage);
                error.code = 'PROFILE_INCOMPLETE';
                error.completionPercentage = errorData.completionPercentage;
                error.requiredCompletion = errorData.requiredCompletion || 100;
                throw error;
            }

            throw new Error(errorMessage);
        }

        if (method === 'GET') {
            if (endpoint.startsWith('/api/opportunities') || endpoint.startsWith('/api/dashboard')) {
                markFeedSyncedNow();
            }
            if (/^\/api\/opportunities\/[^/?]+/.test(endpoint)) {
                markDetailSyncedNow();
            }
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API calls
export const authApi = {
    login: (email: string, password: string) =>
        apiClient<AuthResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),



    sendOtp: (email: string) =>
        apiClient('/api/auth/otp/send', {
            method: 'POST',
            body: JSON.stringify({ email })
        }),

    verifyOtp: (email: string, code: string, source?: string) =>
        apiClient<AuthResponse>('/api/auth/otp/verify', {
            method: 'POST',
            body: JSON.stringify({ email, code, source })
        }),

    googleLogin: (token: string, source?: string) =>
        apiClient<AuthResponse>('/api/auth/google', {
            method: 'POST',
            body: JSON.stringify({ token, source })
        }),

    logout: async () => {
        await apiClient('/api/auth/logout', {
            method: 'POST'
        });
    },

    me: () => apiClient('/api/auth/me')
};

// Admin Auth API calls
export const adminAuthApi = {
    getRegistrationOptions: (email: string) =>
        apiClient<PublicKeyCredentialCreationOptionsJSON>('/api/admin/auth/register/options', {
            method: 'POST',
            body: JSON.stringify({ email })
        }),

    verifyRegistration: (email: string, body: RegistrationResponseJSON) =>
        apiClient<{ verified: boolean }>('/api/admin/auth/register/verify', {
            method: 'POST',
            body: JSON.stringify({ email, body })
        }),

    getLoginOptions: (email: string) =>
        apiClient<PublicKeyCredentialRequestOptionsJSON | { registrationRequired: boolean }>('/api/admin/auth/login/options', {
            method: 'POST',
            body: JSON.stringify({ email })
        }),

    verifyLogin: (email: string, body: AuthenticationResponseJSON) =>
        apiClient<{ verified: boolean }>('/api/admin/auth/login/verify', {
            method: 'POST',
            body: JSON.stringify({ email, body })
        }),

    verifyLoginTotp: (email: string, code: string) =>
        apiClient<{ verified: boolean }>('/api/admin/auth/login/totp', {
            method: 'POST',
            body: JSON.stringify({ email, code })
        }),

    getPasskeys: () =>
        apiClient<{ keys: Array<{ id: string, name: string }> }>('/api/admin/auth/passkeys'),

    deletePasskey: (id: string) =>
        apiClient(`/api/admin/auth/passkeys/${id}`, {
            method: 'DELETE'
        }),

    logout: async () => {
        await apiClient('/api/admin/auth/logout', {
            method: 'POST'
        });
    },

    me: () => apiClient<{ admin: Admin }>('/api/admin/auth/me'),

    generateTotp: () =>
        apiClient<{ secret: string; qrCode: string }>('/api/admin/auth/totp/generate', {
            method: 'POST'
        }),

    verifyTotp: (code: string) =>
        apiClient<{ success: boolean }>('/api/admin/auth/totp/verify', {
            method: 'POST',
            body: JSON.stringify({ code })
        }),

    disableTotp: () =>
        apiClient<{ success: boolean }>('/api/admin/auth/totp/disable', {
            method: 'POST'
        })
};

// Profile API calls
export const profileApi = {
    get: () => apiClient('/api/profile'),

    updateProfile: (data: Partial<Profile> & { fullName?: string }) =>
        apiClient('/api/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    updateEducation: (data: {
        fullName?: string;
        educationLevel: string;
        tenthYear: number;
        twelfthYear: number;
        gradCourse: string;
        gradSpecialization: string;
        gradYear: number;
        // Optional PG fields
        pgCourse?: string;
        pgSpecialization?: string;
        pgYear?: number;
    }) =>
        apiClient('/api/profile/education', {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    updatePreferences: (data: {
        interestedIn: string[];
        preferredCities: string[];
        workModes: string[];
    }) =>
        apiClient('/api/profile/preferences', {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    updateReadiness: (data: { availability: string; skills: string[] }) =>
        apiClient('/api/profile/readiness', {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    getCompletion: () => apiClient('/api/profile/completion')
};

export const growthApi = {
    trackEvent: (event: 'DETAIL_VIEW' | 'LOGIN_VIEW', source = 'unknown') =>
        apiClient('/api/public/growth/event', {
            method: 'POST',
            body: JSON.stringify({ event, source })
        })
};

// Opportunities API calls
export const opportunitiesApi = {
    list: (params?: { type?: string; city?: string; closingSoon?: boolean }) => {
        const query = new URLSearchParams();
        if (params?.type) query.append('type', params.type);
        if (params?.city) query.append('city', params.city);
        if (params?.closingSoon) query.append('closingSoon', 'true');

        const queryString = query.toString();
        return apiClient(`/api/opportunities${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id: string) => apiClient(`/api/opportunities/${id}`)
};

// Actions API calls
export const actionsApi = {
    list: () => apiClient('/api/actions'),
    summary: () => apiClient('/api/actions/summary'),

    track: (opportunityId: string, actionType: string) =>
        apiClient(`/api/actions/${opportunityId}/action`, {
            method: 'POST',
            body: JSON.stringify({ actionType })
        })
};

// Feedback API calls
export const feedbackApi = {
    submit: (opportunityId: string, reason: string) =>
        apiClient(`/api/opportunities/${opportunityId}/feedback`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        })
};

// Saved API calls
export const savedApi = {
    list: () => apiClient('/api/saved'),
    toggle: (opportunityId: string) =>
        apiClient(`/api/saved/${opportunityId}`, {
            method: 'POST'
        })
};

// Dashboard API calls
export const dashboardApi = {
    getHighlights: () => apiClient('/api/dashboard/highlights')
};

// Alerts API calls
export const alertsApi = {
    getPreferences: () => apiClient('/api/alerts/preferences'),
    getFeed: (kind: 'all' | 'DAILY_DIGEST' | 'CLOSING_SOON' = 'all', limit = 50) => {
        const query = new URLSearchParams();
        query.set('kind', kind);
        query.set('limit', String(limit));
        return apiClient(`/api/alerts/feed?${query.toString()}`);
    },
    updatePreferences: (data: {
        enabled?: boolean;
        emailEnabled?: boolean;
        dailyDigest?: boolean;
        closingSoon?: boolean;
        minRelevanceScore?: number;
        preferredHour?: number;
        timezone?: string;
    }) =>
        apiClient('/api/alerts/preferences', {
            method: 'PUT',
            body: JSON.stringify(data)
        })
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setTokens = (_a: string, _b: string) => { }; // Deprecated: No-op
export const getTokens = () => ({ accessToken: null, refreshToken: null }); // Deprecated: No-op
export const clearTokens = () => { }; // Deprecated: No-op
