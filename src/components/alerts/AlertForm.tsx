'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

interface AlertFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const WORK_TYPES = [
    { id: 'remote', label: 'Remote' },
    { id: 'hybrid', label: 'Hybrid' },
    { id: 'onsite', label: 'On-site' },
];

export default function AlertForm({ onSuccess, onCancel }: AlertFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        roles: '',
        locations: '',
        minSalary: '',
        workType: [] as string[],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !db) return;

        setLoading(true);
        try {
            const alertData = {
                userId: user.uid,
                conditions: {
                    roles: formData.roles.split(',').map(r => r.trim()).filter(Boolean),
                    locations: formData.locations.split(',').map(l => l.trim()).filter(Boolean),
                    minSalary: formData.minSalary ? parseInt(formData.minSalary) : null,
                    workType: formData.workType,
                },
                delivery: ['email'] as const,
                isTemporary: false,
                createdAt: new Date().toISOString(),
            };

            await addDoc(collection(db, 'alerts'), alertData);
            onSuccess();
        } catch (error) {
            console.error('Error creating alert:', error);
            alert('Failed to create alert');
        } finally {
            setLoading(false);
        }
    };

    const toggleWorkType = (id: string) => {
        setFormData(prev => ({
            ...prev,
            workType: prev.workType.includes(id)
                ? prev.workType.filter(type => type !== id)
                : [...prev.workType, id]
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Roles (e.g., Frontend, Backend)
                </label>
                <input
                    type="text"
                    value={formData.roles}
                    onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                    placeholder="Comma separated roles"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Preferred Locations
                </label>
                <input
                    type="text"
                    value={formData.locations}
                    onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                    placeholder="Comma separated cities"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                        Min Salary (Annual)
                    </label>
                    <input
                        type="number"
                        value={formData.minSalary}
                        onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                        placeholder="e.g. 1500000"
                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-900 mb-4">
                    Work Type
                </label>
                <div className="flex flex-wrap gap-2">
                    {WORK_TYPES.map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => toggleWorkType(type.id)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                                formData.workType.includes(type.id)
                                    ? "bg-primary border-primary text-white"
                                    : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                            )}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create Alert'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-neutral-100 text-neutral-900 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
