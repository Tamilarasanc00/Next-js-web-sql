// "use client";

// import DashboardStats from "@/components/Dashboard/page";

// export default function DashboardPage() {
//   return (
//     <div className="p-6">
//       <DashboardStats />
//     </div>
//   );
// }


"use client";
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/Dashboard/Layout";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import UsersTable from "@/components/Dashboard/UsersTable";
import ProductsTable from "@/components/Dashboard/ProductsTable";


export default function DashboardPage() {
const [usersCount, setUsersCount] = useState(0);
const [productsCount, setProductsCount] = useState(0);
const [pointsEstimate, setPointsEstimate] = useState(0);
const [tab, setTab] = useState<'overview'|'users'|'products'>('overview');


useEffect(()=>{ // fetch summary
async function load(){
try{
const u = await fetch('/api/admin/users');
const p = await fetch('/api/admin/products');
const ud = await u.json(); const pd = await p.json();
const users = Array.isArray(ud) ? ud : ud.users || [];
const products = Array.isArray(pd) ? pd : pd.products || [];
setUsersCount(users.length);
setProductsCount(products.length);
setPointsEstimate(products.reduce((s:any,item:any)=> s + (item.pointsValue||0),0));
}catch(err){console.error(err)}
}
load();
},[]);


return (
<DashboardLayout>
<div className="mb-4 flex gap-2">
<button onClick={()=>setTab('overview')} className={`px-3 py-1 rounded ${tab==='overview' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>Overview</button>
<button onClick={()=>setTab('users')} className={`px-3 py-1 rounded ${tab==='users' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>Users</button>
<button onClick={()=>setTab('products')} className={`px-3 py-1 rounded ${tab==='products' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>Products</button>
</div>


{tab==='overview' && <StatsCard users={usersCount} products={productsCount} points={pointsEstimate} />}
{tab==='users' && <UsersTable />}
{tab==='products' && <ProductsTable />}
</DashboardLayout>
);
}