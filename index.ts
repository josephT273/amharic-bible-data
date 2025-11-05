import fs from "node:fs";
import { bibleFiles } from "./books";
import db from "./config";
import { bookName, translation, verses } from "./db/schema";

interface VerseType {
	verse: string;
	text: string;
}

interface ChaptersType {
	chapter: string;
	title: string;
	verses: VerseType[];
}
interface FileReadingType {
	title: string;
	abbv: string;
	chapters: ChaptersType[];
}

function readFile(filename: string): FileReadingType {
	const raw = fs.readFileSync(`./bibles/amharic_bible/${filename}`, "utf8");
	return JSON.parse(raw);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
	const [insertedTranslation] = await db
		.insert(translation)
		.values({
			language: "Amharic",
			name: "እማ2003",
		})
		.returning();

	for (const file of bibleFiles) {
		const bible = readFile(file);

		console.log(`📖 Starting ${bible.title}`);

		await db.transaction(async (tx) => {
			const [insertedBook] = await tx
				.insert(bookName)
				.values({
					name: bible.title,
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

			console.log(`${bible.title} completed (${allVerses.length} verses)`);
		});

		await sleep(500);
	}
	console.log("🎉 All books imported successfully!");
}

main().catch((err) => console.error(err));
