import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { getRclonePath } from "./bins.js";
import { exec } from "child_process";
import { promisify } from "util";
import driveCompression from "../tools/driveCompression.js";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

// Persistence
const getHomeDir = () => {
  try {
    return os.homedir();
  } catch (e) {
    return process.env.HOME || process.env.USERPROFILE || app.getPath("home") || app.getPath("userData");
  }
};
const getConfigDir = () => path.join(getHomeDir(), ".laymansync");
const getConfigPath = () => path.join(getConfigDir(), "setup.json");

// Track active processes for close confirmation
let activeProcessCount = 0;

async function createWindow() {
  const isDev = !!process.env.VITE_DEV_SERVER_URL;

  const appPath = app.getAppPath();
  const iconPath = path.join(appPath, "dist/icon.png");

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
    title: "LaymanSync - Rclone GUI",
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
  }

  // Handle window close with confirmation if processing
  mainWindow.on("close", async (e) => {
    if (activeProcessCount > 0) {
      e.preventDefault();

      const response = await dialog.showMessageBox(mainWindow!, {
        type: "warning",
        buttons: ["Cancel", "Quit"],
        defaultId: 0,
        title: "Sync in progress",
        message: "Are you sure you want to quit?",
        detail: `${activeProcessCount} process(es) are currently running. Unfinished operations might leave files in an inconsistent state.`,
      });

      if (response.response === 1) {
        // User chose to quit
        app.exit(0);
      }
    }
  });
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

// Load configuration
ipcMain.handle("config:load", async () => {
  try {
    const configPath = getConfigPath();
    const data = await fs.readFile(configPath, "utf-8");
    return JSON.parse(data);
  } catch (error: any) {
    return {
      sourceDir: "",
      destinationDir: "",
      deleteMode: false,
    };
  }
});

// Save configuration
ipcMain.handle("config:save", async (_event, config) => {
  try {
    await fs.mkdir(getConfigDir(), { recursive: true });
    await fs.writeFile(getConfigPath(), JSON.stringify(config, null, 2));
    return { success: true };
  } catch (error) {
    console.error("Failed to save config:", error);
    return { success: false, error: String(error) };
  }
});

// Select directory
ipcMain.handle("dialog:selectDirectory", async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory", "createDirectory"],
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// Get rclone version
ipcMain.handle("app:getRcloneVersion", async () => {
  try {
    const rclonePath = getRclonePath();
    const { stdout } = await execAsync(`"${rclonePath}" --version`);
    return stdout.split("\n")[0].trim();
  } catch (error) {
    console.error("Failed to get rclone version:", error);
    return "unknown";
  }
});

// Reveal in finder
ipcMain.on("app:revealPath", (_event, filePath: string) => {
  if (filePath) {
    shell.showItemInFolder(filePath);
  }
});

// Open external URL
ipcMain.on("app:openExternal", (_event, url: string) => {
  shell.openExternal(url);
});

// Start rclone process
ipcMain.on("rclone:start", async (event, options) => {
  const { sourceDir, destinationDir } = options;
  const isDelete = !!options.delete;

  console.log(`[Main] IPC rclone:start received:`, { sourceDir, destinationDir, isDelete });

  activeProcessCount++;
  event.sender.send("process:count", activeProcessCount);

  try {
    console.log(`[Main] Invoking driveCompression engine...`);
    await driveCompression({
      sourceDir,
      destinationDir,
      delete: isDelete,
      progressEvent: (data) => {
        // console.log(`[Main] rclone progress:`, data.progressPercentHuman);
        event.sender.send("rclone:progress", data);
      },
      log: (line) => {
        event.sender.send("rclone:log", line);
      },
      end: (error, duration) => {
        console.log(`[Main] rclone process ended. Error:`, error, `Duration:`, duration);
        activeProcessCount--;
        event.sender.send("process:count", activeProcessCount);
        event.sender.send("rclone:end", { error, duration });
      },
    });
  } catch (error: any) {
    console.error(`[Main] driveCompression engine threw error:`, error);
    activeProcessCount--;
    event.sender.send("process:count", activeProcessCount);
    event.sender.send("rclone:end", { error: error.message || String(error), duration: "0s" });
  }
});

// Set process count
ipcMain.on("process:count", (_event, count: number) => {
  activeProcessCount = count;
});
