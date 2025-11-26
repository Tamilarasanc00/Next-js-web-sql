"use client";

import React, { useEffect, useState } from "react";
import LogoutButton from "@/components/Auth/LogoutButton";
import Link from "next/link";
import {jwtDecode} from "jwt-decode";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
const [userImage, setUserImage] = useState<string>("");


  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {

        const decoded: any = jwtDecode(token);
        setUserName(decoded.name || "");
        setUserImage(decoded.image || "");
        setRole(decoded.userType || "");
      }
    } catch (e) {
      console.log("Role Read Error:", e);
    }
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* ------------------ SIDEBAR (DESKTOP) ------------------ */}
      <aside className="hidden md:block w-64 bg-white border-r">

        {/* Logo Section */}
        <div className="p-4 flex items-center gap-3 border-b">
          <img
  src={userImage || "/default-avatar.png"}
  alt="User Image"
  className="h-12 w-12 rounded-full object-cover border"
/>
          <div>
  <div className="text-lg font-semibold">{userName || "User"}</div>
  <div className="text-sm text-gray-500">{role?.toUpperCase()}</div>
</div>
        </div>

        {/* Sidebar Links */}
        <nav className="p-4 space-y-1">
          <Link href="/dashboard" className="block px-3 py-2 rounded hover:bg-gray-50">
            Overview
          </Link>

          {role === "admin" && (
            <Link href="/dashboard/users" className="block px-3 py-2 rounded hover:bg-gray-50">
              Users
            </Link>
          )}

          <Link href="/dashboard/products" className="block px-3 py-2 rounded hover:bg-gray-50">
            Products
          </Link>
        </nav>

        <div className="p-4 mt-auto">
          <LogoutButton />
        </div>
      </aside>

      {/* ------------------ MOBILE TOP NAV ------------------ */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-40 p-3 border-b flex items-center justify-between">
        <button onClick={() => setOpen(!open)} className="p-2 rounded-md bg-gray-200">
          ☰
        </button>
        <div className="font-semibold">Doodle Admin</div>
        <LogoutButton />
      </div>

      {/* ------------------ MOBILE SIDEBAR DRAWER ------------------ */}
      {open && (
        <div className="md:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 p-4 space-y-4">
          <button onClick={() => setOpen(false)} className="pb-4 text-xl">✕</button>

          <Link href="/dashboard" className="block py-2" onClick={() => setOpen(false)}>
            Overview
          </Link>

          {role === "admin" && (
            <Link href="/dashboard/users" className="block py-2" onClick={() => setOpen(false)}>
              Users
            </Link>
          )}

          <Link href="/dashboard/products" className="block py-2" onClick={() => setOpen(false)}>
            Products
          </Link>

          <div className="pt-4">
            <LogoutButton />
          </div>
        </div>
      )}

      {/* ------------------ MAIN CONTENT ------------------ */}
      <main className="flex-1 p-6 mt-16 md:mt-0">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-500 text-sm">Admin Panel Overview</p>
          </div>
        </header>

        <div>{children}</div>
      </main>
    </div>
  );
}
