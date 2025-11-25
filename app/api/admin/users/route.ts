import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔐 Helper: Validate Admin
async function checkAdmin(req: Request) {
  let token =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.headers.get("Authorization")?.replace("Bearer ", "") ||
    "";

  if (!token) {
    // also try cookie
    token =
      (req.headers.get("cookie") || "")
        .split("; ")
        .find((c) => c.startsWith("token="))
        ?.split("=")[1] || "";
  }

  if (!token) return { ok: false, status: 401, error: "Not Authorized" };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.userType !== "admin") {
      return { ok: false, status: 403, error: "Forbidden: Admin Only" };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, status: 401, error: "Invalid Token" };
  }
}

// ----------------------------------------
// GET All Users (Admin Only)
// ----------------------------------------
export async function GET(req: Request) {
  const auth = await checkAdmin(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const all = await Database.select().from(users).orderBy(users.id);
    return NextResponse.json(all);
  } catch (err) {
    console.log("USERS GET ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ----------------------------------------
// CREATE User (Admin Only)
// ----------------------------------------
export async function POST(req: Request) {
  const auth = await checkAdmin(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { name, email, password, mobile, userType } = await req.json();

    const hashed = await bcrypt.hash(password || "secret123", 10);

    const inserted = await Database.insert(users)
      .values({ name, email, password: hashed, mobile, userType })
      .returning();

    return NextResponse.json(inserted[0]);
  } catch (err) {
    console.log("USERS POST ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
