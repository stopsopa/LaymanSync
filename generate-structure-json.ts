import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Script to resolve relative paths in a structure JSON file to absolute paths.
 *
 * NODE_OPTIONS="" /bin/bash ts.sh generate-structure-json.ts <path-to-json-file>
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// determine root directory by examining position of generate-structure-json.ts file
// use that directory where generate-structure-json.ts is as a root
const ROOT = __dirname;

function validateStructure(data: any): void {
  if (!Array.isArray(data)) {
    console.error("generate-structure-json.ts error: Input JSON must be an array of objects.");
    process.exit(1);
  }

  data.forEach((entry, index) => {
    if (typeof entry !== "object" || entry === null) {
      console.error(`generate-structure-json.ts error: Entry at index ${index} is not an object.`);
      process.exit(1);
    }

    const { label, source, target, delete: del } = entry;

    if (typeof label !== "string" || label.trim() === "") {
      console.error(`generate-structure-json.ts error: Entry at index ${index} has an invalid or empty 'label'.`);
      process.exit(1);
    }

    if (typeof source !== "string" || source.trim() === "") {
      console.error(`generate-structure-json.ts error: Entry at index ${index} has an invalid or empty 'source'.`);
      process.exit(1);
    }

    if (typeof target !== "string" || target.trim() === "") {
      console.error(`generate-structure-json.ts error: Entry at index ${index} has an invalid or empty 'target'.`);
      process.exit(1);
    }

    if (typeof del !== "boolean") {
      console.error(
        `generate-structure-json.ts error: Entry at index ${index} has an invalid 'delete' property (must be boolean).`,
      );
      process.exit(1);
    }
  });
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error(
    "generate-structure-json.ts error: Please provide the path to the structure JSON file as the first argument.",
  );
  process.exit(1);
}

const inputFilePath = path.resolve(args[0]);

if (!fs.existsSync(inputFilePath)) {
  console.error(`generate-structure-json.ts error: File not found at ${inputFilePath}`);
  process.exit(1);
}

// The directory where the input file is located
const inputDir = path.dirname(inputFilePath);

try {
  const rawData = fs.readFileSync(inputFilePath, "utf8");
  const structure = JSON.parse(rawData);

  validateStructure(structure);

  const resolvedStructure = structure.map((entry: any) => {
    const newEntry = { ...entry };

    if (typeof entry.source === "string") {
      newEntry.source = path.resolve(inputDir, entry.source);
    }

    if (typeof entry.target === "string") {
      newEntry.target = path.resolve(inputDir, entry.target);
    }

    return newEntry;
  });

  console.log(JSON.stringify(resolvedStructure, null, 2));
} catch (error) {
  console.error(
    `generate-structure-json.ts error: processing JSON: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}
