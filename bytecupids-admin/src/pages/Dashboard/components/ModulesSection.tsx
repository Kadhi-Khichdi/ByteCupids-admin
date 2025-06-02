import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ModulesSection.module.css";
import CreateModuleForm from "./CreateModuleForm";
import localStorageService from "../../../services/local/LocalStorageService";
import { getModules } from "../../../services/GetModulesService";
import type { NewModuleResponse } from "../../../types/NewModuleResponse";
import type { GetModuleResponse } from "../../../types/GetModuleResponse";

interface Module {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Beginner" | "Beginner to Intermediate" | "Intermediate" | "Intermediate to Advanced" | "Advanced" | "Beginner to Expert";
  status: "Not Saved" | "Draft" | "In Progress" | "Completed" | "Saved";
  targetAudience: string;
  estimatedCompletionTime: string;
  createdAt: string;
  isTemporary?: boolean;
  noOfTopics?: number;
  noOfSubTopics?: number;
  moduleImgUri?: string;
}

const ModulesSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(true);
  const [isLoadingFromBackend, setIsLoadingFromBackend] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadTempModulesFromStorage = async () => {
    try {
      setIsLoadingFromStorage(true);
      const tempModules = localStorageService.getAllTempModules();
      
      const tempDisplayModules = tempModules.map(tempModule => 
        localStorageService.tempModuleToDisplayModule(tempModule)
      );

      if (tempModules.length > 0) {
        console.log(`Loaded ${tempModules.length} temporary modules from local storage`);
      }
      
      return tempDisplayModules;
      
    } catch (error) {
      console.error('Error loading temporary modules:', error);
      return [];
    } finally {
      setIsLoadingFromStorage(false);
    }
  };

  const loadSavedModulesFromBackend = async () => {
    try {
      setIsLoadingFromBackend(true);
      setBackendError(null);
      
      const response: GetModuleResponse = await getModules();
      console.log('Response from getModules:', response);
      
      if (response.success && response.modules) {
        const savedDisplayModules: Module[] = response.modules.map(savedModule => ({
          id: savedModule.moduleId,
          title: savedModule.moduleName, // Changed from 'name' to 'moduleName'
          difficulty: savedModule.difficultyLevel as Module['difficulty'] || "Intermediate",
          status: "Saved" as const,
          targetAudience: savedModule.targetAudience,
          estimatedCompletionTime: `${savedModule.estimatedTime} hours`, // Convert number to string with units
          createdAt: savedModule.lastUpdateTime || new Date().toISOString(),
          isTemporary: false,
          noOfTopics: savedModule.noOfTopics,
          noOfSubTopics: savedModule.noOfSubTopics,
          moduleImgUri: undefined // Not present in your response
        }));

        console.log(`Loaded ${savedDisplayModules.length} saved modules from backend`);
        return savedDisplayModules;
      } else {
        throw new Error(response.message || 'Failed to fetch modules from backend');
      }
      
    } catch (error) {
      console.error('Error loading saved modules from backend:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load saved modules';
      setBackendError(errorMessage);
      return [];
    } finally {
      setIsLoadingFromBackend(false);
    }
  };

  const combineAllModules = async () => {
    const [tempModules, savedModules] = await Promise.all([
      loadTempModulesFromStorage(),
      loadSavedModulesFromBackend()
    ]);

    // Combine both arrays, with temporary modules first
    const allModules = [...tempModules, ...savedModules];
    setModules(allModules);
  };

  // KEEP only this useEffect for initial load
  useEffect(() => {
    combineAllModules();
  }, []);

  const filteredModules = modules.filter(
    (module) =>
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.targetAudience.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (moduleId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const module = modules.find(m => m.id === moduleId);
    const isTemporary = module?.isTemporary;
    
    const confirmMessage = isTemporary 
      ? "Are you sure you want to delete this temporary module? It will be permanently removed from local storage."
      : "Are you sure you want to delete this saved module? This will only remove it from the current view.";

    const confirmDelete = window.confirm(confirmMessage);
    if (confirmDelete) {
      // Remove from local storage if temporary
      if (isTemporary) {
        localStorageService.deleteTempModule(moduleId);
      } else {
        // For saved modules, we might want to call a delete API in the future
        console.log('Saved module delete requested:', moduleId);
        alert('Deleting saved modules is not yet implemented. This only removes it from the current view.');
      }
      
      // Remove from UI
      setModules((prevModules) =>
        prevModules.filter((module) => module.id !== moduleId)
      );
      
      console.log('Module deleted:', moduleId, isTemporary ? '(temporary)' : '(saved)');
    }
  };

  const handleEdit = (moduleId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    console.log("Edit module clicked:", moduleId);
    navigate(`/editor/${moduleId}`);
  };

  const handleModuleClick = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    
    console.log(`Navigating to module: ${moduleId}`, module);
    navigate(`/editor/${moduleId}`);
  };

  const handleCreateNew = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (moduleData: NewModuleResponse) => {
    try {
      console.log("Creating temporary module:", moduleData);

      // Save to local storage
      localStorageService.saveTempModule(moduleData);

      // Create the new temporary module object for display
      const newModule: Module = {
        id: moduleData.moduleId,
        title: moduleData.moduleName,
        difficulty: moduleData.difficultyLevel as Module["difficulty"],
        status: "Not Saved",
        targetAudience: moduleData.targetAudience,
        estimatedCompletionTime: moduleData.estimatedCompletionTime,
        createdAt: moduleData.createdAt.toISOString(),
        isTemporary: true
      };

      // Add to the modules list at the top
      setModules((prev) => [newModule, ...prev]);

      // Close the form
      setIsFormOpen(false);

      console.log("Temporary module added to grid and saved to local storage:", newModule);
      
      // Show success message
      setTimeout(() => {
        alert(`Module created successfully!\n\nTemporary ID: ${moduleData.moduleId}\nModule Name: ${moduleData.moduleName}\n\nThe module has been saved to your browser's local storage and will persist until you delete it or clear your browser data.`);
      }, 500);
      
    } catch (error) {
      console.error("Error creating module:", error);
      alert("Failed to create module. Please try again.");
    }
  };

  const handleClearAllTemp = () => {
    const tempModules = modules.filter(m => m.isTemporary);
    if (tempModules.length === 0) {
      alert("No temporary modules to clear.");
      return;
    }

    const confirmClear = window.confirm(
      `Are you sure you want to delete all ${tempModules.length} temporary modules? This action cannot be undone.`
    );
    
    if (confirmClear) {
      localStorageService.clearAllTempModules();
      setModules(prev => prev.filter(m => !m.isTemporary));
      console.log("All temporary modules cleared");
    }
  };

  const handleRefreshSaved = async () => {
    setIsLoadingFromBackend(true);
    const savedModules = await loadSavedModulesFromBackend();
    
    // Update modules list by removing old saved modules and adding new ones
    setModules(prev => {
      const tempModules = prev.filter(m => m.isTemporary);
      return [...tempModules, ...savedModules];
    });
  };

  const isLoading = isLoadingFromStorage || isLoadingFromBackend;
  const tempModules = modules.filter(m => m.isTemporary);
  const savedModules = modules.filter(m => !m.isTemporary);
  
  const filteredTempModules = tempModules.filter(
    (module) =>
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.targetAudience.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSavedModules = savedModules.filter(
    (module) =>
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.targetAudience.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
      case "Beginner":
        return "var(--color-success)";
      case "Medium":
      case "Beginner to Intermediate":
      case "Intermediate":
        return "var(--color-warning)";
      case "Hard":
      case "Intermediate to Advanced":
      case "Advanced":
      case "Beginner to Expert":
        return "var(--color-error)";
      default:
        return "var(--color-text-secondary)";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Not Saved":
        return "var(--color-warning)";
      case "Draft":
        return "var(--color-text-secondary)";
      case "In Progress":
        return "var(--color-primary)";
      case "Completed":
        return "var(--color-success)";
      case "Saved":
        return "var(--color-success)";
      default:
        return "var(--color-text-secondary)";
    }
  };

  const getDifficultyInitial = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
      case "Beginner":
        return "B";
      case "Medium":
      case "Beginner to Intermediate":
        return "BI";
      case "Intermediate":
        return "I";
      case "Intermediate to Advanced":
        return "IA";
      case "Hard":
      case "Advanced":
        return "A";
      case "Beginner to Expert":
        return "BE";
      default:
        return "?";
    }
  };

  if (isLoading) {
    return (
      <div className={styles.modulesSection}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <h3 className={styles.loadingTitle}>Loading Modules</h3>
          <div className={styles.loadingDetails}>
            {isLoadingFromStorage && <span>• Loading temporary modules...</span>}
            {isLoadingFromBackend && <span>• Loading saved modules...</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.modulesSection}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.mainTitle}>Module Management</h1>
            <p className={styles.subtitle}>Manage your temporary and saved learning modules</p>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.searchContainer}>
              <div className={styles.searchIcon}>🔍</div>
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button 
              className={styles.refreshButton} 
              onClick={handleRefreshSaved}
              disabled={isLoadingFromBackend}
              title="Refresh saved modules"
            >
              <span className={styles.refreshIcon}>↻</span>
              Refresh
            </button>
            <button className={styles.createButton} onClick={handleCreateNew}>
              <span className={styles.createIcon}>+</span>
              Create Module
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {backendError && (
          <div className={styles.errorBanner}>
            <div className={styles.errorContent}>
              <span className={styles.errorIcon}>⚠️</span>
              <span className={styles.errorMessage}>Error loading saved modules: {backendError}</span>
            </div>
            <button onClick={handleRefreshSaved} className={styles.retryButton}>
              Retry
            </button>
          </div>
        )}

        <div className={styles.sectionsContainer}>
          {/* Temporary Modules Section */}
          {(tempModules.length > 0 || searchTerm) && (
            <div className={styles.moduleSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.tempIcon}>📝</span>
                    Temporary Modules
                  </h2>
                  <div className={styles.sectionBadge}>
                    <span className={styles.tempBadge}>{tempModules.length}</span>
                  </div>
                </div>
                {tempModules.length > 0 && (
                  <button 
                    className={styles.clearAllButton} 
                    onClick={handleClearAllTemp}
                    title="Clear all temporary modules"
                  >
                    <span className={styles.clearIcon}>🗑️</span>
                    Clear All
                  </button>
                )}
              </div>
              
              <div className={styles.moduleGrid}>
                {filteredTempModules.length > 0 ? (
                  filteredTempModules.map((module) => (
                    <div 
                      key={module.id} 
                      className={`${styles.moduleCard} ${styles.tempModuleCard}`}
                      onClick={() => handleModuleClick(module.id)}
                    >
                      <div className={styles.moduleCardHeader}>
                        <div className={styles.moduleIcon}>
                          <span className={styles.tempModuleIcon}>📝</span>
                        </div>
                        <div className={styles.moduleStatus}>
                          <span className={styles.tempStatusBadge}>Not Saved</span>
                        </div>
                      </div>
                      
                      <div className={styles.moduleCardContent}>
                        <h3 className={styles.moduleCardTitle}>{module.title}</h3>
                        <p className={styles.moduleCardId}>{module.id}</p>
                        <div className={styles.moduleCardMeta}>
                          <span className={styles.audience}>{module.targetAudience}</span>
                          <span className={styles.difficulty}>
                            <span className={styles.difficultyDot} style={{backgroundColor: getDifficultyColor(module.difficulty)}}></span>
                            {module.difficulty}
                          </span>
                        </div>
                        <p className={styles.estimatedTime}>⏱️ {module.estimatedCompletionTime}</p>
                      </div>
                      
                      <div className={styles.moduleCardActions}>
                        <button
                          className={styles.actionButton}
                          onClick={(e) => handleEdit(module.id, e)}
                          title="Edit module"
                        >
                          ✏️
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={(e) => handleDelete(module.id, e)}
                          title="Delete module"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptySection}>
                    <div className={styles.emptyIcon}>📝</div>
                    <p className={styles.emptyMessage}>
                      {searchTerm ? "No temporary modules match your search" : "No temporary modules yet"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Saved Modules Section */}
          <div className={styles.moduleSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.savedIcon}>💾</span>
                  Saved Modules
                </h2>
                <div className={styles.sectionBadge}>
                  <span className={styles.savedBadge}>{savedModules.length}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.moduleGrid}>
              {filteredSavedModules.length > 0 ? (
                filteredSavedModules.map((module) => (
                  <div 
                    key={module.id} 
                    className={`${styles.moduleCard} ${styles.savedModuleCard}`}
                    onClick={() => handleModuleClick(module.id)}
                  >
                    <div className={styles.moduleCardHeader}>
                      <div className={styles.moduleIcon}>
                        <span className={styles.savedModuleIcon}>💾</span>
                      </div>
                      <div className={styles.moduleStatus}>
                        <span className={styles.savedStatusBadge}>Saved</span>
                      </div>
                    </div>
                    
                    <div className={styles.moduleCardContent}>
                      <h3 className={styles.moduleCardTitle}>{module.title}</h3>
                      <p className={styles.moduleCardId}>{module.id}</p>
                      <div className={styles.moduleCardMeta}>
                        <span className={styles.audience}>{module.targetAudience}</span>
                        <span className={styles.difficulty}>
                          <span className={styles.difficultyDot} style={{backgroundColor: getDifficultyColor(module.difficulty)}}></span>
                          {module.difficulty}
                        </span>
                      </div>
                      <div className={styles.moduleStats}>
                        <span className={styles.statsItem}>
                          📚 {module.noOfTopics || 0} topics
                        </span>
                        <span className={styles.statsItem}>
                          📄 {module.noOfSubTopics || 0} subtopics
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.moduleCardActions}>
                      <button
                        className={styles.actionButton}
                        onClick={(e) => handleEdit(module.id, e)}
                        title="Edit module"
                      >
                        ✏️
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={(e) => handleDelete(module.id, e)}
                        title="Delete module"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptySection}>
                  <div className={styles.emptyIcon}>💾</div>
                  <p className={styles.emptyMessage}>
                    {searchTerm ? "No saved modules match your search" : "No saved modules found"}
                  </p>
                  {!searchTerm && (
                    <p className={styles.emptySubMessage}>
                      Create and save modules to see them here
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Empty State for No Modules */}
          {tempModules.length === 0 && savedModules.length === 0 && !searchTerm && (
            <div className={styles.globalEmptyState}>
              <div className={styles.emptyStateIcon}>📚</div>
              <h3 className={styles.emptyStateTitle}>No Modules Found</h3>
              <p className={styles.emptyStateMessage}>
                Get started by creating your first learning module
              </p>
              <button className={styles.emptyStateButton} onClick={handleCreateNew}>
                <span className={styles.createIcon}>+</span>
                Create Your First Module
              </button>
            </div>
          )}
        </div>
      </div>

      <CreateModuleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </>
  );
};

export default ModulesSection;
