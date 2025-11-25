"use client";
import React from "react";


export function StatsCard({ users, products, points }: { users: number; products: number; points: number; }) {
return (
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
<div className="bg-white p-4 rounded shadow">
<p className="text-sm text-gray-500">Total Users</p>
<p className="text-2xl font-semibold">{users}</p>
</div>
<div className="bg-white p-4 rounded shadow">
<p className="text-sm text-gray-500">Total Products</p>
<p className="text-2xl font-semibold">{products}</p>
</div>
<div className="bg-white p-4 rounded shadow">
<p className="text-sm text-gray-500">Estimated Points</p>
<p className="text-2xl font-semibold">{points}</p>
</div>
</div>
);
}