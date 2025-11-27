import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { inventories } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import jwt from "jsonwebtoken";

// helper to get logged in user
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
    const rows = await Database.execute(sql`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') AS month,
        SUM(quantity * points_earned) AS points
      FROM inventories
      WHERE user_id = ${userId}
      GROUP BY month
      ORDER BY month ASC
    `);

    return NextResponse.json(rows.rows || []);
  } catch (err) {
    console.error("MONTHLY ANALYTICS ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
