import { AuthResponse, ApiError, Profile } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
    accessToken = access;
    refreshToken = refresh;

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
    }
}

export function getTokens() {
    if (typeof window !== 'undefined') {
        return {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken')
        };
    }
    return { accessToken: null, refreshToken: null };
}

export function clearTokens() {
    accessToken = null;
    refreshToken = null;

    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
}

// Refresh access token
async function refreshAccessToken(): Promise<string | null> {
    const tokens = getTokens();

    if (!tokens.refreshToken) {
        clearTokens();
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: tokens.refreshToken })
        });

        if (!response.ok) {
            // Only clear tokens if the refresh token is definitely invalid (400, 401, 403)
            // If it's a 500 or network error, we don't clear tokens, just return null so the request fails
            if (response.status === 400 || response.status === 401 || response.status === 403) {
                clearTokens();
            }
            return null;
        }

        const data = await response.json();
        accessToken = data.accessToken;

        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.accessToken);
        }

        return data.accessToken;
    } catch (error) {
        clearTokens();
        return null;
    }
}

// API Client with automatic token injection and refresh
export async function apiClient<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const tokens = getTokens();

    // Inject access token if available
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (tokens.accessToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    }

    try {
        let response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        // If 401 and we have a refresh token, try to refresh
        if (response.status === 401 && tokens.refreshToken && !endpoint.includes('/auth/refresh')) {
            const newAccessToken = await refreshAccessToken();

            if (newAccessToken) {
                // Retry with new token
                headers['Authorization'] = `Bearer ${newAccessToken}`;
                response = await fetch(`${API_URL}${endpoint}`, {
                    ...options,
                    headers
                });
            } else {
                // Refresh failed, redirect to login
                clearTokens();
                if (typeof window !== 'undefined' &&
                    !window.location.pathname.startsWith('/login') &&
                    !window.location.pathname.startsWith('/register')) {
                    window.location.href = '/login';
                }
                throw new Error('Session expired. Please login again.');
            }
        }

        if (!response.ok) {
            let errorMessage = 'Request failed';
            try {
                const errorData: ApiError = await response.json();
                errorMessage = errorData.error?.message || errorMessage;
            } catch (jsonError) {
                // Fallback if response is not JSON
                errorMessage = `System Error (${response.status})`;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API calls
export const authApi = {
    register: (email: string, password: string, fullName: string) =>
        apiClient<AuthResponse>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, fullName })
        }),

    login: (email: string, password: string) =>
        apiClient<AuthResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),

    logout: async () => {
        const tokens = getTokens();
        if (tokens.refreshToken) {
            await apiClient('/api/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ refreshToken: tokens.refreshToken })
            });
        }
        clearTokens();
    },

    me: () => apiClient('/api/auth/me')
};

// Profile API calls
export const profileApi = {
    get: () => apiClient('/api/profile'),

    updateProfile: (data: Partial<Profile>) =>
        apiClient('/api/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    updateEducation: (data: {
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
