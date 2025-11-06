import fs from "node:fs";
import path from "node:path";
import type { InferInsertModel } from "drizzle-orm";
import db from "./config";
import { metadata, verses } from "./db/schema";

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
            const data = readJSON(full);
            if (data) yield { folder: dir, file, data };
        }
    }
}

export type MetadataType = InferInsertModel<typeof metadata>;
export type VerseType = InferInsertModel<typeof verses>;

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

        const [insertMetadata] = await db.insert(metadata).values(meta).returning();
        if (insertMetadata?.id === undefined) continue;
        const versesList: VerseType[] = data.verses.map((v: VerseType) => ({
            metadataID: insertMetadata.id,
            book_name: v.book_name?.trim() ?? "",
            book: String(v.book ?? ""),
            chapter: String(v.chapter ?? ""),
            verse: String(v.verse ?? ""),
            text: v.text ?? "",
        }));

        const BATCH_SIZE = 500;
        for (let i = 0; i < versesList.length; i += BATCH_SIZE) {
            const batch = versesList.slice(i, i + BATCH_SIZE);
            await db.insert(verses).values(batch);
        }

    }

    console.log("🎉 All Bible translations imported successfully!");
}

main().catch((err) => console.error("❌ Import failed:", err));
