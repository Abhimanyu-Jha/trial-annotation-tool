"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrialWithStatus } from "@/lib/types";
import { UsersIcon, Calendar, Search, Filter } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, type PieLabelRenderProps } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

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

type BreakdownType = 'none' | 'grade' | 'region' | 'channel' | 'trialVersion' | 'enrollment';

export function ConversationCard({
  trials,
  isFiltered: _isFiltered = false,
  searchTerm,
  dateRange,
  columnFilters = []
}: ConversationCardProps) {
  const [breakdownBy, setBreakdownBy] = useState<BreakdownType>('enrollment');
  const totalTrials = trials.length;



  // Custom label renderer
  const renderLabel = (props: PieLabelRenderProps) => {
    const value = props.value as number;
    if (value === 0) return '';

    const percentage = totalTrials > 0 ? Math.round((value / totalTrials) * 100) : 0;
    return `${value} (${percentage}%)`;
  };

  // Get chart data for color key
  const chartData = breakdownBy === 'none' ? [
    { name: 'Total', color: '#3b82f6' }
  ] : (() => {
    const breakdown: { [key: string]: number } = {};
    trials.forEach(trial => {
      const key = breakdownBy === 'enrollment'
        ? trial.enrollmentStatus
        : trial[breakdownBy] as string;
      breakdown[key] = (breakdown[key] || 0) + 1;
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return Object.entries(breakdown).map(([key], index) => ({
      name: key,
      color: colors[index % colors.length]
    }));
  })();

  const formatDateRange = (range: DateRange) => {
    if (!range.from) return '';
    const fromDate = range.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const toDate = range.to ? range.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : fromDate;
    return range.to ? `${fromDate} - ${toDate}` : fromDate;
  };


  const getRegionEmoji = (region: string) => {
    return region === 'NAM' ? '🇺🇸' : region === 'ISC' ? '🇮🇳' : '🇦🇪';
  };

  const getChannelBadgeClass = (channel: string) => {
    switch (channel) {
      case 'perf-meta':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30';
      case 'organic-content':
        return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30';
      case 'BTL':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30';
      case 'tutor-referral':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30';
      default:
        return 'bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:hover:bg-pink-900/30';
    }
  };

  const getEnrollmentBadgeClass = (status: string) => {
    switch (status) {
      case 'yes':
        return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30';
      case 'no (>2w since trial)':
        return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30';
      default:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:hover:bg-yellow-900/30';
    }
  };

  const formatSingleFilterValue = (filterId: string, value: unknown) => {
    const stringValue = String(value);

    switch (filterId) {
      case 'region':
        return `${getRegionEmoji(stringValue)} ${stringValue}`;
      case 'enrollmentStatus':
        return stringValue === 'yes' ? 'Yes' :
               stringValue === 'no (>2w since trial)' ? 'No (>2w)' :
               'Not yet (<2w)';
      default:
        return stringValue;
    }
  };

  const getFilterBadgeClass = (filterId: string, value: string) => {
    switch (filterId) {
      case 'channel':
        return getChannelBadgeClass(value);
      case 'enrollmentStatus':
        return getEnrollmentBadgeClass(value);
      case 'region':
      case 'trialVersion':
      case 'annotationStatus':
        return 'border-muted-foreground/20';
      default:
        return 'border-muted-foreground/20';
    }
  };

  const activeFilters = [];
  if (searchTerm) {
    activeFilters.push({ type: 'search', value: searchTerm, icon: Search, className: 'border-muted-foreground/20' });
  }
  if (dateRange?.from) {
    activeFilters.push({ type: 'date', value: formatDateRange(dateRange), icon: Calendar, className: 'border-muted-foreground/20' });
  }
  columnFilters.forEach(filter => {
    if (filter.value &&
        ((Array.isArray(filter.value) && filter.value.length > 0) ||
         (typeof filter.value === 'string' && filter.value.trim() !== '') ||
         (typeof filter.value === 'number') ||
         (typeof filter.value === 'boolean'))) {

      if (Array.isArray(filter.value)) {
        // Create individual tags for each value in array
        filter.value.forEach(val => {
          activeFilters.push({
            type: 'column',
            value: formatSingleFilterValue(filter.id, val),
            icon: Filter,
            className: getFilterBadgeClass(filter.id, String(val)),
            filterId: filter.id
          });
        });
      } else {
        // Single value filter
        activeFilters.push({
          type: 'column',
          value: formatSingleFilterValue(filter.id, filter.value),
          icon: Filter,
          className: getFilterBadgeClass(filter.id, String(filter.value)),
          filterId: filter.id
        });
      }
    }
  });

  return (
    <Card className="w-full gap-4 h-full">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Volume Breakdown
          </div>
          <Select value={breakdownBy} onValueChange={(value: BreakdownType) => setBreakdownBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Breakdown by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="region">Region</SelectItem>
              <SelectItem value="grade">Grade</SelectItem>
              <SelectItem value="channel">Channel</SelectItem>
              <SelectItem value="trialVersion">Trial Version</SelectItem>
              <SelectItem value="enrollment">Enrollment</SelectItem>
            </SelectContent>
          </Select>
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
                  <Badge
                    key={index}
                    variant={filter.type === 'column' && (filter.className?.includes('bg-') || false) ? undefined : "outline"}
                    className={`text-xs ${filter.className || ''}`}
                  >
                    <IconComponent className="h-3 w-3 mr-1" />
                    {filter.value}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="space-y-4">
          {/* Ring Chart */}
          <div className="relative">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownBy === 'none' ? [
                      {
                        name: 'Total',
                        value: totalTrials,
                        color: '#3b82f6'
                      }
                    ] : (() => {
                      const breakdown: { [key: string]: number } = {};
                      trials.forEach(trial => {
                        const key = breakdownBy === 'enrollment'
                          ? trial.enrollmentStatus
                          : trial[breakdownBy] as string;
                        breakdown[key] = (breakdown[key] || 0) + 1;
                      });

                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
                      return Object.entries(breakdown)
                        .filter(([, value]) => value > 0)
                        .map(([key, value], index) => ({
                          name: key,
                          value,
                          color: colors[index % colors.length]
                        }));
                    })()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={renderLabel}
                    labelLine={false}
                  >
                    {(breakdownBy === 'none' ? [
                      { name: 'Total', color: '#3b82f6' }
                    ] : (() => {
                      const breakdown: { [key: string]: number } = {};
                      trials.forEach(trial => {
                        const key = breakdownBy === 'enrollment'
                          ? trial.enrollmentStatus
                          : trial[breakdownBy] as string;
                        breakdown[key] = (breakdown[key] || 0) + 1;
                      });

                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
                      return Object.entries(breakdown)
                        .filter(([, value]) => value > 0)
                        .map(([key], index) => ({
                          name: key,
                          color: colors[index % colors.length]
                        }));
                    })()).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Center Text - Total Trials */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold">{totalTrials}</div>
                <div className="text-xs text-muted-foreground">Total Trials</div>
              </div>
            </div>
          </div>

          <div className="border-t pt-2">
            <div className="text-xs text-muted-foreground mb-1">
              Breakdown by {breakdownBy === 'none' ? 'None' :
                breakdownBy === 'grade' ? 'Grade' :
                breakdownBy === 'region' ? 'Region' :
                breakdownBy === 'channel' ? 'Channel' :
                breakdownBy === 'trialVersion' ? 'Trial Version' :
                breakdownBy === 'enrollment' ? 'Enrollment' : breakdownBy} • Showing volume breakdown
            </div>
            <div className="flex flex-wrap gap-2">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}