'use client';

import { useState, useMemo } from 'react';
import { getTrialsWithIssues } from '@/lib/dummy-data';
import { TrialWithIssues } from '@/lib/types';
import { ThemeToggle } from '@/components/theme-toggle';
import { IssuesDataTable } from '@/components/data-table/issues-data-table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BarChart } from 'lucide-react';

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export default function IssuesDashboard() {
  const [trials] = useState<TrialWithIssues[]>(getTrialsWithIssues());
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

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
                <h1 className="text-2xl font-bold">Issues Dashboard</h1>
                <p className="text-muted-foreground">Track volume of issues identified in trials</p>
              </div>
              <nav className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <BarChart className="h-4 w-4 mr-2" />
                    Trials Dashboard
                  </Button>
                </Link>
                <Button variant="default" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Issues Dashboard
                </Button>
              </nav>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <IssuesDataTable
          data={filteredTrials}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </main>
    </div>
  );
}