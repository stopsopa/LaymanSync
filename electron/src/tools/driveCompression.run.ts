import fs from "node:fs";
import driveCompression from "./driveCompression.js";

/**
 * Test script for driveCompression.ts
 *
 * Run with:
 * /bin/bash ts.sh electron/src/tools/driveCompression.run.ts
 */

const sourceDir = "electron/node_modules";
const destinationDir = "electron/node_modules2";

console.log(`Starting rclone copy test...`);
console.log(`Source:      ${sourceDir}`);
console.log(`Destination: ${destinationDir}`);
console.log(`----------------------------------------------------------------`);

fs.writeFileSync("stdout.log", "");

await driveCompression({
  sourceDir,
  destinationDir,
  delete: false,
  progressEvent: (data) => {
    const { progressPercentHuman, totalTimePassedHuman, estimatedTotalTimeHuman, estimatedRemainingTimeHuman } = data;

    console.log(
      `Progress: ${progressPercentHuman.padStart(4)} | Passed: ${totalTimePassedHuman.padStart(6)} | Total: ${estimatedTotalTimeHuman.padStart(6)} | Remaining: ${estimatedRemainingTimeHuman.padStart(6)}`,
    );
  },
  log: (line) => {
    // let's save it to file stdout.log
    fs.appendFileSync("stdout.log", line + "\n");
    // Uncomment to see full rclone output
    // console.log(`[rclone]: ${line}`);
  },
  end: (error, duration) => {
    if (error) {
      console.error(`\n[END] Failed after ${duration}: ${error}`);
    } else {
      console.log(`\n[END] Finished successfully in ${duration}!`);
    }
  },
});
