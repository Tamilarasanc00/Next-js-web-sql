import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { users, redemptions } from "@/lib/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq,desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    // Make sure the payload actually contains an `id` (common name). If your token uses another key,
    // change `payload.id` to the correct property.
    const userId = (payload as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    // Select only the columns we know exist on users to avoid TS errors
    const userRows = await Database
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        mobile: users.mobile,      // safe if your schema has mobile as earlier
        userType: users.userType,  // safe if present
        image: users.image,        // safe if present
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userRows[0];

    // If you keep UPI in redemptions, fetch the latest UPI for the user (optional)
    // If UPI is actually a column on users, remove this block and include it in the first select.
    const redemptionRows = await Database
      .select({
        upiId: redemptions.upiId,
      })
      .from(redemptions)
      .where(eq(redemptions.userId, userId))
      // .orderBy(redemptions.id.desc) // get latest if you have id or createdAt
      .orderBy(desc(redemptions.id))
      .limit(1);

    const upiId = redemptionRows.length ? redemptionRows[0].upiId : null;

    // totalPoints: if you have a users.totalPoints column you can include it in the first select.
    // Otherwise compute it from whichever table tracks points (inventory/redeems). For now return null
    // to avoid TypeScript errors — replace with real calculation if you want.
    const totalPoints = null;

    return NextResponse.json({
      user: {
        ...user,
        upiId,
        totalPoints,
      },
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
