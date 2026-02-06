import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

import generateRcloneParams, { generateRcloneParamsStrings } from "./generateRcloneParams.js";

/**
 * /bin/bash ts.sh --test electron/src/tools/generateRcloneParams.test.ts
 */
describe("generateRcloneParams", () => {
  let tmpSource: string;
  let tmpDest: string;
  const tmpBase = path.join(process.cwd(), ".tmp_test_rclone");

  before(() => {
    if (!fs.existsSync(tmpBase)) {
      fs.mkdirSync(tmpBase, { recursive: true });
    }
    tmpSource = fs.mkdtempSync(path.join(tmpBase, "source-"));
    tmpDest = fs.mkdtempSync(path.join(tmpBase, "dest-"));
  });

  after(() => {
    fs.rmSync(tmpBase, { recursive: true, force: true });
  });

  it("should generate rclone copy params when delete is false", () => {
    const params = {
      delete: false as const,
      sourceDir: tmpSource,
      destinationDir: tmpDest,
    };

    const result = generateRcloneParams(params);

    assert.deepStrictEqual(result, [
      "copy",
      ["-v", "-P", "--transfers", "4", "--fast-list", "--stats=1s", "--stats-one-line"],
      tmpSource,
      tmpDest,
    ]);
  });

  it("should generate rclone sync params when delete is true", () => {
    const params = {
      delete: true as const,
      sourceDir: tmpSource,
      destinationDir: tmpDest,
    };

    const result = generateRcloneParams(params);

    assert.deepStrictEqual(result, [
      "sync",
      ["-v", "-P", "--transfers", "4", "--fast-list", "--stats=1s", "--stats-one-line"],
      tmpSource,
      tmpDest,
    ]);
  });

  it("should generate string/array version for execution", () => {
    const args = generateRcloneParamsStrings({
      delete: false,
      sourceDir: tmpSource,
      destinationDir: tmpDest,
    });

    assert.equal(args, `copy -v -P --transfers 4 --fast-list --stats=1s --stats-one-line '${tmpSource}' '${tmpDest}'`);
  });

  it("should handle paths with special characters correctly in string version", () => {
    // We can't easily create a path with quotes on all OSs, but we can mock or use spaces
    const spaceSource = path.join(tmpBase, "source with space");
    const spaceDest = path.join(tmpBase, "dest with space");
    fs.mkdirSync(spaceSource);
    fs.mkdirSync(spaceDest);

    const args = generateRcloneParamsStrings({
      delete: true,
      sourceDir: spaceSource,
      destinationDir: spaceDest,
    });

    assert.equal(
      args,
      `sync -v -P --transfers 4 --fast-list --stats=1s --stats-one-line '${spaceSource}' '${spaceDest}'`,
    );
  });

  it("should throw error if directory does not exist", () => {
    assert.throws(() => {
      generateRcloneParams({
        delete: false,
        sourceDir: "/non/existent/path/at/all",
        destinationDir: tmpDest,
      });
    }, /generateRcloneParams\.ts error: Source directory does not exist/);
  });
});
