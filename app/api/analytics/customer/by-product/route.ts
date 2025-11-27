import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { inventories, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

function getUserId(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") || "";
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded.id;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows = await Database
      .select({
        sku: inventories.sku,
        name: products.name,
        points: inventories.pointsEarned,
        quantity: inventories.quantity,
      })
      .from(inventories)
      .leftJoin(products, eq(inventories.sku, products.sku))
      .where(eq(inventories.userId, userId));

    // Group by product
    const grouped: Record<string, { name: string; points: number }> = {};

    rows.forEach((r) => {
      const id = r.sku;
      const total = r.quantity * r.points;

      if (!grouped[id]) grouped[id] = { name: r.name || id, points: 0 };
      grouped[id].points += total;
    });

    return NextResponse.json(Object.values(grouped));
  } catch (err) {
    console.error("BY PRODUCT ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
