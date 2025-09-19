'use client';

import { useState, useMemo } from 'react';
import { getTrialsWithStatus } from '@/lib/dummy-data';
import { TrialWithStatus } from '@/lib/types';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/data-table/columns';

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export default function Dashboard() {
  const [trials] = useState<TrialWithStatus[]>(getTrialsWithStatus());
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
            <div>
              <h1 className="text-2xl font-bold">Cuemath Trial Analysis Hub</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">

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
      </main>
    </div>
  );
}