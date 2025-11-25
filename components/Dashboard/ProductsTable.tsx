
"use client";
import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";


export default function ProductsTable() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [pointsValue, setPointsValue] = useState<number>(0);
  const [role, setRole] = useState<string>("");

useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    const decoded: any = jwtDecode(token);
    setRole(decoded.userType); // admin, staff, customer
  }
}, []);



  const fetchProducts = async () => {
    setLoading(true);
    try { const res = await fetch('/api/admin/products'); const data = await res.json(); setProducts(Array.isArray(data) ? data : data.products || []); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(()=>{ fetchProducts(); }, []);

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, name, pointsValue })
      });
      if (res.ok) { await fetchProducts(); setSku(''); setName(''); setPointsValue(0); }
    } catch (err) { console.error(err); }
  };

 // const deleteProduct = async (id: number) => { if (!confirm('Delete product?')) return; try { const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' }); if (res.ok) fetchProducts(); } catch (err) { console.error(err); } };
const deleteProduct = async (id: number) => {
  try {
    const confirmDelete = confirm("Delete product?");
    if (!confirmDelete) return;

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Delete Error:", error);
      alert(error.error || "Delete failed");
      return;
    }

    fetchProducts(); // refresh list
  } catch (err) {
    console.error("Network Error:", err);
    alert("Network error. Please try again.");
  }
};


  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-4">
        <form onSubmit={createProduct} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input value={sku} onChange={(e)=>setSku(e.target.value)} placeholder="SKU" className="p-2 border rounded" required />
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" className="p-2 border rounded" required />
          <input value={pointsValue} onChange={(e)=>setPointsValue(Number(e.target.value))} placeholder="Points" className="p-2 border rounded" type="number" required />
          <div className="flex gap-2">
            {role !== "customer" && (
              <button className="bg-indigo-600 text-white px-3 rounded">Add</button>
            )}

          </div>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">SKU</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Points</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center">No products</td></tr>
            ) : products.map((p,i)=> (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{i+1}</td>
                <td className="p-2">{p.sku}</td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.pointsValue}</td>
                <td className="p-2">
                  {role === "admin" && (
  <button onClick={() => deleteProduct(p.id)} className="text-sm text-red-600">
    Delete
  </button>
)}

                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

