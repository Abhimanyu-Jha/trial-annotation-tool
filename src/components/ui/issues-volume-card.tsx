"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrialWithIssues, IssueDomain, IssueType } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Search, Filter, Calendar, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface IssuesVolumeCardProps {
  trials: TrialWithIssues[];
  isFiltered?: boolean;
  dateRange?: DateRange | null;
  searchTerm?: string;
  columnFilters?: Array<{ id: string; value: unknown }>;
}

type BreakdownType = 'domain' | 'issueType' | 'severity' | 'grade' | 'region' | 'channel';

export function IssuesVolumeCard({
  trials,
  isFiltered: _isFiltered = false,
  dateRange,
  searchTerm,
  columnFilters = []
}: IssuesVolumeCardProps) {
  const [breakdownBy, setBreakdownBy] = useState<BreakdownType>('domain');

  const chartData = useMemo(() => {
    if (trials.length === 0) return [];

    // Flatten all issues from all trials
    const allIssues = trials.flatMap(trial =>
      trial.issues.map(issue => ({
        ...issue,
        trial
      }))
    );

    if (allIssues.length === 0) return [];

    // Group issues by month and breakdown category
    const monthlyData: { [month: string]: { [category: string]: number } } = {};

    allIssues.forEach(issue => {
      const issueDate = new Date(issue.createdAt);
      const monthKey = issueDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });

      let categoryValue: string;
      switch (breakdownBy) {
        case 'domain':
          categoryValue = issue.domain;
          break;
        case 'issueType':
          categoryValue = issue.issueType;
          break;
        case 'severity':
          categoryValue = issue.severity;
          break;
        case 'grade':
          categoryValue = issue.trial.grade;
          break;
        case 'region':
          categoryValue = issue.trial.region;
          break;
        case 'channel':
          categoryValue = issue.trial.channel;
          break;
        default:
          categoryValue = 'Unknown';
      }

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {};
      }

      if (!monthlyData[monthKey][categoryValue]) {
        monthlyData[monthKey][categoryValue] = 0;
      }

      monthlyData[monthKey][categoryValue]++;
    });

    // Get all unique categories
    const allCategories = new Set<string>();
    Object.values(monthlyData).forEach(monthCategories => {
      Object.keys(monthCategories).forEach(category => allCategories.add(category));
    });

    // Convert to chart format
    const result = Object.entries(monthlyData).map(([month, categories]) => {
      const monthData: Record<string, string | number> = { month };

      // Ensure all categories have a value (0 if no data)
      allCategories.forEach(category => {
        monthData[category] = categories[category] || 0;
      });

      return monthData;
    }).sort((a, b) => new Date(a.month + ' 1').getTime() - new Date(b.month + ' 1').getTime());

    console.log('Issues chart data:', result, 'Categories:', Array.from(allCategories));
    return result;
  }, [trials, breakdownBy]);

  // Get unique categories for coloring
  const categories = useMemo(() => {
    const allIssues = trials.flatMap(trial => trial.issues);
    const uniqueCategories = new Set<string>();

    allIssues.forEach(issue => {
      let value: string;
      switch (breakdownBy) {
        case 'domain':
          value = issue.domain;
          break;
        case 'issueType':
          value = issue.issueType;
          break;
        case 'severity':
          value = issue.severity;
          break;
        case 'grade':
          value = trials.find(t => t.trialId === issue.trialId)?.grade || 'Unknown';
          break;
        case 'region':
          value = trials.find(t => t.trialId === issue.trialId)?.region || 'Unknown';
          break;
        case 'channel':
          value = trials.find(t => t.trialId === issue.trialId)?.channel || 'Unknown';
          break;
        default:
          value = 'Unknown';
      }
      uniqueCategories.add(value);
    });

    return Array.from(uniqueCategories).sort();
  }, [trials, breakdownBy]);

  // Color palette for different categories - using CSS variables for proper dark mode support
  const colors = [
    'var(--chart-1)', // blue
    'var(--chart-2)', // emerald
    'var(--chart-3)', // amber
    'var(--chart-4)', // red
    'var(--chart-5)', // violet
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f59e0b', // amber-500
    '#ef4444', // red-500
  ];

  const getBreakdownLabel = (breakdown: BreakdownType) => {
    switch (breakdown) {
      case 'domain': return 'Domain';
      case 'issueType': return 'Issue Type';
      case 'severity': return 'Severity';
      case 'grade': return 'Grade';
      case 'region': return 'Region';
      case 'channel': return 'Channel';
      default: return breakdown;
    }
  };

  const formatTooltipValue = (value: number, name: string) => {
    return [`${value} issues`, name];
  };

  const formatTooltipLabel = (label: string) => {
    return `${label} - Issue Volume`;
  };

  // Applied filters logic
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

  const formatSingleFilterValue = (filterId: string, value: unknown) => {
    const stringValue = String(value);

    switch (filterId) {
      case 'region':
        return `${getRegionEmoji(stringValue)} ${stringValue}`;
      default:
        return stringValue;
    }
  };

  const getFilterBadgeClass = (filterId: string, value: string) => {
    switch (filterId) {
      case 'channel':
        return getChannelBadgeClass(value);
      case 'region':
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

  // Calculate total issues for summary
  const totalIssues = trials.reduce((sum, trial) => sum + trial.issueCount, 0);
  const criticalIssues = trials.reduce((sum, trial) => sum + trial.criticalIssueCount, 0);

  return (
    <Card className="w-full gap-4 max-h-[500px]">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Issues Volume Trends
            <Badge variant="secondary" className="ml-2 text-xs">
              {totalIssues} total, {criticalIssues} critical
            </Badge>
          </div>
          <Select value={breakdownBy} onValueChange={(value: BreakdownType) => setBreakdownBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Breakdown by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="domain">Domain</SelectItem>
              <SelectItem value="issueType">Issue Type</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
              <SelectItem value="grade">Grade</SelectItem>
              <SelectItem value="region">Region</SelectItem>
              <SelectItem value="channel">Channel</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4 -mt-2">
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

        {chartData.length > 0 && categories.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  domain={[0, 'dataMax']}
                  tickFormatter={(value) => `${value}`}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={{ stroke: 'var(--border)' }}
                  width={30}
                />
                <Tooltip
                  formatter={formatTooltipValue}
                  labelFormatter={formatTooltipLabel}
                />
                {categories.map((category, index) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stroke={colors[index % colors.length]}
                    strokeWidth={3}
                    dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                    name={category}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div>No issue data available for the selected period</div>
              <div className="text-xs mt-2">
                Data points: {chartData.length}, Categories: {categories.length}
              </div>
            </div>
          </div>
        )}

        <div className="border-t pt-2">
          <div className="text-xs text-muted-foreground mb-1">
            Breakdown by {getBreakdownLabel(breakdownBy)} • Showing issue volume per month
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <div key={category} className="flex items-center gap-1 text-xs">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="max-w-24 truncate" title={category}>{category}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}