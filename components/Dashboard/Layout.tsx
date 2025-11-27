// "use client";

// import React, { useEffect, useState } from "react";
// import LogoutButton from "@/components/Auth/LogoutButton";
// import Link from "next/link";
// import { jwtDecode } from "jwt-decode";
// // import RedeemPoints from './RedeemPoints'

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//   const [open, setOpen] = useState(false);
//   const [role, setRole] = useState<string>("");
//   const [userId, setUserId] = useState<number>();
//   const [userName, setUserName] = useState<string>("");
//   const [userImage, setUserImage] = useState<string>("");

//   useEffect(() => {
//     try {
//       const token = localStorage.getItem("token");
//       if (token) {
//         const decoded: any = jwtDecode(token);

//         setUserName(decoded.name || "");
//         setUserImage(decoded.image || "");
//         setRole(decoded.userType || "");
//         setUserId(decoded.id ? Number(decoded.id) : undefined);

//       }
//     } catch (e) {
//       console.log("Role Read Error:", e);
//     }
//   }, []);

//   /** ---- Sidebar MENU handling roles ----- **/
//   const menuItems = [
//     { title: "Overview", href: "/dashboard", allow: ["admin", "staff", "customer"] },
//     { title: "Users", href: "/dashboard/users", allow: ["admin"] },
//     { title: "Products", href: "/dashboard/products", allow: ["admin", "staff", "customer"] },
//     { title: "Points To Customer", href: "/staff/users/[id]/products", allow: ["admin", "staff","customer"] },
//     { title: "Redeem", href: "/dashboard/redeem-points", allow: ["admin", "staff", "customer"] },
//     { title: "Analytics", href: "/dashboard/customer-analytics", allow: ["admin", "staff", "customer"] },
//     { title: "Redeem History", href: "/dashboard/redeem-history", allow: ["admin", "staff", "customer"] },
//   ];

//   const filteredMenu = menuItems.filter((m) => m.allow.includes(role));

//   return (
//     <div className="min-h-screen flex bg-gray-100">

//       {/* ---------------------- DESKTOP SIDEBAR ---------------------- */}
//       <aside className="hidden md:block w-64 bg-white border-r">

//         {/* Profile */}
//         <div className="p-4 flex items-center gap-3 border-b">
//           <img
//             src={userImage || "/default-avatar.png"}
//             alt="User Image"
//             className="h-12 w-12 rounded-full object-cover border"
//           />
//           <div>
//             <div className="text-lg font-semibold">{userName || "User"}</div>
//             <div className="text-sm text-gray-500">{role?.toUpperCase()}</div>
//           </div>
//         </div>

//         {/* Sidebar Links */}
//         <nav className="p-4 space-y-1">
//           {filteredMenu.map((m) => (
//           <Link
//   key={m.href}
//   href={m.href}
//   prefetch={false}
//   scroll={false}
//   className="block px-3 py-2 rounded hover:bg-gray-50"
// >
//   {m.title}
// </Link>

//           ))}
//         </nav>

//         <div className="p-4 mt-auto">
//           <LogoutButton />
//         </div>
//       </aside>

//       {/* ---------------------- MOBILE TOP NAV ---------------------- */}
//       <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-40 p-3 border-b flex items-center justify-between">
//         <button onClick={() => setOpen(!open)} className="p-2 rounded-md bg-gray-200">
//           ☰
//         </button>
//         <div className="font-semibold">{userName || "User"}</div>
//         <LogoutButton />
//       </div>

//       {/* ---------------------- MOBILE SIDEBAR DRAWER ---------------------- */}
//       {open && (
//         <div className="md:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 p-4 space-y-4">
//           <button onClick={() => setOpen(false)} className="pb-4 text-xl">✕</button>

//           {filteredMenu.map((m) => (
//  <Link
//   key={m.href}
//   href={m.href}
//   prefetch={false}
//   scroll={false}
//   className="block px-3 py-2 rounded hover:bg-gray-50"
// >
//   {m.title}
// </Link>

//           ))}

//           <div className="pt-4">
//             <LogoutButton />
//           </div>
//         </div>
//       )}

//       {/* ---------------------- MAIN CONTENT ---------------------- */}
//       <main className="flex-1 p-6 mt-16 md:mt-0">
//         <header className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-bold">Dashboard</h1>
//             <p className="text-gray-500 text-sm">Admin Panel Overview</p>
//           </div>
//         </header>

//         <div>{children}</div>
//       </main>
//     </div>
//   );
// }



// components/Dashboard/Layout.tsx
"use client";

