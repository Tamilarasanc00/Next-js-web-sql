import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean,
  varchar, 
  timestamp,
  json 
} from "drizzle-orm/pg-core";

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ------------------------- USERS TABLE -------------------------

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  mobile: varchar("mobile", { length: 20 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password: text("password").notNull(),
  userType: varchar("user_type", { length: 20 }).notNull(), // admin, customer, staff
  image: text("image").notNull(),
  totalPoints: varchar("total_points", { length: 100 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// zod schema for user insert
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
}).omit({ id: true, createdAt: true });

// ------------------------- PRODUCTS -------------------------

// export const products = pgTable("products", {
//   id: serial("id").primaryKey(),
//   sku: text("sku").unique().notNull(),
//   name: text("name").notNull(),
//   description: text("description"),
//   pointsValue: integer("points_value").notNull(),
//   imageUrl: text("image_url"),
//   isActive: boolean("is_active").default(true),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow(),
// });

// export const insertProductSchema = createInsertSchema(products, {
//   sku: z.string().min(1),
//   name: z.string().min(1),
//   pointsValue: z.number().positive(),
// }).omit({ id: true });

// ------------------------- INVENTORIES -------------------------

// export const inventories = pgTable("inventories", {
//   id: serial("id").primaryKey(),
//   userId: integer("user_id").references(() => users.id),
//   productId: integer("product_id").references(() => products.id),
//   quantity: integer("quantity").notNull(),
//   pointsEarned: integer("points_earned").notNull(),
//   scannedAt: timestamp("scanned_at").defaultNow(),
// });

// ------------------------- REDEMPTIONS -------------------------

// export const redemptions = pgTable("redemptions", {
//   id: serial("id").primaryKey(),
//   userId: integer("user_id").references(() => users.id),
//   productId: integer("product_id").references(() => products.id),
//   pointsUsed: integer("points_used").notNull(),
//   upiId: text("upi_id").notNull(),
//   status: text("status").default("pending"), // pending, completed, failed
//   createdAt: timestamp("created_at").defaultNow(),
// });

// ------------------------- LOGIN HISTORY -------------------------

export const loginHistory = pgTable("login_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  loginAt: timestamp("login_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// ------------------------- PASSWORD RESET TOKENS -------------------------

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});


export const passwordOtp = pgTable("password_otp", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 150 }).notNull(),
  otp: varchar("otp", { length: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// ------------------------- PASSWORD RESET TOKENS ENDS -------------------------

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 200 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  pointsValue: integer("points_value").notNull().default(0),
  imageUrl: varchar("image_url", { length: 500 }).default(""),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products, {
  sku: z.string().min(1),
  name: z.string().min(1),
  pointsValue: z.number().positive(),
}).omit({ id: true });

export const inventories = pgTable("inventories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sku: varchar("sku", { length: 200 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  pointsEarned: integer("points_earned").notNull().default(0),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pointsLedger = pgTable("points_ledger", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  change: integer("change").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'earning', 'redemption', 'adjustment'
  refId: integer("ref_id"),
  meta: json("meta"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const redemptions = pgTable("redemptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  pointsUsed: integer("points_used").notNull(),
  upiId: varchar("upi_id", { length: 150 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const redeemHistory = pgTable("redeem_history", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id),

  redeemType: varchar("redeem_type", { length: 20 }).notNull(), // "cash" | "product"

  cashId: varchar("cash_id", { length: 200 }), // stores UPI ID

  productId: integer("product_id")
    .references(() => products.id),

  redeemedPoints: integer("redeemed_points").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

export type RedeemHistory = typeof redeemHistory.$inferSelect;
export type NewRedeemHistory = typeof redeemHistory.$inferInsert;



// ------------------------- TYPES -------------------------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Inventory = typeof inventories.$inferSelect;
export type Redemption = typeof redemptions.$inferSelect;
