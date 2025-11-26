import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await Database.select()
      .from(users)
      .where(eq(users.email, email));

    if (user.length === 0) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const existingUser = user[0];

    const validPass = await bcrypt.compare(password, existingUser.password);
    if (!validPass) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    const token = jwt.sign(
      {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        userType: existingUser.userType,
        image: existingUser.image
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    console.log("Name:-",existingUser.name);
    

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        userType: existingUser.userType,
      },
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
