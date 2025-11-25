// "use client";

// export default function DashboardStats() {
//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <h1 className="text-3xl font-bold mb-6">Welcome to the Dashboard</h1>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
//         <div className="bg-white p-6 rounded-lg shadow">
//           <p className="text-gray-500 text-sm">Total Users</p>
//           <p className="text-3xl font-bold mt-2">25</p>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <p className="text-gray-500 text-sm">Total Products</p>
//           <p className="text-3xl font-bold mt-2">18</p>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <p className="text-gray-500 text-sm">Total Points</p>
//           <p className="text-3xl font-bold mt-2">42,350</p>
//         </div>

//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import LogoutButton from "@/components/Auth/LogoutButton";

export default function DashboardStats() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = (document.cookie.split("token=")[1] || "").split(";")[0];

    if (token) {
      const decoded: any = jwtDecode(token);
      setUser(decoded);
    }
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">
          Welcome {user?.email ? user.email : "User"}
        </h1>

        <LogoutButton />
      </div>

      <div className="mt-6">
        {/* Your Dashboard Content */}
      </div>
    </div>
  );
}
