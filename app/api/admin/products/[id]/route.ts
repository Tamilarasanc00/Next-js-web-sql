import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { products } from "@/lib/db/schema";
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

    if (decoded.userType !== "admin") {
      return { ok: false, status: 403, error: "Forbidden: Admin Only" };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, status: 401, error: "Invalid Token" };
  }
}

// ------------------------------------
// UPDATE PRODUCT (PUT)
// ------------------------------------
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

    await Database.update(products)
      .set(body)
      .where(eq(products.id, Number(id)));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.log("PRODUCT UPDATE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ------------------------------------
// DELETE PRODUCT (DELETE)
// ------------------------------------
// DELETE product (Admin only)
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await checkAdmin(req); // only admin
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  await Database.delete(products).where(eq(products.id, Number(id)));
  return NextResponse.json({ ok: true });
}

