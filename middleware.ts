


// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get("token")?.value;

//   // protect /dashboard and nested routes
//   if (req.nextUrl.pathname.startsWith("/app/dashboard")) {
//     if (!token) {
//       return NextResponse.redirect(new URL("/app/login", req.url));
//     }

//     try {
//       jwt.verify(token, process.env.JWT_SECRET!);
//       return NextResponse.next();
//     } catch (err) {
//       console.log("JWT Verification Error:", err);
//       return NextResponse.redirect(new URL("/app/login", req.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/app/dashboard/:path*", "/app/dashboard"],
// };


// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export async function middleware(req: NextRequest) {
//   const path = req.nextUrl.pathname;

//   // Allow public routes
//   const publicRoutes = ["/login", "/register"];
//   if (publicRoutes.includes(path)) return NextResponse.next();

//   // Read token from cookies
//   const token = req.cookies.get("token")?.value;

//   // Redirect if no token
//   if (!token) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   let decoded: any = null;

//   try {
//     decoded = jwt.verify(token, process.env.JWT_SECRET!);
//   } catch (err) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   const userType = decoded.userType;

//   // ------------------ ADMIN-ONLY ROUTES ------------------
//   if (path.startsWith("/app/dashboard/users") || path.startsWith("/app/api/admin/users")) {
//     if (userType !== "admin") {
//       return NextResponse.redirect(new URL("/not-authorized", req.url));
//     }
//   }

//   if (path.startsWith("/app/api/admin/products")) {
//     if (userType !== "admin" ) {
//       return NextResponse.redirect(new URL("/not-authorized", req.url));
//     }
//   }

//   // ------------------ STAFF BLOCK CUSTOMERS ------------------
//   if (path.startsWith("/dashboard/products") && userType === "customer") {
//     return NextResponse.redirect(new URL("/not-authorized", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/app/dashboard/:path*",
//     "/app/api/admin/:path*",
//   ],
// };


// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export async function middleware(req: NextRequest) {
//   const path = req.nextUrl.pathname;

//   // Public pages
//   const publicRoutes = ["/login", "/register"];
//   if (publicRoutes.includes(path)) return NextResponse.next();

//   // Read token from cookies
//   const token = req.cookies.get("token")?.value;

//   // Redirect if not logged in
//   if (!token) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   let decoded: any = null;

//   try {
//     decoded = jwt.verify(token, process.env.JWT_SECRET!);
//   } catch (err) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   const userType = decoded.userType;

//   // ------------------ ADMIN ONLY ROUTES ------------------
//   if (
//     path.startsWith("/app/dashboard/users") ||
//     path.startsWith("/app/api/admin/users") ||
//     path.startsWith("/app/api/admin/products")
//   ) {
//     if (userType !== "admin") {
//       return NextResponse.redirect(new URL("/not-authorized", req.url));
//     }
//   }

//   // ------------------ STAFF RESTRICTION ------------------
//   if (path.startsWith("/app/dashboard/products") && userType === "customer") {
//     return NextResponse.redirect(new URL("/not-authorized", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/app/dashboard/:path*", "/app/api/admin/:path*"],
// };


import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Routes that don't require login
  const publicRoutes = ["/login", "/register"];
  if (publicRoutes.includes(path)) return NextResponse.next();

  const token = req.cookies.get("token")?.value;

  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = decoded.userType; // admin, staff, customer

  // ------------------ ADMIN-ONLY ROUTES ------------------
  if (
    path.startsWith("/dashboard/users") ||
    path.startsWith("/api/admin/users")
  ) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/not-authorized", req.url));
    }
  }

  // ------------------ STAFF + ADMIN CAN ADD PRODUCTS ------------------
  if (path.startsWith("/api/admin/products") && req.method === "POST") {
    if (role === "customer") {
      return NextResponse.redirect(new URL("/not-authorized", req.url));
    }
  }

  // ------------------ DELETE PRODUCT → ADMIN ONLY ------------------
  if (path.startsWith("/api/admin/products") && req.method === "DELETE") {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/not-authorized", req.url));
    }
  }

  // ------------------ UPDATE PRODUCT → STAFF/ADMIN ------------------
  if (path.startsWith("/api/admin/products") && req.method === "PUT") {
    if (role === "customer") {
      return NextResponse.redirect(new URL("/not-authorized", req.url));
    }
  }

  // ------------------ CUSTOMER RESTRICTION ------------------
  if (path.startsWith("/dashboard/products") && role === "customer") {
    // Customers can view but not modify UI
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/dashboard/:path*", "/app/api/admin/:path*"],
};
