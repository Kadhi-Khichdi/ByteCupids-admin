import type { GetTopicsRequest, GetTopicsResponse, GenerateTopicsRequest, SaveTopicsRequest } from '../types/TopicsResponse';

const API_BASE_URL = 'http://localhost:8000/bytecupids/lab';

export class TopicsService {
  
  /**
   * Fetch topics for a module
   */
  static async getTopics(request: GetTopicsRequest): Promise<GetTopicsResponse> {
    try {
      console.log('Fetching topics for module:', request.moduleId);
      
      const response = await fetch(`${API_BASE_URL}/get_topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GetTopicsResponse = await response.json();
      
      console.log('Topics fetched successfully:', data);
      return data;
      
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch topics');
    }
  }

  /**
   * Generate topics for a module (placeholder implementation)
   */
  static async generateTopics(request: GenerateTopicsRequest): Promise<GetTopicsResponse> {
    try {
      console.log('Generating topics for module:', request.moduleId);
      
      // TODO: Replace with actual API endpoint when available
      const response = await fetch(`${API_BASE_URL}/generate_topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GetTopicsResponse = await response.json();
      
      console.log('Topics generated successfully:', data);
      return data;
      
    } catch (error) {
      console.error('Error generating topics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate topics');
    }
  }

  /**
   * Save topics for a module (placeholder implementation)
   */
  static async saveTopics(request: SaveTopicsRequest): Promise<GetTopicsResponse> {
    try {
      console.log('Saving topics for module:', request.moduleId);
      
      // TODO: Replace with actual API endpoint when available
      const response = await fetch(`${API_BASE_URL}/save_topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GetTopicsResponse = await response.json();
      
      console.log('Topics saved successfully:', data);
      return data;
      
    } catch (error) {
      console.error('Error saving topics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to save topics');
    }
  }
}

export default TopicsService;