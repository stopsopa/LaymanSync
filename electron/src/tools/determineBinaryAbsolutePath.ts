import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Finds the absolute path to the single binary within the 'bin' directory.
 * download-bins.sh ensures there is exactly one file in the bin directory tree.
 * 
 * /bin/bash ts.sh electron/src/tools/determineBinaryAbsolutePath.ts
 */
export function determineBinaryAbsolutePath(searchDir?: string): string {
  // If searchDir is not provided, we look for 'bin' three levels up from this tool
  // which matches PROJECT_ROOT/electron/bin when the tool is in PROJECT_ROOT/electron/src/tools/
  const binDir = searchDir || path.resolve(__dirname, "..", "..", "bin");

  if (!fs.existsSync(binDir)) {
    throw new Error(`Bin directory not found: ${binDir}`);
  }

  const allFiles: string[] = [];

  // Recursive search to collect all files
  const search = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        search(fullPath);
      } else {
        allFiles.push(fullPath);
      }
    }
  };

  search(binDir);

  if (allFiles.length === 0) {
    throw new Error(`No files found in ${binDir}. Have you run download-bins.sh?`);
  }

  if (allFiles.length > 1) {
    // If there are multiple files, we might be in a state before Audit passed or something.
    // Let's just return the first one that doesn't look like a hidden file,
    // but better to warn.
    const filtered = allFiles.filter((f) => !path.basename(f).startsWith("."));
    if (filtered.length === 1) {
      return path.resolve(filtered[0]);
    }

    throw new Error(
      `Expected exactly 1 file in ${binDir}, but found ${allFiles.length}: ${JSON.stringify(
        allFiles.map((p) => path.relative(binDir, p)),
      )}`,
    );
  }

  return path.resolve(allFiles[0]);
}

// Integration for CI/CD or CLI usage: outputs the path to stdout
const isMain =
  process.argv[1] &&
  (process.argv[1] === __filename ||
    process.argv[1].endsWith("determineBinaryAbsolutePath.ts") ||
    process.argv[1].endsWith("determineBinaryAbsolutePath.js"));

if (isMain) {
  try {
    const searchDir = process.argv[2];
    console.log(determineBinaryAbsolutePath(searchDir));
  } catch (e: any) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}
