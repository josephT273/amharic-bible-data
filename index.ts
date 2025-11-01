import bible from "./01_ኦሪት ዘፍጥረት.json";
import db from "./config";
import { bookName, verses } from "./db/schema";

async function main() {
	const _bibleName = await db
		.insert(bookName)
		.values({
			name: bible.title,
			chapters: bible.chapters.length,
		})
		.returning();

	bible.chapters.forEach((chapter) => {
		chapter.verses.forEach(async (verse) => {
			const v = await db
				.insert(verses)
				.values({
					chapter: chapter.chapter.toString(),
					text: verse.text,
					verse: verse.verse,
					bookID: _bibleName[0]?.id,
				})
				.returning();
			console.log(v);
		});
	});
}

main();
