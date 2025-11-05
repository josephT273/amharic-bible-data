import fs from "node:fs";

type BibleName = {
    id: number,
    name: string,
    shortname: string | null,
    matching1: string | null,
    matching2: string | null
};

const path = "./bibles/Extras";
const EXCLUDED = new Set([
    "languages.json",
    "readme.txt",
    "shortcuts_en.json",
    "strongs_definitions.json",
    "books_am.json",
]);

const dir = fs.readdirSync(path, "utf-8");

const validFiles = dir.filter(
    (file) => file.endsWith(".json") && !EXCLUDED.has(file)
);

const allBibleNames: BibleName[] = [];

for (const file of validFiles) {
    try {
        const raw = fs.readFileSync(`${path}/${file}`, "utf8");
        const json: BibleName[] = JSON.parse(raw);
        allBibleNames.push(...json);
    } catch (error) {
        console.error(`❌ Error parsing ${file}:`, error);
    }
}

const BATCH_SIZE = 100;

for (let i = 0; i < allBibleNames.length; i++) {
    const batch = allBibleNames.slice(i, i + BATCH_SIZE);
    const values = batch.map((b) => ({
      name: b.name,
      translation: "",
      chapters: 0,
    }));
}