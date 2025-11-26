import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { inventories } from "@/lib/db/schema";

export async function POST(req: Request, context: any) {
  try {
    const { id } = await context.params;

    const body = await req.json();

    await Database.insert(inventories).values({
      userId: Number(id),
      sku: body.sku,
      quantity: Number(body.quantity) || 1,
      pointsEarned: Number(body.points) || 0,
      processed: false, // must be boolean, not string
    });

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to insert inventory", err },
      { status: 500 }
    );
  }
}
