import { contextBridge, ipcRenderer, webUtils } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Config
  loadConfig: () => ipcRenderer.invoke("config:load"),
  saveConfig: (config: any) => ipcRenderer.invoke("config:save", config),

  // Directory Selection
  selectDirectory: () => ipcRenderer.invoke("dialog:selectDirectory"),

  // Tool to get file path from File object (standard in modern Electron)
  getPathForFile: (file: File) => webUtils.getPathForFile(file),

  // Reveal in Finder/Explorer
  revealPath: (path: string) => ipcRenderer.send("app:revealPath", path),

  // App Versions
  getRcloneVersion: () => ipcRenderer.invoke("app:getRcloneVersion"),

  // Open URL in system browser
  openExternal: (url: string) => ipcRenderer.send("app:openExternal", url),

  // Process count
  setProcessCount: (count: number) => ipcRenderer.send("process:count", count),

  // rclone events (for Phase 4)
  onLog: (callback: (line: string) => void) => {
    const listener = (_event: any, line: string) => callback(line);
    ipcRenderer.on("rclone:log", listener);
    return () => ipcRenderer.removeListener("rclone:log", listener);
  },
  onProgress: (callback: (data: any) => void) => {
    const listener = (_event: any, data: any) => callback(data);
    ipcRenderer.on("rclone:progress", listener);
    return () => ipcRenderer.removeListener("rclone:progress", listener);
  },
  onEnd: (callback: (error: string | null, duration: string) => void) => {
    const listener = (_event: any, data: { error: string | null; duration: string }) =>
      callback(data.error, data.duration);
    ipcRenderer.on("rclone:end", listener);
    return () => ipcRenderer.removeListener("rclone:end", listener);
  },
  startRclone: (options: any) => ipcRenderer.send("rclone:start", options),
});

// Type definition for window.electronAPI
declare global {
  interface Window {
    electronAPI: {
      loadConfig: () => Promise<any>;
      saveConfig: (config: any) => Promise<{ success: boolean; error?: string }>;
      selectDirectory: () => Promise<string | null>;
      getPathForFile: (file: File) => string;
      revealPath: (path: string) => void;
      getRcloneVersion: () => Promise<string>;
      openExternal: (url: string) => void;
      setProcessCount: (count: number) => void;
      onLog: (callback: (line: string) => void) => () => void;
      onProgress: (callback: (data: any) => void) => () => void;
      onEnd: (callback: (error: string | null, duration: string) => void) => () => void;
      startRclone: (options: any) => void;
    };
  }
}
