import { AdminProvider } from '@/contexts/AdminContext';

// Extend API client with admin methods
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const adminApi = {
    // Create new opportunity
    createOpportunity: async (token: string, data: any) => {
        const response = await fetch(`${API_URL}/api/admin/opportunities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to create opportunity');
        }
        return await response.json();
    },

    // Get all opportunities (with filters)
    getOpportunities: async (token: string, filters?: { type?: string; status?: string }) => {
        const query = new URLSearchParams();
        if (filters?.type) query.append('type', filters.type);
        if (filters?.status) query.append('status', filters.status);

        const response = await fetch(`${API_URL}/api/admin/opportunities?${query.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch opportunities');
        return await response.json();
    },

    // Get single opportunity
    getOpportunity: async (token: string, id: string) => {
        const response = await fetch(`${API_URL}/api/admin/opportunities/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch opportunity');
        return await response.json();
    },

    // Update opportunity
    updateOpportunity: async (token: string, id: string, data: any) => {
        const response = await fetch(`${API_URL}/api/admin/opportunities/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to update opportunity');
        }
        return await response.json();
    },

    // Expire opportunity
    expireOpportunity: async (token: string, id: string) => {
        const response = await fetch(`${API_URL}/api/admin/opportunities/${id}/expire`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to expire opportunity');
        return await response.json();
    },

    // Delete opportunity
    deleteOpportunity: async (token: string, id: string, reason?: string) => {
        const response = await fetch(`${API_URL}/api/admin/opportunities/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason: reason || 'Deleted by admin' })
        });

        if (!response.ok) throw new Error('Failed to delete opportunity');
        return await response.json();
    },

    // Get all feedback
    getFeedback: async (token: string) => {
        const response = await fetch(`${API_URL}/api/admin/feedback`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch feedback');
        return await response.json();
    }
};
