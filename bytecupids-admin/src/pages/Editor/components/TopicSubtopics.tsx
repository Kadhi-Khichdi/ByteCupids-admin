import React, { useEffect, useState } from 'react';
import { useEditor } from '../../../contexts/EditorContext';
import { useSubtopics } from '../../../hooks/useSubtopics';
import type { SubTopic } from '../../../types/SubtopicsResponse';
import styles from './TopicSubtopics.module.css';

interface TopicSubtopicsProps {
  selectedTopic?: {id: string, name: string} | null;
  onNextStage?: () => void;
  onSubtopicSelect?: (subtopicId: string, subtopicName: string) => void;
  onBackToTopics?: () => void;
}

type ViewMode = 'edit' | 'view';

const TopicSubtopics: React.FC<TopicSubtopicsProps> = ({ 
  selectedTopic, 
  onNextStage, 
  onSubtopicSelect,
  onBackToTopics 
}) => {
  const { moduleData } = useEditor();
  const {
    subtopics,
    originalSubtopics,
    isLoading,
    isGenerating,
    isSaving,
    error,
    hasUnsavedChanges,
    loadSubtopics,
    generateSubtopics,
    saveSubtopics,
    updateSubtopicName,
    addSubtopic,
    removeSubtopic,
    reorderSubtopics,
    resetSubtopics,
    clearError
  } = useSubtopics();

  const [hasLoadedSubtopics, setHasLoadedSubtopics] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('view');

  useEffect(() => {
    if (moduleData && !moduleData.isTemporary && selectedTopic && !hasLoadedSubtopics) {
      // Load subtopics for the selected topic using both moduleId and topicId
      loadSubtopics(moduleData.moduleId, selectedTopic.id);
      setHasLoadedSubtopics(true);
    }
  }, [moduleData, selectedTopic, loadSubtopics, hasLoadedSubtopics]);

  // Reset hasLoadedSubtopics when selectedTopic changes
  useEffect(() => {
    setHasLoadedSubtopics(false);
  }, [selectedTopic?.id]);

  // Switch to edit mode when subtopics are generated
  useEffect(() => {
    if (subtopics.length > 0 && originalSubtopics.length === 0) {
      setViewMode('edit');
    }
  }, [subtopics.length, originalSubtopics.length]);

  const handleModeToggle = () => {
    if (viewMode === 'edit' && hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Switching to view mode will discard these changes. Continue?'
      );
      if (!confirmSwitch) {
        return;
      }
      resetSubtopics();
    }
    setViewMode(viewMode === 'edit' ? 'view' : 'edit');
  };

  const handleGenerateSubtopics = async () => {
    if (!moduleData || !selectedTopic) return;
    
    try {
      await generateSubtopics(moduleData.moduleId, selectedTopic.id);
      setViewMode('edit'); // Switch to edit mode after generation
    } catch (error) {
      console.error('Failed to generate subtopics:', error);
    }
  };

  const handleSave = async () => {
    if (!moduleData || !selectedTopic || subtopics.length === 0) return;

    // Filter out empty subtopics and get subtopic names
    const validSubtopicNames = subtopics
      .map(subtopic => subtopic.subTopicName.trim())
      .filter(name => name !== '');
    
    if (validSubtopicNames.length === 0) {
      alert('Please add at least one valid subtopic before saving.');
      return;
    }

    // Show confirmation dialog
    const confirmSave = window.confirm(
      `Are you sure you want to save these ${validSubtopicNames.length} subtopics?`
    );

    if (!confirmSave) {
      return;
    }

    try {
      await saveSubtopics(moduleData.moduleId, selectedTopic.id, validSubtopicNames);
      alert('Subtopics saved successfully!');
      setViewMode('view'); // Switch to view mode after saving
    } catch (error) {
      alert('Failed to save subtopics. Please try again.');
    }
  };

  const handleReset = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset all changes? This will restore the subtopics to their last saved state.'
    );
    
    if (confirmReset) {
      resetSubtopics();
    }
  };

  const handleSubtopicClick = (subtopic: SubTopic) => {
    if (viewMode === 'view' && subtopic.subTopicName.trim()) {
      // Pass the actual subtopicId (UUID) from the backend
      if (onSubtopicSelect) {
        onSubtopicSelect(subtopic.subTopicId, subtopic.subTopicName);
      }
      
      if (onNextStage) {
        onNextStage();
      }
    }
  };

  const handleSubtopicChange = (index: number, value: string) => {
    if (viewMode === 'edit') {
      updateSubtopicName(index, value);
    }
  };

  const handleAddSubtopic = () => {
    if (viewMode === 'edit' && moduleData && selectedTopic) {
      addSubtopic(moduleData.moduleId, selectedTopic.id);
    }
  };

  const handleRemoveSubtopic = (index: number) => {
    if (viewMode === 'edit' && subtopics.length > 1) {
      removeSubtopic(index);
    }
  };

  const handleBackToTopics = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to go back to topics?'
      );
      if (!confirmLeave) {
        return;
      }
    }
    
    if (onBackToTopics) {
      onBackToTopics();
    }
  };

  // Don't render if module is temporary (should be saved first)
  if (!moduleData) {
    return (
      <div className={styles.subtopicsContainer}>
        <div className={styles.centerContent}>
          <h2>No Module Data</h2>
          <p>Module data is not available.</p>
        </div>
      </div>
    );
  }

  if (moduleData.isTemporary) {
    return (
      <div className={styles.subtopicsContainer}>
        <div className={styles.centerContent}>
          <div className={styles.warningIcon}>🔒</div>
          <h2>Module Must Be Saved First</h2>
          <p>Please save the module metadata in the previous stage before proceeding to manage subtopics.</p>
          <p className={styles.instructions}>
            Go back to the "Module Metadata" stage and click "Save & Next" to continue.
          </p>
        </div>
      </div>
    );
  }

  if (!selectedTopic) {
    return (
      <div className={styles.subtopicsContainer}>
        <div className={styles.centerContent}>
          <div className={styles.warningIcon}>📝</div>
          <h2>No Topic Selected</h2>
          <p>Please select a topic first to manage its subtopics.</p>
          <button 
            onClick={handleBackToTopics}
            className={styles.backButton}
          >
            ← Back to Topics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.subtopicsContainer}>
      {/* Back to Topics Button */}
      <div className={styles.backSection}>
        <button 
          onClick={handleBackToTopics}
          className={styles.backButton}
        >
          ← Back to Topics
        </button>
        <div className={styles.topicInfo}>
          <span className={styles.topicLabel}>Selected Topic:</span>
          <span className={styles.topicName}>{selectedTopic.name}</span>
          <span className={styles.topicId}>ID: {selectedTopic.id}</span>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className={styles.floatingActions}>
        {/* Mode Toggle Button */}
        {subtopics.length > 0 && (
          <button 
            onClick={handleModeToggle}
            className={`${styles.modeButton} ${viewMode === 'edit' ? styles.editMode : styles.viewMode}`}
            title={viewMode === 'edit' ? 'Switch to View Mode' : 'Switch to Edit Mode'}
          >
            {viewMode === 'edit' ? '👁️ View' : '✏️ Edit'}
          </button>
        )}
        
        {/* Edit Mode Buttons */}
        {viewMode === 'edit' && subtopics.length > 0 && (
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
              disabled={isSaving || subtopics.filter(s => s.subTopicName.trim()).length === 0}
              title="Save subtopics"
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
            <h2>Loading Subtopics...</h2>
            <p>Fetching subtopics for "{selectedTopic.name}"</p>
          </div>
        ) : subtopics.length === 0 && originalSubtopics.length === 0 ? (
          // No subtopics - show generate button
          <div className={styles.centerContent}>
            <div className={styles.emptyStateIcon}>📋</div>
            <h2>No Subtopics Found</h2>
            <p>This topic doesn't have any subtopics yet.</p>
            <p className={styles.topicContext}>
              Topic: <strong>{selectedTopic.name}</strong>
            </p>
            <button 
              onClick={handleGenerateSubtopics}
              className={styles.generateButton}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className={styles.spinner}></span>
                  Generating Subtopics...
                </>
              ) : (
                <>
                  ✨ Generate Subtopics
                </>
              )}
            </button>
          </div>
        ) : (
          // Subtopics list
          <div className={styles.subtopicsListContainer}>
            <div className={styles.header}>
              <h2 className={styles.title}>Topic Subtopics</h2>
              <div className={styles.headerInfo}>
                <p className={styles.subtitle}>
                  {viewMode === 'edit' 
                    ? 'Edit mode: Modify subtopic names, reorder, add or remove subtopics as needed.'
                    : 'View mode: Click on any subtopic to view its content and learning materials.'
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

            <div className={styles.subtopicsList}>
              {subtopics.map((subtopic, index) => (
                <div 
                  key={subtopic.subTopicId} 
                  className={`${styles.subtopicItem} ${viewMode === 'view' ? styles.clickable : ''}`}
                  onClick={() => handleSubtopicClick(subtopic)}
                >
                  <div className={styles.subtopicNumber}>{subtopic.sequenceNumber}</div>
                  
                  {viewMode === 'edit' ? (
                    <input
                      type="text"
                      value={subtopic.subTopicName}
                      onChange={(e) => handleSubtopicChange(index, e.target.value)}
                      className={styles.subtopicInput}
                      placeholder={`Enter subtopic ${subtopic.sequenceNumber} name`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className={styles.subtopicName}>
                      {subtopic.subTopicName || `Subtopic ${subtopic.sequenceNumber}`}
                    </div>
                  )}
                  
                  {viewMode === 'edit' && subtopics.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSubtopic(index);
                      }}
                      className={styles.removeButton}
                      title="Remove subtopic"
                    >
                      🗑️
                    </button>
                  )}
                  
                  {viewMode === 'view' && (
                    <div className={styles.clickHint}>
                      Click to view content →
                    </div>
                  )}
                  
                  {/* Debug info for the subtopic ID */}
                  {viewMode === 'view' && (
                    <div className={styles.subtopicId}>
                      ID: {subtopic.subTopicId}
                    </div>
                  )}
                </div>
              ))}
              
              {viewMode === 'edit' && (
                <button 
                  onClick={handleAddSubtopic}
                  className={styles.addSubtopicButton}
                >
                  ➕ Add More Subtopic
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicSubtopics;