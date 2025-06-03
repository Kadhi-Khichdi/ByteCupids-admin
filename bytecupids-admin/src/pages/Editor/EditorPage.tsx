import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor } from "../../contexts/EditorContext";
import ModuleMetadata from "./components/ModuleMetadata";
import ModuleTopics from "./components/ModuleTopics";
import TopicSubtopics from "./components/TopicSubtopics";
import SubtopicContent from "./components/SubtopicContent";
import styles from "./Editor.module.css";

type EditorStage = 'metadata' | 'topics' | 'subtopics' | 'content';

// Base props that all stage components receive
interface BaseStageProps {
  onNextStage?: () => void;
}

// Extended props for specific components
interface TopicsStageProps extends BaseStageProps {
  onTopicSelect?: (topicId: string, topicName: string) => void;
}

interface SubtopicsStageProps extends BaseStageProps {
  selectedTopic?: {id: string, name: string} | null;
  onSubtopicSelect?: (subtopicId: string, subtopicName: string) => void;
}

interface ContentStageProps extends BaseStageProps {
  selectedTopic?: {id: string, name: string} | null;
  selectedSubtopic?: {id: string, name: string} | null;
}

interface EditorStageConfig {
  id: EditorStage;
  label: string;
  component: React.ComponentType<any>; // Changed to any to allow different prop types
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
  const [selectedTopic, setSelectedTopic] = useState<{id: string, name: string} | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<{id: string, name: string} | null>(null);
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

  const handleNextStage = () => {
    const currentIndex = editorStages.findIndex(stage => stage.id === activeStage);
    if (currentIndex < editorStages.length - 1) {
      const nextStage = editorStages[currentIndex + 1];
      setActiveStage(nextStage.id);
    }
  };

  const handleTopicSelect = (topicId: string, topicName: string) => {
    setSelectedTopic({ id: topicId, name: topicName });
    console.log(`Selected topic: ${topicName} (ID: ${topicId})`);
  };

  const handleSubtopicSelect = (subtopicId: string, subtopicName: string) => {
    setSelectedSubtopic({ id: subtopicId, name: subtopicName });
    console.log(`Selected subtopic: ${subtopicName} (ID: ${subtopicId})`);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setActiveStage('topics');
  };

  const handleBackToSubtopics = () => {
    setSelectedSubtopic(null);
    setActiveStage('subtopics');
  };

  const renderActiveComponent = () => {
    const activeStageConfig = editorStages.find(stage => stage.id === activeStage);
    if (!activeStageConfig) return null;
    
    const Component = activeStageConfig.component;
    
    // Pass specific props based on the active stage
    switch (activeStage) {
      case 'metadata':
        return (
          <Component 
            onNextStage={handleNextStage}
          />
        );
        
      case 'topics':
        return (
          <Component 
            onNextStage={handleNextStage}
            onTopicSelect={handleTopicSelect}
          />
        );
        
      case 'subtopics':
        return (
          <Component 
            onNextStage={handleNextStage}
            selectedTopic={selectedTopic}
            onSubtopicSelect={handleSubtopicSelect}
            onBackToTopics={handleBackToTopics}
          />
        );
        
      case 'content':
        return (
          <Component 
            onNextStage={handleNextStage}
            selectedTopic={selectedTopic}
            selectedSubtopic={selectedSubtopic}
            onBackToSubtopics={handleBackToSubtopics}
          />
        );
        
      default:
        return <Component onNextStage={handleNextStage} />;
    }
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
      
      {/* Debug Info - Remove in production */}
      {selectedTopic && (
        <div className={styles.debugInfo}>
          <small>Selected Topic: {selectedTopic.name} (ID: {selectedTopic.id})</small>
          {selectedSubtopic && (
            <small>Selected Subtopic: {selectedSubtopic.name} (ID: {selectedSubtopic.id})</small>
          )}
        </div>
      )}
    </div>
  );
};

export default EditorPage;