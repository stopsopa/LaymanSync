import path from "node:path";
import { app } from "electron";
import { determineBinaryAbsolutePath } from "../tools/determineBinaryAbsolutePath.js";

export function getRclonePath(): string {
  if (app.isPackaged) {
    const binDir = path.join(process.resourcesPath, "bin");
    const fullPath = determineBinaryAbsolutePath(binDir);
    console.log(`[Bins] Packaged Rclone path resolved via tool: ${fullPath}`);
    return fullPath;
  }

  // In development, use the downloaded binaries in electron/bin
  const devPath = determineBinaryAbsolutePath();
  console.log(`[Bins] Dev Rclone path resolved via tool: ${devPath}`);
  return devPath;
}
