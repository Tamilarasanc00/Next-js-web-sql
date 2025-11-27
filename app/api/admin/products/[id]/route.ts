// import { NextResponse } from "next/server";
// import { Database } from "@/lib/db";
// import { products } from "@/lib/db/schema";
// import { eq } from "drizzle-orm";
// import jwt from "jsonwebtoken";

// // 🔐 Admin check
// async function checkAdmin(req: Request) {
//   let token =
//     req.headers.get("authorization")?.replace("Bearer ", "") ||
//     req.headers.get("Authorization")?.replace("Bearer ", "") ||
//     "";

//   if (!token) {
//     token =
//       (req.headers.get("cookie") || "")
//         .split("; ")
//         .find((c) => c.startsWith("token="))
//         ?.split("=")[1] || "";
//   }

//   if (!token) return { ok: false, status: 401, error: "Not Authorized" };

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

//     if (decoded.userType !== "admin") {
//       return { ok: false, status: 403, error: "Forbidden: Admin Only" };
//     }

//     return { ok: true };
//   } catch (err) {
//     return { ok: false, status: 401, error: "Invalid Token" };
//   }
// }

// // ------------------------------------
// // UPDATE PRODUCT (PUT)
// // ------------------------------------
// export async function PUT(
//   req: Request,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const auth = await checkAdmin(req);
//   if (!auth.ok)
//     return NextResponse.json({ error: auth.error }, { status: auth.status });

//   try {
//     const { id } = await context.params;
//     const body = await req.json();

//     await Database.update(products)
//       .set(body)
//       .where(eq(products.id, Number(id)));

//     return NextResponse.json({ ok: true });
//   } catch (err) {
//     console.log("PRODUCT UPDATE ERROR:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// // ------------------------------------
// // DELETE PRODUCT (DELETE)
// // ------------------------------------
// // DELETE product (Admin only)
// export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
//   const auth = await checkAdmin(req); // only admin
//   if (!auth.ok)
//     return NextResponse.json({ error: auth.error }, { status: auth.status });

//   const { id } = await context.params;
//   await Database.delete(products).where(eq(products.id, Number(id)));
//   return NextResponse.json({ ok: true });
// }
import { NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";

// 🔐 Admin check (use your exact logic)
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
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (decoded.userType !== "admin") {
      return { ok: false, status: 403, error: "Forbidden: Admin Only" };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, status: 401, error: "Invalid Token" };
  }
}

// ====================================================================================
// UPDATE PRODUCT (PUT) — supports image replace + deletes old image automatically
// ====================================================================================
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdmin(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await context.params;

    // 🌟 Must use FormData (because images)
    const form = await req.formData();

    const sku = String(form.get("sku"));
    const name = String(form.get("name"));
    const pointsValue = Number(form.get("pointsValue"));
    const newImage = form.get("image") as File | null;

    // ⏳ Load existing product so we can delete old image
    const existing = await Database.select().from(products).where(eq(products.id, Number(id)));
    if (!existing.length)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const oldImageUrl = existing[0].imageUrl || "";

    let updateData: any = {
      sku,
      name,
      pointsValue,
    };

    // ============================================================
    // 📸 If user uploads new image → save new & delete old image
    // ============================================================
    if (newImage) {
      const bytes = await newImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${newImage.name}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      await fs.mkdir(uploadDir, { recursive: true });

      const finalPath = path.join(uploadDir, fileName);
      await fs.writeFile(finalPath, buffer);

      updateData.imageUrl = `/uploads/${fileName}`;

      // 🗑 Delete old image (if exists)
      if (oldImageUrl && oldImageUrl.startsWith("/uploads/")) {
        const oldPath = path.join(process.cwd(), "public", oldImageUrl);
        try {
          await fs.unlink(oldPath);
        } catch {
          console.log("Old image not found, skip delete:", oldPath);
        }
      }
    }

    // Update in DB
    await Database.update(products)
      .set(updateData)
      .where(eq(products.id, Number(id)));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.log("PRODUCT UPDATE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ====================================================================================
// DELETE PRODUCT (DELETE) — also deletes product image file
// ====================================================================================
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdmin(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await context.params;

    // 1️⃣ Get product for deleting image file
    const existing = await Database.select().from(products).where(eq(products.id, Number(id)));

    if (!existing.length)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const imageUrl = existing[0].imageUrl;

    // 2️⃣ Delete DB record
    await Database.delete(products).where(eq(products.id, Number(id)));

    // 3️⃣ Delete image from uploads folder
    if (imageUrl && imageUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", imageUrl);
      try {
        await fs.unlink(filePath);
      } catch {
        console.log("Image already removed:", filePath);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.log("DELETE PRODUCT ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

