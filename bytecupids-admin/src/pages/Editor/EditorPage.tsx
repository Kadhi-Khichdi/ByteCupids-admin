import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./Editor.module.css";

interface ModuleData {
  moduleId: string;
  moduleName: string;
  targetAudience: string;
  difficultyLevel: string;
  estimatedCompletionTime: string;
  prerequisites: string;
  keywords: Record<string, string>;
  otherMetadata: Record<string, any>;
  agentNotes: string;
  interpretation: string;
  createdAt: Date;
  updatedAt: Date;
}

const EditorPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState<ModuleData | null>(null);

  useEffect(() => {
    // Simulate loading module data (in real app, this would come from API or context)
    // For now, we'll check if we have recent module data in sessionStorage
    const recentModule = sessionStorage.getItem('recentModule');
    if (recentModule) {
      try {
        const parsed = JSON.parse(recentModule);
        if (parsed.moduleId === moduleId) {
          const moduleDataWithDates = {
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt)
          };
          setModuleData(moduleDataWithDates);
          setEditedData(moduleDataWithDates);
          // Clear the session storage after loading
          sessionStorage.removeItem('recentModule');
          return;
        }
      } catch (error) {
        console.error('Error parsing recent module data:', error);
      }
    }

    // If no recent module data, create mock data for demo
    const mockModuleData: ModuleData = {
      moduleId: moduleId || 'unknown',
      moduleName: 'Sample Module',
      targetAudience: 'General audience',
      difficultyLevel: 'Beginner',
      estimatedCompletionTime: '40 hours',
      prerequisites: 'None',
      keywords: { keyword_1: 'sample', keyword_2: 'demo' },
      otherMetadata: {},
      agentNotes: 'This is sample data for demonstration.',
      interpretation: 'This module covers sample content for demonstration purposes.',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setModuleData(mockModuleData);
    setEditedData(mockModuleData);
  }, [moduleId]);

  // Store module data in sessionStorage when it's set
  useEffect(() => {
    if (moduleData && moduleData.moduleId === moduleId) {
      sessionStorage.setItem('recentModule', JSON.stringify(moduleData));
    }
  }, [moduleData, moduleId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedData) return;

    setIsSaving(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the module data
      const updatedData = {
        ...editedData,
        updatedAt: new Date()
      };
      
      setModuleData(updatedData);
      setIsEditing(false);
      
      console.log('Module saved successfully:', updatedData);
      alert('Module saved successfully!');
      
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Failed to save module. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData(moduleData);
    setIsEditing(false);
  };

  const handleFieldChange = (field: keyof ModuleData, value: any) => {
    if (!editedData) return;
    
    setEditedData(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const formatKeywords = (keywords: Record<string, string>) => {
    return Object.values(keywords).join(', ');
  };

  const parseKeywords = (keywordsString: string): Record<string, string> => {
    const keywords: Record<string, string> = {};
    const keywordArray = keywordsString.split(',').map(k => k.trim()).filter(k => k);
    
    keywordArray.forEach((keyword, index) => {
      keywords[`keyword_${index + 1}`] = keyword;
    });
    
    return keywords;
  };

  const formatMetadata = (metadata: Record<string, any>) => {
    if (!metadata || Object.keys(metadata).length === 0) return '';
    return Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  const parseMetadata = (metadataString: string): Record<string, any> => {
    if (!metadataString.trim()) return {};
    
    const metadata: Record<string, any> = {};
    const pairs = metadataString.split(',').map(pair => pair.trim());
    
    pairs.forEach(pair => {
      const [key, ...valueParts] = pair.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
        
        if (!isNaN(Number(value))) {
          metadata[cleanKey] = Number(value);
        } else {
          metadata[cleanKey] = value;
        }
      }
    });
    
    return metadata;
  };

  if (!moduleData) {
    return (
      <div className={styles.editorContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading module data...</p>
        </div>
      </div>
    );
  }

  const currentData = isEditing ? editedData : moduleData;

  return (
    <div className={styles.editorContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button 
            className={styles.backButton}
            onClick={handleBackToDashboard}
            disabled={isSaving}
          >
            ← Back to Dashboard
          </button>
          <div className={styles.moduleInfo}>
            <h1 className={styles.moduleTitle}>
              {currentData?.moduleName || 'Unknown Module'}
            </h1>
            <p className={styles.moduleId}>ID: {moduleId}</p>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          {!isEditing ? (
            <button 
              className={styles.editButton}
              onClick={handleEdit}
            >
              Edit Module
            </button>
          ) : (
            <div className={styles.editActions}>
              <button 
                className={styles.cancelButton}
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.moduleDataSection}>
          <h2 className={styles.sectionTitle}>Module Information</h2>
          
          <div className={styles.fieldGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Module Name</label>
              {isEditing ? (
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={editedData?.moduleName || ''}
                  onChange={(e) => handleFieldChange('moduleName', e.target.value)}
                />
              ) : (
                <div className={styles.fieldValue}>{currentData?.moduleName}</div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Target Audience</label>
              {isEditing ? (
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={editedData?.targetAudience || ''}
                  onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
                />
              ) : (
                <div className={styles.fieldValue}>{currentData?.targetAudience}</div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Difficulty Level</label>
              {isEditing ? (
                <select
                  className={styles.fieldSelect}
                  value={editedData?.difficultyLevel || ''}
                  onChange={(e) => handleFieldChange('difficultyLevel', e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Beginner to Intermediate">Beginner to Intermediate</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Intermediate to Advanced">Intermediate to Advanced</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Beginner to Expert">Beginner to Expert</option>
                </select>
              ) : (
                <div className={styles.fieldValue}>{currentData?.difficultyLevel}</div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Estimated Completion Time</label>
              {isEditing ? (
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={editedData?.estimatedCompletionTime || ''}
                  onChange={(e) => handleFieldChange('estimatedCompletionTime', e.target.value)}
                />
              ) : (
                <div className={styles.fieldValue}>{currentData?.estimatedCompletionTime}</div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Prerequisites</label>
              {isEditing ? (
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={editedData?.prerequisites || ''}
                  onChange={(e) => handleFieldChange('prerequisites', e.target.value)}
                />
              ) : (
                <div className={styles.fieldValue}>{currentData?.prerequisites}</div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Keywords</label>
              {isEditing ? (
                <textarea
                  className={styles.fieldTextarea}
                  value={formatKeywords(editedData?.keywords || {})}
                  onChange={(e) => handleFieldChange('keywords', parseKeywords(e.target.value))}
                  rows={3}
                />
              ) : (
                <div className={styles.fieldValue}>{formatKeywords(currentData?.keywords || {})}</div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Other Metadata</label>
              {isEditing ? (
                <textarea
                  className={styles.fieldTextarea}
                  value={formatMetadata(editedData?.otherMetadata || {})}
                  onChange={(e) => handleFieldChange('otherMetadata', parseMetadata(e.target.value))}
                  rows={2}
                />
              ) : (
                <div className={styles.fieldValue}>
                  {formatMetadata(currentData?.otherMetadata || {}) || 'None'}
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Agent Notes</label>
              {isEditing ? (
                <textarea
                  className={styles.fieldTextarea}
                  value={editedData?.agentNotes || ''}
                  onChange={(e) => handleFieldChange('agentNotes', e.target.value)}
                  rows={3}
                />
              ) : (
                <div className={styles.fieldValue}>{currentData?.agentNotes}</div>
              )}
            </div>

            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label className={styles.fieldLabel}>Interpretation</label>
              {isEditing ? (
                <textarea
                  className={styles.fieldTextarea}
                  value={editedData?.interpretation || ''}
                  onChange={(e) => handleFieldChange('interpretation', e.target.value)}
                  rows={4}
                />
              ) : (
                <div className={styles.fieldValue}>{currentData?.interpretation}</div>
              )}
            </div>
          </div>

          <div className={styles.timestamps}>
            <div className={styles.timestamp}>
              <span className={styles.timestampLabel}>Created:</span>
              <span className={styles.timestampValue}>
                {currentData?.createdAt.toLocaleString()}
              </span>
            </div>
            <div className={styles.timestamp}>
              <span className={styles.timestampLabel}>Updated:</span>
              <span className={styles.timestampValue}>
                {currentData?.updatedAt.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;