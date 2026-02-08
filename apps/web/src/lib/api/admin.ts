import { apiClient } from './client';

// Admin API methods using the centralized client (cookie-based auth)
export const adminApi = {
    // Summary stats
    getOpportunitiesSummary: () =>
        apiClient('/api/admin/opportunities/summary'),

    // Create new opportunity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createOpportunity: (data: any) =>
        apiClient('/api/admin/opportunities', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    // Get all opportunities (with filters)
    getOpportunities: (filters?: { type?: string; status?: string; limit?: number; offset?: number; q?: string; sort?: string }) => {
        const query = new URLSearchParams();
        if (filters?.type) query.append('type', filters.type);
        if (filters?.status) query.append('status', filters.status);
        if (filters?.limit !== undefined) query.append('limit', String(filters.limit));
        if (filters?.offset !== undefined) query.append('offset', String(filters.offset));
        if (filters?.q) query.append('q', filters.q);
        if (filters?.sort) query.append('sort', filters.sort);

        const queryString = query.toString();
        return apiClient(`/api/admin/opportunities${queryString ? `?${queryString}` : ''}`);
    },

    // Get single opportunity
    getOpportunity: (id: string) =>
        apiClient(`/api/admin/opportunities/${id}`),

    // Update opportunity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateOpportunity: (id: string, data: any) =>
        apiClient(`/api/admin/opportunities/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    // Expire opportunity
    expireOpportunity: (id: string) =>
        apiClient(`/api/admin/opportunities/${id}/expire`, {
            method: 'POST'
        }),

    // Delete opportunity
    deleteOpportunity: (id: string, reason?: string) =>
        apiClient(`/api/admin/opportunities/${id}`, {
            method: 'DELETE',
            body: JSON.stringify({ reason: reason || 'Deleted by admin' })
        }),

    // Get all feedback
    getFeedback: () =>
        apiClient('/api/admin/feedback'),

    // System observability metrics
    getSystemMetrics: () =>
        apiClient('/api/admin/system/metrics'),

    // Parse job description text
    parseJobText: (text: string) =>
        apiClient('/api/admin/opportunities/parse', {
            method: 'POST',
            body: JSON.stringify({ text })
        }),

    // Bulk actions
    bulkAction: (ids: string[], action: 'DELETE' | 'ARCHIVE' | 'PUBLISH' | 'EXPIRE', reason?: string) =>
        apiClient('/api/admin/opportunities/bulk', {
            method: 'POST',
            body: JSON.stringify({ ids, action, reason })
        })
};
