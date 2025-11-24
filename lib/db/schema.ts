import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  upiId: text('upi_id'),
  points: integer('points').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  upiId: z.string().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Products/SKUs table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  sku: text('sku').unique().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  pointsValue: integer('points_value').notNull(),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertProductSchema = createInsertSchema(products, {
  sku: z.string().min(1),
  name: z.string().min(1),
  pointsValue: z.number().positive(),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Inventories table for earning points
export const inventories = pgTable('inventories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  productId: integer('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  pointsEarned: integer('points_earned').notNull(),
  scannedAt: timestamp('scanned_at').defaultNow(),
});

// Redemptions table
export const redemptions = pgTable('redemptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  productId: integer('product_id').references(() => products.id),
  pointsUsed: integer('points_used').notNull(),
  upiId: text('upi_id').notNull(),
  status: text('status').default('pending'), // pending, completed, failed
  createdAt: timestamp('created_at').defaultNow(),
});

// Login history table
export const loginHistory = pgTable('login_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  loginAt: timestamp('login_at').defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});

// Password reset tokens
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Inventory = typeof inventories.$inferSelect;
export type Redemption = typeof redemptions.$inferSelect;