"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./view-options";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Search } from "lucide-react";
import type { TableConfig } from "./utils/table-config";

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  config: TableConfig;
  dateRange?: DateRange | null;
  onDateRangeChange?: (range: DateRange | null) => void;
}

export function DataTableToolbar<TData>({
  table,
  config,
  dateRange,
  onDateRangeChange,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const globalFilter = table.getState().globalFilter;
  const hasDateFilter = dateRange?.from;

  const handleReset = () => {
    table.resetColumnFilters();
    if (hasDateFilter && onDateRangeChange) {
      onDateRangeChange(null);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {config.enableSearch && (
          <div className="relative w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={config.searchPlaceholder || "Search..."}
              value={globalFilter ?? ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {onDateRangeChange && (
          <DateRangePicker
            align="start"
            initialDateFrom={dateRange?.from}
            initialDateTo={dateRange?.to}
            onUpdate={(values) => {
              onDateRangeChange(values.range);
            }}
          />
        )}

        {(isFiltered || hasDateFilter) && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {config.enableColumnVisibility && <DataTableViewOptions table={table} />}
    </div>
  );
}