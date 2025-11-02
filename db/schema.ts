import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const translation = sqliteTable("translation", {
	id: int().primaryKey({autoIncrement: true}),
	name: text().notNull(),
	language: text().notNull(),
})

export const bookName = sqliteTable("book_name", {
	id: int().primaryKey({ autoIncrement: true }),
	translation: int().references(() => translation.id, {onDelete: 'cascade'}),
	name: text().notNull(),
	chapters: int().notNull(),
});

export const verses = sqliteTable("verses", {
	id: int().primaryKey({ autoIncrement: true }),
	bookID: int().references(() => bookName.id, { onDelete: "cascade" }),
	chapter: text().notNull(),
	verse: text().notNull(),
	text: text().notNull(),
});
