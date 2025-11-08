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
})


export const bookInfo = sqliteTable("book_info", {
	id: int().primaryKey({ autoIncrement: true }),
	metadataID: int().notNull().references(() => metadata.id, { onDelete: 'cascade' }),
	bookName: text("book_name").notNull(),
	chapters: int().notNull(),
})


export const verses = sqliteTable("verses", {
	id: int().primaryKey({ autoIncrement: true }),
	bookInfoID: int().notNull().references(() => bookInfo.id, { onDelete: 'cascade' }),
	chapter: text().notNull(),
	verse: text().notNull(),
	text: text().notNull(),
});