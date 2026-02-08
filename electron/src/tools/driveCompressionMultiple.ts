import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import type { DriveCompressionOptions } from "./commonTypes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import driveCompression from "./driveCompression.js";

export default async function driveCompressionMultiple(options: DriveCompressionOptions[]) {
  for (const option of options) {
    try {
      await driveCompression(option);
    } catch (e) {
      console.log(`driveCompressionMultiple catch error: ${e}`);
    }
  }
}

// Integration for CI/CD or CLI usage: outputs the path to stdout
const isMain = process.argv[1] && process.argv[1] === __filename;

console.log("process.argv", process.argv);

if (isMain) {
  try {
    const configFile = process.argv[2];

    // throw when file doesn't exist
    if (!fs.existsSync(configFile)) {
      throw new Error(`File not found: ${configFile}`);
    }

    let config;

    try {
      config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
    } catch (e) {
      //   console.error(`driveCompressionMultiple error: ${e.message}`);
      //   process.exit(1);
    }
    console.log(`configFile >${configFile}<`);
    console.log(config);
  } catch (e: any) {
    e.message = `determineBinaryAbsolutePath.ts error: ${e.message}`;
    throw e;
  }
}
