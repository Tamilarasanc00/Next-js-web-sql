"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import DashboardLayout from "@/components/Dashboard/Layout";
/**
 * Redeem History Page
 *
 * - Fetches /api/redeem/history (or fallback)
 * - Search (by SKU/name/UPI), filter by status, pagination
 */

type RedeemRow = {
  id: number;
  userId?: number;
  redeemType: "cash" | "product";
  productId?: number | null;
  cashId?: string | null;
  redeemedPoints: number;
  createdAt: string;
  status?: string;
  productName?: string | null;
};

export default function RedeemHistoryPage() {
  const [rows, setRows] = useState<RedeemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/redeem");
        if (res.ok) {
          const data = await res.json();
          // expecting array; if object with key, normalize
          const arr = Array.isArray(data) ? data : data.rows || data.history || data.redeems || [];
          setRows(arr);
        } else {
          // fallback demo data
          setRows([
            {
              id: 1,
              redeemType: "product",
              productId: 10,
              productName: "TMI",
              redeemedPoints: 25,
              createdAt: new Date().toISOString(),
              status: "completed",
            },
            {
              id: 2,
              redeemType: "cash",
              cashId: "tamilarasan@upi",
              redeemedPoints: 100,
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              status: "pending",
            },
          ]);
        }
      } catch (err) {
        console.error("Redeem history load error:", err);
        setError("Failed to load redeem history");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return rows
      .filter((r) => (statusFilter === "all" ? true : (r.status || "") === statusFilter))
      .filter((r) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          String(r.productName || r.productId || "").toLowerCase().includes(q) ||
          String(r.cashId || "").toLowerCase().includes(q) ||
          String(r.redeemedPoints).includes(q)
        );
      });
  }, [rows, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  return (
  <DashboardLayout>
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-semibold mb-4">Redeem History</h1>

      {/* <div className="mb-4 flex flex-col md:flex-row gap-3 items-start md:items-center">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Search by product, UPI, points..."
          className="border p-2 rounded w-full md:w-1/3"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border p-2 rounded"
        >
          <option value="all">All statuses</option>
          <option value="pending">pending</option>
          <option value="completed">completed</option>
          <option value="failed">failed</option>
        </select>
      </div> */}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Product / UPI</th>
              <th className="p-3 text-left">Points</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">Loading...</td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">No records found</td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="p-3">{r.redeemType}</td>
                  <td className="p-3">
                    {r.redeemType === "product" ? r.productName ?? `#${r.productId}` : r.cashId}
                  </td>
                  <td className="p-3 font-semibold">{r.redeemedPoints}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${r.status === "completed" ? "bg-green-100 text-green-700" : r.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                      {r.status ?? "unknown"}
                    </span>
                  </td>
                  <td className="p-3">{format(new Date(r.createdAt), "dd MMM yyyy, hh:mm a")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} of {filtered.length}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <div className="px-3 py-1 border rounded">
            {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
  );
}
