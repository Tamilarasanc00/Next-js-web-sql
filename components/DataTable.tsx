// components/DataTable.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowData,
} from "@tanstack/react-table";

type DataTableProps<TData extends RowData, TValue = unknown> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  initialPageSize?: number;
  pageSizeOptions?: number[];
  // callbacks
  onSelectionChange?: (selectedRows: Record<string, boolean>) => void;
  exportCsvFilename?: string;
  className?: string;
};

export function DataTable<TData extends RowData, TValue = unknown>({
  columns,
  data,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  onSelectionChange,
  exportCsvFilename = "export.csv",
  className = "",
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      rowSelection,
      columnVisibility,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
  });

  // Inform parent of selection changes
  useEffect(() => {
    onSelectionChange?.(rowSelection);
  }, [rowSelection, onSelectionChange]);

  // Debounce global filter input (simple)
  useEffect(() => {
    const t = setTimeout(() => {
      table.setGlobalFilter(globalFilter);
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter]);

  // CSV export of currently visible rows (current page)
  const exportCSV = () => {
    const header = table.getHeaderGroups()
      .flatMap(hg => hg.headers)
      .filter(h => h.column.getIsVisible())
      .map(h => h.column.id);

    const rows = table.getRowModel().rows.map(row =>
      header.map(colId => {
        const val = row.getValue(colId);
        // escape quotes
        if (val === null || val === undefined) return "";
        const s = String(val);
        return `"${s.replace(/"/g, '""')}"`;
      }).join(",")
    );

    const csv = [header.map(h => `"${h}"`).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportCsvFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            className="p-2 border rounded w-56"
          />
          <button
            onClick={() => {
              // reset sorts & filter
              setGlobalFilter("");
              setSorting([]);
              table.resetColumnFilters();
              table.resetRowSelection();
            }}
            className="px-3 py-2 border rounded"
          >
            Reset
          </button>
          <button onClick={() => exportCSV()} className="px-3 py-2 border rounded">
            Export CSV
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm">
            {table.getRowModel().rows.length} results
          </div>
          <div className="text-sm">Page size:</div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="p-2 border rounded"
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="p-2 text-left"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          onClick: header.column.getToggleSortingHandler(),
                          className: header.column.getCanSort() ? "cursor-pointer select-none" : "",
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " ▲",
                          desc: " ▼",
                        }[String(header.column.getIsSorted() as string)] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center">
                  No data
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>

          <div>
            Page{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </div>

          <div>
            | Go to page:{" "}
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const p = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(p);
              }}
              className="w-20 p-1 border rounded ml-2"
            />
          </div>
        </div>

        <div className="text-sm">
          Showing{" "}
          <strong>
            {table.getRowModel().rows.length}
          </strong>{" "}
          rows
        </div>
      </div>
    </div>
  );
}

export default DataTable;
