import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { UserProfile } from '@/types/user';

const COLLECTION = 'users';

export const UserService = {
    async getProfile(uid: string) {
        if (!db) throw new Error('Firebase not initialized');
        const docRef = doc(db, COLLECTION, uid);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;
        return snapshot.data() as UserProfile;
    },

    async createProfile(uid: string, email: string) {
        if (!db) throw new Error('Firebase not initialized');
        const docRef = doc(db, COLLECTION, uid);
        const newProfile: UserProfile = {
            email,
            savedJobs: [],
            createdAt: new Date().toISOString(),
        };
        await setDoc(docRef, newProfile);
        return newProfile;
    },

    async toggleSavedJob(uid: string, jobId: string, isSaved: boolean) {
        if (!db) throw new Error('Firebase not initialized');
        const docRef = doc(db, COLLECTION, uid);
        await updateDoc(docRef, {
            savedJobs: isSaved ? arrayRemove(jobId) : arrayUnion(jobId)
        });
    }
};
