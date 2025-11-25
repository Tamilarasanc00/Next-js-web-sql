import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { users, passwordOtp } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// export async function POST(req: Request) {
//   try {
//     const { email, newPassword } = await req.json();
//     console.log(email,newPassword);
    

//     const hashed = await bcrypt.hash(newPassword, 10);

//     await Database.update(users)
//       .set({ password: hashed })
//       .where(eq(users.email, email));

//     // Delete OTP after successful reset
//     await Database.delete(passwordOtp).where(eq(passwordOtp.email, email));

//     return NextResponse.json({ message: "Password updated" });
//   } catch (err) {
//     console.log("ERR",err);
    
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }


export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log(email, password);

    const hashed = await bcrypt.hash(password, 10);

    await Database.update(users)
      .set({ password: hashed })
      .where(eq(users.email, email));

    await Database.delete(passwordOtp).where(eq(passwordOtp.email, email));

    return NextResponse.json({ message: "Password updated" });
  } catch (err) {
    console.log("ERR", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

