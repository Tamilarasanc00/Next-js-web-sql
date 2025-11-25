import { NextResponse } from "next/server";
import { Database } from "@/lib/db/index";
import { users, passwordOtp } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await Database.select()
      .from(users)
      .where(eq(users.email, email));

    if (user.length === 0) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Save in DB
    await Database.insert(passwordOtp).values({ email, otp });

    return NextResponse.json({ message: "OTP generated", otp }); // show OTP
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
