import { useEditor } from '../contexts/EditorContext';

// Simple hook to get commonly used module data
export const useModuleData = () => {
  const { 
    moduleData, 
    updateModuleData, 
    hasUnsavedChanges,
    resetToOriginal,
    saveModule,
    isSaving
  } = useEditor();

  return {
    // Data
    module: moduleData,
    hasChanges: hasUnsavedChanges,
    
    // Actions
    updateModule: updateModuleData,
    resetChanges: resetToOriginal,
    save: saveModule,
    
    // States
    isSaving
  };
};