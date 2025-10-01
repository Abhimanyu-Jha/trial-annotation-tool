"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "./column-header";
import { formatDate } from "@/lib/dummy-data";
import { TrialWithIssues } from "@/lib/types";
import { Eye } from "lucide-react";

export const issuesColumns: ColumnDef<TrialWithIssues>[] = [
  {
    id: "actions",
    header: () => <div className="w-8"></div>,
    cell: ({ row }) => {
      const trial = row.original;
      return (
        <Link href={`/annotate/${trial.trialId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="View trial">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "studentName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student Name" />
    ),
    cell: ({ row }) => {
      const trial = row.original;
      return (
        <Link href={`https://admin.leap.cuemath.com/student/${trial.studentId}`} target="_blank">
          <Button variant="link" className="h-auto p-0 text-foreground hover:text-muted-foreground font-medium cursor-pointer">
            {trial.studentName}
          </Button>
        </Link>
      );
    },
    filterFn: (row, id, value) => {
      const trial = row.original;
      return trial.studentName.toLowerCase().includes(value.toLowerCase()) ||
             trial.studentId.toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "tutorName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tutor Name" />
    ),
    cell: ({ row }) => {
      const trial = row.original;
      return (
        <Link href={`https://admin.leap.cuemath.com/tutor/${trial.tutorId}`} target="_blank">
          <Button variant="link" className="h-auto p-0 text-foreground hover:text-muted-foreground font-medium cursor-pointer">
            {trial.tutorName}
          </Button>
        </Link>
      );
    },
    filterFn: (row, id, value) => {
      const trial = row.original;
      return trial.tutorName.toLowerCase().includes(value.toLowerCase()) ||
             trial.tutorId.toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "grade",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Grade"
        filterOptions={[
          { label: "Grade 3", value: "Grade 3" },
          { label: "Grade 4", value: "Grade 4" },
          { label: "Grade 5", value: "Grade 5" },
          { label: "Grade 6", value: "Grade 6" },
          { label: "Grade 7", value: "Grade 7" },
        ]}
      />
    ),
    cell: ({ row }) => <div>{row.getValue("grade")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "trialDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trial Date" enableFilter={false} />
    ),
    cell: ({ row }) => <div>{formatDate(row.getValue("trialDate"))}</div>,
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = new Date(rowA.getValue(columnId) as string);
      const dateB = new Date(rowB.getValue(columnId) as string);
      return dateA.getTime() - dateB.getTime();
    },
  },
  {
    accessorKey: "region",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Region"
        filterOptions={[
          { label: "🇺🇸 North America (NAM)", value: "NAM" },
          { label: "🇮🇳 Indian Subcontinent (ISC)", value: "ISC" },
          { label: "🇦🇪 Rest of World (ROW)", value: "ROW" },
        ]}
      />
    ),
    cell: ({ row }) => {
      const region = row.getValue("region") as string;
      return (
        <Badge variant="outline">
          {region === 'NAM' ? '🇺🇸' : region === 'ISC' ? '🇮🇳' : '🇦🇪'} {region}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "channel",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Channel"
        filterOptions={[
          { label: "Performance Meta", value: "perf-meta" },
          { label: "Organic Content", value: "organic-content" },
          { label: "BTL", value: "BTL" },
          { label: "Tutor Referral", value: "tutor-referral" },
          { label: "Parent Referral", value: "parent-referral" },
        ]}
      />
    ),
    cell: ({ row }) => {
      const channel = row.getValue("channel") as string;
      return (
        <Badge
          className={
            channel === 'perf-meta' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30' :
            channel === 'organic-content' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30' :
            channel === 'BTL' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30' :
            channel === 'tutor-referral' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30' :
            'bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:hover:bg-pink-900/30'
          }
        >
          {channel}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "issueCount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Total Issues"
        filterOptions={[
          { label: "1-2 Issues", value: "1-2" },
          { label: "3-4 Issues", value: "3-4" },
          { label: "5-6 Issues", value: "5-6" },
          { label: "7+ Issues", value: "7+" },
        ]}
      />
    ),
    cell: ({ row }) => {
      const count = row.getValue("issueCount") as number;
      return (
        <Badge
          variant="secondary"
          className={count >= 7 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                    count >= 5 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                    count >= 3 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'}
        >
          {count}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const count = row.getValue(id) as number;
      return value.some((v: string) => {
        if (v === '1-2') return count >= 1 && count <= 2;
        if (v === '3-4') return count >= 3 && count <= 4;
        if (v === '5-6') return count >= 5 && count <= 6;
        if (v === '7+') return count >= 7;
        return false;
      });
    },
  },
  {
    accessorKey: "criticalIssueCount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Critical Issues"
        filterOptions={[
          { label: "No Critical Issues", value: "0" },
          { label: "1 Critical Issue", value: "1" },
          { label: "2+ Critical Issues", value: "2+" },
        ]}
      />
    ),
    cell: ({ row }) => {
      const count = row.getValue("criticalIssueCount") as number;
      return (
        <Badge
          className={count === 0 ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30' :
                    count === 1 ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30' :
                    'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30'}
        >
          {count}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const count = row.getValue(id) as number;
      return value.some((v: string) => {
        if (v === '0') return count === 0;
        if (v === '1') return count === 1;
        if (v === '2+') return count >= 2;
        return false;
      });
    },
  },
  {
    accessorKey: "topIssues",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Top Issues" enableFilter={false} />
    ),
    cell: ({ row }) => {
      const topIssues = row.getValue("topIssues") as string[];
      return (
        <div className="flex flex-wrap gap-1 max-w-sm">
          {topIssues.length > 0 ? (
            topIssues.slice(0, 2).map((issue, index) => (
              <Badge key={index} variant="outline" className="text-xs max-w-32 truncate" title={issue}>
                {issue}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">None</span>
          )}
          {topIssues.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{topIssues.length - 2} more
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
];