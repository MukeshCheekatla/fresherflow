import { db } from '@/lib/firebase/client';
import { collection, doc, getDocs, addDoc, deleteDoc, query, where, orderBy, QueryConstraint } from 'firebase/firestore';
import { Alert } from '@/types/alert';

const COLLECTION = 'alerts';

export const AlertsService = {
    async getUserAlerts(userId: string) {
        if (!db) throw new Error('Firebase not initialized');
        // Note: client-side sorting is used currently to avoid index error
        const q = query(
            collection(db, COLLECTION),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data() as Alert
        })).sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());
    },

    async create(alert: Alert) {
        if (!db) throw new Error('Firebase not initialized');
        return await addDoc(collection(db, COLLECTION), alert);
    },

    async delete(id: string) {
        if (!db) throw new Error('Firebase not initialized');
        const docRef = doc(db, COLLECTION, id);
        await deleteDoc(docRef);
    }
};
