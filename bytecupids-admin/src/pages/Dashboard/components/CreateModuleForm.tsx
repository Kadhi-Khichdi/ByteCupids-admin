import React, { useState } from 'react';
import styles from './CreateModuleForm.module.css';
import newModuleService from '../../../services/NewModuleService';

interface CreateModuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moduleData: any) => void;
}

interface FormData {
  module_name: string;
  target_audience: string;
  difficulty_level: string;
  estimated_completion_time: string;
  keywords: string;
  prerequisites: string;
  other_metadata: string;
  agent_notes: string;
  interpretation: string;
}

const CreateModuleForm: React.FC<CreateModuleFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    module_name: '',
    target_audience: '',
    difficulty_level: '',
    estimated_completion_time: '',
    keywords: '',
    prerequisites: '',
    other_metadata: '',
    agent_notes: '',
    interpretation: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [showProgress, setShowProgress] = useState(false);

  const difficultyOptions = [
    'Beginner',
    'Beginner to Intermediate',
    'Intermediate',
    'Intermediate to Advanced',
    'Advanced',
    'Beginner to Expert'
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.module_name.trim()) newErrors.module_name = 'Module name is required';
    if (!formData.target_audience.trim()) newErrors.target_audience = 'Target audience is required';
    if (!formData.difficulty_level) newErrors.difficulty_level = 'Difficulty level is required';
    if (!formData.estimated_completion_time.trim()) newErrors.estimated_completion_time = 'Completion time is required';
    if (!formData.keywords.trim()) newErrors.keywords = 'Keywords are required';
    if (!formData.prerequisites.trim()) newErrors.prerequisites = 'Prerequisites are required';
    if (!formData.other_metadata.trim()) newErrors.other_metadata = 'Other metadata is required';
    if (!formData.agent_notes.trim()) newErrors.agent_notes = 'Agent notes are required';
    if (!formData.interpretation.trim()) newErrors.interpretation = 'Interpretation is required';
    
    // Validate interpretation word count
    if (formData.interpretation.trim() && formData.interpretation.trim().split(' ').length > 100) {
      newErrors.interpretation = 'Interpretation must be less than 100 words';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setShowProgress(true);
    setProgressMessages([]);

    try {
      // Transform form data to request format
      const requestData = newModuleService.transformFormDataToRequest({
        module_name: formData.module_name,
        target_audience: formData.target_audience,
        difficulty_level: formData.difficulty_level,
        estimated_completion_time: formData.estimated_completion_time,
        prerequisites: formData.prerequisites,
        keywords: formData.keywords,
        other_metadata: formData.other_metadata,
        agent_notes: formData.agent_notes,
        interpretation: formData.interpretation,
      }, 'your-access-token-here'); // Replace with actual access token

      // Create the module using the service with progress tracking
      const response = await newModuleService.createModuleWithValidation(
        requestData,
        (chunk: string) => {
          // Handle progress updates here
          console.log('Progress:', chunk);
          setProgressMessages(prev => [...prev, chunk]);
        }
      );
      
      console.log('Module created successfully:', response);
      await onSubmit(response);
      handleClose();
      
    } catch (error) {
      console.error('Error creating module:', error);
      alert(error instanceof Error ? error.message : 'Failed to create module');
    } finally {
      setIsSubmitting(false);
      setShowProgress(false);
      setProgressMessages([]);
    }
  };

  const handleClose = () => {
    setFormData({
      module_name: '',
      target_audience: '',
      difficulty_level: '',
      estimated_completion_time: '',
      keywords: '',
      prerequisites: '',
      other_metadata: '',
      agent_notes: '',
      interpretation: ''
    });
    setErrors({});
    setProgressMessages([]);
    setShowProgress(false);
    onClose();
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(' ').length : 0;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create New Module</h2>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            type="button"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {showProgress && (
          <div className={styles.progressContainer}>
            <div className={styles.progressHeader}>
              <h3>Creating Module...</h3>
              <div className={styles.spinner}></div>
            </div>
            <div className={styles.progressMessages}>
              {progressMessages.map((message, index) => (
                <div key={index} className={styles.progressMessage}>
                  {message}
                </div>
              ))}
            </div>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Module Name *
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.module_name ? styles.error : ''}`}
              value={formData.module_name}
              onChange={(e) => handleInputChange('module_name', e.target.value)}
              placeholder="Enter module name"
              disabled={isSubmitting}
            />
            {errors.module_name && <span className={styles.errorText}>{errors.module_name}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Target Audience *
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.target_audience ? styles.error : ''}`}
                value={formData.target_audience}
                onChange={(e) => handleInputChange('target_audience', e.target.value)}
                placeholder="e.g., Web Developers, Students"
                disabled={isSubmitting}
              />
              {errors.target_audience && <span className={styles.errorText}>{errors.target_audience}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Difficulty Level *
              </label>
              <select
                className={`${styles.select} ${errors.difficulty_level ? styles.error : ''}`}
                value={formData.difficulty_level}
                onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Select difficulty</option>
                {difficultyOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.difficulty_level && <span className={styles.errorText}>{errors.difficulty_level}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Estimated Completion Time *
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.estimated_completion_time ? styles.error : ''}`}
                value={formData.estimated_completion_time}
                onChange={(e) => handleInputChange('estimated_completion_time', e.target.value)}
                placeholder="e.g., 30 hours, 2 weeks"
                disabled={isSubmitting}
              />
              {errors.estimated_completion_time && <span className={styles.errorText}>{errors.estimated_completion_time}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Prerequisites *
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.prerequisites ? styles.error : ''}`}
                value={formData.prerequisites}
                onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                placeholder="Comma-separated list"
                disabled={isSubmitting}
              />
              {errors.prerequisites && <span className={styles.errorText}>{errors.prerequisites}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Keywords *
            </label>
            <textarea
              className={`${styles.textarea} ${errors.keywords ? styles.error : ''}`}
              value={formData.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              placeholder="Comma-separated domain-specific terms, concepts, and technologies"
              rows={3}
              disabled={isSubmitting}
            />
            {errors.keywords && <span className={styles.errorText}>{errors.keywords}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Other Metadata *
            </label>
            <textarea
              className={`${styles.textarea} ${errors.other_metadata ? styles.error : ''}`}
              value={formData.other_metadata}
              onChange={(e) => handleInputChange('other_metadata', e.target.value)}
              placeholder="e.g., Lessons: 12, Instructor: Jane Doe, Format: Video"
              rows={2}
              disabled={isSubmitting}
            />
            {errors.other_metadata && <span className={styles.errorText}>{errors.other_metadata}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Agent Notes *
            </label>
            <textarea
              className={`${styles.textarea} ${errors.agent_notes ? styles.error : ''}`}
              value={formData.agent_notes}
              onChange={(e) => handleInputChange('agent_notes', e.target.value)}
              placeholder="Summarize assumptions, estimations, or missing fields"
              rows={3}
              disabled={isSubmitting}
            />
            {errors.agent_notes && <span className={styles.errorText}>{errors.agent_notes}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Interpretation * 
              <span className={styles.wordCount}>
                ({getWordCount(formData.interpretation)}/100 words)
              </span>
            </label>
            <textarea
              className={`${styles.textarea} ${errors.interpretation ? styles.error : ''}`}
              value={formData.interpretation}
              onChange={(e) => handleInputChange('interpretation', e.target.value)}
              placeholder="Summary of what this module covers (max 100 words)"
              rows={4}
              disabled={isSubmitting}
            />
            {errors.interpretation && <span className={styles.errorText}>{errors.interpretation}</span>}
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModuleForm;