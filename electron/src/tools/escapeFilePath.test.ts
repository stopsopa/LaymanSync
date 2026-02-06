import { describe, it } from "node:test";
import assert from "node:assert";
import { escapeFilePath } from "./escapeFilePath.js";

/**
 * /bin/bash ts.sh --test electron/src/tools/escapeFilePath.test.ts
 */
describe("escapeFilePath", () => {
  it("simple path", () => {
    assert.strictEqual(escapeFilePath("simple/path"), "'simple/path'");
  });

  it("path with spaces", () => {
    assert.strictEqual(escapeFilePath("path with spaces"), "'path with spaces'");
  });

  it("path with single quote", () => {
    assert.strictEqual(escapeFilePath("path's"), "'path'\\''s'");
  });

  it("path with multiple single quotes", () => {
    assert.strictEqual(escapeFilePath("it's a 'nice' day"), "'it'\\''s a '\\''nice'\\'' day'");
  });

  it("empty path", () => {
    assert.strictEqual(escapeFilePath(""), "''");
  });

  it("path with special characters", () => {
    assert.strictEqual(escapeFilePath("path/with/$special/&/characters"), "'path/with/$special/&/characters'");
  });
});
