import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const outDir = path.join(root, "hostinger-dist");
const phpDir = path.join(root, "php");

async function copyRecursive(from, to) {
  await fs.cp(from, to, { recursive: true, force: true });
}

async function main() {
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  await copyRecursive(distDir, outDir);

  const indexHtml = await fs.readFile(path.join(distDir, "index.html"), "utf8");
  await fs.writeFile(path.join(outDir, "index.php"), indexHtml);
  await fs.rm(path.join(outDir, "index.html"), { force: true });

  await copyRecursive(path.join(phpDir, "fetch.php"), path.join(outDir, "fetch.php"));
  await copyRecursive(path.join(phpDir, "health.php"), path.join(outDir, "health.php"));
  await copyRecursive(path.join(phpDir, ".htaccess"), path.join(outDir, ".htaccess"));
  await fs.rm(distDir, { recursive: true, force: true });

  console.log(`Hostinger package ready: ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
