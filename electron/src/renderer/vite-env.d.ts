/// <reference types="vite/client" />

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

  namespace JSX {
    interface IntrinsicElements {
      "ace-editor": any;
    }
  }
}

export {};
