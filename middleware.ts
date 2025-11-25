// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export async function middleware(req: NextRequest) {
//   const path = req.nextUrl.pathname;

//   // Routes that don't require login
//   const publicRoutes = ["/login", "/register"];
//   if (publicRoutes.includes(path)) return NextResponse.next();

//   const token = req.cookies.get("token")?.value;

//   if (!token) return NextResponse.redirect(new URL("/login", req.url));

//   let decoded: any;
//   try {
//     decoded = jwt.verify(token, process.env.JWT_SECRET!);
//   } catch {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   const role = decoded.userType; // admin, staff, customer

//   // ------------------ ADMIN-ONLY ROUTES ------------------
//   if (
//     path.startsWith("/dashboard/users") ||
//     path.startsWith("/api/admin/users")
//   ) {
//     if (role !== "admin") {
//       return NextResponse.redirect(new URL("/not-authorized", req.url));
//     }
//   }

//   // ------------------ STAFF + ADMIN CAN ADD PRODUCTS ------------------
//   if (path.startsWith("/api/admin/products") && req.method === "POST") {
//     if (role === "customer") {
//       return NextResponse.redirect(new URL("/not-authorized", req.url));
//     }
//   }

//   // ------------------ DELETE PRODUCT → ADMIN ONLY ------------------
//   if (path.startsWith("/api/admin/products") && req.method === "DELETE") {
//     if (role !== "admin") {
//       return NextResponse.redirect(new URL("/not-authorized", req.url));
//     }
//   }

//   // ------------------ UPDATE PRODUCT → STAFF/ADMIN ------------------
//   if (path.startsWith("/api/admin/products") && req.method === "PUT") {
//     if (role === "customer") {
//       return NextResponse.redirect(new URL("/not-authorized", req.url));
//     }
//   }

//   // ------------------ CUSTOMER RESTRICTION ------------------
//   if (path.startsWith("/dashboard/products") && role === "customer") {
//     // Customers can view but not modify UI
//     return NextResponse.next();
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/app/dashboard/:path*", "/app/api/admin/:path*"],
// };



import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes without checking token
  const publicPaths = ["/login", "/register", "/forgot-password", "/verify-otp", "/reset-password", "/reset-success"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check token
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = decoded.userType; // admin, staff, customer

  // -------------------------
  // ADMIN-ONLY ROUTES
  // -------------------------
  const adminRoutes = [
    "/dashboard/users",
    "/api/admin/users",
    "/api/admin/products",
  ];

  if (adminRoutes.some((p) => pathname.startsWith(p))) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/not-authorized", req.url));
    }
  }

  // -------------------------
  // STAFF RULES
  // -------------------------
  // staff can access dashboard/products but cannot delete users
  if (pathname.startsWith("/dashboard/products") && role === "customer") {
    return NextResponse.redirect(new URL("/not-authorized", req.url));
  }

  // staff cannot access /dashboard/users
  if (pathname.startsWith("/dashboard/users") && role !== "admin") {
    return NextResponse.redirect(new URL("/not-authorized", req.url));
  }

  // customers cannot access admin APIs
  if (pathname.startsWith("/api/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/not-authorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/dashboard/:path*",
    "/app/api/admin/:path*",
  ],
};
