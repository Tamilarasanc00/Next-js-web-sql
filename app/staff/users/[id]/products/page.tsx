

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";

// Toast UI
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

// safe array helper
function safeArray<T = any>(maybeArr: any): T[] {
  if (Array.isArray(maybeArr)) return maybeArr;
  if (!maybeArr) return [];
  if (Array.isArray(maybeArr.rows)) return maybeArr.rows;
  if (Array.isArray(maybeArr.data)) return maybeArr.data;
  if (Array.isArray(maybeArr.inventory)) return maybeArr.inventory;
  if (Array.isArray(maybeArr.users)) return maybeArr.users;
  if (Array.isArray(maybeArr.products)) return maybeArr.products;
  return [];
}

export default function AssignProducts() {
  const { id } = useParams();

  // states
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  const [selectedUser, setSelectedUser] = useState<string>(id ?? "");
  const [selectedSku, setSelectedSku] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [pointsEarned, setPointsEarned] = useState<number | "">("");
  const [selectedImage, setSelectedImage] = useState<string>("");

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingInv, setLoadingInv] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [role, setRole] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  // Decode token
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded: any = jwtDecode(token);

      setRole(decoded.userType || "");
      setUserId(decoded.id || null);
    } catch {
      setRole("");
    }
  }, []);

  // Auto hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Load users + products
  useEffect(() => {
    async function load() {
      setLoadingUsers(true);
      setLoadingProducts(true);
      try {
        const [uRes, pRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/products"),
        ]);

        const uJson = await uRes.json();
        const pJson = await pRes.json();

        const uArr = safeArray(uJson);
        const pArr = safeArray(pJson);
// console.log("role role",role);

        // Role Based Filtering
        if (role === "customer" && userId) {
          // console.log("TAMIL");
          
          setUsers(uArr.filter((u: any) => u.id === userId)); // only yourself
          setSelectedUser(String(userId)); // lock user selection
        } else {
          // console.log("TAMIL-----");
          setUsers(uArr.filter((u: any) => u.userType === "customer")); // show all customers
        }

        setProducts(pArr);
      } catch {
        setError("Failed to load users/products");
      } finally {
        setLoadingUsers(false);
        setLoadingProducts(false);
      }
    }

    load();
  }, [role, userId]);

  console.log("selectedUser",selectedUser);
  
  // Load inventory for selected user
const loadInventory = useCallback(async () => {
  try {
    const uid = selectedUser || userId; // fallback to logged-in user
    if (!uid) {
      setInventory([]);
      return;
    }

    setLoadingInv(true);

    const token = localStorage.getItem("token") || "";

    const res = await fetch(`/api/staff/users/${uid}/inventory`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    setInventory(safeArray(json));

  } catch (error) {
    console.error("INVENTORY LOAD ERROR:", error);
    setInventory([]);
  } finally {
    setLoadingInv(false);
  }

}, [selectedUser, userId]);






  useEffect(() => {
    loadInventory();
  }, [selectedUser, loadInventory]);

  // Product selected → update points preview
  useEffect(() => {
    if (!selectedSku) {
      setPointsEarned("");
      setSelectedImage("");
      return;
    }

    const product = products.find(
      (p: any) => String(p.sku) === selectedSku || String(p.id) === selectedSku
    );

    if (product) {
      setPointsEarned(product.pointsValue);
      setSelectedImage(product.imageUrl);
    }
  }, [selectedSku, products]);

  // Submit inventory
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedUser)
      return setToast({ message: "Choose a user", type: "error" });

    if (!selectedSku)
      return setToast({ message: "Choose a product", type: "error" });

    setSubmitting(true);

    try {
      const res = await fetch(`/api/staff/users/${selectedUser}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: selectedSku,
          quantity,
          points: pointsEarned,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        return setToast({ message: json.error || "Failed", type: "error" });
      }

      setToast({ message: "Added Successfully!", type: "success" });

      setSelectedSku("");
      setQuantity(1);
      setPointsEarned("");
      setSelectedImage("");

      loadInventory();
    } catch {
      setToast({ message: "Network Error", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString() : "-";

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="p-4 flex justify-center">
        <div className="w-full max-w-xl bg-white p-6 rounded shadow space-y-6">

          <h2 className="text-2xl font-bold text-center">Add to Inventory</h2>

          {error && <div className="text-red-600">{error}</div>}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* User select */}
            <div>
              <label className="font-medium block mb-1">Select User</label>

              <select
                className="border p-2 rounded w-full"
                value={selectedUser}
                disabled={role === "customer"} // customer cannot change
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">-- Select User --</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.mobile})
                  </option>
                ))}
              </select>
            </div>

            {/* Product select */}
            <div>
              <label className="font-medium block mb-1">Select Product</label>

              <select
                className="border p-2 rounded w-full"
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
              >
                <option value="">-- Select Product --</option>

                {products.map((p: any) => (
                  <option key={p.id} value={p.sku}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            {selectedImage && (
              <div className="flex justify-center">
                <img
                  src={selectedImage}
                  className="w-28 h-28 rounded border"
                />
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="font-medium block mb-1">Quantity</label>
              {/* <input
                type="number"
                min={1}
                className="border p-2 rounded w-full"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              /> */}
              <input
  type="text"
  className="border p-2 rounded w-full"
  placeholder="Points"
  value={quantity}
  onChange={(e) => setQuantity(Number(e.target.value))}
  required
/>
            </div>

            {/* Points */}
            <div>
              <label className="font-medium block mb-1">Points per unit</label>
              <input
                type="number"
                className="border p-2 rounded w-full"
                value={pointsEarned === "" ? "" : pointsEarned}
                onChange={(e) => setPointsEarned(Number(e.target.value))}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full p-3 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add to Inventory"}
            </button>
          </form>

          {/* Inventory Table */}
          <div>
            <h3 className="text-xl font-semibold mb-2">User Inventory</h3>

            {loadingInv ? (
              <p>Loading...</p>
            ) : inventory.length === 0 ? (
              <p>No items.</p>
            ) : (
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
                  {inventory.map((item: any) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">
                        <img
                          src={item.imageUrl || "/no-image.png"}
                          className="w-10 h-10 border rounded"
                        />
                      </td>
                      <td className="p-2">{item.sku}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">{item.pointsEarned}</td>
                      <td className="p-2">
                        {item.quantity * item.pointsEarned}
                      </td>
                      <td className="p-2">{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
