import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
const source = dirname(fileURLToPath(import.meta.url));
const [destination, flag] = process.argv.slice(2);
if (!destination) throw Error("Usage: node sync.mjs <destination> [--check]");
const dest = resolve(destination),
  manifest = JSON.parse(await readFile(join(source, "version.json"), "utf8"));
const hash = (b) => createHash("sha256").update(b).digest("hex");
let previous;
try {
  previous = JSON.parse(await readFile(join(dest, "version.json"), "utf8"));
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
const writes = [];
for (const [name, expected] of Object.entries(manifest.files)) {
  if (name.includes("/") || name.includes(".."))
    throw Error("Invalid manifest filename");
  const bytes = await readFile(join(source, name));
  if (hash(bytes) !== expected)
    throw Error("Canonical source differs from manifest: " + name);
  let current;
  try {
    current = await readFile(join(dest, name));
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  if (current && hash(current) === expected) continue;
  if (flag === "--check") throw Error("Copy differs: " + name);
  if (current && hash(current) !== previous?.files?.[name])
    throw Error("Local edits detected; refusing overwrite: " + name);
  writes.push([name, bytes]);
}
if (flag !== "--check") {
  await mkdir(dest, { recursive: true });
  for (const [name, bytes] of writes) await writeFile(join(dest, name), bytes);
  await writeFile(
    join(dest, "version.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
}
console.log(
  flag === "--check"
    ? "Canonical copy matches"
    : "Copied version " + manifest.version,
);
