import React, { useEffect, useState } from 'react';
import { useEditor } from '../../../contexts/EditorContext';
import { useTopics } from '../../../hooks/useTopics';
import type { Topic } from '../../../types/TopicsResponse';
import styles from './ModuleTopics.module.css';

interface ModuleTopicsProps {
  onNextStage?: () => void;
  onTopicSelect?: (topicId: string, topicName: string) => void;
}

type ViewMode = 'edit' | 'view';

const ModuleTopics: React.FC<ModuleTopicsProps> = ({ onNextStage, onTopicSelect }) => {
  const { moduleData } = useEditor();
  const {
    topics,
    originalTopics,
    isLoading,
    isGenerating,
    isSaving,
    error,
    hasUnsavedChanges,
    loadTopics,
    generateTopics,
    saveTopics,
    updateTopicName,
    addTopic,
    removeTopic,
    resetTopics,
    clearError
  } = useTopics();

  const [hasLoadedTopics, setHasLoadedTopics] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('view');

  useEffect(() => {
    if (moduleData && !moduleData.isTemporary && !hasLoadedTopics) {
      // Only load topics for saved modules
      loadTopics(moduleData.moduleId);
      setHasLoadedTopics(true);
    }
  }, [moduleData, loadTopics, hasLoadedTopics]);

  // Switch to edit mode when topics are generated
  useEffect(() => {
    if (topics.length > 0 && originalTopics.length === 0) {
      setViewMode('edit');
    }
  }, [topics.length, originalTopics.length]);

  const handleModeToggle = () => {
    if (viewMode === 'edit' && hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Switching to view mode will discard these changes. Continue?'
      );
      if (!confirmSwitch) {
        return;
      }
      resetTopics();
    }
    setViewMode(viewMode === 'edit' ? 'view' : 'edit');
  };

  const handleGenerateTopics = async () => {
    if (!moduleData) return;
    
    try {
      await generateTopics(moduleData.moduleId);
      setViewMode('edit'); // Switch to edit mode after generation
    } catch (error) {
      console.error('Failed to generate topics:', error);
    }
  };

  const handleSave = async () => {
    if (!moduleData || topics.length === 0) return;

    // Filter out empty topics and get topic names
    const validTopicNames = topics
      .map(topic => topic.topicName.trim())
      .filter(name => name !== '');
    
    if (validTopicNames.length === 0) {
      alert('Please add at least one valid topic before saving.');
      return;
    }

    // Show confirmation dialog
    const confirmSave = window.confirm(
      `Are you sure you want to save these ${validTopicNames.length} topics?`
    );

    if (!confirmSave) {
      return;
    }

    try {
      await saveTopics(moduleData.moduleId, validTopicNames);
      alert('Topics saved successfully!');
      setViewMode('view'); // Switch to view mode after saving
    } catch (error) {
      alert('Failed to save topics. Please try again.');
    }
  };

  const handleReset = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset all changes? This will restore the topics to their last saved state.'
    );
    
    if (confirmReset) {
      resetTopics();
    }
  };

  const handleTopicClick = (topic: Topic) => {
    if (viewMode === 'view' && topic.topicName.trim()) {
      // Pass the actual topicId (UUID) from the backend
      if (onTopicSelect) {
        onTopicSelect(topic.topicId, topic.topicName);
      }
      
      if (onNextStage) {
        onNextStage();
      }
    }
  };

  const handleTopicChange = (index: number, value: string) => {
    if (viewMode === 'edit') {
      updateTopicName(index, value);
    }
  };

  const handleAddTopic = () => {
    if (viewMode === 'edit' && moduleData) {
      addTopic(moduleData.moduleId);
    }
  };

  const handleRemoveTopic = (index: number) => {
    if (viewMode === 'edit' && topics.length > 1) {
      removeTopic(index);
    }
  };

  // Don't render if module is temporary (should be saved first)
  if (!moduleData) {
    return (
      <div className={styles.topicsContainer}>
        <div className={styles.centerContent}>
          <h2>No Module Data</h2>
          <p>Module data is not available.</p>
        </div>
      </div>
    );
  }

  if (moduleData.isTemporary) {
    return (
      <div className={styles.topicsContainer}>
        <div className={styles.centerContent}>
          <div className={styles.warningIcon}>🔒</div>
          <h2>Module Must Be Saved First</h2>
          <p>Please save the module metadata in the previous stage before proceeding to manage topics.</p>
          <p className={styles.instructions}>
            Go back to the "Module Metadata" stage and click "Save & Next" to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.topicsContainer}>
      {/* Floating Action Buttons */}
      <div className={styles.floatingActions}>
        {/* Mode Toggle Button */}
        {topics.length > 0 && (
          <button 
            onClick={handleModeToggle}
            className={`${styles.modeButton} ${viewMode === 'edit' ? styles.editMode : styles.viewMode}`}
            title={viewMode === 'edit' ? 'Switch to View Mode' : 'Switch to Edit Mode'}
          >
            {viewMode === 'edit' ? '👁️ View' : '✏️ Edit'}
          </button>
        )}
        
        {/* Edit Mode Buttons */}
        {viewMode === 'edit' && topics.length > 0 && (
          <>
            <button 
              onClick={handleReset}
              className={styles.resetButton}
              disabled={!hasUnsavedChanges || isSaving}
              title="Reset changes"
            >
              🔄 Reset
            </button>
            <button 
              onClick={handleSave}
              className={styles.saveButton}
              disabled={isSaving || topics.filter(t => t.topicName.trim()).length === 0}
              title="Save topics"
            >
              {isSaving ? '💾 Saving...' : '💾 Save'}
            </button>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className={styles.contentContainer}>
        {/* Error Display */}
        {error && (
          <div className={styles.errorBanner}>
            <div className={styles.errorContent}>
              <span className={styles.errorIcon}>⚠️</span>
              <span className={styles.errorText}>{error}</span>
              <button onClick={clearError} className={styles.closeError}>✕</button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className={styles.centerContent}>
            <div className={styles.loadingSpinner}></div>
            <h2>Loading Topics...</h2>
            <p>Fetching topics for this module</p>
          </div>
        ) : topics.length === 0 && originalTopics.length === 0 ? (
          // No topics - show generate button
          <div className={styles.centerContent}>
            <div className={styles.emptyStateIcon}>📝</div>
            <h2>No Topics Found</h2>
            <p>This module doesn't have any topics yet.</p>
            <button 
              onClick={handleGenerateTopics}
              className={styles.generateButton}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className={styles.spinner}></span>
                  Generating Topics...
                </>
              ) : (
                <>
                  ✨ Generate Topics
                </>
              )}
            </button>
          </div>
        ) : (
          // Topics list
          <div className={styles.topicsListContainer}>
            <div className={styles.header}>
              <h2 className={styles.title}>Module Topics</h2>
              <div className={styles.headerInfo}>
                <p className={styles.subtitle}>
                  {viewMode === 'edit' 
                    ? 'Edit mode: Modify topic names, add or remove topics as needed.'
                    : 'View mode: Click on any topic to view its subtopics and content.'
                  }
                </p>
                <div className={styles.statusBadges}>
                  <span className={`${styles.modeBadge} ${styles[viewMode]}`}>
                    {viewMode === 'edit' ? '✏️ EDIT MODE' : '👁️ VIEW MODE'}
                  </span>
                  {hasUnsavedChanges && viewMode === 'edit' && (
                    <span className={styles.unsavedBadge}>UNSAVED CHANGES</span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.topicsList}>
              {topics.map((topic, index) => (
                <div 
                  key={topic.topicId} 
                  className={`${styles.topicItem} ${viewMode === 'view' ? styles.clickable : ''}`}
                  onClick={() => handleTopicClick(topic)}
                >
                  <div className={styles.topicNumber}>{index + 1}</div>
                  
                  {viewMode === 'edit' ? (
                    <input
                      type="text"
                      value={topic.topicName}
                      onChange={(e) => handleTopicChange(index, e.target.value)}
                      className={styles.topicInput}
                      placeholder={`Enter topic ${index + 1} name`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className={styles.topicName}>
                      {topic.topicName || `Topic ${index + 1}`}
                    </div>
                  )}
                  
                  {viewMode === 'edit' && topics.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTopic(index);
                      }}
                      className={styles.removeButton}
                      title="Remove topic"
                    >
                      🗑️
                    </button>
                  )}
                  
                  {viewMode === 'view' && (
                    <div className={styles.clickHint}>
                      Click to view subtopics →
                    </div>
                  )}
                  
                  {/* Debug info for the topic ID */}
                  {viewMode === 'view' && (
                    <div className={styles.topicId}>
                      ID: {topic.topicId}
                    </div>
                  )}
                </div>
              ))}
              
              {viewMode === 'edit' && (
                <button 
                  onClick={handleAddTopic}
                  className={styles.addTopicButton}
                >
                  ➕ Add More Topic
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleTopics;