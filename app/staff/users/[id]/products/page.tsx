"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

/**
 * AssignProducts (robust)
 * - Handles API responses that return arrays OR objects (e.g. { rows: [...] }, { inventory: [...] }, etc.)
 * - Defensive parsing for users/products/inventory
 * - Keeps UI responsive with loading/error states
 * - Reloads inventory after successful add
 */

// Small toast
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed top-5 right-5 z-50 px-4 py-3 rounded shadow-lg text-white 
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      {message}
    </div>
  );
}

function safeArray<T = any>(maybeArr: any): T[] {
  if (Array.isArray(maybeArr)) return maybeArr;
  if (!maybeArr) return [];
  // common wrapper shapes
  if (Array.isArray(maybeArr.rows)) return maybeArr.rows;
  if (Array.isArray(maybeArr.data)) return maybeArr.data;
  if (Array.isArray(maybeArr.inventory)) return maybeArr.inventory;
  if (Array.isArray(maybeArr.products)) return maybeArr.products;
  if (Array.isArray(maybeArr.users)) return maybeArr.users;
  // fallback: if object with numeric keys, convert to array
  try {
    const vals = Object.values(maybeArr).filter(v => typeof v === "object");
    if (Array.isArray(vals) && vals.length > 0) return vals;
  } catch {}
  return [];
}

