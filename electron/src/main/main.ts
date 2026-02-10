import { app, BrowserWindow, ipcMain, shell, dialog } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";
import { determineBinaryAbsolutePath } from "../tools/determineBinaryAbsolutePath.js";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Disable sandboxing on macOS to prevent crashes
app.commandLine.appendSwitch("no-sandbox");
app.commandLine.appendSwitch("disable-gpu-sandbox");
app.commandLine.appendSwitch("disable-setuid-sandbox");

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  const isDev = !!process.env.VITE_DEV_SERVER_URL;

  const appPath = app.getAppPath();
  const iconPath = path.join(appPath, "dist/icon.png");

  mainWindow = new BrowserWindow({
    width: isDev ? 1750 : 1150,
    height: 850,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
    title: "LaymanSyncBulk",
  });

  if (process.platform === "darwin" && app.dock) {
    try {
      app.dock.setIcon(iconPath);
    } catch (e) {
      console.warn("Failed to set dock icon:", e);
    }
  }

  // Load Vite dev server in development or built files in production
  if (isDev) {
    console.log(`[Main] Loading Dev URL: ${process.env.VITE_DEV_SERVER_URL}`);
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!);
    mainWindow.webContents.openDevTools();
  } else {
    const htmlPath = path.join(appPath, "dist/index.html");
    mainWindow.loadFile(htmlPath).catch((err) => {
      console.error(`[Main] Failed to load index.html:`, err);
    });

    // Allow opening DevTools in production with a shortcut for debugging if needed
    mainWindow.webContents.on("before-input-event", (_event, input) => {
      if ((input.control || input.meta) && input.shift && input.key.toLowerCase() === "i") {
        mainWindow?.webContents.openDevTools();
      }
    });
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers

// Reveal directory in Finder/Explorer
ipcMain.on("directory:reveal", (_event, dirPath: string) => {
  shell.showItemInFolder(dirPath);
});

// Select directory using native dialog
ipcMain.handle("dialog:openDirectory", async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// Select file using native dialog
ipcMain.handle("dialog:openFile", async (_event, filters?: Electron.FileFilter[]) => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: filters,
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// Save file using native dialog
ipcMain.handle("dialog:saveFile", async (_event, options?: Electron.SaveDialogOptions) => {
  if (!mainWindow) return null;
  const result = await dialog.showSaveDialog(mainWindow, options || {});
  if (result.canceled || !result.filePath) {
    return null;
  }
  return result.filePath;
});

// Check if directory exists (supports symlinks to directories)
ipcMain.handle("file:exists", (_event, filePath: string) => {
  if (!filePath) return false;
  try {
    const stats = fs.statSync(filePath);
    return stats.isDirectory();
  } catch (e) {
    return false;
  }
});

// Get rclone version
ipcMain.handle("app:getRcloneVersion", async () => {
  try {
    const rclonePath = determineBinaryAbsolutePath();
    const { stdout } = await execAsync(`"${rclonePath}" version`);

    // Parse version from output like "rclone v1.65.0"
    const match = stdout.match(/rclone v([\d.]+)/);
    return match ? match[1] : "unknown";
  } catch (error: any) {
    console.error("Failed to get rclone version:", error);
    return "not found";
  }
});

// Open external URL
ipcMain.on("app:openExternal", (_event, url: string) => {
  shell.openExternal(url);
});

// Synchronous JSON file reading
ipcMain.on("file:read-json-sync", (event, filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      event.returnValue = JSON.parse(content);
    } else {
      event.returnValue = null;
    }
  } catch (error) {
    console.error("Error reading JSON sync:", error);
    event.returnValue = null;
  }
});

// Synchronous JSON file writing
ipcMain.on("file:write-json-sync", (event, { filePath, data }: { filePath: string; data: any }) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    event.returnValue = true;
  } catch (error) {
    console.error("Error writing JSON sync:", error);
    event.returnValue = false;
  }
});

// Start sync/copy operation
ipcMain.on(
  "sync:start",
  async (event, options: { source: string; target: string; deleteMode: boolean; index: number }) => {
    const accumulatedLogs: string[] = [];
    const index = options.index;

    try {
      const { default: driveCompression } = await import("../tools/driveCompression.js");

      // Throttle progress updates to prevent UI freezing
      let lastProgressSent = 0;
      let lastProgressData: any = null;
      const THROTTLE_MS = 300;

      // Wrap driveCompression in a promise that rejects on failure
      // so we can handle it in the catch block as requested.
      await new Promise<void>((resolve, reject) => {
        driveCompression({
          source: options.source,
          target: options.target,
          delete: options.deleteMode,
          progressEvent: (data) => {
            const now = Date.now();
            lastProgressData = data;

            // Only send if enough time has passed since last update
            if (now - lastProgressSent >= THROTTLE_MS) {
              event.sender.send("sync:progress", { index, data });
              lastProgressSent = now;
            }
          },
          log: (line) => {
            accumulatedLogs.push(line);
            event.sender.send("sync:log", { index, line });
          },
          end: (error, duration) => {
            // Send final progress update if there's one pending
            if (lastProgressData && Date.now() - lastProgressSent >= THROTTLE_MS) {
              event.sender.send("sync:progress", { index, data: lastProgressData });
            }

            if (error) {
              reject({ error, duration });
            } else {
              event.sender.send("sync:end", { index, error: null, duration });
              resolve();
            }
          },
        });
      });
    } catch (err: any) {
      let errorMessage = "";
      let duration = "0s";

      // Handle the custom error object from our Promise rejection
      if (err && typeof err === "object" && "error" in err) {
        errorMessage = err.error;
        duration = err.duration;
      } else {
        errorMessage = err.message || String(err);
      }

      // Translation for Rclone exit code 7 (Fatal Error)
      if (errorMessage.includes("exited with code 7")) {
        const absSource = path.resolve(options.source);
        const absDest = path.resolve(options.target);

        const relativeToDest = path.relative(absDest, absSource);
        const sourceInsideDest = !relativeToDest.startsWith("..") && !path.isAbsolute(relativeToDest);

        const relativeToSource = path.relative(absSource, absDest);
        const destInsideSource = !relativeToSource.startsWith("..") && !path.isAbsolute(relativeToSource);

        let overlapReason = "";
        if (absSource === absDest) {
          overlapReason = "Source and destination are exactly the same directory.";
        } else if (sourceInsideDest) {
          overlapReason = "Source directory is INSIDE the destination directory.";
        } else if (destInsideSource) {
          overlapReason = "Destination directory is INSIDE the source directory.";
        }

        if (overlapReason) {
          errorMessage = `Sync Failed: Path Overlap Detected\n\n${overlapReason}\n\nThis is a fatal error in rclone (Code 7) because it would cause an infinite recursive copying loop.\n\nSource: ${absSource}\nDestination: ${absDest}`;
        } else {
          errorMessage = `Sync Failed: Fatal Rclone Error (Code 7)\n\nThis usually indicates a fatal system error or an issue with the paths provided.`;
        }
      }

      // Append log context for better debugging
      if (accumulatedLogs.length > 0) {
        errorMessage += `\n\nRecent Logs:\n${accumulatedLogs.slice(-10).join("\n")}`;
      }

      console.error("Sync operation failed:", errorMessage);
      event.sender.send("sync:end", {
        index,
        error: errorMessage,
        duration: duration,
      });
    }
  },
);
