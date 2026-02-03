import { AuthResponse, Profile } from '@fresherflow/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// API Client with automatic cookie handling
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
        credentials: 'include' // CRITICAL: This sends/receives cookies
    };

    try {
        let response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

        // If 401, trying to auto-refresh is handled by the browser sending the refresh cookie to the /refresh endpoint.
        // But we need to CALL that endpoint.
        if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register') && !endpoint.includes('/auth/refresh')) {
            // Attempt refresh
            try {
                const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include' // Validate refresh cookie
                });

                if (refreshResponse.ok) {
                    // Refresh succeeded (new access cookie set)
                    // Retry original request
                    response = await fetch(`${API_URL}${endpoint}`, fetchOptions);
                } else {
                    // Refresh failed (refresh cookie expired or invalid)
                    // Throw 401 to let caller handle redirect/logout
                }
            } catch (e) {
                // Network error on refresh, throw original error or new one
            }
        }

        if (!response.ok) {
            let errorMessage = 'Request failed';
            let errorData: any = {};

            try {
                errorData = await response.json();
                errorMessage = errorData.error?.message || errorData.error || errorMessage;
            } catch (jsonError) {
                // Fallback if response is not JSON
                errorMessage = `System Error (${response.status})`;
            }

            // Special handling for 403 profile incomplete errors
            if (response.status === 403 && errorData.completionPercentage !== undefined) {
                const error: any = new Error(errorMessage);
                error.code = 'PROFILE_INCOMPLETE';
                error.completionPercentage = errorData.completionPercentage;
                error.requiredCompletion = errorData.requiredCompletion || 100;
                throw error;
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
        await apiClient('/api/auth/logout', {
            method: 'POST'
        });
        // reload or clear state handled by context
    },

    me: () => apiClient('/api/auth/me')
};

// Admin Auth API calls
export const adminAuthApi = {
    login: (email: string, password: string) =>
        apiClient<{ admin: any }>('/api/admin/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),

    logout: async () => {
        await apiClient('/api/admin/auth/logout', {
            method: 'POST'
        });
    },

    me: () => apiClient<{ admin: any }>('/api/admin/auth/me')
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

export const setTokens = (a: any, b: any) => { }; // Deprecated: No-op
export const getTokens = () => ({ accessToken: null, refreshToken: null }); // Deprecated: No-op
export const clearTokens = () => { }; // Deprecated: No-op
