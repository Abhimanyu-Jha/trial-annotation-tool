'use client';

import { useState, useMemo, useEffect } from 'react';
import { getTrialsWithStatus } from '@/lib/dummy-data';
import { TrialWithStatus } from '@/lib/types';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/data-table/columns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BarChart } from 'lucide-react';

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface TrialAPIResponse {
  trialId: string;
  videoUrl: string;
  transcriptUrl: string;
  hasAnalysis: boolean;
  analysisId: string;
  analysisTimestamp: string;
  issueCount: number;
}

export default function Dashboard() {
  const [trials, setTrials] = useState<TrialWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  // Fetch trials from API and merge with dummy data
  useEffect(() => {
    async function fetchTrials() {
      try {
        // Get dummy trials first
        const dummyTrials = getTrialsWithStatus();

        const response = await fetch('/api/trials');
        const data = await response.json();

        if (data.trials && data.trials.length > 0) {
          // Map API response to TrialWithStatus format
          const apiTrials: TrialWithStatus[] = data.trials.map((trial: TrialAPIResponse) => ({
            trialId: trial.trialId,
            videoUrl: trial.videoUrl,
            transcriptUrl: trial.transcriptUrl,
            studentId: trial.trialId, // Using trialId as placeholder
            studentName: trial.trialId.split('-')[0].charAt(0).toUpperCase() + trial.trialId.split('-')[0].slice(1),
            tutorId: 'tutor-001',
            tutorName: 'AI Analysis',
            grade: trial.trialId.includes('g1') ? 'Grade 1' :
                   trial.trialId.includes('g2') ? 'Grade 2' :
                   trial.trialId.includes('g3') ? 'Grade 3' :
                   trial.trialId.includes('g4') ? 'Grade 4' :
                   trial.trialId.includes('g5') ? 'Grade 5' :
                   trial.trialId.includes('g6') ? 'Grade 6' :
                   trial.trialId.includes('g7') ? 'Grade 7' :
                   trial.trialId.includes('g8') ? 'Grade 8' : 'Grade 3',
            trialDate: trial.analysisTimestamp,
            region: 'NAM' as const,
            channel: 'perf-meta' as const,
            duration: 3600, // Default 1 hour, could be extracted from video metadata
            trialVersion: 'v3.2' as const,
            annotationStatus: 'Annotated' as const,
            annotatorNames: ['AI (Gemini 2.5 Pro)'],
            lastModified: trial.analysisTimestamp,
            enrollmentStatus: 'not yet (<2w since trial)' as const,
          }));

          // Merge API trials with dummy trials (API trials first)
          setTrials([...apiTrials, ...dummyTrials]);
        } else {
          // No API trials, use only dummy data
          setTrials(dummyTrials);
        }
      } catch (error) {
        console.error('Error fetching trials:', error);
        // Fallback to dummy data on error
        setTrials(getTrialsWithStatus());
      } finally {
        setLoading(false);
      }
    }

    fetchTrials();
  }, []);

  const filteredTrials = useMemo(() => {
    if (!dateRange?.from) return trials;

    return trials.filter(trial => {
      const trialDate = new Date(trial.trialDate);
      const startDate = dateRange.from!;
      const endDate = dateRange.to || dateRange.from!;

      // Set time to start of day for comparison
      const trialDay = new Date(trialDate.getFullYear(), trialDate.getMonth(), trialDate.getDate());
      const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      return trialDay >= startDay && trialDay <= endDay;
    });
  }, [trials, dateRange]);


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold">Cuemath Trial Analysis Hub</h1>
              </div>
              <nav className="flex items-center gap-2">
                <Button variant="default" size="sm">
                  <BarChart className="h-4 w-4 mr-2" />
                  Trials Dashboard
                </Button>
                <Link href="/issues-dashboard">
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Issues Dashboard
                  </Button>
                </Link>
              </nav>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading trials...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={filteredTrials}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              config={{
                enableSearch: true,
                enableColumnFilters: true,
                enableRowSelection: false,
                enableColumnVisibility: true,
                enablePagination: true,
                searchPlaceholder: "Search by Student ID, Tutor ID, names...",
                size: 'default'
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}