"use client";
import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";
import DashboardLayout from "@/components/Dashboard/Layout";

export default function RedeemPoints() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [redeemType, setRedeemType] = useState<"product" | "cash" | null>(null);

  const [productId, setProductId] = useState<number | null>(null);
  const [redeemPoints, setRedeemPoints] = useState<number>(0);
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getUserIdFromToken() {
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded?.id ?? null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    async function load() {
      const id = getUserIdFromToken();
      if (!id) return;
      try {
        const [uRes, pRes] = await Promise.all([
          fetch(`/api/admin/users/${id}`, {
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
}),
          fetch(`/api/admin/products`)
        ]);
        if (!uRes.ok || !pRes.ok) {
          console.error("Failed to fetch user/products", uRes.status, pRes.status);
          return;
        }
        const ud = await uRes.json();
        const pd = await pRes.json();
        setUser(ud.user ?? ud); // adapt to your API shape
        setProducts(pd.products ?? pd);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  function productPoints(pId: number | null) {
    return products.find(p => p.id === pId)?.pointsValue ?? 0;
  }

  const canSubmit = (() => {
    if (!user || !redeemType) return false;
    const total = Number(user.totalPoints ?? 0);
    if (redeemType === "product") {
      if (!productId) return false;
      return productPoints(productId) <= total;
    } else {
      if (!upiId || redeemPoints <= 0) return false;
      return redeemPoints <= total;
    }
  })();

// inside RedeemPoints component
async function handleRedeem() {
  setError(null);
  if (!canSubmit) return setError("Invalid redeem data");
  setLoading(true);

  const payload: any = {
    userId: user.id,
    redeemType,
  };

  if (redeemType === "product") {
    payload.productId = productId;
  } else {
    payload.cashId = upiId;
    payload.redeemedPoints = Number(redeemPoints);
  }

  try {
    const res = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Server error");
    } else {
      setUser({ ...user, totalPoints: String(data.newBalance) });
      setProductId(null);
      setRedeemPoints(0);
      setUpiId("");
      alert("Redeem successful");
    }
  } catch (err) {
    console.error(err);
    setError("Network error");
  } finally {
    setLoading(false);
  }
}

  if (!user) return <p>Loading...</p>;

  return (
    <DashboardLayout>
    <div className="p-4 bg-white shadow rounded-lg max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-3">Redeem Points</h2>
      <p className="mb-3 text-gray-600">
        <strong>Total Points:</strong>{" "}
        <span className="text-indigo-600 font-bold">{user.totalPoints}</span>
      </p>

      <div className="flex gap-3 mb-4">
        <button onClick={() => setRedeemType("product")} className={`px-4 py-2 rounded ${redeemType==="product"?"bg-indigo-600 text-white":"bg-gray-100"}`}>Redeem by Product</button>
        <button onClick={() => setRedeemType("cash")} className={`px-4 py-2 rounded ${redeemType==="cash"?"bg-indigo-600 text-white":"bg-gray-100"}`}>Redeem by Cash</button>
      </div>

      {redeemType === "product" && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Product</label>
          <select value={productId ?? ""} onChange={(e)=>setProductId(e.target.value?Number(e.target.value):null)} className="w-full border px-3 py-2 rounded">
            <option value="">-- Select --</option>
            {products.map((p:any) => {
              const disabled = p.pointsValue > Number(user.totalPoints);
              return <option key={p.id} value={p.id} disabled={disabled}>{p.name} — {p.pointsValue} Points {disabled? "(need more points)":""}</option>;
            })}
          </select>

          {productId && (
            <p className="mt-2 text-sm text-gray-600">New Balance: <strong>{Number(user.totalPoints) - productPoints(productId!)}</strong></p>
          )}
        </div>
      )}

      {redeemType === "cash" && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Enter Points</label>
          <input type="number" min={1} value={redeemPoints} onChange={(e)=>setRedeemPoints(Number(e.target.value||0))} className="w-full border px-3 py-2 rounded mb-2" />

          <p className="text-sm text-gray-600 mb-3">Value: <strong>₹{redeemPoints * 10}</strong></p>

          <label className="block mb-1 font-medium">UPI ID</label>
          <input type="text" value={upiId} onChange={(e)=>setUpiId(e.target.value)} className="w-full border px-3 py-2 rounded" />

          {redeemPoints > 0 && <p className="mt-2 text-sm text-gray-600">New Balance: <strong>{Number(user.totalPoints) - redeemPoints}</strong></p>}
        </div>
      )}

      {error && <div className="mb-2 text-red-600">{error}</div>}

      <button disabled={!canSubmit || loading} onClick={handleRedeem} className="w-full bg-indigo-600 text-white py-2 rounded mt-4">
        {loading ? "Processing..." : "Submit Redeem"}
      </button>
    </div>
  </DashboardLayout>
  );
}
