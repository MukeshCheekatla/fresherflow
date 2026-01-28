'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Alert, OnlineJob } from '@/lib/types';

export function useAlertMatcher() {
    const { user, profile } = useAuth();
    const [matches, setMatches] = useState<{ id: string; data: OnlineJob }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && db) {
            checkNewJobs();
        }
    }, [user]);

    const checkNewJobs = async () => {
        if (!user || !db) return;

        try {
            setLoading(true);

            // Get last visit timestamp or default to last 24h
            const lastVisitStr = window.localStorage.getItem('lastJobVisit');
            const lastVisit = lastVisitStr ? new Date(lastVisitStr) : new Date(Date.now() - 24 * 60 * 60 * 1000);

            // Fetch user alerts
            const alertsQ = query(collection(db, 'alerts'), where('userId', '==', user.uid));
            const alertsSnap = await getDocs(alertsQ);
            const alerts = alertsSnap.docs.map(doc => doc.data() as Alert);

            if (alerts.length === 0) {
                setLoading(false);
                return;
            }

            // Fetch new jobs since last visit (limit to 20 for safety)
            const jobsQ = query(
                collection(db, 'jobs'),
                where('postedAt', '>', lastVisit.toISOString()),
                orderBy('postedAt', 'desc'),
                limit(20)
            );
            const jobsSnap = await getDocs(jobsQ);
            const newJobs = jobsSnap.docs.map(doc => ({
                id: doc.id,
                data: doc.data() as OnlineJob
            }));

            // Match jobs against alerts
            const matchedJobs = newJobs.filter(job => {
                const jobData = job.data;
                return alerts.some(alert => {
                    const { roles, locations, minSalary, workType } = alert.conditions;

                    const roleMatch = roles && roles.length > 0
                        ? roles.some(r => jobData.normalizedRole.toLowerCase().includes(r.toLowerCase()))
                        : true;

                    const locMatch = locations && locations.length > 0
                        ? locations.some(l => jobData.locations.some(jl => jl.toLowerCase().includes(l.toLowerCase())))
                        : true;

                    const salaryMatch = minSalary
                        ? (jobData.salary?.min || 0) >= minSalary
                        : true;

                    const workMatch = workType && workType.length > 0
                        ? workType.includes(jobData.workType)
                        : true;

                    return roleMatch && locMatch && salaryMatch && workMatch;
                });
            });

            setMatches(matchedJobs);

            // Update last visit timestamp
            window.localStorage.setItem('lastJobVisit', new Date().toISOString());

        } catch (error) {
            console.error('Error matching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    return { matches, loading };
}
