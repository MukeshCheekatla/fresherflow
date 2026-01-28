'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserProfile {
    email: string;
    savedJobs: string[];
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    loginWithGoogle: () => Promise<import('firebase/auth').UserCredential>;
    loginWithEmail: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    toggleSaveJob: (jobId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                await fetchOrCreateProfile(user);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        // Handle Email Link Sign-in
        if (isSignInWithEmailLink(auth, window.location.href)) {
            handleEmailSignIn();
        }

        return () => unsubscribe();
    }, []);

    const fetchOrCreateProfile = async (user: User) => {
        if (!db) return;
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
        } else {
            const newProfile: UserProfile = {
                email: user.email || '',
                savedJobs: [],
                createdAt: new Date().toISOString(),
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
        }
    };

    const toggleSaveJob = async (jobId: string) => {
        if (!user || !profile || !db) return;

        const isSaved = profile.savedJobs.includes(jobId);
        const updatedSavedJobs = isSaved
            ? profile.savedJobs.filter(id => id !== jobId)
            : [...profile.savedJobs, jobId];

        const updatedProfile = { ...profile, savedJobs: updatedSavedJobs };
        setProfile(updatedProfile);

        try {
            await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
        } catch (error) {
            console.error('Error updating saved jobs:', error);
            // Revert local state on error
            setProfile(profile);
        }
    };

    const handleEmailSignIn = async () => {
        if (!auth) return;
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }
        if (email) {
            try {
                await signInWithEmailLink(auth, email, window.location.href);
                window.localStorage.removeItem('emailForSignIn');
            } catch (error) {
                console.error('Error signing in with email link:', error);
            }
        }
    };

    const loginWithGoogle = async () => {
        if (!auth) throw new Error('Auth not initialized');
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
    };

    const loginWithEmail = async (email: string) => {
        if (!auth) return;
        const actionCodeSettings = {
            url: window.location.origin + '/account',
            handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
    };

    const logout = async () => {
        if (!auth) return;
        await signOut(auth);
    };

    const isAdmin = !!(user && process.env.NEXT_PUBLIC_ADMIN_UIDS?.split(',').includes(user.uid));

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAdmin, loginWithGoogle, loginWithEmail, logout, toggleSaveJob }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
