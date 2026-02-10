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
      checkPathExists: (path: string) => Promise<boolean>;
      startSync: (options: { source: string; target: string; deleteMode: boolean; index: number }) => void;
      onSyncProgress: (callback: (data: { index: number; data: any }) => void) => () => void;
      onSyncLog: (callback: (data: { index: number; line: string }) => void) => () => void;
      onSyncEnd: (callback: (result: { index: number; error: string | null; duration: string }) => void) => () => void;
    };
  }
}

export {};
