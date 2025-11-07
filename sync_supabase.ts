import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import type { InferInsertModel } from "drizzle-orm";
import { db as supabase_db } from "./config.supabase";
import { metadata, verses } from "./db/schema_pg";

dotenv.config({ quiet: true });

interface Verse {
    verse: string;
    text: string;
}

interface Chapters {
    chapter: string;
    title: string;
    verses: Verse[];
}

export type MetadataType = InferInsertModel<typeof metadata>;
export type VerseType = InferInsertModel<typeof verses>;

function readJSON(filePath: string) {
    try {
        const raw = fs.readFileSync(filePath, "utf8");
        return JSON.parse(raw);
    } catch (_err) {
        console.warn(`⚠️ Skipped invalid JSON: ${filePath}`);
        return null;
    }
}

interface AmharicBible {
    title: string;
    abbv: string;
    chapters: Chapters[];
}
async function main() {
    const biblePath = "./bibles/amharic_bible";

    const dir = fs.readdirSync(biblePath, "utf-8");

    const validFiles = dir.filter((file) => file.endsWith(".json"));

    const meta: MetadataType = {
        name: "\u1218\u133d\u1210\u134d \u1245\u12f1\u1235",
        shortname: "\u1218\u133d\u1210\u134d \u1245\u12f1\u1235",
        module: "am_amh",
        year: "1962, 2003",
        publisher: "United Bible Societies",
        owner: "United Bible Societies",
        description:
            '<h2>\u1218\u133d\u1210\u134d \u1245\u12f1\u1235</h2><h2>The New Testament in the Amharic language of Ethiopia</h2><p>copyright \u00a9 1962, 2003 <a href="http://biblesociety-ethiopia.org/">United Bible Societies</a><br>Language: <a href="http://www.ethnologue.org/language/amh">\u12a0\u121b\u122d\u129b (Amharic)</a><br><br><strong>Amharic NT</strong><br>Revised Amharic Bible in XML (2003).<br>Printed version by <a href="http://www.biblesociety.org/">United Bible Societies</a> (C)1962.<br>E-Text in transliterated ASCII format by Lapsley/Brooks Foundation 1994.<br>Unicode UTF-8 transformation and XML-tagging by Dirk R\u00f6ckmann 2003 (<a href="http://www.nt-text.net/">www.nt-text.net</a>).<br>With kind permission of the Bible Society of Ethiopia.<br>Every non-commercial work using this data in any form must fully include this copyright statement!<br>Every commercial use of parts or the complete data in any form needs written permission of the Bible Society of Ethiopia!</p>',
        lang: null,
        langShort: "am",
        copyright: "0",
        copyrightStatement:
            "copyright \u00a9 1962, 2003 United Bible Societies\nLanguage: \u12a0\u121b\u122d\u129b (Amharic)\n\nAmharic NT\nRevised Amharic Bible in XML (2003).\nPrinted version by United Bible Societies (C)1962.\nE-Text in transliterated ASCII format by Lapsley/Brooks Foundation 1994.\nUnicode UTF-8 transformation and XML-tagging by Dirk R\u00f6ckmann 2003 (www.nt-text.net).\nWith kind permission of the Bible Society of Ethiopia.\nEvery non-commercial work using this data in any form must fully include this copyright statement!\nEvery commercial use of parts or the complete data in any form needs written permission of the Bible Society of Ethiopia!\n\n",
        url: null,
        citationLimit: "0",
        restrict: "0",
        italics: "0",
        strongs: "0",
        redLetter: "0",
        paragraph: "0",
        official: "1",
        research: "1",
        moduleVersion: "5.6.21",
    };

    const [insertMetadata] = await supabase_db
        .insert(metadata)
        .values(meta)
        .returning();

    const metadataID: number = insertMetadata?.id ?? 0;
    const BATCH_SIZE = 1000;

    console.log(`✅ Starting insert for ${validFiles.length} books...`);

    for (const file of validFiles) {
        const data: AmharicBible | null = readJSON(path.join(biblePath, file));
        if (!data) continue;

        const bookRows: VerseType[] = [];

        for (const chapter of data.chapters) {
            for (const v of chapter.verses) {
                bookRows.push({
                    metadataId: metadataID,
                    bookName: data.title,
                    book: `AM_${path.parse(file).name}`,
                    chapter: String(chapter.chapter ?? ""),
                    verse: String(v.verse ?? ""),
                    text: v.text ?? "",
                });
            }
        }

        for (let i = 0; i < bookRows.length; i += BATCH_SIZE) {
            const batch = bookRows.slice(i, i + BATCH_SIZE);
            await supabase_db.insert(verses).values(batch);
        }
    }

    console.log("🎉 All verses inserted successfully!");
}

main()
    .then(() => console.log("✅ Done."))
    .catch((e) => console.error("❌ Error:", e));
