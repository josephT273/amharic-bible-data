import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// export default defineConfig({
// 	out: "./drizzle",
// 	schema: "./db/schema.ts",
// 	dialect: "sqlite",
// 	dbCredentials: {
// 		url: process.env.DB_FILE_NAME ?? "file:./bible.sqlite",
// 	},
// });

export default defineConfig({
	out: "./drizzle",
	schema: "./db/schema_pg.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.SUPABASE_DB_URL!,
	},
});
