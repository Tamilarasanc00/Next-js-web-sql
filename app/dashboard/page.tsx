


// "use client";
// import React, { useEffect, useState } from "react";
// import DashboardLayout  from "@/components/Dashboard/Layout";
// import { StatsCard } from "@/components/Dashboard/StatsCard";
// import UsersTable from "@/components/Dashboard/UsersTable";
// import ProductsTable from "@/components/Dashboard/ProductsTable";


// export default function DashboardPage() {
// const [usersCount, setUsersCount] = useState(0);
// const [productsCount, setProductsCount] = useState(0);
// const [pointsEstimate, setPointsEstimate] = useState(0);
// const [tab, setTab] = useState<'overview'|'users'|'products'>('overview');


// useEffect(()=>{ // fetch summary
// async function load(){
// try{
// const u = await fetch('/api/admin/users');
// const p = await fetch('/api/admin/products');
// const ud = await u.json(); const pd = await p.json();
// const users = Array.isArray(ud) ? ud : ud.users || [];
// const products = Array.isArray(pd) ? pd : pd.products || [];
// setUsersCount(users.length);
// setProductsCount(products.length);
// setPointsEstimate(products.reduce((s:any,item:any)=> s + (item.pointsValue||0),0));
// }catch(err){console.error(err)}
// }
// load();
// },[]);


// return (
// <DashboardLayout>
// <div className="mb-4 flex gap-2">
// <button onClick={()=>setTab('overview')} className={`px-3 py-1 rounded ${tab==='overview' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>Overview</button>
// <button onClick={()=>setTab('users')} className={`px-3 py-1 rounded ${tab==='users' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>Users</button>
// <button onClick={()=>setTab('products')} className={`px-3 py-1 rounded ${tab==='products' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>Products</button>
// </div>


// {tab==='overview' && <StatsCard users={usersCount} products={productsCount} points={pointsEstimate} />}
// {tab==='users' && <UsersTable />}
// {tab==='products' && <ProductsTable />}
// </DashboardLayout>
// );
// }


"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/Layout";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import UsersTable from "@/components/Dashboard/UsersTable";
import ProductsTable from "@/components/Dashboard/ProductsTable";
import {jwtDecode} from "jwt-decode";

export default function DashboardPage() {
  const [usersCount, setUsersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [pointsEstimate, setPointsEstimate] = useState(0);
  const [tab, setTab] = useState<'overview' | 'users' | 'products'>("overview");
  const [role, setRole] = useState("");

  // -----------------------------
  // Read role from token
  // -----------------------------
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded: any = jwtDecode(token);
        setRole(decoded.userType || "");
      }
    } catch {
      setRole("");
    }
  }, []);

  // -----------------------------
  // Fetch dashboard summary
  // -----------------------------
  useEffect(() => {
    async function load() {
      try {
        const u = await fetch("/api/admin/users");
        const p = await fetch("/api/admin/products");
        const ud = await u.json();
        const pd = await p.json();
        const users = Array.isArray(ud) ? ud : ud.users || [];
        const products = Array.isArray(pd) ? pd : pd.products || [];

        setUsersCount(users.length);
        setProductsCount(products.length);
        setPointsEstimate(
          products.reduce((s: any, item: any) => s + (item.pointsValue || 0), 0)
        );
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout>
      {/* ---------------- Tab Buttons ---------------- */}
      <div className="mb-4 flex gap-2">

        {/* Everyone */}
        <button
          onClick={() => setTab("overview")}
          className={`px-3 py-1 rounded ${
            tab === "overview" ? "bg-indigo-600 text-white" : "bg-white border"
          }`}
        >
          Overview
        </button>

        {/* Admin ONLY */}
        {role === "admin" && (
          <button
            onClick={() => setTab("users")}
            className={`px-3 py-1 rounded ${
              tab === "users" ? "bg-indigo-600 text-white" : "bg-white border"
            }`}
          >
            Users
          </button>
        )}

        {/* Staff + Admin + Customer */}
        <button
          onClick={() => setTab("products")}
          className={`px-3 py-1 rounded ${
            tab === "products" ? "bg-indigo-600 text-white" : "bg-white border"
          }`}
        >
          Products
        </button>
      </div>

      {/* ---------------- Tab Content ---------------- */}
      {tab === "overview" && (
        <StatsCard users={usersCount} products={productsCount} points={pointsEstimate} />
      )}

      {tab === "users" && role === "admin" && <UsersTable />}

      {tab === "products" && <ProductsTable />}
    </DashboardLayout>
  );
}
