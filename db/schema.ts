import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const bookName = sqliteTable("book_name", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	chapters: text().notNull(),
});

export const verses = sqliteTable("verses", {
	id: int().primaryKey({ autoIncrement: true }),
	bookID: int().references(() => bookName.id, { onDelete: "cascade" }),
	chapter: int().notNull(),
	verse: text().notNull(),
	text: text().notNull(),
});
