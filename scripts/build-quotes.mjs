import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = path.join(root, "php", "quotes.csv");
const outPath = path.join(root, "src", "lib", "quotesData.json");

function parseCSVLine(line) {
  const fields = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ";") {
        fields.push(field);
        field = "";
      } else {
        field += ch;
      }
    }
  }
  fields.push(field);
  return fields;
}

async function main() {
  const raw = await fs.readFile(csvPath, "utf8");
  const lines = raw.split(/\r?\n/);

  // Skip the 3-line header: "Table 1", ";;;;;;", "author;quote;tags;;;;"
  const dataLines = lines.slice(3);

  const quotes = [];
  let nextId = 1;
  for (const line of dataLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const fields = parseCSVLine(trimmed);
    const author = (fields[0] ?? "").trim();
    const quote = (fields[1] ?? "").trim();
    const tagsRaw = (fields[2] ?? "").trim();
    const tags = tagsRaw ? tagsRaw.split(";").map((t) => t.trim()).filter(Boolean) : [];

    if (!author || !quote || quote.length < 10) continue;

    quotes.push({ id: nextId++, author, quote, tags });
  }

  await fs.writeFile(outPath, JSON.stringify(quotes, null, 2), "utf8");
  console.log(`Built ${quotes.length} quotes → ${path.relative(root, outPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
