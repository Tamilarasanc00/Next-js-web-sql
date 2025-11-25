CREATE TABLE "password_otp" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(150) NOT NULL,
	"otp" varchar(4) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
