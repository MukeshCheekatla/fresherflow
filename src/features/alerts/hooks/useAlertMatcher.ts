'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AlertsService } from '@/features/alerts/services/alerts.service';
import { JobsService } from '@/features/jobs/services/jobs.service';
import { OnlineJob } from '@/types/job';

export function useAlertMatcher() {
    const { user } = useAuth();
    const [matches, setMatches] = useState<{ id: string; data: OnlineJob }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            checkNewJobs();
        }
    }, [user]);

    const checkNewJobs = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Get last visit timestamp or default to last 24h
            const lastVisitStr = window.localStorage.getItem('lastJobVisit');
            const lastVisit = lastVisitStr ? new Date(lastVisitStr) : new Date(Date.now() - 24 * 60 * 60 * 1000);

            // Fetch user alerts
            // Alert service returns { id, data: Alert }[]
            const alertsWithId = await AlertsService.getUserAlerts(user.uid);
            const alerts = alertsWithId.map(a => a.data);

            if (alerts.length === 0) {
                setLoading(false);
                return;
            }

            // Fetch new jobs since last visit (limit to 20 for safety)
            // Use JobsService
            const newJobs = await JobsService.getAll({
                postedSince: lastVisit.toISOString(),
                limitCount: 20
            });

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
