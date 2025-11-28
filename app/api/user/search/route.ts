import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ilike, or } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q) return NextResponse.json([]);

  const data = await Database
    .select()
    .from(users)
    .where(
      or(
        ilike(users.name, `%${q}%`),
        ilike(users.mobile, `%${q}%`)
      )
    )
    .limit(20);

  return NextResponse.json(data);
}
