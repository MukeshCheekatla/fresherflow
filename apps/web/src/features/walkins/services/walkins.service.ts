// Walkins Service - Uses Backend API

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
}

export const WalkinsService = {
    async create(walkinData: any) {
        const token = getToken();
        const response = await fetch(`${API_BASE}/api/admin/opportunities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify({
                ...walkinData,
                type: 'WALKIN'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to create walk-in');
        }

        return response.json();
    },

    async getAll() {
        const token = getToken();
        const response = await fetch(`${API_BASE}/api/admin/opportunities?type=WALKIN`, {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch walk-ins');
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
            throw new Error('Failed to fetch walk-in');
        }
        return response.json();
    },

    async update(id: string, walkinData: any) {
        const token = getToken();
        const response = await fetch(`${API_BASE}/api/admin/opportunities/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify({
                ...walkinData,
                type: 'WALKIN'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to update walk-in');
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
            throw new Error(error.error?.message || 'Failed to delete walk-in');
        }

        return response.json();
    }
};

