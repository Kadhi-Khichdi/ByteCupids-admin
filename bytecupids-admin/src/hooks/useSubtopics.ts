import { useState, useCallback } from 'react';
import { SubtopicsService } from '../services/SubtopicsService';
import type { SubTopic, GetSubtopicsResponse } from '../types/SubtopicsResponse';

interface UseSubtopicsReturn {
  // State
  subtopics: SubTopic[];
  originalSubtopics: SubTopic[];
  isLoading: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  
  // Actions
  loadSubtopics: (moduleId: string, topicId: string) => Promise<void>; // Added topicId parameter
  generateSubtopics: (moduleId: string, topicId: string) => Promise<void>;
  saveSubtopics: (moduleId: string, topicId: string, subtopicNames: string[]) => Promise<void>;
  updateSubtopicName: (index: number, name: string) => void;
  addSubtopic: (moduleId: string, topicId: string) => void;
  removeSubtopic: (index: number) => void;
  reorderSubtopics: (startIndex: number, endIndex: number) => void;
  resetSubtopics: () => void;
  clearError: () => void;
}

export const useSubtopics = (): UseSubtopicsReturn => {
  const [subtopics, setSubtopics] = useState<SubTopic[]>([]);
  const [originalSubtopics, setOriginalSubtopics] = useState<SubTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const ACCESS_TOKEN = "12345"; // Static access token as specified

  const loadSubtopics = useCallback(async (moduleId: string, topicId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: GetSubtopicsResponse = await SubtopicsService.getSubtopics({
        moduleId,
        accessToken: ACCESS_TOKEN
      });
      
      if (response.success) {
        // Filter subtopics by the selected topic ID, exclude deleted ones, and sort by sequence number
        const activeSubtopics = response.subTopics
          .filter(subtopic => 
            !subtopic.deleted && 
            subtopic.topicId === topicId // Only show subtopics for the selected topic
          )
          .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
        
        setSubtopics(activeSubtopics);
        setOriginalSubtopics([...activeSubtopics]); // Deep copy
        setHasUnsavedChanges(false);
      } else {
        throw new Error(response.message || 'Failed to load subtopics');
      }
      
    } catch (err) {
      console.error('Error loading subtopics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subtopics');
      setSubtopics([]);
      setOriginalSubtopics([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateSubtopics = useCallback(async (moduleId: string, topicId: string): Promise<void> => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response: GetSubtopicsResponse = await SubtopicsService.generateSubtopics({
        moduleId,
        topicId,
        accessToken: ACCESS_TOKEN
      });
      
      if (response.success) {
        // Filter subtopics by the selected topic ID, exclude deleted ones, and sort by sequence number
        const activeSubtopics = response.subTopics
          .filter(subtopic => 
            !subtopic.deleted && 
            subtopic.topicId === topicId // Only show subtopics for the selected topic
          )
          .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
        
        setSubtopics(activeSubtopics);
        setOriginalSubtopics([...activeSubtopics]); // Deep copy
        setHasUnsavedChanges(false);
      } else {
        throw new Error(response.message || 'Failed to generate subtopics');
      }
      
    } catch (err) {
      console.error('Error generating subtopics:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate subtopics');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const saveSubtopics = useCallback(async (moduleId: string, topicId: string, subtopicNames: string[]): Promise<void> => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response: GetSubtopicsResponse = await SubtopicsService.saveSubtopics({
        moduleId,
        topicId,
        accessToken: ACCESS_TOKEN,
        subtopics: subtopicNames
      });
      
      if (response.success) {
        // Filter subtopics by the selected topic ID, exclude deleted ones, and sort by sequence number
        const activeSubtopics = response.subTopics
          .filter(subtopic => 
            !subtopic.deleted && 
            subtopic.topicId === topicId // Only show subtopics for the selected topic
          )
          .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
        
        setSubtopics(activeSubtopics);
        setOriginalSubtopics([...activeSubtopics]); // Update original to match saved
        setHasUnsavedChanges(false);
      } else {
        throw new Error(response.message || 'Failed to save subtopics');
      }
      
    } catch (err) {
      console.error('Error saving subtopics:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to save subtopics');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateSubtopicName = useCallback((index: number, name: string) => {
    setSubtopics(prev => {
      const newSubtopics = [...prev];
      newSubtopics[index] = {
        ...newSubtopics[index],
        subTopicName: name
      };
      
      // Check for changes by comparing subtopic names and order
      const currentData = newSubtopics.map((s, i) => ({ name: s.subTopicName, seq: i }));
      const originalData = originalSubtopics.map((s, i) => ({ name: s.subTopicName, seq: i }));
      const hasChanges = JSON.stringify(currentData) !== JSON.stringify(originalData);
      setHasUnsavedChanges(hasChanges);
      
      return newSubtopics;
    });
  }, [originalSubtopics]);

  const addSubtopic = useCallback((moduleId: string, topicId: string) => {
    const newSubtopic: SubTopic = {
      subTopicId: `temp_${Date.now()}`, // Temporary ID for new subtopics
      moduleId: moduleId,
      topicId: topicId, // Ensure the new subtopic belongs to the selected topic
      subTopicName: '',
      sequenceNumber: subtopics.length + 1,
      deleted: false
    };
    
    setSubtopics(prev => {
      const newSubtopics = [...prev, newSubtopic];
      setHasUnsavedChanges(true);
      return newSubtopics;
    });
  }, [subtopics.length]);

  const removeSubtopic = useCallback((index: number) => {
    setSubtopics(prev => {
      const newSubtopics = prev.filter((_, i) => i !== index);
      
      // Update sequence numbers
      const resequencedSubtopics = newSubtopics.map((subtopic, i) => ({
        ...subtopic,
        sequenceNumber: i + 1
      }));
      
      // Check for changes
      const currentData = resequencedSubtopics.map((s, i) => ({ name: s.subTopicName, seq: i }));
      const originalData = originalSubtopics.map((s, i) => ({ name: s.subTopicName, seq: i }));
      const hasChanges = JSON.stringify(currentData) !== JSON.stringify(originalData);
      setHasUnsavedChanges(hasChanges);
      
      return resequencedSubtopics;
    });
  }, [originalSubtopics]);

  const reorderSubtopics = useCallback((startIndex: number, endIndex: number) => {
    setSubtopics(prev => {
      const newSubtopics = [...prev];
      const [removed] = newSubtopics.splice(startIndex, 1);
      newSubtopics.splice(endIndex, 0, removed);
      
      // Update sequence numbers
      const resequencedSubtopics = newSubtopics.map((subtopic, i) => ({
        ...subtopic,
        sequenceNumber: i + 1
      }));
      
      // Check for changes
      const currentData = resequencedSubtopics.map((s, i) => ({ name: s.subTopicName, seq: i }));
      const originalData = originalSubtopics.map((s, i) => ({ name: s.subTopicName, seq: i }));
      const hasChanges = JSON.stringify(currentData) !== JSON.stringify(originalData);
      setHasUnsavedChanges(hasChanges);
      
      return resequencedSubtopics;
    });
  }, [originalSubtopics]);

  const resetSubtopics = useCallback(() => {
    setSubtopics([...originalSubtopics]);
    setHasUnsavedChanges(false);
    setError(null);
  }, [originalSubtopics]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    subtopics,
    originalSubtopics,
    isLoading,
    isGenerating,
    isSaving,
    error,
    hasUnsavedChanges,
    
    // Actions
    loadSubtopics,
    generateSubtopics,
    saveSubtopics,
    updateSubtopicName,
    addSubtopic,
    removeSubtopic,
    reorderSubtopics,
    resetSubtopics,
    clearError
  };
};