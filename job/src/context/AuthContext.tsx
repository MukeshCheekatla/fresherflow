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
import { auth } from '@/lib/firebase/client';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    loginWithGoogle: () => Promise<import('firebase/auth').UserCredential>;
    loginWithEmail: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setLoading(false);
        });

        // Handle Email Link Sign-in
        if (isSignInWithEmailLink(auth, window.location.href)) {
            handleEmailSignIn();
        }

        return () => unsubscribe();
    }, []);

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
        <AuthContext.Provider value={{
            user,
            loading,
            isAdmin,
            isAuthenticated: !!user,
            loginWithGoogle,
            loginWithEmail,
            logout
        }}>
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
