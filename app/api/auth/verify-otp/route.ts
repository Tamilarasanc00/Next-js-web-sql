import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { passwordOtp } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

const row = await Database.select()
  .from(passwordOtp)
  .where(eq(passwordOtp.email, email));

console.log("OTP", row);

const lastRow = row.at(-1); // or row[row.length - 1]

if (!lastRow || lastRow.otp !== otp) {
  return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
}


    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
