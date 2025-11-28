import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

// Optional: Auto reconnect
async function connectWithRetry() {
  try {
    await pool.connect();
    console.log("✔ Neon PostgreSQL Connected Successfully");
  } catch (err: any) {
    console.error("⚠ Neon Connection Failed, retrying…", err.message);
    setTimeout(connectWithRetry, 5000);
  }
}

connectWithRetry();

export const Database = drizzle(pool);
