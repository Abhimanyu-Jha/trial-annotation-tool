"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./view-options";
import { Search } from "lucide-react";
import type { TableConfig } from "./utils/table-config";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  config: TableConfig;
}

export function DataTableToolbar<TData>({
  table,
  config,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const globalFilter = table.getState().globalFilter;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {config.enableSearch && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={config.searchPlaceholder || "Search..."}
              value={globalFilter ?? ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
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