export default function AssignProducts() {
  const { id } = useParams(); // optional user id from route

  // data
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  // form
  const [selectedUser, setSelectedUser] = useState<string>(id ?? "");
  const [selectedSku, setSelectedSku] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [pointsEarned, setPointsEarned] = useState<number | "">("");
  const [selectedImage, setSelectedImage] = useState<string>("");

  // ui
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingInv, setLoadingInv] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // load users & products
  useEffect(() => {
    async function load() {
      setLoadingUsers(true);
      setLoadingProducts(true);
      try {
        const [uRes, pRes] = await Promise.all([fetch("/api/admin/users"), fetch("/api/admin/products")]);
        const uJson = await uRes.json().catch(() => null);
        const pJson = await pRes.json().catch(() => null);

        const uArr = safeArray(uJson);
        const pArr = safeArray(pJson);

        setUsers(uArr);
        setProducts(pArr);

        // if route provided an id but selectedUser is empty, set it
        if (!selectedUser && id && uArr.some((u: any) => String(u.id) === String(id))) {
          setSelectedUser(String(id));
        }
      } catch (err) {
        console.error("Load users/products error:", err);
        setError("Failed to load users or products");
      } finally {
        setLoadingUsers(false);
        setLoadingProducts(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper to load inventory (kept as stable callback)
  const loadInventory = useCallback(
    async (uid?: string) => {
      const userId = uid ?? selectedUser;
      if (!userId) {
        setInventory([]);
        return;
      }
      setLoadingInv(true);
      try {
        const res = await fetch(`/api/staff/users/${userId}/inventory`);
        const json = await res.json().catch(() => null);
        const arr = safeArray(json);
        setInventory(arr);
      } catch (err) {
        console.error("Load inventory error:", err);
        setInventory([]);
      } finally {
        setLoadingInv(false);
      }
    },
    [selectedUser]
  );

  // load inventory when selectedUser or on mount if id present
  useEffect(() => {
    loadInventory();
  }, [selectedUser, loadInventory]);

  // when product selected update points & image
  useEffect(() => {
    if (!selectedSku) {
      setPointsEarned("");
      setSelectedImage("");
      return;
    }
    const product = products.find((p: any) => String(p.sku) === String(selectedSku) || String(p.id) === String(selectedSku));
    if (product) {
      setPointsEarned(Number(product.pointsValue ?? product.points ?? 0));
      setSelectedImage(product.imageUrl ?? "");
    } else {
      setPointsEarned("");
      setSelectedImage("");
    }
  }, [selectedSku, products]);

  // submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedUser) return setToast({ message: "Choose a user", type: "error" });
    if (!selectedSku) return setToast({ message: "Choose a product", type: "error" });
    if (!quantity || quantity < 1) return setToast({ message: "Enter a valid quantity", type: "error" });

    setSubmitting(true);
    try {
      const payload = {
        sku: selectedSku,
        quantity: Number(quantity),
        points: Number(pointsEarned || 0),
      };

      const res = await fetch(`/api/staff/users/${selectedUser}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.error || json?.message || "Add to inventory failed";
        setToast({ message: String(msg), type: "error" });
        return;
      }

      setToast({ message: "Inventory added!", type: "success" });
      // reset form
      setSelectedSku("");
      setQuantity(1);
      setPointsEarned("");
      setSelectedImage("");

      // refresh inventory
      await loadInventory(selectedUser);
    } catch (err) {
      console.error("Submit inventory error:", err);
      setToast({ message: "Network error", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // small helpers for rendering
  const formatDate = (d: string | Date | undefined) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return String(d);
    }
  };

  const imgOrPlaceholder = (src: string | null | undefined) => {
    return src || "/no-image.png";
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="p-4 flex justify-center">
        <div className="w-full max-w-xl bg-white p-6 rounded shadow space-y-6">
          <h2 className="text-2xl font-bold text-center">Add to Inventory</h2>

          {/* errors */}
          {error && <div className="text-red-600">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User */}
            <div>
              <label className="font-medium block mb-1">Select User</label>
              {loadingUsers ? (
                <div className="text-sm text-gray-500">Loading users...</div>
              ) : (
                <select className="border p-2 rounded w-full" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                  <option value="">-- Select User --</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={String(u.id)}>
                      {u.name} {u.email ? `(${u.email})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Product */}
            <div>
              <label className="font-medium block mb-1">Select Product</label>
              {loadingProducts ? (
                <div className="text-sm text-gray-500">Loading products...</div>
              ) : (
                <select
                  className="border p-2 rounded w-full"
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.sku ?? p.id}>
                      {p.name} {p.sku ? `(${p.sku})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* image preview */}
            {selectedImage ? (
              <div className="flex justify-center">
                <img src={imgOrPlaceholder(selectedImage)} className="w-28 h-28 object-cover rounded border" alt="product" />
              </div>
            ) : null}

            {/* Quantity */}
            <div>
              <label className="font-medium block mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                className="border p-2 rounded w-full"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value || 1))}
              />
            </div>

            {/* Points */}
            <div>
              <label className="font-medium block mb-1">Points Earned (per unit)</label>
              <input
                type="number"
                className="border p-2 rounded w-full"
                value={pointsEarned === "" ? "" : String(pointsEarned)}
                onChange={(e) => {
                  const v = e.target.value;
                  setPointsEarned(v === "" ? "" : Number(v));
                }}
                placeholder="leave blank to use product default"
              />
            </div>

            <button type="submit" disabled={submitting} className="w-full p-3 bg-blue-600 text-white rounded disabled:opacity-50">
              {submitting ? "Adding..." : "Add to Inventory"}
            </button>
          </form>

          {/* Inventory Table */}
          <div>
            <h3 className="text-xl font-semibold mb-2">User Inventory</h3>

            {loadingInv ? (
              <p className="text-sm text-gray-500">Loading inventory...</p>
            ) : !Array.isArray(inventory) || inventory.length === 0 ? (
              <p className="text-gray-500">No items added.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2">Image</th>
                      <th className="p-2">SKU</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Points</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item: any, idx: number) => (
                      <tr key={item.id ?? idx} className="border-b">
                        <td className="p-2">
                          <img src={imgOrPlaceholder(item.imageUrl)} className="w-10 h-10 object-cover rounded border" alt={item.sku} />
                        </td>
                        <td className="p-2">{item.sku ?? "-"}</td>
                        <td className="p-2">{item.quantity ?? "-"}</td>
                        <td className="p-2">{item.pointsEarned ?? "-"}</td>
                        <td className="p-2">{(Number(item.quantity || 0) * Number(item.pointsEarned || 0)) || 0}</td>
                        <td className="p-2">{formatDate(item.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
