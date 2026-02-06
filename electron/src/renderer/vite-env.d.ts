/// <reference types="vite/client" />

declare global {
  interface Window {
    electronAPI: {
      getPathForFile: (file: File) => string;
      revealDirectory: (dirPath: string) => void;
      getRcloneVersion: () => Promise<string>;
      openExternal: (url: string) => void;
      startSync: (options: { sourceDir: string; destinationDir: string; deleteMode: boolean }) => void;
      onSyncProgress: (callback: (data: any) => void) => () => void;
      onSyncLog: (callback: (line: string) => void) => () => void;
      onSyncEnd: (callback: (result: { error: string | null; duration: string }) => void) => () => void;
    };
  }
}

export {};
