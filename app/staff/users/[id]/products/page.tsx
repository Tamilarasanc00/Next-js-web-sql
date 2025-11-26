"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

// Toast Component
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed top-5 right-5 z-50 px-4 py-3 rounded shadow-lg text-white animate-slide-in
      ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      {message}
    </div>
  );
}

export default function AssignProducts() {
  const { id } = useParams(); // userId

  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [selectedUser, setSelectedUser] = useState<string>(id || "");
  const [selectedSku, setSelectedSku] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [pointsEarned, setPointsEarned] = useState("");

  const [toast, setToast] = useState<any>(null);
  const [searchUser, setSearchUser] = useState("");
  const [searchProduct, setSearchProduct] = useState("");

  const [selectedImage, setSelectedImage] = useState("");

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Load users and products
  useEffect(() => {
    async function load() {
      const u = await fetch("/api/admin/users");
      const p = await fetch("/api/admin/products");

      const ud = await u.json();
      const pd = await p.json();

      setUsers(Array.isArray(ud) ? ud : ud.users || []);
      setProducts(Array.isArray(pd) ? pd : pd.products || []);
    }
    load();
  }, []);

  // Filter logic
  const filteredUsers = users.filter((u: any) =>
    (u.name + u.email).toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredProducts = products.filter((p: any) =>
    (p.name + p.sku).toLowerCase().includes(searchProduct.toLowerCase())
  );

  // Submit
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedUser) return setToast({ message: "Choose a user", type: "error" });
    if (!selectedSku) return setToast({ message: "Choose a product", type: "error" });
    if (!quantity) return setToast({ message: "Enter quantity", type: "error" });

    const res = await fetch(`/api/staff/users/${selectedUser}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: selectedSku,
        quantity,
        points: pointsEarned,
      }),
    });

    const data = await res.json();

    if (!res.ok) return setToast({ message: data.error, type: "error" });

    setToast({ message: "Inventory added!", type: "success" });
    setQuantity("1");
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-xl bg-white shadow-xl rounded-xl p-6 space-y-6 animate-fade-in">

          <h2 className="text-2xl font-bold text-center">Add to Inventory</h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* USER DROPDOWN */}
            <div>
              <label className="block mb-1 font-medium">Select User</label>
              {/* <input
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search user..."
                className="border p-2 rounded w-full mb-2"
              /> */}
              <select
                className="border p-2 w-full rounded"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">-- Select User --</option>
                {filteredUsers.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {/* PRODUCT DROPDOWN */}
            <div>
              <label className="block mb-1 font-medium">Select Product</label>

              {/* <input
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                placeholder="Search product..."
                className="border p-2 rounded w-full mb-2"
              /> */}

              <select
                className="border p-2 w-full rounded"
                value={selectedSku}
                onChange={(e) => {
                  const sku = e.target.value;
                  setSelectedSku(sku);

                  const product = products.find((p: any) => p.sku === sku);
                  if (product) {
                    setPointsEarned(product.pointsValue);
                    setSelectedImage(product.imageUrl || "");
                  }
                }}
              >
                <option value="">-- Select Product --</option>
                {filteredProducts.map((p: any) => (
                  <option key={p.id} value={p.sku}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* IMAGE PREVIEW */}
            {selectedImage && (
              <div className="flex justify-center">
                <img
                  src={selectedImage}
                  className="w-32 h-32 rounded shadow-md border object-cover"
                />
              </div>
            )}

            {/* QUANTITY */}
            <div>
              <label className="block mb-1 font-medium">Quantity</label>
              <input
                type="number"
                className="border p-2 rounded w-full"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            {/* POINTS */}
            <div>
              <label className="block mb-1 font-medium">Points Earned</label>
              <input
                type="number"
                className="border p-2 rounded w-full"
                value={pointsEarned}
                onChange={(e) => setPointsEarned(e.target.value)}
              />
            </div>

            <button className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700">
              Add to Inventory
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
