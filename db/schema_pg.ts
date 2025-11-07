import {
    boolean,
    foreignKey, integer, pgTable,
    serial,
    text,
    timestamp
} from "drizzle-orm/pg-core";

export const metadata = pgTable("metadata", {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    shortname: text().notNull(),
    module: text().notNull(),
    year: text().notNull(),
    publisher: text(),
    owner: text(),
    description: text(),
    lang: text(),
    langShort: text("lang_short"),
    copyright: text(),
    copyrightStatement: text("copyright_statement"),
    url: text(),
    citationLimit: text("citation_limit"),
    restrict: text(),
    italics: text(),
    strongs: text(),
    redLetter: text("red_letter"),
    paragraph: text(),
    official: text(),
    research: text().notNull(),
    moduleVersion: text("module_version"),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    isSynced: boolean("is_synced").default(true),
});

export const verses = pgTable(
    "verses",
    {
        id: serial().primaryKey().notNull(),
        metadataId: integer().notNull(),
        bookName: text("book_name").notNull(),
        book: text().notNull(),
        chapter: text().notNull(),
        verse: text().notNull(),
        text: text().notNull(),
        updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
        isSynced: boolean("is_synced").default(true),
    },
    (table) => [
        foreignKey({
            columns: [table.metadataId],
            foreignColumns: [metadata.id],
            name: "verses_metadataID_metadata_id_fk",
        }).onDelete("cascade"),
    ],
);
