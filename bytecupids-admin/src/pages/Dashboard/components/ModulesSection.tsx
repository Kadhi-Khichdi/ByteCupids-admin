import React, { useState } from "react";
import styles from "./ModulesSection.module.css";

interface Module {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const ModulesSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [modules, setModules] = useState<Module[]>([
    { id: "MOD001", title: "Introduction to React", difficulty: "Easy" },
    { id: "MOD002", title: "Advanced TypeScript", difficulty: "Hard" },
    { id: "MOD003", title: "CSS Animations", difficulty: "Medium" },
    { id: "MOD004", title: "Node.js Fundamentals", difficulty: "Easy" },
    { id: "MOD005", title: "Database Design", difficulty: "Hard" },
    { id: "MOD006", title: "API Development", difficulty: "Medium" },
    { id: "MOD007", title: "Testing Strategies", difficulty: "Medium" },
    { id: "MOD008", title: "DevOps Basics", difficulty: "Hard" },
    { id: "MOD009", title: "React Native", difficulty: "Medium" },
    { id: "MOD010", title: "GraphQL Fundamentals", difficulty: "Hard" },
    { id: "MOD011", title: "MongoDB Basics", difficulty: "Easy" },
    { id: "MOD012", title: "Docker Containers", difficulty: "Medium" },
    {
      id: "MOD013",
      title: "Advanced Machine Learning with TensorFlow and PyTorch",
      difficulty: "Hard",
    },
    {
      id: "MOD014",
      title: "Microservices Architecture Design Patterns",
      difficulty: "Hard",
    },
  ]);

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
    console.log("Create new module");
    // TODO: Connect with backend
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
            <div key={module.id} className={styles.moduleItem} onClick={(e) => handleEdit(module.id,e)}>
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
  );
};

export default ModulesSection;
