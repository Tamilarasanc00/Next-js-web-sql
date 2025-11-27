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
