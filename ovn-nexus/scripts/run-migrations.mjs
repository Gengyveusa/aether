import pg from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "supabase", "migrations");

// Supabase direct connection (transaction mode via port 5432)
const PROJECT_REF = "zwgywployfghfhjhwhqc";
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!DB_PASSWORD) {
  // Try session pooler connection with service role
  console.log("No DB_PASSWORD set. Trying pooler connection...");
}

const connectionString = DB_PASSWORD
  ? `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
  : `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

const files = [
  "00004_music_generation.sql",
  "00005_music_storage_bucket.sql",
];

async function run() {
  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    console.log("Connected to Supabase Postgres");

    for (const file of files) {
      const sql = readFileSync(join(migrationsDir, file), "utf-8");
      console.log(`\nRunning ${file}...`);

      try {
        await client.query(sql);
        console.log(`  -> ${file} applied successfully`);
      } catch (err) {
        if (err.message.includes("already exists")) {
          console.log(`  -> ${file} already applied (skipping)`);
        } else {
          console.error(`  -> Error in ${file}: ${err.message}`);
          throw err;
        }
      }
    }

    console.log("\nAll migrations complete!");
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
