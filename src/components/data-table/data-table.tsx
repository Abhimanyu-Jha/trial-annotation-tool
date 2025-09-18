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
import { DataTableToolbar } from "./toolbar";
import { useTableConfig, type TableConfig } from "./utils/table-config";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  config?: Partial<TableConfig>;
  loading?: boolean;
  totalItems?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  onGlobalFilterChange?: (filter: string) => void;
  onTableReady?: (table: Table<TData>) => void;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  config: configOverride,
  loading = false,
  totalItems,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  onGlobalFilterChange,
  onTableReady,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
}: DataTableProps<TData, TValue>) {
  const config = useTableConfig(configOverride);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: config.enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: config.enableRowSelection ? setRowSelection : undefined,
    onSortingChange: (updater) => {
      setSorting(updater);
      if (onSortingChange) {
        const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
        onSortingChange(newSorting);
      }
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      if (onColumnFiltersChange) {
        const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
        onColumnFiltersChange(newFilters);
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value);
      if (onGlobalFilterChange) {
        onGlobalFilterChange(value);
      }
    },
    onPaginationChange: (updater) => {
      setPagination(updater);
      if (onPaginationChange) {
        const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
        onPaginationChange(newPagination);
      }
    },
    manualPagination,
    manualSorting,
    manualFiltering,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: config.enableRowSelection ? rowSelection : {},
      globalFilter,
      pagination,
    },
  });

  // Call onTableReady when table is initialized
  React.useEffect(() => {
    if (onTableReady) {
      onTableReady(table);
    }
  }, [table, onTableReady]);

  return (
    <div className="space-y-4">
      {config.enableToolbar && (
        <DataTableToolbar table={table} config={config} />
      )}
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? "Loading..." : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {config.enablePagination && (
        <DataTablePagination
          table={table}
          totalItems={totalItems || data.length}
          totalSelectedItems={table.getFilteredSelectedRowModel().rows.length}
          size={config.size}
        />
      )}
    </div>
  );
}