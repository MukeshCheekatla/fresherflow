'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { OnlineJob, UserIntent } from '@/types';
import TopNav from '@/shared/components/navigation/TopNav';
import IntentSelector from '@/features/jobs/components/IntentSelector';
import JobCard from '@/features/jobs/components/JobCard';
import { useRouter } from 'next/navigation';

import { useAlertMatcher } from '@/features/alerts/hooks/useAlertMatcher';
import Link from 'next/link';
import JobFilters, { FilterState } from '@/features/jobs/components/JobFilters';

export default function Home() {
  const [allJobs, setAllJobs] = useState<{ id: string; data: OnlineJob }[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<{ id: string; data: OnlineJob }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntent, setSelectedIntent] = useState<UserIntent>();
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    experience: 0,
    workTypes: [],
    locations: [],
  });

  const router = useRouter();
  const { matches: alertMatches } = useAlertMatcher();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activeFilters, allJobs]);

  const fetchJobs = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, 'jobs'),
        orderBy('postedAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data() as OnlineJob,
      }));

      setAllJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...allJobs];

    // Experience Filter
    if (activeFilters.experience > 0) {
      results = results.filter(job => job.data.experienceRange.min <= activeFilters.experience);
    }

    // Work Type Filter
    if (activeFilters.workTypes.length > 0) {
      results = results.filter(job => activeFilters.workTypes.includes(job.data.workType));
    }

    // Location Filter
    if (activeFilters.locations.length > 0) {
      results = results.filter(job =>
        activeFilters.locations.some(loc =>
          job.data.locations.some(jl => jl.toLowerCase().includes(loc.toLowerCase()))
        )
      );
    }

    setFilteredJobs(results);
  };

  const handleIntentSelect = (intent: UserIntent) => {
    setSelectedIntent(intent);
  };

  const handleJobClick = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left Sidebar: Filters */}
          <div className="hidden md:block">
            <JobFilters onFilterChange={setActiveFilters} />
          </div>

          {/* Main Content: Jobs List */}
          <div className="md:col-span-3">
            {/* Alert Notification */}
            {alertMatches.length > 0 && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm sm:text-base">New matches found!</p>
                    <p className="text-xs sm:text-sm text-primary/80">We found {alertMatches.length} new roles matching your alerts.</p>
                  </div>
                </div>
                <Link
                  href="/alerts"
                  className="px-4 py-2 bg-primary text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-dark transition-colors whitespace-nowrap ml-4"
                >
                  View All
                </Link>
              </div>
            )}

            <div className="md:hidden mb-6">
              <button className="w-full py-3 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 shadow-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filters
              </button>
            </div>

            {/* Intent Selector: Online Jobs Only */}
            <IntentSelector
              onSelectIntent={handleIntentSelect}
              selectedIntent={selectedIntent}
            />

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">
                {loading ? 'Finding' : filteredJobs.length} opportunities
                {selectedIntent && <span className="text-primary ml-1">for {selectedIntent.replace(/-/g, ' ')}</span>}
              </h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-white rounded-xl border border-neutral-200 animate-pulse" />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 px-8">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">No jobs match your filters</h3>
                <p className="text-neutral-500 max-w-xs mx-auto mb-6">Try adjusting your filters to see more opportunities.</p>
                <button
                  onClick={() => setActiveFilters({ experience: 0, workTypes: [], locations: [] })}
                  className="text-primary font-bold hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job.data}
                    jobId={job.id}
                    onClick={() => handleJobClick(job.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
