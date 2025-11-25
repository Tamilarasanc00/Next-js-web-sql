"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import LogoutButton from "@/components/Auth/LogoutButton";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const cookie = document.cookie.split("; ").find(c => c.startsWith("token="));
    if (cookie) {
      const token = cookie.split("=")[1];
      const decoded: any = jwtDecode(token);
      setUserType(decoded.userType);
    }
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 flex items-center gap-3 border-b">
          <div>
            <div className="text-lg font-semibold">Doodle Admin</div>
            <div className="text-sm text-gray-500">{userType}</div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <a href="/dashboard" className="block px-3 py-2 rounded hover:bg-gray-50">Overview</a>

          {userType === "admin" && (
            <a href="/dashboard/users" className="block px-3 py-2 rounded hover:bg-gray-50">
              Users
            </a>
          )}

          {userType !== "customer" && (
            <a href="/dashboard/products" className="block px-3 py-2 rounded hover:bg-gray-50">
              Products
            </a>
          )}
        </nav>

        <div className="p-4 mt-auto">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
