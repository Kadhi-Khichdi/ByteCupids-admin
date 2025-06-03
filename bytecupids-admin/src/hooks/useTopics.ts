import { useState, useCallback } from 'react';
import { TopicsService } from '../services/TopicsService';
import type { Topic, GetTopicsResponse } from '../types/TopicsResponse';

interface UseTopicsReturn {
  // State
  topics: Topic[];
  originalTopics: Topic[];
  isLoading: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  
  // Actions
  loadTopics: (moduleId: string) => Promise<void>;
  generateTopics: (moduleId: string) => Promise<void>;
  saveTopics: (moduleId: string, topicNames: string[]) => Promise<void>;
  updateTopicName: (index: number, name: string) => void;
  addTopic: (moduleId: string) => void;
  removeTopic: (index: number) => void;
  resetTopics: () => void;
  clearError: () => void;
}

export const useTopics = (): UseTopicsReturn => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [originalTopics, setOriginalTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const ACCESS_TOKEN = "12345"; // Static access token as specified

  const loadTopics = useCallback(async (moduleId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: GetTopicsResponse = await TopicsService.getTopics({
        moduleId,
        accessToken: ACCESS_TOKEN
      });
      
      if (response.success) {
        // Filter out deleted topics
        const activeTopics = response.topics.filter(topic => !topic.deleted);
        setTopics(activeTopics);
        setOriginalTopics([...activeTopics]); // Deep copy
        setHasUnsavedChanges(false);
      } else {
        throw new Error(response.message || 'Failed to load topics');
      }
      
    } catch (err) {
      console.error('Error loading topics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load topics');
      setTopics([]);
      setOriginalTopics([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateTopics = useCallback(async (moduleId: string): Promise<void> => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response: GetTopicsResponse = await TopicsService.generateTopics({
        moduleId,
        accessToken: ACCESS_TOKEN
      });
      
      if (response.success) {
        const activeTopics = response.topics.filter(topic => !topic.deleted);
        setTopics(activeTopics);
        setOriginalTopics([...activeTopics]); // Deep copy
        setHasUnsavedChanges(false);
      } else {
        throw new Error(response.message || 'Failed to generate topics');
      }
      
    } catch (err) {
      console.error('Error generating topics:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate topics');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const saveTopics = useCallback(async (moduleId: string, topicNames: string[]): Promise<void> => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response: GetTopicsResponse = await TopicsService.saveTopics({
        moduleId,
        accessToken: ACCESS_TOKEN,
        topics: topicNames
      });
      
      if (response.success) {
        const activeTopics = response.topics.filter(topic => !topic.deleted);
        setTopics(activeTopics);
        setOriginalTopics([...activeTopics]); // Update original to match saved
        setHasUnsavedChanges(false);
      } else {
        throw new Error(response.message || 'Failed to save topics');
      }
      
    } catch (err) {
      console.error('Error saving topics:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to save topics');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateTopicName = useCallback((index: number, name: string) => {
    setTopics(prev => {
      const newTopics = [...prev];
      newTopics[index] = {
        ...newTopics[index],
        topicName: name
      };
      
      // Check for changes by comparing topic names
      const currentNames = newTopics.map(t => t.topicName);
      const originalNames = originalTopics.map(t => t.topicName);
      const hasChanges = JSON.stringify(currentNames) !== JSON.stringify(originalNames);
      setHasUnsavedChanges(hasChanges);
      
      return newTopics;
    });
  }, [originalTopics]);

  const addTopic = useCallback((moduleId: string) => {
    const newTopic: Topic = {
      topicId: `temp_${Date.now()}`, // Temporary ID for new topics
      moduleId: moduleId,
      topicName: '',
      deleted: false
    };
    
    setTopics(prev => {
      const newTopics = [...prev, newTopic];
      setHasUnsavedChanges(true);
      return newTopics;
    });
  }, []);

  const removeTopic = useCallback((index: number) => {
    setTopics(prev => {
      const newTopics = prev.filter((_, i) => i !== index);
      
      // Check for changes
      const currentNames = newTopics.map(t => t.topicName);
      const originalNames = originalTopics.map(t => t.topicName);
      const hasChanges = JSON.stringify(currentNames) !== JSON.stringify(originalNames);
      setHasUnsavedChanges(hasChanges);
      
      return newTopics;
    });
  }, [originalTopics]);

  const resetTopics = useCallback(() => {
    setTopics([...originalTopics]);
    setHasUnsavedChanges(false);
    setError(null);
  }, [originalTopics]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    topics,
    originalTopics,
    isLoading,
    isGenerating,
    isSaving,
    error,
    hasUnsavedChanges,
    
    // Actions
    loadTopics,
    generateTopics,
    saveTopics,
    updateTopicName,
    addTopic,
    removeTopic,
    resetTopics,
    clearError
  };
};