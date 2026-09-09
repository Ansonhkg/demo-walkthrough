import { readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const source = new URL("../src/demo-walkthrough/", import.meta.url);
const manifest = JSON.parse(
  await readFile(new URL("version.json", source), "utf8"),
);
manifest.files = {};
for (const name of (await readdir(source))
  .filter((n) => n !== "version.json")
  .sort()) {
  manifest.files[name] = createHash("sha256")
    .update(await readFile(new URL(name, source)))
    .digest("hex");
}
await writeFile(
  new URL("version.json", source),
  JSON.stringify(manifest, null, 2) + "\n",
);
