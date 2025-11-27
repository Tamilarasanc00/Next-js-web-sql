// app/api/staff/users/[id]/inventory/route.ts
import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { inventories, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, context: any) {
  try {
    const params = await (typeof context?.params?.then === "function" ? context.params : Promise.resolve(context.params || {}));
    const idRaw = params?.id ?? params?.userId ?? null;
    const userId = Number(idRaw);

    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const rows = await Database
      .select({
        id: inventories.id,
        sku: inventories.sku,
        quantity: inventories.quantity,
        pointsEarned: inventories.pointsEarned,
        createdAt: inventories.createdAt,
        imageUrl: products.imageUrl,
      })
      .from(inventories)
      .leftJoin(products, eq(products.sku, inventories.sku))
      .where(eq(inventories.userId, userId))
      .orderBy(inventories.createdAt.desc);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("INVENTORY FETCH ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
