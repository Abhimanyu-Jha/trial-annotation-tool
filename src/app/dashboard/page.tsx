'use client';

import { useState } from 'react';
import { getTrialsWithStatus } from '@/lib/dummy-data';
import { TrialWithStatus } from '@/lib/types';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/data-table/columns';

export default function Dashboard() {
  const [trials] = useState<TrialWithStatus[]>(getTrialsWithStatus());


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Video Trial Annotation Tool</h1>
              <p className="text-muted-foreground mt-1">Manage and annotate trial class videos</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Trial Videos ({trials.length})</h1>
          <p className="text-muted-foreground mt-1">
            Browse, filter, and annotate trial videos with Excel-like inline filters
          </p>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={trials}
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