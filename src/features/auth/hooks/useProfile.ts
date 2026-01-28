import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserService } from '../services/user.service';
import { UserProfile } from '@/types/user';

export function useProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async () => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        try {
            let data = await UserService.getProfile(user.uid);
            if (!data) {
                data = await UserService.createProfile(user.uid, user.email || '');
            }
            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    return { profile, loading, refetch: loadProfile };
}

