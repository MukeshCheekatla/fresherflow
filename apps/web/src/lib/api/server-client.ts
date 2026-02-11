import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function serverApiClient<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        ...(options.headers as Record<string, string> || {}),
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            cache: 'no-store',
        });

        if (!response.ok) {
            let errorMessage = 'Request failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error?.message || errorData.error || errorMessage;
            } catch {
                if (response.status === 429) {
                    errorMessage = 'Too many requests. Please wait a moment and try again.';
                } else if (response.status >= 500) {
                    errorMessage = 'Server is temporarily unavailable. Please try again.';
                } else {
                    errorMessage = `Request failed (${response.status})`;
                }
            }
            throw new Error(errorMessage);
        }

        // Handle 204 No Content or empty responses
        const text = await response.text();
        return (text ? JSON.parse(text) : null) as T;
    } catch (error) {
        console.error(`mServer API Error (${endpoint}):`, error);
        throw error;
    }
}
