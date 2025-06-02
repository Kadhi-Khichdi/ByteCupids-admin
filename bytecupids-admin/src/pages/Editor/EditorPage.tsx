import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import localStorageService from "../../services/local/LocalStorageService";
import { getModules } from "../../services/GetModulesService";
import type { GetModuleResponse } from "../../types/GetModuleResponse";
import styles from "./Editor.module.css";

interface ModuleData {
  moduleId: string;
  moduleName: string;
  targetAudience: string;
  difficultyLevel: string;
  estimatedCompletionTime: string;
  prerequisites: string | string[];
  keywords?: Record<string, string>;
  otherMetadata?: Record<string, any>;
  agentNotes: string;
  interpretation: string;
  createdAt: Date;
  updatedAt: Date;
  isTemporary?: boolean;
  noOfTopics?: number;
  noOfSubTopics?: number;
  organization?: string;
}

const EditorPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!moduleId) {
      setError("No module ID provided");
      setIsLoading(false);
      return;
    }

    loadModuleData(moduleId);
  }, [moduleId]);

  const loadModuleData = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // First, try to load from local storage (for temporary modules)
      const tempModule = localStorageService.getTempModule(id);
      
      if (tempModule) {
        console.log("Loading temporary module from local storage:", id);
        
        const moduleData: ModuleData = {
          moduleId: tempModule.moduleId,
          moduleName: tempModule.moduleName,
          targetAudience: tempModule.targetAudience,
          difficultyLevel: tempModule.difficultyLevel,
          estimatedCompletionTime: tempModule.estimatedCompletionTime,
          prerequisites: tempModule.prerequisites,
          keywords: tempModule.keywords,
          otherMetadata: tempModule.otherMetadata,
          agentNotes: tempModule.agentNotes,
          interpretation: tempModule.interpretation,
          createdAt: tempModule.createdAt,
          updatedAt: tempModule.updatedAt,
          isTemporary: true
        };
        
        setModuleData(moduleData);
        return;
      }
      
      // If not found in local storage, try to load from backend (saved modules)
      try {
        console.log("Loading saved module from backend:", id);
        
        const response: GetModuleResponse = await getModules();
        
        if (response.success && response.modules) {
          const savedModule = response.modules.find(module => module.moduleId === id);
          
          if (savedModule) {
            const moduleData: ModuleData = {
              moduleId: savedModule.moduleId,
              moduleName: savedModule.moduleName,
              targetAudience: savedModule.targetAudience,
              difficultyLevel: savedModule.difficultyLevel,
              estimatedCompletionTime: `${savedModule.estimatedTime} hours`,
              prerequisites: savedModule.prerequisites, // Array format
              agentNotes: savedModule.agentNotes,
              interpretation: savedModule.interpretation,
              createdAt: new Date(savedModule.lastUpdateTime),
              updatedAt: new Date(savedModule.lastUpdateTime),
              isTemporary: false,
              noOfTopics: savedModule.noOfTopics,
              noOfSubTopics: savedModule.noOfSubTopics,
              organization: savedModule.organization
            };
            
            setModuleData(moduleData);
            return;
          }
        }
        
        throw new Error(`Saved module with ID ${id} not found`);
        
      } catch (backendError) {
        console.error("Error loading from backend:", backendError);
        throw new Error(`Module with ID ${id} not found in local storage or backend`);
      }
      
    } catch (err) {
      console.error("Error loading module:", err);
      setError(err instanceof Error ? err.message : "Failed to load module data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className={styles.editorContainer}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading module...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.editorContainer}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleGoBack} className={styles.backButton}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className={styles.editorContainer}>
        <div className={styles.error}>
          <h2>Module Not Found</h2>
          <p>The requested module could not be found.</p>
          <button onClick={handleGoBack} className={styles.backButton}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editorContainer}>
      <div className={styles.header}>
        <button onClick={handleGoBack} className={styles.backButton}>
          ← Back to Dashboard
        </button>
        <div className={styles.moduleInfo}>
          <h1 className={styles.moduleName}>
            {moduleData.moduleName}
            {moduleData.isTemporary && (
              <span className={styles.tempBadge}>TEMPORARY</span>
            )}
          </h1>
          <p className={styles.moduleId}>Module ID: {moduleData.moduleId}</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.moduleDetails}>
          <h2>Module Details</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <label>Module Name:</label>
              <span>{moduleData.moduleName}</span>
            </div>
            <div className={styles.detailItem}>
              <label>Module ID:</label>
              <span>{moduleData.moduleId}</span>
            </div>
            <div className={styles.detailItem}>
              <label>Target Audience:</label>
              <span>{moduleData.targetAudience}</span>
            </div>
            <div className={styles.detailItem}>
              <label>Difficulty Level:</label>
              <span>{moduleData.difficultyLevel}</span>
            </div>
            <div className={styles.detailItem}>
              <label>Estimated Time:</label>
              <span>{moduleData.estimatedCompletionTime}</span>
            </div>
            <div className={styles.detailItem}>
              <label>Prerequisites:</label>
              <span>
                {Array.isArray(moduleData.prerequisites) 
                  ? moduleData.prerequisites.join(', ') || 'None'
                  : moduleData.prerequisites || 'None'
                }
              </span>
            </div>
            <div className={styles.detailItem}>
              <label>Status:</label>
              <span className={moduleData.isTemporary ? styles.tempStatus : styles.savedStatus}>
                {moduleData.isTemporary ? "Not Saved" : "Saved"}
              </span>
            </div>
            {!moduleData.isTemporary && (
              <>
                <div className={styles.detailItem}>
                  <label>Topics:</label>
                  <span>{moduleData.noOfTopics || 0}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Subtopics:</label>
                  <span>{moduleData.noOfSubTopics || 0}</span>
                </div>
                {moduleData.organization && (
                  <div className={styles.detailItem}>
                    <label>Organization:</label>
                    <span>{moduleData.organization}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.interpretationSection}>
            <h3>Interpretation</h3>
            <p>{moduleData.interpretation}</p>
          </div>

          <div className={styles.agentNotesSection}>
            <h3>Agent Notes</h3>
            <p>{moduleData.agentNotes}</p>
          </div>

          {moduleData.keywords && (
            <div className={styles.keywordsSection}>
              <h3>Keywords</h3>
              <div className={styles.keywordsList}>
                {Object.values(moduleData.keywords).map((keyword, index) => (
                  <span key={index} className={styles.keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPage;