"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./pagination";
import { IssuesDataTableToolbar } from "./issues-toolbar";
import { issuesColumns } from "./issues-columns";
import type { TrialWithIssues } from "@/lib/types";

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface IssuesDataTableProps {
  data: TrialWithIssues[];
  dateRange?: DateRange | null;
  onDateRangeChange?: (range: DateRange | null) => void;
}

export function IssuesDataTable({
  data,
  dateRange,
  onDateRangeChange,
}: IssuesDataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const table = useReactTable({
    data,
    columns: issuesColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: {},
      globalFilter,
      pagination,
    },
  });

  return (
    <div className="space-y-2">
      <IssuesDataTableToolbar
        table={table}
        config={{
          enableSearch: true,
          enableColumnFilters: true,
          enableRowSelection: false,
          enableColumnVisibility: true,
          enablePagination: true,
          enableToolbar: true,
          enableKeyboardNavigation: false,
          enableClickRowSelect: false,
          enableDateFilter: true,
          enableExport: false,
          enableUrlState: false,
          enableColumnResizing: false,
          allowExportNewColumns: false,
          searchPlaceholder: "Search by Student ID, Tutor ID, names...",
          size: 'default'
        }}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
      />
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={issuesColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        table={table}
        totalItems={data.length}
        totalSelectedItems={0}
        size="default"
      />
    </div>
  );
}