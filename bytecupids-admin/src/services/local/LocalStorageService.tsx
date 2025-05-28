import type { NewModuleResponse } from '../../types/NewModuleResponse';

interface StoredModule extends NewModuleResponse {
  isTemporary: boolean;
  storedAt: string; // ISO timestamp
}

class LocalStorageService {
  private readonly STORAGE_KEY = 'bytecupids_temp_modules';
  private readonly MAX_MODULES = 50; // Limit to prevent storage bloat

  /**
   * Save a temporary module to local storage
   */
  saveTempModule(moduleData: NewModuleResponse): void {
    try {
      const storedModule: StoredModule = {
        ...moduleData,
        isTemporary: true,
        storedAt: new Date().toISOString()
      };

      const existingModules = this.getAllTempModules();
      
      // Check if module already exists (update it)
      const existingIndex = existingModules.findIndex(m => m.moduleId === moduleData.moduleId);
      
      if (existingIndex >= 0) {
        // Update existing module
        existingModules[existingIndex] = storedModule;
      } else {
        // Add new module at the beginning
        existingModules.unshift(storedModule);
      }

      // Limit the number of stored modules
      if (existingModules.length > this.MAX_MODULES) {
        existingModules.splice(this.MAX_MODULES);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingModules));
      console.log('Temporary module saved to local storage:', moduleData.moduleId);
      
    } catch (error) {
      console.error('Error saving module to local storage:', error);
    }
  }

  /**
   * Get all temporary modules from local storage
   */
  getAllTempModules(): StoredModule[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const modules = JSON.parse(stored) as StoredModule[];
      
      // Convert date strings back to Date objects
      return modules.map(module => ({
        ...module,
        createdAt: new Date(module.createdAt),
        updatedAt: new Date(module.updatedAt)
      }));
      
    } catch (error) {
      console.error('Error loading modules from local storage:', error);
      return [];
    }
  }

  /**
   * Get a specific temporary module by ID
   */
  getTempModule(moduleId: string): StoredModule | null {
    try {
      const modules = this.getAllTempModules();
      const module = modules.find(m => m.moduleId === moduleId);
      return module || null;
    } catch (error) {
      console.error('Error getting module from local storage:', error);
      return null;
    }
  }

  /**
   * Delete a temporary module from local storage
   */
  deleteTempModule(moduleId: string): boolean {
    try {
      const modules = this.getAllTempModules();
      const filteredModules = modules.filter(m => m.moduleId !== moduleId);
      
      if (filteredModules.length === modules.length) {
        console.warn('Module not found in local storage:', moduleId);
        return false;
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredModules));
      console.log('Temporary module deleted from local storage:', moduleId);
      return true;
      
    } catch (error) {
      console.error('Error deleting module from local storage:', error);
      return false;
    }
  }

  /**
   * Update a temporary module in local storage
   */
  updateTempModule(moduleData: NewModuleResponse): boolean {
    try {
      const modules = this.getAllTempModules();
      const moduleIndex = modules.findIndex(m => m.moduleId === moduleData.moduleId);
      
      if (moduleIndex === -1) {
        console.warn('Module not found for update:', moduleData.moduleId);
        return false;
      }

      // Update the module with new data
      modules[moduleIndex] = {
        ...moduleData,
        isTemporary: true,
        storedAt: modules[moduleIndex].storedAt, // Keep original stored time
        updatedAt: new Date() // Update the modification time
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(modules));
      console.log('Temporary module updated in local storage:', moduleData.moduleId);
      return true;
      
    } catch (error) {
      console.error('Error updating module in local storage:', error);
      return false;
    }
  }

  /**
   * Clear all temporary modules from local storage
   */
  clearAllTempModules(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('All temporary modules cleared from local storage');
    } catch (error) {
      console.error('Error clearing modules from local storage:', error);
    }
  }

  /**
   * Get storage stats
   */
  getStorageStats(): { count: number; sizeKB: number } {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const count = this.getAllTempModules().length;
      const sizeKB = stored ? Math.round((stored.length * 2) / 1024) : 0; // Rough estimate
      
      return { count, sizeKB };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { count: 0, sizeKB: 0 };
    }
  }

  /**
   * Check if a module exists in local storage
   */
  moduleExists(moduleId: string): boolean {
    return this.getTempModule(moduleId) !== null;
  }

  /**
   * Convert temporary module to regular module format for display
   */
  tempModuleToDisplayModule(tempModule: StoredModule) {
    return {
      id: tempModule.moduleId,
      title: tempModule.moduleName,
      difficulty: tempModule.difficultyLevel as any,
      status: "Not Saved" as const,
      targetAudience: tempModule.targetAudience,
      estimatedCompletionTime: tempModule.estimatedCompletionTime,
      createdAt: tempModule.createdAt.toISOString(),
      isTemporary: true
    };
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
export default localStorageService;