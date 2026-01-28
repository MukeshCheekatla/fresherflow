import { db } from '@/lib/firebase/client';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, DocumentData, QueryConstraint } from 'firebase/firestore';
import { WalkinJob } from '@/types/walkin';

const COLLECTION = 'walkins';

export const WalkinsService = {
    async getAll(options: { orderByDate?: boolean } = {}) {
        if (!db) throw new Error('Firebase not initialized');
        const constraints: QueryConstraint[] = [];
        if (options.orderByDate) {
            constraints.push(orderBy('walkInDate', 'desc'));
        }

        const q = query(collection(db, COLLECTION), ...constraints);
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data() as WalkinJob
        }));
    },

    async getById(id: string) {
        if (!db) throw new Error('Firebase not initialized');
        const docRef = doc(db, COLLECTION, id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;
        return { id: snapshot.id, data: snapshot.data() as WalkinJob };
    },

    async create(walkin: Omit<WalkinJob, 'id'>) {
        if (!db) throw new Error('Firebase not initialized');
        return await addDoc(collection(db, COLLECTION), walkin);
    },

    async update(id: string, walkin: Partial<WalkinJob>) {
        if (!db) throw new Error('Firebase not initialized');
        const docRef = doc(db, COLLECTION, id);
        await updateDoc(docRef, walkin as DocumentData);
    },

    async delete(id: string) {
        if (!db) throw new Error('Firebase not initialized');
        const docRef = doc(db, COLLECTION, id);
        await deleteDoc(docRef);
    }
};
