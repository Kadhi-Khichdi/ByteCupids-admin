import React, { useState, useEffect } from 'react';
import { useEditor } from '../../../contexts/EditorContext';
import styles from './ModuleMetadata.module.css';

interface FormData {
  moduleName: string;
  targetAudience: string;
  difficultyLevel: string;
  estimatedCompletionTime: string;
  prerequisites: string;
  agentNotes: string;
  interpretation: string;
  keywords: string;
  otherMetadata: string;
}

interface ModuleMetadataProps {
  onNextStage?: () => void;
}

const ModuleMetadata: React.FC<ModuleMetadataProps> = ({ onNextStage }) => {
  const { 
    moduleData, 
    originalData,
    updateModuleData, 
    resetToOriginal,
    hasUnsavedChanges,
    isSaving,
    saveModule
  } = useEditor();

  const [formData, setFormData] = useState<FormData>({
    moduleName: '',
    targetAudience: '',
    difficultyLevel: '',
    estimatedCompletionTime: '',
    prerequisites: '',
    agentNotes: '',
    interpretation: '',
    keywords: '',
    otherMetadata: ''
  });

  const [isFormValid, setIsFormValid] = useState(false);

  // Populate form data when module data changes
  useEffect(() => {
    if (moduleData) {
      const newFormData: FormData = {
        moduleName: moduleData.moduleName || '',
        targetAudience: moduleData.targetAudience || '',
        difficultyLevel: moduleData.difficultyLevel || '',
        estimatedCompletionTime: moduleData.estimatedCompletionTime || '',
        prerequisites: Array.isArray(moduleData.prerequisites) 
          ? moduleData.prerequisites.join(', ') 
          : moduleData.prerequisites || '',
        agentNotes: moduleData.agentNotes || '',
        interpretation: moduleData.interpretation || '',
        keywords: moduleData.keywords 
          ? Object.values(moduleData.keywords).join(', ') 
          : '',
        otherMetadata: moduleData.otherMetadata 
          ? JSON.stringify(moduleData.otherMetadata, null, 2) 
          : ''
      };
      
      setFormData(newFormData);
    }
  }, [moduleData]);

  // Validate form
  useEffect(() => {
    const isValid = formData.moduleName.trim() !== '' && 
                   formData.targetAudience.trim() !== '' && 
                   formData.difficultyLevel !== '';
    setIsFormValid(isValid);
  }, [formData]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (moduleData?.isTemporary) {
      const newFormData = { ...formData, [field]: value };
      setFormData(newFormData);
      
      // Update the context with the new data
      updateFormDataToContext(newFormData);
    }
  };

  const updateFormDataToContext = (data: FormData) => {
    try {
      let parsedKeywords: Record<string, string> | undefined;
      if (data.keywords.trim()) {
        const keywordArray = data.keywords.split(',').map(k => k.trim()).filter(k => k);
        parsedKeywords = keywordArray.reduce((acc, keyword, index) => {
          acc[`keyword_${index + 1}`] = keyword;
          return acc;
        }, {} as Record<string, string>);
      }

      let parsedMetadata: Record<string, any> | undefined;
      if (data.otherMetadata.trim()) {
        try {
          parsedMetadata = JSON.parse(data.otherMetadata);
        } catch (e) {
          console.warn("Invalid JSON in other metadata, keeping as string");
          parsedMetadata = { raw: data.otherMetadata };
        }
      }

      const prerequisites = data.prerequisites 
        ? data.prerequisites.split(',').map(p => p.trim()).filter(p => p)
        : [];

      updateModuleData({
        moduleName: data.moduleName,
        targetAudience: data.targetAudience,
        difficultyLevel: data.difficultyLevel,
        estimatedCompletionTime: data.estimatedCompletionTime,
        prerequisites: prerequisites,
        agentNotes: data.agentNotes,
        interpretation: data.interpretation,
        keywords: parsedKeywords,
        otherMetadata: parsedMetadata
      });
    } catch (error) {
      console.error("Error updating form data:", error);
    }
  };

  const handleReset = () => {
    if (originalData) {
      resetToOriginal();
      // Form data will be updated through the useEffect when moduleData changes
    }
  };

  const handleSaveAndNext = async () => {
    if (!isFormValid) return;

    // Show confirmation dialog for saving
    const confirmSave = window.confirm(
      "⚠️ IMPORTANT: Once you save this module metadata, it cannot be modified later. You would need to create a new module from scratch to make changes.\n\nAre you sure you want to save and proceed?"
    );

    if (!confirmSave) {
      return;
    }

    try {
      // Actually call the save method from context
      await saveModule();
      
      // Move to next stage
      if (onNextStage) {
        onNextStage();
      }
    } catch (error) {
      alert("Failed to save module. Please try again.");
    }
  };

  const handleNext = () => {
    if (onNextStage) {
      onNextStage();
    }
  };

  if (!moduleData) {
    return (
      <div className={styles.metadataContainer}>
        <div className={styles.centerContent}>
          <h2>No Module Data</h2>
          <p>Module data is not available.</p>
        </div>
      </div>
    );
  }

  const isEditable = moduleData.isTemporary;

  return (
    <div className={styles.metadataContainer}>
      {/* Floating Action Buttons */}
      <div className={styles.floatingActions}>
        {isEditable ? (
          // For temporary modules: Reset + Save & Next buttons
          <>
            <button 
              onClick={handleReset}
              className={styles.resetButton}
              disabled={!hasUnsavedChanges || isSaving}
            >
              🔄 Reset
            </button>
            <button 
              onClick={handleSaveAndNext}
              className={styles.saveNextButton}
              disabled={!isFormValid || isSaving}
            >
              {isSaving ? '💾 Saving...' : '💾 Save & Next'}
            </button>
          </>
        ) : (
          // For saved modules: Only Next button
          <button 
            onClick={handleNext}
            className={styles.nextButton}
          >
            Next Stage →
          </button>
        )}
      </div>

      {/* Form Container - Full Height */}
      <div className={styles.formContainer}>
        {/* Warning Notice for Editable Modules */}
        {isEditable && (
          <div className={styles.warningNotice}>
            <div className={styles.warningIcon}>⚠️</div>
            <div className={styles.warningContent}>
              <h3 className={styles.warningTitle}>Important Notice</h3>
              <p className={styles.warningText}>
                Make sure to press <strong>"Save & Next"</strong> only when you are completely sure about the metadata. 
                Once stored, this module metadata <strong>cannot be modified</strong> and you will need to create a new module from scratch to make changes.
              </p>
              <p className={styles.warningSubtext}>
                Please review all fields carefully before saving.
              </p>
            </div>
          </div>
        )}

        <form className={styles.metadataForm} onSubmit={(e) => e.preventDefault()}>
          
          {/* Module Name */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Module Name *
              {!isEditable && <span className={styles.lockIcon}>🔒</span>}
            </label>
            <input
              type="text"
              value={formData.moduleName}
              onChange={(e) => handleInputChange('moduleName', e.target.value)}
              className={`${styles.formInput} ${!isEditable ? styles.readOnly : ''}`}
              placeholder="Enter module name"
              readOnly={!isEditable}
              required
            />
          </div>

          {/* Target Audience */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Target Audience *
              {!isEditable && <span className={styles.lockIcon}>🔒</span>}
            </label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              className={`${styles.formInput} ${!isEditable ? styles.readOnly : ''}`}
              placeholder="Enter target audience"
              readOnly={!isEditable}
              required
            />
          </div>

          {/* Difficulty Level */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Difficulty Level *
              {!isEditable && <span className={styles.lockIcon}>🔒</span>}
            </label>
            <select
              value={formData.difficultyLevel}
              onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
              className={`${styles.formSelect} ${!isEditable ? styles.readOnly : ''}`}
              disabled={!isEditable}
              required
            >
              <option value="">Select difficulty level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          {/* Estimated Completion Time */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Estimated Completion Time
              {!isEditable && <span className={styles.lockIcon}>🔒</span>}
            </label>
            <input
              type="text"
              value={formData.estimatedCompletionTime}
              onChange={(e) => handleInputChange('estimatedCompletionTime', e.target.value)}
              className={`${styles.formInput} ${!isEditable ? styles.readOnly : ''}`}
              placeholder="e.g., 8 hours, 2 weeks"
              readOnly={!isEditable}
            />
          </div>

          {/* Prerequisites */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Prerequisites
              {!isEditable && <span className={styles.lockIcon}>🔒</span>}
            </label>
            <textarea
              value={formData.prerequisites}
              onChange={(e) => handleInputChange('prerequisites', e.target.value)}
              className={`${styles.formTextarea} ${!isEditable ? styles.readOnly : ''}`}
              placeholder="Enter prerequisites (comma-separated)"
              rows={3}
              readOnly={!isEditable}
            />
          </div>

          {/* Keywords */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Keywords
              {!isEditable && <span className={styles.lockIcon}>🔒</span>}
            </label>
            <textarea
              value={formData.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              className={`${styles.formTextarea} ${!isEditable ? styles.readOnly : ''}`}
              placeholder="Enter keywords (comma-separated)"
              rows={2}
              readOnly={!isEditable}
            />
          </div>

          {/* Agent Notes */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Agent Notes
              {!isEditable && <span className={styles.lockIcon}>🔒</span>}
            </label>
            <textarea
              value={formData.agentNotes}
              onChange={(e) => handleInputChange('agentNotes', e.target.value)}
              className={`${styles.formTextarea} ${!isEditable ? styles.readOnly : ''}`}
              placeholder="Enter agent notes"
              rows={4}
              readOnly={!isEditable}
            />
          </div>

          {/* Interpretation */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Interpretation
              {!isEditable && <span className={styles.lockIcon}>🔒</span>}
            </label>
            <textarea
              value={formData.interpretation}
              onChange={(e) => handleInputChange('interpretation', e.target.value)}
              className={`${styles.formTextarea} ${!isEditable ? styles.readOnly : ''}`}
              placeholder="Enter interpretation"
              rows={4}
              readOnly={!isEditable}
            />
          </div>

          {/* Other Metadata */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Other Metadata (JSON)
              {!isEditable && <span className={styles.lockIcon}>🔒</span>}
            </label>
            <textarea
              value={formData.otherMetadata}
              onChange={(e) => handleInputChange('otherMetadata', e.target.value)}
              className={`${styles.formTextarea} ${!isEditable ? styles.readOnly : ''} ${styles.codeTextarea}`}
              placeholder="Enter metadata in JSON format"
              rows={5}
              readOnly={!isEditable}
            />
          </div>

          {/* Module Stats (Read-only for saved modules) */}
          {!moduleData.isTemporary && (
            <div className={styles.statsSection}>
              <h3 className={styles.statsTitle}>Module Statistics</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <label>Topics:</label>
                  <span>{moduleData.noOfTopics || 0}</span>
                </div>
                <div className={styles.statItem}>
                  <label>Subtopics:</label>
                  <span>{moduleData.noOfSubTopics || 0}</span>
                </div>
                {moduleData.organization && (
                  <div className={styles.statItem}>
                    <label>Organization:</label>
                    <span>{moduleData.organization}</span>
                  </div>
                )}
                <div className={styles.statItem}>
                  <label>Created:</label>
                  <span>{moduleData.createdAt.toLocaleDateString()}</span>
                </div>
                <div className={styles.statItem}>
                  <label>Updated:</label>
                  <span>{moduleData.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default ModuleMetadata;