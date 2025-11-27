"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { format } from "date-fns";
import DashboardLayout from "@/components/Dashboard/Layout";

/**
 * Customer Analytics page (standalone)
 * - Line chart: month-wise points earned
 * - Bar chart: points by product
 * - Summary cards (total points, products, inventory)
 *
 * Expects backend endpoints (optional):
 * GET /api/analytics/customer/monthly -> [{ month: "2025-01", points: 30 }]
 * GET /api/analytics/customer/by-product -> [{ sku, name, points }]
 *
 * The page will gracefully use local fallback data if API fails.
 */

type MonthPoint = { month: string; points: number };
type ProductPoints = { sku: string; name: string; points: number };

export default function CustomerAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState<MonthPoint[]>([]);
  const [byProduct, setByProduct] = useState<ProductPoints[]>([]);
  const [summary, setSummary] = useState({
    totalPoints: 0,
    totalProducts: 0,
    totalInventory: 0,
    totalRedeemed: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [mRes, pRes, sRes] = await Promise.all([
          fetch("/api/analytics/customer/monthly").catch(() => null),
          fetch("/api/analytics/customer/by-product").catch(() => null),
          fetch("/api/analytics/customer/summary").catch(() => null),
        ]);

        if (mRes && mRes.ok) {
          setMonthly(await mRes.json());
        } else {
          // fallback synthetic monthly data (last 6 months)
          const now = new Date();
          const fallback: MonthPoint[] = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            fallback.push({
              month: format(d, "yyyy-MM"),
              points: Math.floor(20 + Math.random() * 80),
            });
          }
          setMonthly(fallback);
        }

        if (pRes && pRes.ok) {
          setByProduct(await pRes.json());
        } else {
          // fallback product points
          setByProduct([
            { sku: "ABC-01", name: "ABC-01", points: 120 },
            { sku: "CBA-00", name: "CBA-00", points: 80 },
            { sku: "TAMIL1234-0", name: "TMI", points: 40 },
          ]);
        }

        if (sRes && sRes.ok) {
          setSummary(await sRes.json());
        } else {
          setSummary({
            totalPoints: monthly.reduce((s, m) => s + m.points, 0) || 320,
            totalProducts: 12,
            totalInventory: 6,
            totalRedeemed: 60,
          });
        }
      } catch (err: any) {
        console.error("Analytics load error:", err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // small helpers
  const lineData = monthly.map((m) => ({ name: m.month, points: m.points }));
  const barData = byProduct.map((p) => ({ name: p.name, points: p.points }));

  return (
    <DashboardLayout>
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-semibold mb-4">Customer Analytics</h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Points</p>
          <p className="text-2xl font-bold">{summary.totalPoints}</p>
        </div>
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold">{summary.totalProducts}</p>
        </div>
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Inventory Items</p>
          <p className="text-2xl font-bold">{summary.totalInventory}</p>
        </div>
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Points Redeemed</p>
          <p className="text-2xl font-bold">{summary.totalRedeemed}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line chart: monthly */}
        <div className="lg:col-span-2 bg-white rounded shadow p-4">
          <h3 className="text-lg font-medium mb-2">Monthly Points Earned</h3>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickFormatter={(t) => t.replace("-", " ")}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart: by product */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-lg font-medium mb-2">Points by Product</h3>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="points" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* optional details */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4">
          <h4 className="font-medium mb-2">Top Products</h4>
          <ul className="space-y-2">
            {byProduct.slice(0, 6).map((p) => (
              <li key={p.sku} className="flex justify-between">
                <span>{p.name}</span>
                <span className="font-semibold">{p.points}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h4 className="font-medium mb-2">Notes</h4>
          <p className="text-sm text-gray-600">
            The charts above use your analytics endpoints if available. If not,
            sample data is shown so you can preview the UI.
          </p>
        </div>
      </div>
    </div>
  </DashboardLayout>
  );
}
