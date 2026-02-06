/**
 * WARNING:
 * This is just experimental script to use generateRcloneParams.ts library from cli
 * But in the final version of our app we won't be calling this script from cli
 * Instead we will be calling generateRcloneParams.ts library directly from electron app
 * So absolutely don't use this library in final application, stick to using directly generateRcloneParams.ts library
 * WARNING:
 *
 * NODE_OPTIONS="" /bin/bash ts.sh electron/src/tools/cli.ts -s "./source" -d "./dest" --delete
 */

import process from "node:process";
import { generateRcloneParamsStrings, type Params } from "./generateRcloneParams.js";
import { determineBinaryAbsolutePath } from "./determineBinaryAbsolutePath.js";

const args = process.argv.slice(2);

function printHelp() {
  process.stdout.write(`
Usage: ts.sh electron/src/tools/cli.ts [options]

Required arguments:
  -s, --source <path>        Path to the source directory.
  -d, --dest <path>          Path to the destination directory.

Optional arguments:
  --delete                   Whether to delete extra files in destination (sync). (default: false)
  -e, --exec <path>          Path to the rclone executable. (default: determined automatically)
  --help                     Show this help message.

Example:
  NODE_OPTIONS="" /bin/bash ts.sh electron/src/tools/cli.ts -s "electron/src/tools" -d "electron/src/tools2"
  NODE_OPTIONS="" /bin/bash ts.sh electron/src/tools/cli.ts -s "electron/src/tools" -d "electron/src/tools2" --delete
  NODE_OPTIONS="" /bin/bash ts.sh electron/src/tools/cli.ts -s "electron/src/tools" -d "electron/src/tools2" -e "rclone"
`);

  process.exit(1);
}

if (args.length === 0 || args.includes("--help") || args.includes("/?")) {
  printHelp();
  process.exit(0);
}

const params: Params & {
  mainExec: string;
} = {
  sourceDir: "",
  destinationDir: "",
  delete: false,
  mainExec: "",
};

// Try to determine the binary path automatically
try {
  params.mainExec = determineBinaryAbsolutePath();
} catch (e) {
  // Silence error if determineBinaryAbsolutePath is not found or fails
  // It might be provided via -e flag anyway
}

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  const nextArg = args[i + 1];

  switch (arg) {
    case "-s":
    case "--source":
      params.sourceDir = nextArg;
      i++;
      break;
    case "-d":
    case "--dest":
      params.destinationDir = nextArg;
      i++;
      break;
    case "--delete":
      params.delete = true;
      break;
    case "-e":
    case "--exec":
    case "--mainExec":
      params.mainExec = nextArg || "";
      i++;
      break;
  }
}

// Basic validation
const missing: string[] = [];
if (!params.sourceDir) missing.push("-s, --source");
if (!params.destinationDir) missing.push("-d, --dest");

if (missing.length > 0) {
  console.error(`cli.ts error: Missing or invalid required arguments: ${missing.join(", ")}`);
  printHelp();
  process.exit(1);
}

try {
  const rcloneArgs = generateRcloneParamsStrings(params);

  if (params.mainExec) {
    process.stdout.write(`${params.mainExec} ${rcloneArgs}\n`);
  } else {
    process.stdout.write(`${rcloneArgs}\n`);
  }
} catch (err: any) {
  console.error(`cli.ts error: ${err.message}`);
  process.exit(1);
}
