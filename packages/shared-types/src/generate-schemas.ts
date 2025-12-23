import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { allJsonSchemas } from "./json-schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const outDir = join(__dirname, "..", "schemas");
  await mkdir(outDir, { recursive: true });

  await Promise.all(
    Object.entries(allJsonSchemas).map(async ([name, schema]) => {
      const outPath = join(outDir, `${name}.schema.json`);
      const contents = JSON.stringify(schema, null, 2) + "\n";
      await writeFile(outPath, contents, "utf-8");
    })
  );
}

await main();
