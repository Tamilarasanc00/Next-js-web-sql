// "use client";
// import UsersTable from "@/components/Dashboard/UsersTable";
// import  DashboardLayout  from "@/components/Dashboard/Layout";

// export default function UsersPage() {
//   return (
//     <DashboardLayout>
//       <UsersTable />
//     </DashboardLayout>
//   );
// }


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode";
import DashboardLayout from "@/components/Dashboard/Layout";
import UsersTable from "@/components/Dashboard/UsersTable";

export default function UsersPage() {
  const router = useRouter();

  useEffect(() => {
    // client-side guard: if no token or not admin, redirect
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.push("/login");
        return;
      }

      const decoded: any = jwtDecode(token);
      if (!decoded || decoded.userType !== "admin") {
        router.push("/not-authorized");
      }
    } catch (err) {
      // if decode fails, send to login
      router.push("/login");
    }
  }, [router]);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <UsersTable />
      </div>
    </DashboardLayout>
  );
}
