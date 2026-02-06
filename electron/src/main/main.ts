import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "path";
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
    title: "LaymanSync",
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
