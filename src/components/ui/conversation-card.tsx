"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrialWithStatus } from "@/lib/types";
import { UsersIcon, CheckCircle, Clock, XCircle, Calendar, Search, Filter } from "lucide-react";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface ConversationCardProps {
  trials: TrialWithStatus[];
  isFiltered?: boolean;
  searchTerm?: string;
  dateRange?: DateRange | null;
  columnFilters?: Array<{ id: string; value: unknown }>;
}

export function ConversationCard({
  trials,
  isFiltered = false,
  searchTerm,
  dateRange,
  columnFilters = []
}: ConversationCardProps) {
  const totalTrials = trials.length;

  const enrollmentStats = trials.reduce(
    (acc, trial) => {
      switch (trial.enrollmentStatus) {
        case 'yes':
          acc.enrolled++;
          break;
        case 'not yet (<2w since trial)':
          acc.notYet++;
          break;
        case 'no (>2w since trial)':
          acc.notEnrolled++;
          break;
      }
      return acc;
    },
    { enrolled: 0, notYet: 0, notEnrolled: 0 }
  );

  const enrollmentRate = totalTrials > 0 ? ((enrollmentStats.enrolled / totalTrials) * 100).toFixed(1) : '0';

  const formatDateRange = (range: DateRange) => {
    if (!range.from) return '';
    const fromDate = range.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const toDate = range.to ? range.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : fromDate;
    return range.to ? `${fromDate} - ${toDate}` : fromDate;
  };

  const getOldestTrialDate = () => {
    if (trials.length === 0) return null;
    const oldestTrial = trials.reduce((oldest, trial) =>
      new Date(trial.trialDate) < new Date(oldest.trialDate) ? trial : oldest
    );
    return new Date(oldestTrial.trialDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date(oldestTrial.trialDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const shouldShowSinceDate = !dateRange?.from && trials.length > 0;

  const activeFilters = [];
  if (searchTerm) {
    activeFilters.push({ type: 'search', value: searchTerm, icon: Search });
  }
  if (dateRange?.from) {
    activeFilters.push({ type: 'date', value: formatDateRange(dateRange), icon: Calendar });
  }
  columnFilters.forEach(filter => {
    if (filter.value &&
        ((Array.isArray(filter.value) && filter.value.length > 0) ||
         (typeof filter.value === 'string' && filter.value.trim() !== '') ||
         (typeof filter.value === 'number') ||
         (typeof filter.value === 'boolean'))) {
      activeFilters.push({
        type: 'column',
        value: `${filter.id}: ${Array.isArray(filter.value) ? filter.value.join(', ') : String(filter.value)}`,
        icon: Filter
      });
    }
  });

  return (
    <Card className="w-full gap-4">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Trial Enrollment Overview
            {isFiltered && (
              <Badge variant="secondary" className="text-xs">
                {activeFilters.length} Filter{activeFilters.length !== 1 ? 's' : ''} Applied
              </Badge>
            )}
          </div>
          {shouldShowSinceDate && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>since {getOldestTrialDate()}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Applied Filters */}
        {activeFilters.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Applied Filters</h4>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => {
                const IconComponent = filter.icon;
                return (
                  <Badge key={index} variant="outline" className="text-xs">
                    <IconComponent className="h-3 w-3 mr-1" />
                    {filter.value}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-5 gap-6">
          {/* Total Trials */}
          <div className="text-center">
            <div className="text-2xl font-bold">{totalTrials}</div>
            <div className="text-xs text-muted-foreground">Total Trials</div>
          </div>

          {/* Enrollment Rate */}
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{enrollmentRate}%</div>
            <div className="text-xs text-muted-foreground">Enrollment Rate</div>
          </div>

          {/* Enrolled */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xl font-bold">{enrollmentStats.enrolled}</span>
            </div>
            <div className="text-xs text-muted-foreground">Enrolled</div>
          </div>

          {/* Not Yet */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-xl font-bold">{enrollmentStats.notYet}</span>
            </div>
            <div className="text-xs text-muted-foreground">Not Yet</div>
          </div>

          {/* Not Enrolled */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-xl font-bold">{enrollmentStats.notEnrolled}</span>
            </div>
            <div className="text-xs text-muted-foreground">Not Enrolled</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}