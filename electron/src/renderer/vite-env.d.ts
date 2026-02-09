/// <reference types="vite/client" />

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
      startSync: (options: { source: string; target: string; deleteMode: boolean }) => void;
      onSyncProgress: (callback: (data: any) => void) => () => void;
      onSyncLog: (callback: (line: string) => void) => () => void;
      onSyncEnd: (callback: (result: { error: string | null; duration: string }) => void) => () => void;
    };
  }
}

export {};
