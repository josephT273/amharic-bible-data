import fs from "node:fs";
import { kjv } from "./books";
import db from "./config";
import { bookName, translation, verses } from "./db/schema";

interface VerseType {
	verse: string;
	text: string;
}

interface ChaptersType {
	chapter: string;
	verses: VerseType[];
}

interface KJVData {
	book: string;
	chapters: ChaptersType[];
}

function readFile(filename: string): KJVData {
	const raw = fs.readFileSync(`./bibles/Bible-kjv/${filename}`, "utf8");
	return JSON.parse(raw);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
	const [insertedTranslation] = await db
		.insert(translation)
		.values({
			language: "English",
			name: "KJV",
		})
		.returning();

	for (const file of kjv) {
		const bible = readFile(file);

		console.log(`📖 Starting ${bible.book}`);

		await db.transaction(async (tx) => {
			const [insertedBook] = await tx
				.insert(bookName)
				.values({
					name: bible.book,
					chapters: bible.chapters.length,
					translation: insertedTranslation?.id,
				})
				.returning();

			const allVerses: {
				chapter: string;
				verse: string;
				text: string;
				bookID: number | undefined;
			}[] = [];

			for (const chapter of bible.chapters) {
				for (const verse of chapter.verses) {
					allVerses.push({
						chapter: chapter.chapter.toString(),
						text: verse.text,
						verse: verse.verse,
						bookID: insertedBook?.id,
					});
				}
			}

			const BATCH_SIZE = 300;

			for (let i = 0; i < allVerses.length; i += BATCH_SIZE) {
				const batch = allVerses.slice(i, i + BATCH_SIZE);
				await tx.insert(verses).values(batch);
			}

			console.log(`${bible.book} completed (${allVerses.length} verses)`);
		});

		await sleep(500);
	}
	console.log("🎉 All books imported successfully!");
}

main().catch((err) => console.error(err));
