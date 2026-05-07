import { copyFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const docs = resolve(root, "docs");

await copyFile(resolve(docs, "index.html"), resolve(docs, "404.html"));
await writeFile(resolve(docs, ".nojekyll"), "", "utf8");
