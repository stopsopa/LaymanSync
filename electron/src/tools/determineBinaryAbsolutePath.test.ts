import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { determineBinaryAbsolutePath } from "./determineBinaryAbsolutePath.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testBinDir = path.join(__dirname, "test_bin_mock");

/**
 * /bin/bash ts.sh --test electron/src/tools/determineBinaryAbsolutePath.test.ts
 */
describe("determineBinaryAbsolutePath", () => {
  // Helper to clear and setup exactly one file
  const setupFiles = (paths: string[]) => {
    if (fs.existsSync(testBinDir)) {
      fs.rmSync(testBinDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testBinDir, { recursive: true });
    for (const p of paths) {
      const fullDir = path.join(testBinDir, path.dirname(p));
      fs.mkdirSync(fullDir, { recursive: true });
      fs.writeFileSync(path.join(testBinDir, p), "");
    }
  };

  // Clean up
  after(() => {
    if (fs.existsSync(testBinDir)) {
      fs.rmSync(testBinDir, { recursive: true, force: true });
    }
  });

  it("should find the only binary in darwin structure", () => {
    setupFiles(["darwin/arm64/rclone"]);
    const p = determineBinaryAbsolutePath(testBinDir);
    assert.ok(p.endsWith("darwin/arm64/rclone"));
    assert.ok(path.isAbsolute(p));
  });

  it("should find the only binary in win32 structure", () => {
    setupFiles(["win32/x64/rclone.exe"]);
    const p = determineBinaryAbsolutePath(testBinDir);
    assert.ok(p.endsWith("win32/x64/rclone.exe"));
    assert.ok(path.isAbsolute(p));
  });

  it("should throw error if more than 1 file exist", () => {
    setupFiles(["darwin/arm64/rclone", "extra.txt"]);
    assert.throws(() => {
      determineBinaryAbsolutePath(testBinDir);
    }, /Expected exactly 1 file/);
  });

  it("should throw error if 0 files exist", () => {
    setupFiles([]);
    assert.throws(() => {
      determineBinaryAbsolutePath(testBinDir);
    }, /Expected exactly 1 file/);
  });

  it("should throw error if bin directory is missing", () => {
    const nonExistent = path.join(__dirname, "non_existent_dir_random");
    assert.throws(() => {
      determineBinaryAbsolutePath(nonExistent);
    }, /Bin directory not found/);
  });
});
