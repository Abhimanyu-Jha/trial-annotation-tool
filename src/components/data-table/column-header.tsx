"use client";

import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  EyeOff,
} from "lucide-react";
import type { Column } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ExcelFilter } from "./excel-filter";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  filterOptions?: { label: string; value: string }[];
  enableFilter?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  filterOptions,
  enableFilter = true
}: DataTableColumnHeaderProps<TData, TValue>) {
  const currentDirection = column.getIsSorted();

  const setSorting = (direction: "asc" | "desc" | false) => {
    if (direction === false) {
      column.clearSorting();
      return;
    }
    column.toggleSorting(direction === "desc", false);
  };

  // If column has filter capability and we want inline filters
  if (enableFilter && column.getCanFilter()) {
    return (
      <div className={cn("flex items-center justify-between w-full", className)}>
        <ExcelFilter
          column={column}
          title={title}
          options={filterOptions}
        />
      </div>
    );
  }

  // If column can sort, show sorting dropdown
  if (column.getCanSort()) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="data-[state=open]:bg-accent h-8 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
            >
              <span>{title}</span>
              {currentDirection === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : currentDirection === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setSorting("asc")}>
              <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSorting("desc")}>
              <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Desc
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Hide
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Default static header
  return <div className={cn(className)}>{title}</div>;
}