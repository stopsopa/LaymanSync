import type { MainTypes } from "../../tools/commonTypes";

class ConfigManager {
  private path: string | null = null;

  constructor(path: string | null = null) {
    this.path = path;
  }

  /**
   * Set the absolute path to the configuration file.
   * @param path Absolute path or null
   */
  setPath(path: string | null): void {
    this.path = path;
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
  get(): MainTypes[] | null {
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
  set(data: MainTypes[]): boolean {
    if (this.path) {
      return window.electronAPI.writeJsonSync(this.path, data);
    }
    return false;
  }
}

// Export both the class for instantiation and a singleton instance for shared use
export { ConfigManager };
export const configManager = new ConfigManager();
