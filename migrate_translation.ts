import fs from "node:fs";
import path from "node:path";
import type { InferInsertModel } from "drizzle-orm";
import db from "./config";
import { metadata, verses, bookInfo } from "./db/schema";

const ROOT = "./bibles";

const EXCLUDED = new Set([
    "Extras",
    "readme.txt",
    "AM-Amharic",
    "Bible-kjv",
    "amharic_bible",
]);

export function readDirSafe(p: string) {
    try {
        return fs.readdirSync(p, "utf8");
    } catch {
        return [];
    }
}

export function readJSON(filePath: string) {
    try {
        const raw = fs.readFileSync(filePath, "utf8");
        return JSON.parse(raw);
    } catch (_err) {
        console.warn(`⚠️ Skipped invalid JSON: ${filePath}`);
        return null;
    }
}

function* walkBibles(root: string) {
    const dirs = readDirSafe(root).filter((d) => !EXCLUDED.has(d));
    for (const dir of dirs) {
        const subPath = path.join(root, dir);
        const files = readDirSafe(subPath);
        for (const file of files) {
            const full = path.join(subPath, file);
            if (!file.endsWith(".json")) continue;
            const data: ReadJSONType = readJSON(full);
            if (data) yield { folder: dir, file, data };
        }
    }
}

type Verses = {
    book_name: string,
    book: string,
    chapter: string,
    verse: string,
    text: string
};

type ReadJSONType = {
    metadata: MetadataType,
    verses: Verses[]
}

type MetadataType = InferInsertModel<typeof metadata>;
type VerseType = InferInsertModel<typeof verses>;
type BookInfoType = InferInsertModel<typeof bookInfo>;

async function main() {
    for (const { folder: _f, file: _l, data } of walkBibles(ROOT)) {
        const meta: MetadataType = {
            name: data.metadata?.name ?? "Unknown",
            shortname: data.metadata?.shortname ?? "",
            module: data.metadata?.module ?? "",
            year: String(data.metadata?.year ?? ""),
            publisher: data.metadata?.publisher ?? null,
            owner: data.metadata?.owner ?? null,
            description: data.metadata?.description ?? null,
            lang: data.metadata?.lang ?? null,
            lang_short: data.metadata?.lang_short ?? null,
            copyright: String(data.metadata?.copyright ?? ""),
            copyright_statement: data.metadata?.copyright_statement ?? null,
            url: data.metadata?.url ?? null,
            citation_limit: String(data.metadata?.citation_limit ?? ""),
            restrict: String(data.metadata?.restrict ?? ""),
            italics: String(data.metadata?.italics ?? ""),
            strongs: String(data.metadata?.strongs ?? ""),
            red_letter: String(data.metadata?.red_letter ?? ""),
            paragraph: String(data.metadata?.paragraph ?? ""),
            official: String(data.metadata?.official ?? ""),
            research: String(data.metadata?.research ?? ""),
            module_version: data.metadata?.module_version ?? "",
        };

        const [insertedMeta] = await db.insert(metadata).values(meta).returning();
        if (!insertedMeta?.id) continue;

f        const uniqueBooks = Array.from(
            new Set(data.verses.map((v: any) => v.book_name.trim()))
        );

        for (const book of uniqueBooks) {
            // Count chapters for this book
            const chapters = new Set(
                data.verses
                    .filter((v: any) => v.book_name.trim() === book)
                    .map((v: any) => Number(v.chapter))
            );

            const [insertedBook] = await db
                .insert(bookInfo)
                .values({
                    bookName: book,
                    chapters: chapters.size,
                    metadataID: insertedMeta.id,
                })
                .returning();

            if (!insertedBook?.id) continue;

            // 3️⃣ Prepare and insert verses for this book
            const versesList: VerseType[] = data.verses
                .filter((v: any) => v.book_name.trim() === book)
                .map((v) => ({
                    bookInfoID: insertedBook.id,
                    chapter: String(v.chapter),
                    verse: String(v.verse),
                    text: v.text,
                }));

            const BATCH_SIZE = 500;
            for (let i = 0; i < versesList.length; i += BATCH_SIZE) {
                const batch = versesList.slice(i, i + BATCH_SIZE);
                await db.insert(verses).values(batch);
            }
        }

        console.log(`✅ Imported: ${meta.name}`);
    }

    console.log("🎉 All Bible translations imported successfully!");
}

main().catch((err) => console.error("❌ Import failed:", err));
