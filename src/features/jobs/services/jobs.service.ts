import { db } from '@/lib/firebase/client';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, limit, DocumentData, QueryConstraint, where, documentId } from 'firebase/firestore';
import { OnlineJob } from '@/types/job';

const COLLECTION = 'jobs';

export const JobsService = {
    async getAll(options: { postedSince?: string; limitCount?: number } = {}) {
        if (!db) throw new Error('Firebase not initialized');
        const constraints: QueryConstraint[] = [orderBy('postedAt', 'desc')];
        if (options.postedSince) constraints.push(where('postedAt', '>', options.postedSince));
        if (options.limitCount) constraints.push(limit(options.limitCount));

        const q = query(collection(db, COLLECTION), ...constraints);
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data() as OnlineJob
        }));
    },

    async getById(id: string) {
        if (!db) throw new Error('Firebase not initialized');
        const docRef = doc(db, COLLECTION, id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;
        return { id: snapshot.id, data: snapshot.data() as OnlineJob };
    },

    async getByIds(ids: string[]) {
        if (!db) throw new Error('Firebase not initialized');
        if (ids.length === 0) return [];
        const batches = [];
        for (let i = 0; i < ids.length; i += 10) {
            const batchIds = ids.slice(i, i + 10);
            const q = query(
                collection(db, COLLECTION),
                where(documentId(), 'in', batchIds)
            );
            batches.push(getDocs(q));
        }
        const snapshots = await Promise.all(batches);
        return snapshots.flatMap(s => s.docs.map(doc => ({
            id: doc.id,
            data: doc.data() as OnlineJob
        })));
    },

    async create(job: Omit<OnlineJob, 'id'>) {
        if (!db) throw new Error('Firebase not initialized');
        return await addDoc(collection(db, COLLECTION), job);
    },

    async update(id: string, job: Partial<OnlineJob>) {
        if (!db) throw new Error('Firebase not initialized');
        const docRef = doc(db, COLLECTION, id);
        await updateDoc(docRef, job as DocumentData);
    },

    async delete(id: string) {
        if (!db) throw new Error('Firebase not initialized');
        const docRef = doc(db, COLLECTION, id);
        await deleteDoc(docRef);
    }
};
