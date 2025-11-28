import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { redeemHistory, products } from "@/lib/db/schema";
// import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { desc, asc , eq } from "drizzle-orm";


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
        id: redeemHistory.id,
        redeemType: redeemHistory.redeemType,
        productId: redeemHistory.productId,
        cashId: redeemHistory.cashId,
        redeemedPoints: redeemHistory.redeemedPoints,
        createdAt: redeemHistory.createdAt,
        productName: products.name,
      })
      .from(redeemHistory)
      .leftJoin(products, eq(products.id, redeemHistory.productId))
      .where(eq(redeemHistory.userId, userId))
      .orderBy(desc(redeemHistory.createdAt));

    return NextResponse.json(rows);
  } catch (err) {
    console.error("REDEEM HISTORY ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
