import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

// 🔐 Admin check
async function checkAdmin(req: Request) {
  let token =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.headers.get("Authorization")?.replace("Bearer ", "") ||
    "";

  if (!token) {
    token =
      (req.headers.get("cookie") || "")
        .split("; ")
        .find((c) => c.startsWith("token="))
        ?.split("=")[1] || "";
  }

  if (!token) return { ok: false, status: 401, error: "Not Authorized" };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.userType !== "admin" ) {
      return { ok: false, status: 403, error: "Forbidden: Admin Only" };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, status: 401, error: "Invalid Token" };
  }
}

// ---------------------- UPDATE USER ----------------------
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdmin(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await context.params;
    const body = await req.json();

    await Database.update(users).set(body).where(eq(users.id, Number(id)));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.log("USERS UPDATE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request, context: any) {
  try {
    // support both Promise and plain object
    const params = typeof context?.params?.then === "function" ? await context.params : context.params;
    const idStr = params?.id ?? null;

    const userId = Number(idStr);
    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const rows = await Database.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = Array.isArray(rows) ? rows[0] : rows;

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("GET /api/admin/users/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
// ---------------------- DELETE USER ----------------------
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdmin(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await context.params;

    await Database.delete(users).where(eq(users.id, Number(id)));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.log("USERS DELETE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