import React, { useEffect, useState } from "react";
import LogoutButton from "@/components/Auth/LogoutButton";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import UsersTable from "@/components/Dashboard/UsersTable";
import ProductsTable from "@/components/Dashboard/ProductsTable";
import PointsCustTable from "@/app/staff/users/[id]/products/page";
import RedeemPoints from "@/components/Dashboard/RedeemPoints";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // UI state
  const [open, setOpen] = useState(false);

  // auth / user info (read only on client)
  const [isReady, setIsReady] = useState(false); // wait until we've read token (avoid hydration mismatch)
  const [role, setRole] = useState<string>("");
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userImage, setUserImage] = useState<string>("");

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded: any = jwtDecode(token);
        setUserName(decoded.name || "");
        setUserImage(decoded.image || "");
        setRole(decoded.userType || "");
        setUserId(decoded.id ? Number(decoded.id) : null);
      } else {
        // no token -> treat as guest (no role)
        setRole("");
        setUserId(null);
      }
    } catch (e) {
      console.error("Role Read Error:", e);
      setRole("");
      setUserId(null);
    } finally {
      // mark ready so render won't mismatch server output
      setIsReady(true);
    }
  }, []);

  /** ---- Sidebar MENU handling roles ----- **/
  const rawMenu = [
    { title: "Overview", href: "/dashboard", allow: ["admin", "staff", "customer"] },
    { title: "Users", href: "/dashboard/users", allow: ["admin"] },
    { title: "Products", href: "/dashboard/products", allow: ["admin", "staff", "customer"] },
    { title: "Redeem", href: "/dashboard/redeem-points", allow: ["admin", "staff", "customer"] },
    { title: "Analytics", href: "/dashboard/customer-analytics", allow: ["admin", "staff"] },
    { title: "Redeem History", href: "/dashboard/redeem-history", allow: ["admin", "staff", "customer"] },
  ];

  // Resolve menu for rendering: if dynamic and userId exists -> fill id
const filteredMenu = rawMenu
  .filter((m) => isReady && m.allow.includes(role))
  .map((m) => ({
    ...m,
    resolvedHref: m.href,   // always use normal href
    requiresId: false,      // no dynamic pages now
  }));


  // client navigation helper: uses router.push (SPA)
  function navigate(href: string | null | undefined) {
    if (!href) return;
    // close mobile drawer if open
    setOpen(false);
    router.push(href);
  }

  // simple link component that does SPA navigation and avoids reload
  function NavLink({
    title,
    href,
    disabled,
  }: {
    title: string;
    href: string | null | undefined;
    disabled?: boolean;
  }) {
    // If disabled or no href available, render a button/disabled element
    if (!href || disabled) {
      return (
        <button
          type="button"
          onClick={() => {
            if (!href) {
              // show small client-side alert if needed
              // you can replace with your toast implementation
              alert("No user selected yet. Please login first.");
            }
          }}
          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-gray-500"
          aria-disabled
        >
          {title}
        </button>
      );
    }

    // normal Link (prefetch false for stability) with onClick to ensure SPA navigation
    return (
      <Link
        href={href}
        prefetch={false}
        scroll={false}
        onClick={(e) => {
          // prevent default to ensure router.push used (avoids any full reload mismatch)
          e.preventDefault();
          navigate(href);
        }}
        className="block px-3 py-2 rounded hover:bg-gray-50"
      >
        {title}
      </Link>
    );
  }

  // render skeleton before isReady to avoid hydration mismatch
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* ---------------------- DESKTOP SIDEBAR ---------------------- */}
      <aside className="hidden md:block w-64 bg-white border-r">
        {/* Profile */}
        <div className="p-4 flex items-center gap-3 border-b">
          <img
            src={userImage || "/default-avatar.png"}
            alt="User Image"
            className="h-12 w-12 rounded-full object-cover border"
          />
          <div>
            <div className="text-lg font-semibold">{userName || "User"}</div>
            <div className="text-sm text-gray-500">{role ? role.toUpperCase() : "GUEST"}</div>
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="p-4 space-y-1">
          {filteredMenu.map((m) => (
            <NavLink
              key={m.href}
              title={m.title}
              href={m.resolvedHref}
              disabled={m.requiresId && !m.resolvedHref}
            />
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <LogoutButton />
        </div>
      </aside>

      {/* ---------------------- MOBILE TOP NAV ---------------------- */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-40 p-3 border-b flex items-center justify-between">
        <button onClick={() => setOpen(!open)} className="p-2 rounded-md bg-gray-200">
          ☰
        </button>
        <div className="font-semibold">{userName || "User"}</div>
        <LogoutButton />
      </div>

      {/* ---------------------- MOBILE SIDEBAR DRAWER ---------------------- */}
      {open && (
        <div className="md:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 p-4 space-y-4">
          <button onClick={() => setOpen(false)} className="pb-4 text-xl">✕</button>

          {filteredMenu.map((m) => (
            <div key={m.href}>
              {/* use same NavLink but ensure click closes drawer */}
              <a
                onClick={(e) => {
                  e.preventDefault();
                  if (!m.resolvedHref) {
                    alert("No user selected yet. Please login first.");
                    setOpen(false);
                    return;
                  }
                  setOpen(false);
                  router.push(m.resolvedHref);
                }}
                className={`block px-3 py-2 rounded hover:bg-gray-50 ${!m.resolvedHref ? "text-gray-500" : ""}`}
                href={m.resolvedHref ?? "#"}
              >
                {m.title}
              </a>
            </div>
          ))}

          <div className="pt-4">
            <LogoutButton />
          </div>
        </div>
      )}

      {/* ---------------------- MAIN CONTENT ---------------------- */}
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
