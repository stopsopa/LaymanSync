import fs from "node:fs";
import path from "node:path";
import { escapeFilePath } from "./escapeFilePath.js";

/**
 * Logic for generating rclone parameters.
 *
 * rclone copy -v -P --- always safe - just adds files
 * ||
 * rclone sync -v -P --- Mirror exactly (delete extras) - might be dangerous
 * -v -P
 * --transfers 4
 * --fast-list
 * source/ destination/
 */

/**
 * rclone commands usually handle trailing slashes automatically.
 * https://rclone.org/commands/rclone_copy/#options
 *    -d, --dir-slash               Append a slash to directory names (default true)
 */
export type Params = {
  delete: boolean;
  sourceDir: string;
  destinationDir: string;
};

/**
 * Derives the rclone action based on the 'delete' boolean.
 * true  => sync
 * false => copy
 */
export type ResolveAction<T extends boolean> = T extends true ? "sync" : "copy";

/**
 * Derived RcloneParams type.
 * It uses the generic P to determine if the first element should be "copy" or "sync".
 */
export type RcloneParams<P extends Params = Params> = [
  ResolveAction<P["delete"]>,
  ["-v", "-P", "--transfers", "4", "--fast-list", "--stats=1s", "--stats-one-line"],
  string, // resolved sourceDir
  string, // resolved destinationDir
];

const processPath = (name: string, p: string, isSource: boolean): string => {
  // If it contains a colon, assume it's a remote path and return as is
  if (p.includes(":")) {
    return p;
  }

  // Resolve relative local path to absolute
  const resolvedPath = path.resolve(p);

  // Real directory validation
  const stats = fs.statSync(resolvedPath);
  if (!stats.isDirectory()) {
    throw new Error(`generateRcloneParams.ts error: ${name} path exists but is not a directory: ${resolvedPath}`);
  }

  return resolvedPath;
};

/**
 * Generates rclone parameters based on input Params.
 * By using a generic <P extends Params>, TypeScript can track the literal
 * value of 'delete' (true/false) and narrow the return type accordingly.
 */
export default function generateRcloneParams<P extends Params>(params: P): RcloneParams<P> {
  const { delete: isDelete, sourceDir, destinationDir } = params;

  const finalSource = processPath("Source", sourceDir, true);
  const finalDestination = processPath("Destination", destinationDir, false);

  const result: RcloneParams<P> = [
    (isDelete ? "sync" : "copy") as ResolveAction<P["delete"]>,
    ["-v", "-P", "--transfers", "4", "--fast-list", "--stats=1s", "--stats-one-line"],
    finalSource,
    finalDestination,
    // quote
  ];

  if (process.env.BWLIMIT) {
    const flags = result[1] as string[];
    flags.push("--bwlimit", process.env.BWLIMIT);
  }

  if (process.env.DRY_RUN) {
    const flags = result[1] as string[];
    flags.push("--dry-run");
  }

  return result;
}

/**
 * Helper to get the parameters as a flat string or array of strings for execution.
 */
export function generateRcloneParamsStrings<P extends Params>(params: P) {
  const [action, flags, source, dest] = generateRcloneParams(params);
  return [action, ...flags, escapeFilePath(source), escapeFilePath(dest)].join(" ");
}
