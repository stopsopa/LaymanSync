import { spawn } from "node:child_process";
import generateRcloneParams, { generateRcloneParamsStrings } from "./generateRcloneParams.js";
import { timeHumanReadable } from "./timeHumanReadable.js";
import { determineBinaryAbsolutePath } from "./determineBinaryAbsolutePath.js";
import { escapeFilePath } from "./escapeFilePath.js";
import { LogBufferer } from "./LogBufferer.js";

import type { MainTypes, DriveCompressionOptions } from "./commonTypes.js";

/**
 * Executes a single rclone command and tracks its progress.
 */
export default async function driveCompression(options: DriveCompressionOptions) {
  const { source, target, progressEvent, log, end } = options;
  const logBufferer = new LogBufferer(log);

  /**
   * Internal state to avoid duplicate progress events if needed,
   * although rclone with 1s stats interval is fine.
   */
  let lastPercent = "";
  function processOneLog(line: string) {
    // Parse progress from rclone aggregate stats line
    // Example: 299.147 MiB / 662.034 MiB, 45%, 0 B/s, ETA - (xfr#8137/18149)
    // We look for a line that starts with counts (e.g. "1.2 MiB / 10 MiB, 12%")
    const match = line.match(/^\d*.\d* [^\s]+ \/ \d*.\d* [^\s]+, (\d+)%, \d+.*$/);
    if (match && match[1]) {
      // Trigger progressEvent only if the percentage changed
      if (match[1] !== lastPercent) {
        lastPercent = match[1];

        const progressPercentNum = parseInt(match[1], 10);

        const now = Date.now();
        const totalTimePassedMs = now - startTime;

        let estimatedRemainingTimeMs = 0;
        let estimatedTotalTimeMs = 0;

        if (progressPercentNum > 0) {
          const totalMs = (totalTimePassedMs / progressPercentNum) * 100;
          estimatedTotalTimeMs = Math.round(totalMs);
          estimatedRemainingTimeMs = Math.round(totalMs - totalTimePassedMs);
        }

        if (progressEvent) {
          progressEvent({
            progressPercentHuman: `${match[1]}%`,
            totalTimePassedHuman: timeHumanReadable(totalTimePassedMs),
            estimatedTotalTimeHuman: progressPercentNum > 0 ? timeHumanReadable(estimatedTotalTimeMs) : "?",
            estimatedRemainingTimeHuman: progressPercentNum > 0 ? timeHumanReadable(estimatedRemainingTimeMs) : "?",
          });
        }
      }
    }
  }

  logBufferer.setLastLinesCallback((lines) => {
    lines.forEach((l) => processOneLog(l));
  });

  let mainExec;
  let action, flags, sourcePath, destPath;
  try {
    mainExec = determineBinaryAbsolutePath();

    [action, flags, sourcePath, destPath] = generateRcloneParams({
      source,
      target,
      delete: options.delete ?? false,
    });
  } catch (e: any) {
    end(e.message, "0.0s");
    return;
  }

  const args = [action, ...flags, sourcePath, destPath];

  const startTime = Date.now();

  return new Promise<void>((resolve) => {
    try {
      const child = spawn(mainExec, args);

      let stdoutRemainder = "";
      let stderrRemainder = "";

      logBufferer.collect(
        `${escapeFilePath(mainExec)} ${generateRcloneParamsStrings({
          source,
          target,
          delete: options.delete ?? false,
        })}`,
      );

      const handleData = (data: Buffer, isStdout: boolean) => {
        const text = (isStdout ? stdoutRemainder : stderrRemainder) + data.toString();
        const lines = text.split(/\r?\n/);
        const remainder = lines.pop() || "";

        if (isStdout) {
          stdoutRemainder = remainder;
        } else {
          stderrRemainder = remainder;
        }

        for (const line of lines) {
          if (!line.trim()) continue;

          logBufferer.collect(line);
        }
      };

      child.stdout.on("data", (data) => handleData(data, true));
      child.stderr.on("data", (data) => handleData(data, false));

      child.on("error", (err) => {
        logBufferer.flush();
        const duration = timeHumanReadable(Date.now() - startTime);
        end(err.message, duration);
        resolve();
      });

      child.on("close", (code) => {
        // Process remaining content if any
        if (stdoutRemainder) logBufferer.collect(stdoutRemainder);
        if (stderrRemainder) logBufferer.collect("[stderr] " + stderrRemainder);

        logBufferer.flush();

        const duration = timeHumanReadable(Date.now() - startTime);
        if (code === 0) {
          end(null, duration);
        } else {
          // Collect some stderr for context if available
          end(`Process exited with code ${code}`, duration);
        }
        resolve();
      });
    } catch (e: any) {
      logBufferer.flush();
      end(e.message, "0.0s");
      resolve();
    }
  });
}
