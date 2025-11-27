// "use client";

// import React, { useEffect, useState } from "react";
// import DashboardLayout from "@/components/Dashboard/Layout";
// import { StatsCard } from "@/components/Dashboard/StatsCard";
// import UsersTable from "@/components/Dashboard/UsersTable";
// import ProductsTable from "@/components/Dashboard/ProductsTable";
// import PointsCustTable from "@/app/staff/users/[id]/products/page";
// import { jwtDecode } from "jwt-decode";
// import RedeemPoints from "@/components/Dashboard/RedeemPoints";

// export default function DashboardPage() {
//   const [usersCount, setUsersCount] = useState(0);
//   const [productsCount, setProductsCount] = useState(0);
//   const [pointsEstimate, setPointsEstimate] = useState(0);

//   // Customer-specific
//   const [myPoints, setMyPoints] = useState(0);
//   const [myProducts, setMyProducts] = useState(0);
//   const [myInventory, setMyInventory] = useState(0);

//   const [tab, setTab] = useState<
//     "overview" | "users" | "products" | "pointsToCustomer" | "redeem"
//   >("overview");

//   const [role, setRole] = useState("");
//   const [userId, setUserId] = useState<number | null>(null);

//   // -----------------------------
//   // Decode token
//   // -----------------------------
//   useEffect(() => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return;
//       const decoded: any = jwtDecode(token);
//       setRole(decoded.userType || "");
//       setUserId(decoded.id || null);
//     } catch {
//       setRole("");
//     }
//   }, []);

//   // -----------------------------
//   // Load Admin / Staff Summary
//   // -----------------------------
//   useEffect(() => {
//     async function load() {
//       try {
//         const u = await fetch("/api/admin/users");
//         const p = await fetch("/api/admin/products");

//         const ud = await u.json();
//         const pd = await p.json();

//         const users = Array.isArray(ud) ? ud : ud.users || [];
//         const products = Array.isArray(pd) ? pd : pd.products || [];

//         setUsersCount(users.length);
//         setProductsCount(products.length);

//         setPointsEstimate(
//           products.reduce(
//             (sum: any, item: any) => sum + (item.pointsValue || 0),
//             0
//           )
//         );
//       } catch (err) {
//         console.error(err);
//       }
//     }

//     if (role === "admin" || role === "staff") load();
//   }, [role]);

//   // -----------------------------
//   // Load Customer Dashboard Data
//   // -----------------------------
//   useEffect(() => {
//     async function loadCustomerData() {
//       if (!userId || role !== "customer") return;

//       try {
//         //  Load customer profile
//         const userRes = await fetch(`/api/admin/users/${userId}`);
//         const userData = await userRes.json();

//         setMyPoints(Number(userData.user?.totalPoints || 0));
// console.log("Decoded userId =", userId, "role =", role);
//         //  Load inventory for customer
//         //const invRes = await fetch(`/api/staff/users/${userId}/inventory`);
//         // MUST include token so API returns correct inventory

