import type { DriveCompressionOptions } from "../../tools/commonTypes";

/**
 * Renderer-side implementation of driveCompressionMultiple.
 * It uses the indexed IPC channels to coordinate multiple sequential sync jobs.
 */
export default async function driveCompressionMultiple(options: DriveCompressionOptions[]) {
  for (let i = 0; i < options.length; i++) {
    const option = options[i];

    // Set up temporary listeners for this specific job index
    let removeProgress: (() => void) | null = null;
    let removeLog: (() => void) | null = null;
    let removeEnd: (() => void) | null = null;

    await new Promise<void>((resolve) => {
      // Explicitly type the event arguments to avoid lint errors from previous global types
      removeProgress = window.electronAPI.onSyncProgress((event: { index: number; data: any }) => {
        if (event.index === i) {
          option.progressEvent?.(event.data);
        }
      });

      removeLog = window.electronAPI.onSyncLog((event: { index: number; line: string }) => {
        if (event.index === i) {
          option.log?.(event.line);
        }
      });

      removeEnd = window.electronAPI.onSyncEnd((result: { index: number; error: string | null; duration: string }) => {
        if (result.index === i) {
          // Cleanup listeners for this job
          if (removeProgress) removeProgress();
          if (removeLog) removeLog();
          if (removeEnd) removeEnd();

          option.end(result.error, result.duration);
          resolve();
        }
      });

      // Start the sync via IPC
      window.electronAPI.startSync({
        source: option.source,
        target: option.target,
        deleteMode: !!option.delete,
        index: i,
      });
    });
  }
}
