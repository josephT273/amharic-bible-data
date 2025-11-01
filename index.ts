import fs from "node:fs";
import db, { bibleFiles } from "./config";
import { bookName, verses } from "./db/schema";

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
	const raw = fs.readFileSync(`amharic_bible/${filename}`, "utf8");
	return JSON.parse(raw);
}

async function main() {
	for (const file of bibleFiles) {
		const bible = readFile(file);
		const _bibleName = await db
			.insert(bookName)
			.values({
				name: bible.title,
				chapters: bible.chapters.length,
			})
			.returning();

		bible.chapters.forEach((chapter) => {
			chapter.verses.forEach(async (verse) => {
				await db
					.insert(verses)
					.values({
						chapter: chapter.chapter.toString(),
						text: verse.text,
						verse: verse.verse,
						bookID: _bibleName[0]?.id,
					})
					.returning();
			});
		});
		console.log(`${_bibleName[0]?.name} is done`);
	}
}

main();
