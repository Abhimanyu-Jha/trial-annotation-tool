export interface TableConfig {
  enableRowSelection: boolean;
  enableKeyboardNavigation: boolean;
  enableClickRowSelect: boolean;
  enablePagination: boolean;
  enableSearch: boolean;
  enableColumnFilters: boolean;
  enableDateFilter: boolean;
  enableColumnVisibility: boolean;
  enableExport: boolean;
  enableUrlState: boolean;
  enableColumnResizing: boolean;
  enableToolbar: boolean;
  size: 'sm' | 'default' | 'lg';
  columnResizingTableId?: string;
  searchPlaceholder?: string;
  allowExportNewColumns: boolean;
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

const defaultConfig: TableConfig = {
  enableRowSelection: true,
  enableKeyboardNavigation: false,
  enableClickRowSelect: false,
  enablePagination: true,
  enableSearch: true,
  enableColumnFilters: true,
  enableDateFilter: true,
  enableColumnVisibility: true,
  enableExport: true,
  enableUrlState: true,
  enableColumnResizing: true,
  enableToolbar: true,
  size: 'default',
  columnResizingTableId: undefined,
  searchPlaceholder: undefined,
  allowExportNewColumns: true,
  defaultSortBy: undefined,
  defaultSortOrder: 'desc',
};

export function useTableConfig(overrideConfig?: Partial<TableConfig>): TableConfig {
  return { ...defaultConfig, ...overrideConfig };
}