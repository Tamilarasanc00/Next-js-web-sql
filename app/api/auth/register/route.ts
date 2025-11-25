import { NextResponse } from "next/server";
import { Database } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { name, mobile, email, password, userType } = await req.json();

    if (!name || !mobile || !email || !password || !userType) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if email exists
    const existing = await Database.select().from(users).where(eq(users.email, email));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = await Database
      .insert(users)
      .values({
        name,
        mobile,
        email,
        password: hashedPassword,
        userType,
      })
      .returning();

    const createdUser = newUser[0];

    // Create JWT
    const token = jwt.sign(
      {
        id: createdUser.id,
        email: createdUser.email,
        userType: createdUser.userType,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Registration successful",
      token,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        userType: createdUser.userType,
      },
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);
    return NextResponse.json(
      { error: "Server error during registration" },
      { status: 500 }
    );
  }
}
