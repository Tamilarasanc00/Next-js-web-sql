// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// pool.connect()
//   .then(() => console.log("✔ PostgreSQL Connected Successfully"))
//   .catch((err) => console.log("⚠ Connection Failed:", err.message));

// export const Database = drizzle(pool); // <-- MUST MATCH EXACT NAME


import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Auto-Reconnect + Status Log
async function connectWithRetry() {
  try {
    await pool.connect();
    console.log("✔ PostgreSQL Connected Successfully");
  } catch (err: any) {
    console.error("⚠ PostgreSQL Connection Failed, retrying in 5 seconds…", err.message);
    setTimeout(connectWithRetry, 5000);
  }
}

connectWithRetry();

export const Database = drizzle(pool);
