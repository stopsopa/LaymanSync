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
});

// Type definition for window.electronAPI
declare global {
  interface Window {
    electronAPI: {
      getPathForFile: (file: File) => string;
      revealDirectory: (dirPath: string) => void;
      getRcloneVersion: () => Promise<string>;
      openExternal: (url: string) => void;
    };
  }
}
