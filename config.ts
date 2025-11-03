import "dotenv/config";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

const DB_FILE_NAME = process.env.DB_FILE_NAME ?? "";

const sqlite = new Database(DB_FILE_NAME);
const db = drizzle({ client: sqlite });

export default db;
