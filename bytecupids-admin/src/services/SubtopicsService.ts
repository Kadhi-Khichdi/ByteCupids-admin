import type { GetSubtopicsRequest, GetSubtopicsResponse, GenerateSubtopicsRequest, SaveSubtopicsRequest } from '../types/SubtopicsResponse';

const API_BASE_URL = 'http://localhost:8000/bytecupids/lab';

export class SubtopicsService {
  
  /**
   * Fetch subtopics for a module
   */
  static async getSubtopics(request: GetSubtopicsRequest): Promise<GetSubtopicsResponse> {
    try {
      console.log('Fetching subtopics for module:', request.moduleId);
      
      const response = await fetch(`${API_BASE_URL}/get_subtopics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GetSubtopicsResponse = await response.json();
      
      console.log('Subtopics fetched successfully:', data);
      return data;
      
    } catch (error) {
      console.error('Error fetching subtopics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch subtopics');
    }
  }

  /**
   * Generate subtopics for a topic (placeholder implementation)
   */
  static async generateSubtopics(request: GenerateSubtopicsRequest): Promise<GetSubtopicsResponse> {
    try {
      console.log('Generating subtopics for topic:', request.topicId);
      
      // TODO: Replace with actual API endpoint when available
      const response = await fetch(`${API_BASE_URL}/generate_subtopics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GetSubtopicsResponse = await response.json();
      
      console.log('Subtopics generated successfully:', data);
      return data;
      
    } catch (error) {
      console.error('Error generating subtopics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate subtopics');
    }
  }

  /**
   * Save subtopics for a topic (placeholder implementation)
   */
  static async saveSubtopics(request: SaveSubtopicsRequest): Promise<GetSubtopicsResponse> {
    try {
      console.log('Saving subtopics for topic:', request.topicId);
      
      // TODO: Replace with actual API endpoint when available
      const response = await fetch(`${API_BASE_URL}/save_subtopics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GetSubtopicsResponse = await response.json();
      
      console.log('Subtopics saved successfully:', data);
      return data;
      
    } catch (error) {
      console.error('Error saving subtopics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to save subtopics');
    }
  }
}

export default SubtopicsService;