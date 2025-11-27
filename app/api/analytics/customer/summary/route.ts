import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { inventories, redeemHistory, users } from "@/lib/db/schema";
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
    const user = await Database.select().from(users).where(eq(users.id, userId));

    const inventory = await Database
      .select()
      .from(inventories)
      .where(eq(inventories.userId, userId));

    const redeems = await Database
      .select()
      .from(redeemHistory)
      .where(eq(redeemHistory.userId, userId));

    return NextResponse.json({
      totalPoints: Number(user[0]?.totalPoints || 0),
      totalProducts: new Set(inventory.map((i) => i.sku)).size,
      totalInventory: inventory.length,
      totalRedeemed: redeems.reduce((s, r) => s + r.redeemedPoints, 0),
    });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
