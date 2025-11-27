// app/api/redeem/route.ts
import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { users, redeemHistory, products, pointsLedger } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId: rawUserId, redeemType, productId: rawProductId, redeemedPoints: rawRedeemedPoints, cashId } = body;

    // basic validation
    const userId = Number(rawUserId);
    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid or missing userId" }, { status: 400 });
    }
    if (!redeemType || (redeemType !== "product" && redeemType !== "cash")) {
      return NextResponse.json({ error: "Invalid redeemType" }, { status: 400 });
    }

    // fetch user
    const userRows = await Database.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = Array.isArray(userRows) ? userRows[0] : userRows;
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // compute points to deduct
    let deductedPoints = Number(rawRedeemedPoints ?? NaN);

    if (redeemType === "product") {
      const productId = Number(rawProductId);
      if (!Number.isFinite(productId) || productId <= 0) {
        return NextResponse.json({ error: "Invalid productId for product redemption" }, { status: 400 });
      }

      // read product from DB (server-side single source of truth)
      const prodRows = await Database.select().from(products).where(eq(products.id, productId)).limit(1);
      const product = Array.isArray(prodRows) ? prodRows[0] : prodRows;
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

      deductedPoints = Number(product.pointsValue ?? 0);
      // ensure positive int
      if (!Number.isFinite(deductedPoints) || deductedPoints <= 0) {
        return NextResponse.json({ error: "Product has invalid pointsValue" }, { status: 400 });
      }

      // store productId into body for insert
      body.productId = productId;
    } else {
      // redeem by cash: ensure cashId and redeemedPoints present
      if (!cashId || String(cashId).trim() === "") {
        return NextResponse.json({ error: "UPI id (cashId) is required for cash redemption" }, { status: 400 });
      }
      deductedPoints = Number(rawRedeemedPoints);
      if (!Number.isFinite(deductedPoints) || deductedPoints <= 0) {
        return NextResponse.json({ error: "redeemedPoints must be a positive number for cash redemption" }, { status: 400 });
      }
    }

    // check user has enough points
    const currentPoints = Number(user.totalPoints ?? 0);
    if (currentPoints < deductedPoints) {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
    }

    // Insert into redeem_history (coerce values)
    const insertObj: any = {
      userId,
      redeemType,
      redeemedPoints: Math.floor(deductedPoints),
      cashId: redeemType === "cash" ? String(cashId) : null,
      productId: redeemType === "product" ? Number(body.productId) : null,
    };

    const inserted = await Database.insert(redeemHistory).values(insertObj).returning();
    const insertedRow = Array.isArray(inserted) ? inserted[0] : inserted;

    // update user's totalPoints
    const newBalance = currentPoints - Math.floor(deductedPoints);
    await Database.update(users).set({ totalPoints: String(newBalance) }).where(eq(users.id, userId));

    // add points ledger entry (negative change)
    try {
      await Database.insert(pointsLedger).values({
        userId,
        change: -Math.floor(deductedPoints),
        balanceAfter: newBalance,
        type: "redemption",
        refId: insertedRow?.id ?? null,
        meta: { redeemType, productId: insertObj.productId ?? null, cashId: insertObj.cashId ?? null },
      });
    } catch (ledgerErr) {
      console.error("Failed to insert points ledger (non-fatal):", ledgerErr);
      // continue — ledger is desirable but redemption must not fail because of ledger failure
    }

    return NextResponse.json({ success: true, newBalance });
  } catch (err) {
    console.error("POST /api/redeem error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
