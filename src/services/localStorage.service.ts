/**
 * LocalStorage Service
 * 
 * Centralized service for managing localStorage persistence
 * with type safety, error handling, and data validation.
 */

export interface StorageConfig {
  prefix?: string;
  version?: string;
}

class LocalStorageService {
  private readonly prefix: string;
  private readonly version: string;

  constructor(config: StorageConfig = {}) {
    this.prefix = config.prefix || 'constructpro';
    this.version = config.version || 'v1';
  }

  /**
   * Generate storage key with prefix and version
   */
  private getKey(key: string): string {
    return `${this.prefix}_${this.version}_${key}`;
  }

  /**
   * Save data to localStorage
   */
  set<T>(key: string, data: T): boolean {
    try {
      const storageKey = this.getKey(key);
      const serialized = JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
        version: this.version
      });
      localStorage.setItem(storageKey, serialized);
      return true;
    } catch (error) {
      console.error(`Error saving to localStorage [${key}]:`, error);
      return false;
    }
  }

  /**
   * Get data from localStorage
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const storageKey = this.getKey(key);
      const item = localStorage.getItem(storageKey);
      
      if (!item) {
        return defaultValue !== undefined ? defaultValue : null;
      }

      const parsed = JSON.parse(item);
      
      // Validate version
      if (parsed.version !== this.version) {
        console.warn(`Version mismatch for ${key}. Clearing old data.`);
        this.remove(key);
        return defaultValue !== undefined ? defaultValue : null;
      }

      return parsed.data as T;
    } catch (error) {
      console.error(`Error reading from localStorage [${key}]:`, error);
      return defaultValue !== undefined ? defaultValue : null;
    }
  }

  /**
   * Remove data from localStorage
   */
  remove(key: string): boolean {
    try {
      const storageKey = this.getKey(key);
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage [${key}]:`, error);
      return false;
    }
  }

  /**
   * Clear all data with current prefix
   */
  clear(): boolean {
    try {
      const keys = this.getAllKeys();
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Get all keys with current prefix
   */
  getAllKeys(): string[] {
    const keys: string[] = [];
    const prefixPattern = `${this.prefix}_${this.version}_`;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefixPattern)) {
        keys.push(key);
      }
    }
    
    return keys;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const storageKey = this.getKey(key);
    return localStorage.getItem(storageKey) !== null;
  }

  /**
   * Get storage size in bytes
   */
  getSize(): number {
    let size = 0;
    const keys = this.getAllKeys();
    
    keys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        size += item.length + key.length;
      }
    });
    
    return size;
  }

  /**
   * Get storage size formatted
   */
  getSizeFormatted(): string {
    const bytes = this.getSize();
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Export all data
   */
  exportData(): Record<string, any> {
    const data: Record<string, any> = {};
    const keys = this.getAllKeys();
    
    keys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          data[key] = JSON.parse(item);
        } catch {
          data[key] = item;
        }
      }
    });
    
    return data;
  }

  /**
   * Import data
   */
  importData(data: Record<string, any>): boolean {
    try {
      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith(`${this.prefix}_${this.version}_`)) {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Migrate data from old version
   */
  migrate(oldVersion: string, migrationFn: (oldData: any) => any): boolean {
    try {
      const oldPrefix = `${this.prefix}_${oldVersion}_`;
      const keys: string[] = [];
      
      // Find all keys with old version
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(oldPrefix)) {
          keys.push(key);
        }
      }
      
      // Migrate each key
      keys.forEach(oldKey => {
        const item = localStorage.getItem(oldKey);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            const migrated = migrationFn(parsed.data);
            const newKey = oldKey.replace(oldPrefix, `${this.prefix}_${this.version}_`);
            
            this.set(newKey.replace(`${this.prefix}_${this.version}_`, ''), migrated);
            localStorage.removeItem(oldKey);
          } catch (error) {
            console.error(`Error migrating key ${oldKey}:`, error);
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error during migration:', error);
      return false;
    }
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
export default localStorageService;
