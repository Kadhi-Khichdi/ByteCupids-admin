import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ModulesSection.module.css";
import CreateModuleForm from "./CreateModuleForm";
import type { NewModuleResponse } from "../../../types/NewModuleResponse";

interface Module {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Beginner" | "Beginner to Intermediate" | "Intermediate" | "Intermediate to Advanced" | "Advanced" | "Beginner to Expert";
  status: "Not Saved" | "Draft" | "In Progress" | "Completed";
  targetAudience: string;
  estimatedCompletionTime: string;
  createdAt: string;
  isTemporary?: boolean; // Flag to identify temporary modules
}

const ModulesSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const navigate = useNavigate();

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
      ? "Are you sure you want to delete this temporary module? It hasn't been saved yet."
      : "Are you sure you want to delete this module?";

    const confirmDelete = window.confirm(confirmMessage);
    if (confirmDelete) {
      setModules((prevModules) =>
        prevModules.filter((module) => module.id !== moduleId)
      );
      console.log('Module deleted:', moduleId, isTemporary ? '(temporary)' : '(saved)');
    }
  };

  const handleEdit = (moduleId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    const module = modules.find(m => m.id === moduleId);
    if (module?.isTemporary) {
      alert(`This is a temporary module with ID: ${moduleId}\nIt needs to be saved before editing.`);
      return;
    }
    
    console.log("Edit module:", moduleId);
    navigate(`/editor/${moduleId}`);
  };

  const handleModuleClick = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    
    if (module?.isTemporary) {
      alert(`Temporary Module Clicked!\n\nModule ID: ${moduleId}\nModule Name: ${module.title}\nStatus: ${module.status}\n\nThis module needs to be saved before it can be edited.`);
      return;
    }
    
    navigate(`/editor/${moduleId}`);
  };

  const handleCreateNew = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (moduleData: NewModuleResponse) => {
    try {
      console.log("Creating temporary module:", moduleData);

      // Create the new temporary module object
      const newModule: Module = {
        id: moduleData.moduleId, // This will be the temp ID like "MOD1748307123456"
        title: moduleData.moduleName,
        difficulty: moduleData.difficultyLevel as Module["difficulty"],
        status: "Not Saved", // Mark as Not Saved for temporary modules
        targetAudience: moduleData.targetAudience,
        estimatedCompletionTime: moduleData.estimatedCompletionTime,
        createdAt: moduleData.createdAt.toISOString(),
        isTemporary: true // Mark as temporary
      };

      // Add to the modules list at the top
      setModules((prev) => [newModule, ...prev]);

      // Close the form
      setIsFormOpen(false);

      console.log("Temporary module added to grid:", newModule);
      
      // Show success message with temp ID
      setTimeout(() => {
        alert(`Module created successfully!\n\nTemporary ID: ${moduleData.moduleId}\nModule Name: ${moduleData.moduleName}\n\nClick on the module tile to see more details. The module will need to be saved to get a permanent ID.`);
      }, 500);
      
    } catch (error) {
      console.error("Error creating module:", error);
      alert("Failed to create module. Please try again.");
    }
  };

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
        return "var(--color-warning)"; // Orange/yellow for unsaved
      case "Draft":
        return "var(--color-text-secondary)";
      case "In Progress":
        return "var(--color-primary)"; // Blue for in progress
      case "Completed":
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

  return (
    <>
      <div className={styles.modulesSection}>
        <div className={styles.header}>
          <h1 className={styles.title}>Modules</h1>
          <div className={styles.headerActions}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button className={styles.createButton} onClick={handleCreateNew}>
              + Create Module
            </button>
          </div>
        </div>

        <div className={styles.modulesContainer}>
          <div className={styles.modulesList}>
            {filteredModules.map((module) => (
              <div 
                key={module.id} 
                className={`${styles.moduleItem} ${module.isTemporary ? styles.temporaryModule : ''}`}
                onClick={() => handleModuleClick(module.id)}
              >
                <div className={styles.moduleContent}>
                  <div className={styles.moduleInfo}>
                    <div
                      className={styles.difficultyBadge}
                      style={{
                        backgroundColor: getDifficultyColor(module.difficulty),
                      }}
                      title={module.difficulty}
                    >
                      {getDifficultyInitial(module.difficulty)}
                    </div>
                    <div className={styles.moduleDetails}>
                      <h3 className={styles.moduleTitle} title={module.title}>
                        {module.title}
                        {module.isTemporary && <span className={styles.tempIndicator}> (TEMP)</span>}
                      </h3>
                      <p className={styles.moduleId}>{module.id}</p>
                      <div className={styles.moduleMetadata}>
                        <span className={styles.targetAudience}>
                          {module.targetAudience}
                        </span>
                        <span 
                          className={styles.status}
                          style={{ color: getStatusColor(module.status) }}
                        >
                          {module.status}
                        </span>
                      </div>
                      <span className={styles.estimatedTime}>
                        {module.estimatedCompletionTime}
                      </span>
                    </div>
                  </div>
                  <div className={styles.moduleActions}>
                    <button
                      className={styles.editButton}
                      onClick={(e) => handleEdit(module.id, e)}
                      title={module.isTemporary ? "Save module first" : "Edit module"}
                      disabled={module.isTemporary}
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => handleDelete(module.id, e)}
                      title="Delete module"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredModules.length === 0 && (
          <div className={styles.emptyState}>
            <p>
              {searchTerm 
                ? "No modules found matching your search." 
                : "No modules created yet. Click 'Create Module' to get started."
              }
            </p>
          </div>
        )}
      </div>

      <CreateModuleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        />
    </>
  );
}
export default ModulesSection;
