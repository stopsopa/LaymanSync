import * as readline from "node:readline";

// 670.678 MiB / 708.002 MiB, 95%, 0 B/s, ETA - (xfr#21109/23551)
const reg = /^\d*.\d* [^\s]+ \/ \d*.\d* [^\s]+, (\d+)%, \d+.*$/;

let last = null;

/**
 * Function called for each line from stdin.
 * You can make this function async if you need to perform asynchronous operations.
 */
async function onLine(line: string): Promise<void> {
  // TODO: Implement your line processing logic here
  // For example, if you want to just print the line:
  // process.stdout.write(line + '\n');

  // Example: print line length
  const match = line.match(reg);

  let log = true;
  log = false;

  if (log) {
    console.log(`>${line}<`);
    console.log(JSON.stringify(match));
    console.log("");
  }

  if (match && match[1]) {
    if (match[1] !== last) {
      // in this line dumpt time in format of milliseconds and then match[1]
      // padd to even lenght
      console.log(`${String(parseInt(Date.now() / 1000)).padStart(10, " ")} ${match[1]}`);
      last = match[1];
    }
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false,
});

try {
  for await (const line of rl) {
    await onLine(line);
  }
} catch (error) {
  throw new Error(`stream.ts error: ${error instanceof Error ? error.message : String(error)}`);
}
