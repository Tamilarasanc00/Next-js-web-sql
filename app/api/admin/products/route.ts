import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { products } from "@/lib/db/schema";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";

// -------------------------------------------
// AUTH: ADMIN or STAFF
// -------------------------------------------
async function checkAdminOrStaff(req: Request) {
  let token =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    (req.headers.get("cookie") || "")
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

  if (!token) return { ok: false, error: "Unauthorized", status: 401 };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.userType === "admin" || decoded.userType === "staff" ||decoded.userType === "customer") {
      return { ok: true };
    }
    return { ok: false, error: "Forbidden", status: 403 };
  } catch {
    return { ok: false, error: "Invalid Token", status: 401 };
  }
}


// -------------------------------------------
// GET ALL PRODUCTS (Admin or Staff)
// -------------------------------------------
export async function GET(req: Request) {
  const auth = await checkAdminOrStaff(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const all = await Database.select().from(products).orderBy(products.id);
    return NextResponse.json(all);
  } catch (err) {
    console.log("PRODUCTS GET ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


// -------------------------------------------
// POST PRODUCT WITH IMAGE UPLOAD
// -------------------------------------------
export async function POST(req: Request) {
  const auth = await checkAdminOrStaff(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    // MULTIPART FORM DATA
    const form = await req.formData();

    const sku = String(form.get("sku"));
    const name = String(form.get("name"));
    const pointsValue = Number(form.get("pointsValue"));

    let imageUrl = "";

    // FILE PART (OPTIONAL)
    const image = form.get("image") as File | null;

    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${image.name}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      await fs.mkdir(uploadDir, { recursive: true });
      const finalPath = path.join(uploadDir, fileName);

      await fs.writeFile(finalPath, buffer);

      imageUrl = `/uploads/${fileName}`;
    }

    const inserted = await Database.insert(products)
      .values({
        sku,
        name,
        pointsValue,
        imageUrl, // SAVE IMAGE URL
      })
      .returning();

    return NextResponse.json(inserted[0]);
  } catch (err) {
    console.error("PRODUCT UPLOAD ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
