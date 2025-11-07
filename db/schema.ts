import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const metadata = sqliteTable("metadata", {
	id: int().primaryKey({ autoIncrement: true }).notNull(),
	name: text().notNull(),
	shortname: text().notNull(),
	module: text().notNull(),
	year: text().notNull(),
	publisher: text(),
	owner: text(),
	description: text(),
	lang: text(),
	lang_short: text(),
	copyright: text(),
	copyright_statement: text(),
	url: text(),
	citation_limit: text(),
	restrict: text(),
	italics: text(),
	strongs: text(),
	red_letter: text(),
	paragraph: text(),
	official: text(),
	research: text().notNull(),
	module_version: text(),
	updated_at: text()
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),

	is_synced: int({ mode: "boolean" }).default(true).notNull(),
})


export const verses = sqliteTable("verses", {
	id: int().primaryKey({ autoIncrement: true }),
	metadataID: int().notNull().references(() => metadata.id, { onDelete: 'cascade' }),
	book_name: text().notNull(),
	book: text().notNull(),
	chapter: text().notNull(),
	verse: text().notNull(),
	text: text().notNull(),
	updated_at: text()
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),

	is_synced: int({ mode: "boolean" }).default(true).notNull(),
});
