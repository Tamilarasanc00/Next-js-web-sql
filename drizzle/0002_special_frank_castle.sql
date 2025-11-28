CREATE TABLE "points_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"change" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"ref_id" integer,
	"meta" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "redeem_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"redeem_type" varchar(20) NOT NULL,
	"cash_id" varchar(200),
	"product_id" integer,
	"redeemed_points" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "inventories" DROP CONSTRAINT "inventories_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "inventories" DROP CONSTRAINT "inventories_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "redemptions" DROP CONSTRAINT "redemptions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "redemptions" DROP CONSTRAINT "redemptions_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "inventories" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "inventories" ALTER COLUMN "quantity" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "inventories" ALTER COLUMN "points_earned" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "sku" SET DATA TYPE varchar(200);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "points_value" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "image_url" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "image_url" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "redemptions" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "redemptions" ALTER COLUMN "product_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "redemptions" ALTER COLUMN "upi_id" SET DATA TYPE varchar(150);--> statement-breakpoint
ALTER TABLE "redemptions" ALTER COLUMN "status" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "redemptions" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "inventories" ADD COLUMN "sku" varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE "inventories" ADD COLUMN "processed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "inventories" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "redemptions" ADD COLUMN "admin_note" text;--> statement-breakpoint
ALTER TABLE "redemptions" ADD COLUMN "processed_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_points" varchar(100) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "redeem_history" ADD CONSTRAINT "redeem_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redeem_history" ADD CONSTRAINT "redeem_history_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventories" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "inventories" DROP COLUMN "scanned_at";