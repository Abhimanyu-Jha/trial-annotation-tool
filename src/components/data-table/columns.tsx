"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "./column-header";
import { formatDuration, formatDate } from "@/lib/dummy-data";
import { TrialWithStatus } from "@/lib/types";

export const columns: ColumnDef<TrialWithStatus>[] = [
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
    accessorKey: "duration",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Duration"
        filterOptions={[
          { label: "0-20 minutes", value: "0-20" },
          { label: "20-40 minutes", value: "20-40" },
          { label: "40-60 minutes", value: "40-60" },
          { label: "60+ minutes", value: "60+" },
        ]}
      />
    ),
    cell: ({ row }) => <div>{formatDuration(row.getValue("duration"))}</div>,
    filterFn: (row, id, value) => {
      const duration = row.getValue(id) as number;
      return value.some((v: string) => {
        if (v === '0-20') return duration <= 1200;
        if (v === '20-40') return duration > 1200 && duration <= 2400;
        if (v === '40-60') return duration > 2400 && duration <= 3600;
        if (v === '60+') return duration > 3600;
        return false;
      });
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
    accessorKey: "trialVersion",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Trial Version"
        filterOptions={[
          { label: "Legacy", value: "legacy" },
          { label: "Version 3.1", value: "v3.1" },
          { label: "Version 3.2", value: "v3.2" },
        ]}
      />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.getValue("trialVersion")}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "annotationStatus",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Annotation Status"
        filterOptions={[
          { label: "Annotated", value: "Annotated" },
          { label: "Not Annotated", value: "Not Annotated" },
        ]}
      />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.getValue("annotationStatus")}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "enrollmentStatus",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Enrolled"
        filterOptions={[
          { label: "Yes", value: "yes" },
          { label: "No (>2w since trial)", value: "no (>2w since trial)" },
          { label: "Not yet (<2w since trial)", value: "not yet (<2w since trial)" },
        ]}
      />
    ),
    cell: ({ row }) => {
      const status = row.getValue("enrollmentStatus") as string;
      return (
        <Badge
          className={
            status === 'yes' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30' :
            status === 'no (>2w since trial)' ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30' :
            'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:hover:bg-yellow-900/30'
          }
        >
          {status === 'yes' ? 'Yes' :
           status === 'no (>2w since trial)' ? 'No (>2w)' :
           'Not yet (<2w)'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "annotatorNames",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Annotators" enableFilter={false} />
    ),
    cell: ({ row }) => {
      const annotatorNames = row.getValue("annotatorNames") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {annotatorNames.length > 0 ? (
            annotatorNames.map((name, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">None</span>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const annotatorNames = row.getValue(id) as string[];
      return annotatorNames.some(name =>
        name.toLowerCase().includes(value.toLowerCase())
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const trial = row.original;
      return (
        <Link href={`/annotate/${trial.trialId}`}>
          <Button variant="link" className="h-auto p-0 text-foreground hover:text-muted-foreground font-medium cursor-pointer">
            View
          </Button>
        </Link>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];