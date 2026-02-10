import { contextBridge, ipcRenderer, webUtils } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Tool to get file path from File object (standard in modern Electron)
  getPathForFile: (file: File) => webUtils.getPathForFile(file),

  // Reveal directory in Finder/Explorer
  revealDirectory: (dirPath: string) => ipcRenderer.send("directory:reveal", dirPath),

  // Get rclone version
  getRcloneVersion: () => ipcRenderer.invoke("app:getRcloneVersion"),

  // Open external URL
  openExternal: (url: string) => ipcRenderer.send("app:openExternal", url),

  // Synchronous JSON file operations
  readJsonSync: (filePath: string) => ipcRenderer.sendSync("file:read-json-sync", filePath),
  writeJsonSync: (filePath: string, data: any) => ipcRenderer.sendSync("file:write-json-sync", { filePath, data }),

  // Open native directory selection dialog
  openDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),

  // Open native file selection dialog
  openFile: (filters?: Electron.FileFilter[]) => ipcRenderer.invoke("dialog:openFile", filters),

  // Open native save file dialog
  saveFile: (options?: Electron.SaveDialogOptions) => ipcRenderer.invoke("dialog:saveFile", options),

  // Start sync/copy operation
  startSync: (options: { source: string; target: string; deleteMode: boolean; index: number }) =>
    ipcRenderer.send("sync:start", options),

  // Listen for sync progress events
  onSyncProgress: (callback: (data: { index: number; data: any }) => void) => {
    const listener = (_event: any, data: { index: number; data: any }) => callback(data);
    ipcRenderer.on("sync:progress", listener);
    return () => ipcRenderer.removeListener("sync:progress", listener);
  },

  // Listen for sync log events
  onSyncLog: (callback: (data: { index: number; line: string }) => void) => {
    const listener = (_event: any, data: { index: number; line: string }) => callback(data);
    ipcRenderer.on("sync:log", listener);
    return () => ipcRenderer.removeListener("sync:log", listener);
  },

  // Listen for sync end events
  onSyncEnd: (callback: (result: { index: number; error: string | null; duration: string }) => void) => {
    const listener = (_event: any, result: any) => callback(result);
    ipcRenderer.on("sync:end", listener);
    return () => ipcRenderer.removeListener("sync:end", listener);
  },
});

// Type definition for window.electronAPI
declare global {
  interface Window {
    electronAPI: {
      getPathForFile: (file: File) => string;
      revealDirectory: (dirPath: string) => void;
      getRcloneVersion: () => Promise<string>;
      openExternal: (url: string) => void;
      readJsonSync: (filePath: string) => any;
      writeJsonSync: (filePath: string, data: any) => boolean;
      openDirectory: () => Promise<string | null>;
      openFile: (filters?: Electron.FileFilter[]) => Promise<string | null>;
      saveFile: (options?: Electron.SaveDialogOptions) => Promise<string | null>;
      startSync: (options: { source: string; target: string; deleteMode: boolean; index: number }) => void;
      onSyncProgress: (callback: (data: { index: number; data: any }) => void) => () => void;
      onSyncLog: (callback: (data: { index: number; line: string }) => void) => () => void;
      onSyncEnd: (callback: (result: { index: number; error: string | null; duration: string }) => void) => () => void;
    };
  }
}
