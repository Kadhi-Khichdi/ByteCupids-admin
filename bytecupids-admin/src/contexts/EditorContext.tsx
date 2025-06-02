import React, { createContext, useContext, useState, useCallback } from 'react';
import localStorageService from '../services/local/LocalStorageService';
import { getModules } from '../services/GetModulesService';
import type { GetModuleResponse } from '../types/GetModuleResponse';
import type { ReactNode } from 'react';

// Types for module data
interface ModuleMetadata {
  moduleId: string;
  moduleName: string;
  targetAudience: string;
  difficultyLevel: string;
  estimatedCompletionTime: string;
  prerequisites: string | string[];
  keywords?: Record<string, string>;
  otherMetadata?: Record<string, any>;
  agentNotes: string;
  interpretation: string;
  createdAt: Date;
  updatedAt: Date;
  isTemporary?: boolean;
  noOfTopics?: number;
  noOfSubTopics?: number;
  organization?: string;
}

interface EditorContextType {
  // Module Data
  moduleData: ModuleMetadata | null;
  originalData: ModuleMetadata | null;
  
  // Loading States
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadModule: (moduleId: string) => Promise<void>;
  updateModuleData: (updates: Partial<ModuleMetadata>) => void;
  resetToOriginal: () => void;
  saveModule: () => Promise<void>;
  clearModule: () => void;
  
  // Form State
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

interface EditorProviderProps {
  children: ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const [moduleData, setModuleData] = useState<ModuleMetadata | null>(null);
  const [originalData, setOriginalData] = useState<ModuleMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load module data from local storage or backend
  const loadModule = useCallback(async (moduleId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setHasUnsavedChanges(false);

      console.log(`Loading module: ${moduleId}`);

      // First, try to load from local storage (for temporary modules)
      const tempModule = localStorageService.getTempModule(moduleId);
      
      if (tempModule) {
        console.log("Loading temporary module from local storage:", moduleId);
        
        const moduleMetadata: ModuleMetadata = {
          moduleId: tempModule.moduleId,
          moduleName: tempModule.moduleName,
          targetAudience: tempModule.targetAudience,
          difficultyLevel: tempModule.difficultyLevel,
          estimatedCompletionTime: tempModule.estimatedCompletionTime,
          prerequisites: tempModule.prerequisites,
          keywords: tempModule.keywords,
          otherMetadata: tempModule.otherMetadata,
          agentNotes: tempModule.agentNotes,
          interpretation: tempModule.interpretation,
          createdAt: tempModule.createdAt,
          updatedAt: tempModule.updatedAt,
          isTemporary: true
        };
        
        setModuleData(moduleMetadata);
        setOriginalData(JSON.parse(JSON.stringify(moduleMetadata))); // Deep copy
        return;
      }
      
      // If not found in local storage, try to load from backend (saved modules)
      try {
        console.log("Loading saved module from backend:", moduleId);
        
        const response: GetModuleResponse = await getModules();
        
        if (response.success && response.modules) {
          const savedModule = response.modules.find(module => module.moduleId === moduleId);
          
          if (savedModule) {
            const moduleMetadata: ModuleMetadata = {
              moduleId: savedModule.moduleId,
              moduleName: savedModule.moduleName,
              targetAudience: savedModule.targetAudience,
              difficultyLevel: savedModule.difficultyLevel,
              estimatedCompletionTime: `${savedModule.estimatedTime} hours`,
              prerequisites: savedModule.prerequisites, // Array format
              agentNotes: savedModule.agentNotes,
              interpretation: savedModule.interpretation,
              createdAt: new Date(savedModule.lastUpdateTime),
              updatedAt: new Date(savedModule.lastUpdateTime),
              isTemporary: false,
              noOfTopics: savedModule.noOfTopics,
              noOfSubTopics: savedModule.noOfSubTopics,
              organization: savedModule.organization
            };
            
            setModuleData(moduleMetadata);
            setOriginalData(JSON.parse(JSON.stringify(moduleMetadata))); // Deep copy
            return;
          }
        }
        
        throw new Error(`Saved module with ID ${moduleId} not found`);
        
      } catch (backendError) {
        console.error("Error loading from backend:", backendError);
        throw new Error(`Module with ID ${moduleId} not found in local storage or backend`);
      }
      
    } catch (err) {
      console.error("Error loading module:", err);
      setError(err instanceof Error ? err.message : "Failed to load module data");
      setModuleData(null);
      setOriginalData(null);
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed as we're not using any state or props

  // Update module data and track changes
  const updateModuleData = useCallback((updates: Partial<ModuleMetadata>) => {
    setModuleData(prevData => {
      if (!prevData) return null;

      const updatedData = {
        ...prevData,
        ...updates,
        updatedAt: new Date()
      };

      return updatedData;
    });
    
    // Check if there are unsaved changes in a separate effect
    setHasUnsavedChanges(true);
  }, []);

  // Reset to original data
  const resetToOriginal = useCallback(() => {
    setModuleData(prevOriginal => {
      if (originalData) {
        setHasUnsavedChanges(false);
        return JSON.parse(JSON.stringify(originalData)); // Deep copy
      }
      return prevOriginal;
    });
  }, [originalData]);

  // Save module (placeholder implementation)
  const saveModule = useCallback(async (): Promise<void> => {
    if (!moduleData) {
      throw new Error("No module data to save");
    }

    try {
      setIsSaving(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update original data to match current data
      setOriginalData(JSON.parse(JSON.stringify(moduleData))); // Deep copy
      setHasUnsavedChanges(false);

      console.log("Module saved successfully:", moduleData);
      
    } catch (err) {
      console.error("Error saving module:", err);
      throw new Error("Failed to save module");
    } finally {
      setIsSaving(false);
    }
  }, [moduleData]);

  // Clear module data
  const clearModule = useCallback(() => {
    setModuleData(null);
    setOriginalData(null);
    setError(null);
    setHasUnsavedChanges(false);
    setIsSaving(false);
  }, []);

  // Context value
  const contextValue: EditorContextType = {
    // Module Data
    moduleData,
    originalData,
    
    // Loading States
    isLoading,
    error,
    
    // Actions
    loadModule,
    updateModuleData,
    resetToOriginal,
    saveModule,
    clearModule,
    
    // Form State
    hasUnsavedChanges,
    isSaving
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

// Custom hook to use the editor context
export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

// Export types for external use
export type { ModuleMetadata, EditorContextType };