import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const docs = resolve(root, "docs");
const generated = [
  "404.html",
  "assets",
  "coi-serviceworker.min.js",
  "favicon.svg",
  "index.html",
  "manifest.webmanifest",
];

for (const name of generated) {
  await rm(resolve(docs, name), { force: true, recursive: true });
}
