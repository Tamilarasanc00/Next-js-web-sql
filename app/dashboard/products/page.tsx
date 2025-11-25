// "use client";
// import ProductsTable from "@/components/Dashboard/ProductsTable";
// import  DashboardLayout  from "@/components/Dashboard/Layout";

// export default function ProductsPage() {
//   return (
//     <DashboardLayout>
//       <ProductsTable />
//     </DashboardLayout>
//   );
// }


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode";
import DashboardLayout from "@/components/Dashboard/Layout";
import ProductsTable from "@/components/Dashboard/ProductsTable";

export default function ProductsPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const decoded: any = jwtDecode(token);

      // Customers can VIEW only — allowed
      // Staff can VIEW + ADD — allowed
      // Admin can VIEW + ADD + DELETE — allowed

      if (!decoded?.userType) {
        router.push("/login");
        return;
      }
    } catch (err) {
      router.push("/login");
    }
  }, [router]);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        <ProductsTable />
      </div>
    </DashboardLayout>
  );
}