//    const invRes = await fetch(`/api/staff/users/${userId}/inventory`, {
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem("token")}`
//   }
// });


//         const invData = await invRes.json();

//         console.log("invData",invData);
        

//         const inventory = Array.isArray(invData) ? invData : invData.inventory || [];

//         setMyInventory(inventory.length);

//         //  Count distinct products
//         const uniqueProducts = new Set(inventory.map((i: any) => i.user_id));
//         setMyProducts(uniqueProducts.size);

//       } catch (err) {
//         console.error("Customer dashboard load error:", err);
//       }
//     }

//     loadCustomerData();
//   }, [userId, role]);

//   return (
//     <DashboardLayout>
//       {/* ---------------- Tab Buttons ---------------- */}
//       <div className="mb-4 flex gap-2">

//         {/* Everyone */}
//         <button
//           onClick={() => setTab("overview")}
//           className={`px-3 py-1 rounded ${
//             tab === "overview"
//               ? "bg-indigo-600 text-white"
//               : "bg-white border"
//           }`}
//         >
//           Overview
//         </button>

//         {/* Admin ONLY */}
//         {role === "admin" && (
//           <button
//             onClick={() => setTab("users")}
//             className={`px-3 py-1 rounded ${
//               tab === "users"
//                 ? "bg-indigo-600 text-white"
//                 : "bg-white border"
//             }`}
//           >
//             Users
//           </button>
//         )}

//         {/* Staff + Admin + Customer */}
//         <button
//           onClick={() => setTab("products")}
//           className={`px-3 py-1 rounded ${
//             tab === "products"
//               ? "bg-indigo-600 text-white"
//               : "bg-white border"
//           }`}
//         >
//           Products
//         </button>

//         {/* Staff + Admin */}
//         {(role === "admin" || role === "staff" || role === "customers") && (
//           <button
//             onClick={() => setTab("pointsToCustomer")}
//             className={`px-3 py-1 rounded ${
//               tab === "pointsToCustomer"
//                 ? "bg-indigo-600 text-white"
//                 : "bg-white border"
//             }`}
//           >
//             Points To Customer
//           </button>
//         )}

//         {/* Customer redeem allowed also */}
//         <button
//           onClick={() => setTab("redeem")}
//           className={`px-3 py-1 rounded ${
//             tab === "redeem"
//               ? "bg-indigo-600 text-white"
//               : "bg-white border"
//           }`}
//         >
//           Redeem
//         </button>
//       </div>

//       {/* ---------------- Tab Content ---------------- */}
//       {tab === "overview" && (
//         <StatsCard
//           role={role}
//           users={usersCount}
//           products={productsCount}
//           points={pointsEstimate}
//           myPoints={myPoints}
//           myProducts={myProducts}
//           myInventory={myInventory}
//         />
//       )}

//       {tab === "users" && role === "admin" && <UsersTable />}

//       {tab === "products" && <ProductsTable />}

//       {tab === "pointsToCustomer" && role === "customer" && <PointsCustTable />}

//       {tab === "redeem" && <RedeemPoints />}
      
//     </DashboardLayout>
//   );
// }


"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/Layout";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import UsersTable from "@/components/Dashboard/UsersTable";
import ProductsTable from "@/components/Dashboard/ProductsTable";
import PointsCustTable from "@/app/staff/users/[id]/products/page";
import { jwtDecode } from "jwt-decode";
import RedeemPoints from "@/components/Dashboard/RedeemPoints";

export default function DashboardPage() {
  const [usersCount, setUsersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [pointsEstimate, setPointsEstimate] = useState(0);

  // Customer-specific
  const [myPoints, setMyPoints] = useState(0);
  const [myProducts, setMyProducts] = useState(0);
  const [myInventory, setMyInventory] = useState(0);

  const [tab, setTab] = useState<
    "overview" | "users" | "products" | "pointsToCustomer" | "redeem"
  >("overview");

  const [role, setRole] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  // -----------------------------
  // Decode token
  // -----------------------------
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

  // -----------------------------
  // Load Admin / Staff Summary
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
          products.reduce(
            (sum: any, item: any) => sum + (item.pointsValue || 0),
            0
          )
        );
      } catch (err) {
        console.error(err);
      }
    }

    if (role === "admin" || role === "staff") load();
  }, [role]);

  // -----------------------------
  // Load Customer Dashboard Data
  // -----------------------------
  useEffect(() => {
    async function loadCustomerData() {
      if (!userId || role !== "customer") return;

      try {
        // Fetch customer profile
        const userRes = await fetch(`/api/admin/users/${userId}`);
        const userData = await userRes.json();

        setMyPoints(Number(userData.user?.totalPoints || 0));

        // Inventory with token
        const invRes = await fetch(`/api/staff/users/${userId}/inventory`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        const invData = await invRes.json();
        const inventory = Array.isArray(invData) ? invData : invData.inventory || [];

        setMyInventory(inventory.length);

        // Count unique SKUs
        const uniqueProducts = new Set(inventory.map((i: any) => i.sku));
        setMyProducts(uniqueProducts.size);

      } catch (err) {
        console.error("Customer dashboard load error:", err);
      }
    }

    loadCustomerData();
  }, [userId, role]);

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

        {/* Staff + Admin ONLY */}
        {(role === "admin" || role === "staff" || role === "customer") && (
          <button
            onClick={() => setTab("pointsToCustomer")}
            className={`px-3 py-1 rounded ${
              tab === "pointsToCustomer" ? "bg-indigo-600 text-white" : "bg-white border"
            }`}
          >
            Points To Customer
          </button>
        )}

        {/* Everyone can redeem */}
        <button
          onClick={() => setTab("redeem")}
          className={`px-3 py-1 rounded ${
            tab === "redeem" ? "bg-indigo-600 text-white" : "bg-white border"
          }`}
        >
          Redeem
        </button>

      </div>

      {/* ---------------- Tab Content ---------------- */}
      {tab === "overview" && (
        <StatsCard
          role={role}
          users={usersCount}
          products={productsCount}
          points={pointsEstimate}
          myPoints={myPoints}
          myProducts={myProducts}
          myInventory={myInventory}
        />
      )}

      {tab === "users" && role === "admin" && <UsersTable />}

      {tab === "products" && <ProductsTable />}

      {tab === "pointsToCustomer" && (role === "admin" || role === "staff" || role === "customer") && (
        <PointsCustTable />
      )}

      {tab === "redeem" && <RedeemPoints />}

    </DashboardLayout>
  );
}
