import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { users, inventories, products, pointsLedger } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

// Allow admin, staff, or customer
async function checkAccess(req: Request) {
  let token =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    (req.headers.get("cookie") || "")
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1] ||
    "";

  if (!token) return { ok: false, status: 401, error: "Unauthorized" };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // ⭐ FIXED: allow "customer" (singular)
    const allowed = ["admin", "staff", "customer"];

    if (allowed.includes(decoded.userType)) {
      return { ok: true, user: decoded };
    }

    return { ok: false, status: 403, error: "Forbidden" };
  } catch {
    return { ok: false, status: 401, error: "Invalid token" };
  }
}

export async function POST(req: Request, context: any) {
  const auth = await checkAccess(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    // unwrap params correctly
    const params =
      typeof context?.params?.then === "function"
        ? await context.params
        : context?.params || {};

    const userId = Number(params.id);
    if (!userId)
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));

    const sku = String(body.sku || "").trim();
    const quantity = Number(body.quantity || 1);
    let pointsPerUnit = Number(body.points || body.pointsEarned || 0);

    if (!sku)
      return NextResponse.json({ error: "SKU is required" }, { status: 400 });
    if (quantity <= 0)
      return NextResponse.json(
        { error: "Invalid quantity" },
        { status: 400 }
      );

    // Fetch product
    const prodRows = await Database.select()
      .from(products)
      .where(eq(products.sku, sku))
      .limit(1);

    const product = Array.isArray(prodRows) ? prodRows[0] : prodRows;

    if (!product)
      return NextResponse.json(
        { error: "Product not found" },
        { status: 400 }
      );

    if (!pointsPerUnit || pointsPerUnit <= 0)
      pointsPerUnit = product.pointsValue;

    const totalEarned = pointsPerUnit * quantity;

    // Insert into inventory
    const inserted = await Database.insert(inventories)
      .values({
        userId,
        sku,
        quantity,
        pointsEarned: pointsPerUnit,
        processed: false,
      })
      .returning();

    const row = Array.isArray(inserted) ? inserted[0] : inserted;

    // Update user total points
    const [u] = await Database.select()
      .from(users)
      .where(eq(users.id, userId));

    const newBalance = Number(u.totalPoints || 0) + totalEarned;

    await Database.update(users)
      .set({ totalPoints: String(newBalance) })
      .where(eq(users.id, userId));

    // Insert into points ledger
    await Database.insert(pointsLedger).values({
      userId,
      change: totalEarned,
      balanceAfter: newBalance,
      type: "earning",
      refId: row?.id,
      meta: {
        sku,
        productName: product.name,
        addedBy: auth.user?.id,
      },
    });

    return NextResponse.json({
      ok: true,
      newBalance,
      inserted: row,
    });
  } catch (err) {
    console.error("ADD INVENTORY ERROR:", err);
    return NextResponse.json(
      { error: "Server error while adding inventory" },
      { status: 500 }
    );
  }
}
