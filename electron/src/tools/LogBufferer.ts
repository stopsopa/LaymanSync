/**
 * Buffers log lines and flushes them after a delay (throttling/debouncing)
 * to avoid overwhelming the UI with too many logs in a short time.
 */
export class LogBufferer {
  private buffer: string[] = [];
  private timer: NodeJS.Timeout | null = null;
  private log?: (line: string) => void;
  private delay: number;
  private lastLinesCallback?: (lines: string[]) => void;

  constructor(log?: (line: string) => void, delay = 100) {
    this.log = log;
    this.delay = delay;
  }

  /**
   * Registers a callback to be triggered on each flush with the last 3 lines
   * if the buffer contains at least 3 lines.
   */
  setLastLinesCallback(callback: (lines: string[]) => void) {
    this.lastLinesCallback = callback;
  }

  /**
   * Collect a single log line into the buffer and schedule a flush.
   */
  collect(line: string) {
    if (!this.log) return;
    this.buffer.push(line);
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.delay);
    }
  }

  /**
   * Immediately flushes the buffer and clears any pending timer.
   */
  flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.buffer.length > 0) {
      if (this.lastLinesCallback && this.buffer.length >= 3) {
        this.lastLinesCallback(this.buffer.slice(-3));
      }

      if (this.log) {
        this.log(this.buffer.join("\n"));
      }
      this.buffer = [];
    }
  }
}
