import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor } from "../../contexts/EditorContext";
import ModuleMetadata from "./components/ModuleMetadata";
import ModuleTopics from "./components/ModuleTopics";
import TopicSubtopics from "./components/TopicSubtopics";
import SubtopicContent from "./components/SubtopicContent";
import styles from "./Editor.module.css";

type EditorStage = 'metadata' | 'topics' | 'subtopics' | 'content';

interface EditorStageConfig {
  id: EditorStage;
  label: string;
  component: React.ComponentType;
}

const editorStages: EditorStageConfig[] = [
  { id: 'metadata', label: 'Module Metadata', component: ModuleMetadata },
  { id: 'topics', label: "Module's Topics", component: ModuleTopics },
  { id: 'subtopics', label: "Topic's Subtopics", component: TopicSubtopics },
  { id: 'content', label: "Subtopic's Content", component: SubtopicContent }
];

const EditorPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { 
    moduleData, 
    isLoading, 
    error, 
    loadModule, 
    clearModule,
    hasUnsavedChanges 
  } = useEditor();
  
  const [activeStage, setActiveStage] = useState<EditorStage>('metadata');
  const loadedModuleId = useRef<string | null>(null);

  useEffect(() => {
    if (moduleId && moduleId !== loadedModuleId.current) {
      console.log(`Loading module ${moduleId}`);
      loadedModuleId.current = moduleId;
      loadModule(moduleId);
    } else if (!moduleId) {
      console.error("No module ID provided");
    }
  }, [moduleId, loadModule]);

  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      clearModule();
      loadedModuleId.current = null;
    };
  }, [clearModule]);

  const handleBackToDashboard = () => {
    // Warn user about unsaved changes
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmLeave) {
        return;
      }
    }
    
    clearModule();
    loadedModuleId.current = null;
    navigate('/dashboard');
  };

  const handleStageChange = (stageId: EditorStage) => {
    setActiveStage(stageId);
  };

  const renderActiveComponent = () => {
    const activeStageConfig = editorStages.find(stage => stage.id === activeStage);
    if (!activeStageConfig) return null;
    
    const Component = activeStageConfig.component;
    return <Component />;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.editorContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <h2>Loading Module...</h2>
          <p>Fetching module data from storage</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.editorContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Error Loading Module</h2>
          <p>{error}</p>
          <button 
            onClick={handleBackToDashboard}
            className={styles.backButton}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // No module data state
  if (!moduleData) {
    return (
      <div className={styles.editorContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>📄</div>
          <h2>Module Not Found</h2>
          <p>The requested module could not be found.</p>
          <button 
            onClick={handleBackToDashboard}
            className={styles.backButton}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editorContainer}>
      {/* Back Button */}
      <div className={styles.backSection}>
        <button 
          onClick={handleBackToDashboard}
          className={styles.backButton}
        >
          ← Dashboard
        </button>
        <div className={styles.moduleInfo}>
          <span className={styles.moduleId}>
            Module ID: {moduleData.moduleId}
          </span>
          <span className={styles.moduleName}>
            {moduleData.moduleName}
          </span>
          {moduleData.isTemporary && (
            <span className={styles.tempBadge}>TEMPORARY</span>
          )}
          {hasUnsavedChanges && (
            <span className={styles.unsavedBadge}>UNSAVED CHANGES</span>
          )}
        </div>
      </div>

      {/* Staged Navigation Bar */}
      <div className={styles.stageNavigation}>
        <div className={styles.stageBar}>
          {editorStages.map((stage, index) => (
            <button
              key={stage.id}
              onClick={() => handleStageChange(stage.id)}
              className={`${styles.stageTab} ${activeStage === stage.id ? styles.activeStageTab : ''}`}
            >
              <span className={styles.stageNumber}>{index + 1}</span>
              <span className={styles.stageLabel}>{stage.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Stage Content */}
      <div className={styles.stageContent}>
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default EditorPage;