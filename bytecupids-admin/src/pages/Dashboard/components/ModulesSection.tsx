import React, { useState } from "react";
import styles from "./ModulesSection.module.css";
import CreateModuleForm from "./CreateModuleForm";

interface Module {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const ModulesSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);

  const filteredModules = modules.filter(
    (module) =>
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (moduleId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this module?"
    );
    if (confirmDelete) {
      setModules((prevModules) =>
        prevModules.filter((module) => module.id !== moduleId)
      );
      console.log("Module deleted:", moduleId);
      // TODO: Connect with backend API
    }
  };

  const handleEdit = (moduleId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    console.log("Edit module:", moduleId);
    // TODO: Connect with backend
  };

  const handleCreateNew = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (moduleData: any) => {
    try {
      console.log("Creating module:", moduleData);

      // Create the new module object matching the Module interface
      const newModule: Module = {
        id: moduleData.moduleId,
        title: moduleData.moduleName,
        difficulty: moduleData.difficultyLevel,
      };

      // Add to the modules list
      setModules((prev) => [newModule, ...prev]);

      // Close the form
      setIsFormOpen(false);

      console.log("Module added successfully:", newModule);
    } catch (error) {
      console.error("Error creating module:", error);
      alert("Failed to create module. Please try again.");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "var(--color-success)";
      case "Medium":
        return "var(--color-warning)";
      case "Hard":
        return "var(--color-error)";
      default:
        return "var(--color-text-secondary)";
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
              <div key={module.id} className={styles.moduleItem}>
                <div className={styles.moduleContent}>
                  <div className={styles.moduleInfo}>
                    <div
                      className={styles.difficultyBadge}
                      style={{
                        backgroundColor: getDifficultyColor(module.difficulty),
                      }}
                    >
                      {module.difficulty.charAt(0)}
                    </div>
                    <div className={styles.moduleDetails}>
                      <h3 className={styles.moduleTitle} title={module.title}>
                        {module.title}
                      </h3>
                      <p className={styles.moduleId}>{module.id}</p>
                    </div>
                  </div>
                  <div className={styles.moduleActions}>
                    <button
                      className={styles.editButton}
                      onClick={(e) => handleEdit(module.id, e)}
                      title="Edit module"
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
            <p>No modules found matching your search.</p>
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
};

export default ModulesSection;
