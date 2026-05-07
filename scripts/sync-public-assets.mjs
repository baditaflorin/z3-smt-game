import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const assets = [
  {
    from: "node_modules/coi-serviceworker/coi-serviceworker.min.js",
    to: "public/coi-serviceworker.min.js",
  },
];

for (const asset of assets) {
  const source = resolve(root, asset.from);
  const target = resolve(root, asset.to);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
}
