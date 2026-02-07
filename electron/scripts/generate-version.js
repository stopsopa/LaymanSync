import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.resolve(__dirname, "../package.json");
const versionFilePath = path.resolve(__dirname, "../src/renderer/version.json");

try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const versionData = {
    version: pkg.version,
    buildTime: new Date().toISOString(),
  };

  // Ensure directory exists
  const dir = path.dirname(versionFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));
  console.log(`Generated version.json with version ${pkg.version}`);
} catch (error) {
  console.error("Failed to generate version.json:", error);
  process.exit(1);
}
