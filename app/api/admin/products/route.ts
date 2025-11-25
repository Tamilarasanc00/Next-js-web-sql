import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { products } from "@/lib/db/schema";
import jwt from "jsonwebtoken";

async function checkAdminOrStaff(req: Request) {
  let token =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    (req.headers.get("cookie") || "")
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

  if (!token) return { ok: false, error: "Unauthorized", status: 401 };

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log("ROLE:",decoded.userType);

    if (decoded.userType === "admin" || decoded.userType === "staff") {
      return { ok: true };
    }
    return { ok: false, error: "Forbidden", status: 403 };
  } catch {
    return { ok: false, error: "Invalid Token", status: 401 };
  }
}


// -----------------------------------------
// GET ALL PRODUCTS (Admin Only)
// -----------------------------------------
export async function GET(req: Request) {
  const auth = await checkAdminOrStaff(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const all = await Database.select().from(products).orderBy(products.id);
    return NextResponse.json(all);
  } catch (err) {
    console.log("PRODUCTS GET ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}



// POST (Admin + Staff)
export async function POST(req: Request) {
  const auth = await checkAdminOrStaff(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const inserted = await Database.insert(products).values(body).returning();
    return NextResponse.json(inserted[0]);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

