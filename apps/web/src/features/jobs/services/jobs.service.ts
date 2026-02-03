// Jobs Service - Uses Backend API

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
}

export const JobsService = {
    async create(jobData: any) {
        const token = getToken();
        const response = await fetch(`${API_BASE}/api/admin/opportunities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify({
                ...jobData,
                type: 'JOB'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to create job');
        }

        return response.json();
    },

    async getAll() {
        const token = getToken();
        const response = await fetch(`${API_BASE}/api/admin/opportunities?type=JOB`, {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();
        return data.opportunities || [];
    },

    async getById(id: string) {
        const token = getToken();
        const response = await fetch(`${API_BASE}/api/opportunities/${id}`, {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch job');
        }
        return response.json();
    },

    async update(id: string, jobData: any) {
        const token = getToken();
        const response = await fetch(`${API_BASE}/api/admin/opportunities/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify({
                ...jobData,
                type: 'JOB'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to update job');
        }

        return response.json();
    },

    async delete(id: string) {
        const token = getToken();
        const response = await fetch(`${API_BASE}/api/admin/opportunities/${id}?reason=Admin deletion`, {
            method: 'DELETE',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to delete job');
        }

        return response.json();
    }
};

