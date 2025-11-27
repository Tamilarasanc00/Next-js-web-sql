import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

// 🔐 Validate Admin
async function checkAdmin(req: Request) {
  let token =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.headers.get("Authorization")?.replace("Bearer ", "") ||
    "";

  if (!token) {
    token =
      (req.headers.get("cookie") || "")
        .split("; ")
        .find((c) => c.startsWith("token="))
        ?.split("=")[1] || "";
  }

  if (!token) return { ok: false, status: 401, error: "Not Authorized" };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Allow STAFF and ADMIN
    if (decoded.userType !== "admin" && decoded.userType !== "staff") {
      return { ok: false, status: 403, error: "Forbidden: Admin/Staff Only" };
    }

    return { ok: true, role: decoded.userType };
  } catch (err) {
    return { ok: false, status: 401, error: "Invalid Token" };
  }
}


// ----------------------------------------
// GET All Users (Admin Only)
// ----------------------------------------
export async function GET(req: Request) {
  // const auth = await checkAdmin(req);
  // if (!auth.ok)
  //   return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const all = await Database.select().from(users).orderBy(users.id);
    return NextResponse.json(all);
  } catch (err) {
    console.log("USERS GET ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ----------------------------------------
// CREATE User With Image Upload (Admin Only)
// ----------------------------------------
export async function POST(req: Request) {
  const auth = await checkAdmin(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    // Parse form-data (NOT JSON)
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const mobile = formData.get("mobile") as string;
    const userType = formData.get("userType") as string;
    const image = formData.get("image") as File | null;

    let imageUrl: string | null = null;

    // Save image if uploaded
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public/uploads/users");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = uuid() + "-" + image.name.replace(/\s+/g, "_");
      const filepath = path.join(uploadDir, filename);

      fs.writeFileSync(filepath, buffer);

      imageUrl = `/uploads/users/${filename}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password || "secret123", 10);

    // Insert into DB
    const inserted = await Database.insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        mobile,
        userType,
        image: imageUrl, // store image url
      })
      .returning();

    return NextResponse.json(inserted[0]);
  } catch (err) {
    console.log("USERS POST ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
