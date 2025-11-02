# 📖 Amharic Bible Importer (Drizzle + Bun + SQLite)

This project is a simple **Amharic Bible database importer** written in **TypeScript** using  
[`drizzle-orm`](https://orm.drizzle.team/), [`bun:sqlite`](https://bun.sh/docs/api/sqlite), and Node’s file system module.

It reads structured JSON files containing Bible books, chapters, and verses, then imports them into a **SQLite database** efficiently with batching and transactions.



## 🚀 Features

- ✅ Imports all **66 books** of the Amharic Bible  
- ✅ Uses **Drizzle ORM** with a **typed schema**  
- ✅ Handles **translations** (supports multiple Bible versions)  
- ✅ Batch inserts to prevent CPU overheating  
- ✅ Uses **transactions** for data integrity  
- ✅ Compatible with **Bun runtime**



## 📂 Project Structure

```
📦 amharic-bible-importer
├── amharic_bible/             # Folder containing JSON files for each Bible book
│   ├── 01_ኦሪት ዘፍጥረት.json
│   ├── 02_ኦሪት ዘጸአት.json
│   └── ...
│
├── db/
│   └── schema.ts              # Drizzle ORM schema definitions
│
├── config.ts                  # SQLite + Drizzle configuration
├── main.ts                    # Import script
├── .env                       # Contains DB_FILE_NAME=amharic_bible.db
└── README.md

```



## 🧱 Database Schema

The importer creates **three tables**:

### `translation`
Stores information about a Bible translation/language.

| Column     | Type | Description              |
|-------------|------|--------------------------|
| id          | int (PK) | Auto-increment ID     |
| name        | text | Translation name (e.g., "እማ2003") |
| language    | text | Language name (e.g., "Amharic") |



### `book_name`
Stores all Bible book titles.

| Column       | Type | Description |
|---------------|------|-------------|
| id            | int (PK) | Auto-increment ID |
| translation   | int (FK) | References `translation(id)` |
| name          | text | Name of the book (e.g., "መዝሙረ ዳዊት") |
| chapters      | int | Total number of chapters |



### `verses`
Stores all verses in the Bible.

| Column  | Type | Description |
|----------|------|-------------|
| id       | int (PK) | Auto-increment ID |
| bookID   | int (FK) | References `book_name(id)` |
| chapter  | text | Chapter number |
| verse    | text | Verse number |
| text     | text | The verse content in Amharic |



## ⚙️ Configuration

Create a `.env` file in your project root:

```env
DB_FILE_NAME=amharic_bible.db
````

This is the path to your SQLite database file.

---

## 📜 How It Works

1. Reads all JSON files listed in `bibleFiles` (in `config.ts`).
2. Creates a translation record (e.g., `እማ2003 Amharic`).
3. For each JSON file:

   * Inserts a new book record.
   * Parses chapters and verses.
   * Inserts all verses in batches of 300 per transaction.
4. Waits 500ms between books to avoid CPU overheating.
5. Prints progress for each book and ends with a success message.


## 🧩 Example JSON Format

Each file inside `amharic_bible/` must follow this structure:

```json
{
  "title": "ኦሪት ዘፍጥረት",
  "abbv": "",
  "chapters": [
    {
      "chapter": "1",
      "title": "ዘፍጥረት 1",
      "verses": [
        { "verse": "1", "text": "መጀመሪያ እግዚአብሔር..." },
        { "verse": "2", "text": "እናም ምድር ባዶ ነበረች..." }
      ]
    }
  ]
}
```


## 🧠 Usage

### 1. Install Dependencies

Make sure you have [Bun](https://bun.sh) installed, then run:

```bash
bun install drizzle-orm bun:sqlite
```

Or if you’re using npm/yarn, use:

```bash
npm install drizzle-orm
```

### 2. Run the Import Script

```bash
bun run main.ts
```

This will:

* Create the database (if not exists)
* Import all books and verses
* Print a success message when finished


## 🪄 Output Example

```
🌍 Translation "እማ2003" created.
📖 Starting ኦሪት ዘፍጥረት
✅ ኦሪት ዘፍጥረት completed (1533 verses)
📖 Starting ኦሪት ዘጸአት
✅ ኦሪት ዘጸአት completed (1213 verses)
🎉 All books imported successfully!
```


## 🧰 Technologies Used

* **Bun.js** – Fast JavaScript runtime
* **Drizzle ORM** – Type-safe database layer
* **SQLite** – Lightweight embedded database
* **TypeScript** – Strongly typed code


## 💡 Notes

* Each Bible translation can be stored independently.
* You can add more translations (e.g., English, Geez) by changing the translation insert values.
* The script is optimized to run cool and stable even for large text imports.


## 🕊️ Author

**Joseph Tadesse**
📍 Wolkite University, Ethiopia
👨‍💻 Junior Pentester & Software Engineer
🔗 [Medium: josepht273](https://medium.com/@josepht273)



## ⚠️ Important Note — Bible Verse Policy

> **Do not modify the Bible verse data.**
>
> You are free to change, extend, or improve the **script**, **database schema**, and **application code**.
However, the **Bible text files** (`amharic_bible/*.json`) must remain unmodified to preserve accuracy and authenticity.
>
> If you find any verse errors, **please report them** to the author instead of editing the data directly.


## 🧾 License

This project is licensed under the **MIT License** — feel free to use and adapt it.
