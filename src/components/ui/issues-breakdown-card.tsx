"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrialWithIssues, IssueDomain, IssueType, IssueSeverity } from "@/lib/types";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { AlertTriangle, Search, Filter, Calendar, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface IssuesBreakdownCardProps {
  trials: TrialWithIssues[];
  isFiltered?: boolean;
  dateRange?: DateRange | null;
  searchTerm?: string;
  columnFilters?: Array<{ id: string; value: unknown }>;
}

export function IssuesBreakdownCard({
  trials,
  isFiltered: _isFiltered = false,
  dateRange,
  searchTerm,
  columnFilters = []
}: IssuesBreakdownCardProps) {

  const issueAnalytics = useMemo(() => {
    const allIssues = trials.flatMap(trial => trial.issues);

    if (allIssues.length === 0) {
      return {
        domainBreakdown: [],
        severityBreakdown: [],
        topIssues: [],
        totalIssues: 0,
        avgIssuesPerTrial: 0,
        criticalIssueRate: 0
      };
    }

    // Domain breakdown
    const domainCounts: Record<IssueDomain, number> = {
      'Parent Engagement': 0,
      'Student Engagement': 0,
      'Pedagogical Effectiveness': 0,
      'Process & Platform Adherence': 0,
      'Professionalism & Environment': 0,
      'Linguistic & Communicative Competence': 0,
      'Session Flags': 0
    };

    // Severity breakdown
    const severityCounts: Record<IssueSeverity, number> = {
      'low': 0,
      'medium': 0,
      'high': 0,
      'critical': 0
    };

    // Issue type counts
    const issueTypeCounts: Record<string, number> = {};

    allIssues.forEach(issue => {
      domainCounts[issue.domain]++;
      severityCounts[issue.severity]++;
      issueTypeCounts[issue.issueType] = (issueTypeCounts[issue.issueType] || 0) + 1;
    });

    // Convert to chart data
    const domainBreakdown = Object.entries(domainCounts)
      .filter(([, count]) => count > 0)
      .map(([domain, count]) => ({
        name: domain,
        value: count,
        percentage: Math.round((count / allIssues.length) * 100)
      }));

    const severityBreakdown = Object.entries(severityCounts)
      .filter(([, count]) => count > 0)
      .map(([severity, count]) => ({
        name: severity,
        value: count,
        percentage: Math.round((count / allIssues.length) * 100)
      }));

    // Top 10 issues
    const topIssues = Object.entries(issueTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([issueType, count]) => ({
        name: issueType,
        value: count,
        percentage: Math.round((count / allIssues.length) * 100)
      }));

    return {
      domainBreakdown,
      severityBreakdown,
      topIssues,
      totalIssues: allIssues.length,
      avgIssuesPerTrial: Math.round((allIssues.length / trials.length) * 10) / 10,
      criticalIssueRate: Math.round((severityCounts.critical / allIssues.length) * 100)
    };
  }, [trials]);

  // Color schemes
  const domainColors = [
    '#ef4444', // red - Parent Engagement
    '#f97316', // orange - Student Engagement
    '#eab308', // yellow - Pedagogical Effectiveness
    '#22c55e', // green - Process & Platform
    '#3b82f6', // blue - Professionalism
    '#8b5cf6', // purple - Linguistic
    '#6b7280'  // gray - Session Flags
  ];

  const severityColors = {
    'critical': '#dc2626',
    'high': '#ea580c',
    'medium': '#d97706',
    'low': '#16a34a'
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

  const renderCustomizedLabel = (entry: { percentage: number }) => {
    return `${entry.percentage}%`;
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats Card */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="h-4 w-4" />
            Issue Summary
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{issueAnalytics.totalIssues}</div>
              <div className="text-xs text-muted-foreground">Total Issues</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{issueAnalytics.avgIssuesPerTrial}</div>
              <div className="text-xs text-muted-foreground">Avg per Trial</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{issueAnalytics.criticalIssueRate}%</div>
              <div className="text-xs text-red-600 dark:text-red-400">Critical Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Breakdown */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4" />
            Issues by Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {issueAnalytics.domainBreakdown.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issueAnalytics.domainBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {issueAnalytics.domainBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={domainColors[index % domainColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} issues`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No domain data available
            </div>
          )}

          <div className="border-t pt-2 mt-2">
            <div className="flex flex-wrap gap-2">
              {issueAnalytics.domainBreakdown.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: domainColors[index % domainColors.length] }}
                  />
                  <span className="max-w-32 truncate" title={item.name}>{item.name}</span>
                  <span className="text-muted-foreground">({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Issues */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="h-4 w-4" />
            Top Issue Types
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {issueAnalytics.topIssues.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={issueAnalytics.topIssues}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={{ stroke: 'var(--border)' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={{ stroke: 'var(--border)' }}
                    width={30}
                  />
                  <Tooltip formatter={(value) => [`${value} issues`, 'Count']} />
                  <Bar dataKey="value" fill="var(--chart-4)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No issue type data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}