
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
  if (pathname.startsWith("/dashboard/users") && role !== "admin" || role!=="customer") {
    return NextResponse.redirect(new URL("/not-authorized", req.url));
  }

  //Staff
if (pathname.startsWith("/staff")) {
  if (role !== "staff") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
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
    "/staff/:path*"
  ],
};
// export const config = {
//   matcher: [
//     "/app/dashboard/:path*",
//     "/app/api/admin/:path*",
//     "/app/staff/:path*"
//   ],
// };

