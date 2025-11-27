// app/api/staff/users/[id]/inventory/route.ts
import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { inventories, products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const userId = Number(params?.id);
console.log("USER ID",userId);

    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    // ---- AUTH CHECK ----
    const authHeader =
      req.headers.get("authorization") ||
      req.headers.get("Authorization") ||
      "";

    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const requesterId = Number(decoded.id);
    const requesterRole = decoded.userType;

    // Customers can only access their own data
    if (requesterRole === "customer" && requesterId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only view your own inventory" },
        { status: 403 }
      );
    }

    // ---- DB QUERY FIXED ----
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
      .orderBy(desc(inventories.createdAt)); // FIXED

console.log("DATAAAA",rows);

    return NextResponse.json(rows);

  } catch (err) {
    console.error("INVENTORY FETCH ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
