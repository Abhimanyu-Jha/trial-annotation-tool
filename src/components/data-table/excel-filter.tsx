"use client";

import { useState } from "react";
import { Column } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Filter,
  Search,
  ChevronDown
} from "lucide-react";

interface ExcelFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  options?: { label: string; value: string }[];
}

export function ExcelFilter<TData, TValue>({
  column,
  title,
  options,
}: ExcelFilterProps<TData, TValue>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Get current filter values
  const filterValue = column.getFilterValue() as string[] | undefined;
  const selectedValues = new Set(filterValue || []);

  // Get unique values from the column data if no options provided
  const facets = column.getFacetedUniqueValues();
  const uniqueValues = options || Array.from(facets.keys()).map(value => ({
    label: String(value),
    value: String(value)
  }));

  // Filter options based on search term
  const filteredOptions = uniqueValues.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    const allValues = filteredOptions.map(option => option.value);
    column.setFilterValue(allValues);
  };

  const handleClearAll = () => {
    column.setFilterValue(undefined);
  };

  const handleToggleOption = (value: string) => {
    const newSelection = new Set(selectedValues);
    if (newSelection.has(value)) {
      newSelection.delete(value);
    } else {
      newSelection.add(value);
    }

    const newFilterValue = Array.from(newSelection);
    column.setFilterValue(newFilterValue.length > 0 ? newFilterValue : undefined);
  };

  const isAllSelected = filteredOptions.length > 0 &&
    filteredOptions.every(option => selectedValues.has(option.value));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 data-[state=open]:bg-accent flex items-center gap-1 px-2"
        >
          <span className="font-medium">{title}</span>
          <div className="flex items-center gap-1">
            {selectedValues.size > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-xs">
                {selectedValues.size}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3" />
            {selectedValues.size > 0 && (
              <Filter className="h-3 w-3 text-blue-600" />
            )}
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
        </div>

        <div className="p-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleSelectAll();
                  } else {
                    handleClearAll();
                  }
                }}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium">
                {isAllSelected ? "Deselect All" : "Select All"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-6 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-60">
          <div className="p-2 space-y-1">
            {filteredOptions.map((option) => {
              const isSelected = selectedValues.has(option.value);
              const count = facets.get(option.value) || 0;

              return (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-1 rounded hover:bg-accent cursor-pointer"
                  onClick={() => handleToggleOption(option.value)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleOption(option.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm flex-1">{option.label}</span>
                  {count > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({count})
                    </span>
                  )}
                </div>
              );
            })}

            {filteredOptions.length === 0 && (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No options found
              </div>
            )}
          </div>
        </ScrollArea>

      </PopoverContent>
    </Popover>
  );
}