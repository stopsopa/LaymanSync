import { useState, useEffect, useCallback } from "react";
import type { MainOptionalTypes } from "../../tools/commonTypes";

class ConfigManager {
  private path: string | null = null;
  private listeners: Set<() => void> = new Set();

  constructor(path: string | null = null) {
    this.path = path;
  }

  /**
   * Subscribe to changes in the configuration (path or data).
   * @param listener Callback function
   * @returns Unsubscribe function
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Set the absolute path to the configuration file.
   * @param path Absolute path or null
   */
  setPath(path: string | null): void {
    this.path = path;
    this.notify();
  }

  /**
   * Get the current configuration file path.
   * @returns The absolute path or null
   */
  getPath(): string | null {
    return this.path;
  }

  /**
   * Read the configuration file from disk synchronously.
   * Returns null if path is not set or file doesn't exist/is invalid.
   */
  get(): MainOptionalTypes[] | null {
    if (this.path) {
      return window.electronAPI.readJsonSync(this.path);
    }
    return null;
  }

  /**
   * Write the configuration data to disk synchronously.
   * @param data The configuration data to save
   * @returns true if successful, false otherwise
   */
  set(data: MainOptionalTypes[]): boolean {
    if (this.path) {
      const success = window.electronAPI.writeJsonSync(this.path, data);
      if (success) {
        this.notify();
      }
      return success;
    }
    return false;
  }
}

// Export both the class for instantiation and a singleton instance for shared use
export { ConfigManager };
export const configManager = new ConfigManager();

/**
 * React hook to interact with the singleton ConfigManager.
 * It provides reactive access to path and data, and handles re-renders
 * when either changes.
 */
export function useConfigManager() {
  // Use a counter or timestamp to trigger re-renders since the actual
  // data might be complex or managed externally.
  const [, setTick] = useState(0);

  useEffect(() => {
    // Subscribe to the singleton's notify events
    return configManager.subscribe(() => {
      setTick((tick) => tick + 1);
    });
  }, []);

  const setPath = useCallback((path: string | null) => {
    configManager.setPath(path);
  }, []);

  const setConfig = useCallback((data: MainOptionalTypes[]) => {
    return configManager.set(data);
  }, []);

  return {
    path: configManager.getPath(),
    setPath,
    data: configManager.get() || [],
    getConfig: useCallback(() => configManager.get(), []),
    setConfig,
  };
}
