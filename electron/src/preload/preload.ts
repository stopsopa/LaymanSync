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

  // Open URL in system browser
  openExternal: (url: string) => ipcRenderer.send("app:openExternal", url),

  // Start sync/copy operation
  startSync: (options: { source: string; target: string; deleteMode: boolean }) =>
    ipcRenderer.send("sync:start", options),

  // Listen for sync progress events
  onSyncProgress: (callback: (data: any) => void) => {
    const listener = (_event: any, data: any) => callback(data);
    ipcRenderer.on("sync:progress", listener);
    return () => ipcRenderer.removeListener("sync:progress", listener);
  },

  // Listen for sync log events
  onSyncLog: (callback: (line: string) => void) => {
    const listener = (_event: any, line: string) => callback(line);
    ipcRenderer.on("sync:log", listener);
    return () => ipcRenderer.removeListener("sync:log", listener);
  },

  // Listen for sync end events
  onSyncEnd: (callback: (result: { error: string | null; duration: string }) => void) => {
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
      startSync: (options: { source: string; target: string; deleteMode: boolean }) => void;
      onSyncProgress: (callback: (data: any) => void) => () => void;
      onSyncLog: (callback: (line: string) => void) => () => void;
      onSyncEnd: (callback: (result: { error: string | null; duration: string }) => void) => () => void;
    };
  }
}
