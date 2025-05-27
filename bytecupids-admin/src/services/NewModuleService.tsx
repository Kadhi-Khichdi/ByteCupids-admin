import type { NewModuleRequest } from '../types/NewModuleRequest';
import type { NewModuleResponse } from '../types/NewModuleResponse';

interface ModuleInputRequest {
  accessToken: string;
  moduleName: string;
  moduleMetadata: string;
}

interface BackendStreamResponse {
  module_name: string;
  metadata: {
    target_audience: string;
    difficulty_level: string;
    estimated_completion_time: string;
    keywords: string;
    prerequisites: string;
    other_metadata: string;
  };
  agent_notes: string;
  interpretation: string;
}

class NewModuleService {
  private readonly baseURL = 'http://localhost:8000';
  private readonly endpoint = '/bytecupids/admin/generate/module-input';

  /**
   * Creates a new module by handling SSE stream from the backend
   * @param moduleData - The module data to be sent to the backend
   * @param onProgress - Optional callback for progress updates
   * @returns Promise<NewModuleResponse> - The final parsed response
   */
  async createModule(
    moduleData: NewModuleRequest, 
    onProgress?: (message: string) => void
  ): Promise<NewModuleResponse> {
    try {
      const url = `${this.baseURL}${this.endpoint}`;
      
      // Transform to backend format
      const backendRequest = this.transformToBackendRequest(moduleData);
      
      console.log('Creating module with data:', backendRequest);
      console.log('Sending request to:', url);

      if (onProgress) {
        onProgress('Sending request to server...');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(backendRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      if (onProgress) {
        onProgress('Processing module with AI agent...');
      }

      // Handle the SSE stream
      const streamData = await this.handleSSEStream(response, onProgress);
      
      if (onProgress) {
        onProgress('Module created successfully!');
      }

      // Transform the stream response to our expected format
      const moduleResponse = this.transformStreamToResponse(streamData);
      
      console.log('Module created successfully:', moduleResponse);
      return moduleResponse;

    } catch (error) {
      console.error('Error creating module:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check if the server is running.');
      }
      
      throw error instanceof Error 
        ? error 
        : new Error('An unexpected error occurred while creating the module.');
    }
  }

  /**
   * Transforms NewModuleRequest to the backend's expected format
   * @param moduleData - The module data from frontend
   * @returns ModuleInputRequest - The backend request format
   */
  private transformToBackendRequest(moduleData: NewModuleRequest): ModuleInputRequest {
    const metadata = {
      target_audience: moduleData.targetAudience,
      difficulty_level: moduleData.difficultyLevel,
      estimated_completion_time: moduleData.estimatedCompletionTime,
      prerequisites: moduleData.prerequisites,
      keywords: this.convertKeywordsToString(moduleData.keywords),
      other_metadata: this.convertMetadataToString(moduleData.otherMetadata),
      agent_notes: moduleData.agentNotes,
      interpretation: moduleData.interpretation
    };

    return {
      accessToken: moduleData.accessToken || 'default-token',
      moduleName: moduleData.moduleName,
      moduleMetadata: JSON.stringify(metadata)
    };
  }

  /**
   * Converts keywords Record to comma-separated string
   * @param keywords - Keywords Record<string, string>
   * @returns string - Comma-separated keywords
   */
  private convertKeywordsToString(keywords: Record<string, string>): string {
    if (!keywords || Object.keys(keywords).length === 0) return '';
    return Object.values(keywords).join(', ');
  }

  /**
   * Converts metadata Record to string representation
   * @param metadata - Metadata Record<string, any>
   * @returns string - String representation of metadata
   */
  private convertMetadataToString(metadata: Record<string, any>): string {
    if (!metadata || Object.keys(metadata).length === 0) return '';
    
    const pairs = Object.entries(metadata).map(([key, value]) => {
      return `${key}: ${value}`;
    });
    
    return pairs.join(', ');
  }

  /**
   * Handles the Server-Sent Events stream from Flux<String>
   * @param response - The fetch response object
   * @param onProgress - Optional progress callback
   * @returns Promise<BackendStreamResponse> - The parsed stream data
   */
  private async handleSSEStream(
    response: Response, 
    onProgress?: (message: string) => void
  ): Promise<BackendStreamResponse> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    let accumulatedData = '';
    let finalData: BackendStreamResponse | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedData += chunk;
        
        if (onProgress) {
          onProgress('Receiving response from AI agent...');
        }
      }
      
      console.log('Complete raw data received:', accumulatedData);
      
      if (onProgress) {
        onProgress('Parsing AI response...');
      }
      
      // Method 1: Try to parse by reconstructing JSON from data: lines
      finalData = this.attemptPartialJsonParse(accumulatedData);
      
      if (finalData) {
        console.log('Successfully parsed using partial JSON method');
        return finalData;
      }
      
      // Method 2: Try alternative parsing by cleaning up SSE format
      try {
        const lines = accumulatedData.split('\n');
        let jsonContent = '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data:')) {
            const content = trimmedLine.slice(5).trim();
            if (content) {
              jsonContent += content;
            }
          }
        }
        
        console.log('Alternative JSON content:', jsonContent);
        
        const parsedData = JSON.parse(jsonContent);
        if (this.isValidBackendResponse(parsedData)) {
          finalData = parsedData;
          console.log('Successfully parsed using alternative method');
        }
      } catch (parseError) {
        console.error('Alternative parsing failed:', parseError);
      }
      
      // Method 3: Last resort - try to fix and parse
      if (!finalData) {
        try {
          const lines = accumulatedData.split('\n');
          let jsonContent = '';
          
          for (const line of lines) {
            if (line.trim().startsWith('data:')) {
              jsonContent += line.trim().slice(5).trim();
            }
          }
          
          const fixedJson = this.attemptJsonFix(jsonContent);
          console.log('Fixed JSON attempt:', fixedJson);
          
          const parsedData = JSON.parse(fixedJson);
          if (this.isValidBackendResponse(parsedData)) {
            finalData = parsedData;
            console.log('Successfully parsed using JSON fix method');
          }
        } catch (fixError) {
          console.error('JSON fix method failed:', fixError);
        }
      }
      
      if (!finalData) {
        throw new Error(`No valid module data received from stream. Raw data: ${accumulatedData}`);
      }
      
      return finalData;
      
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Attempts to parse incomplete or streaming JSON data
   * @param rawData - The raw accumulated data from the stream
   * @returns BackendStreamResponse | null - Parsed data or null if unsuccessful
   */
  private attemptPartialJsonParse(rawData: string): BackendStreamResponse | null {
    try {
      // Extract all data: lines and reconstruct the JSON
      const dataLines = rawData
        .split('\n')
        .filter(line => line.trim().startsWith('data:'))
        .map(line => line.trim().slice(5).trim()) // Remove 'data:' prefix
        .filter(line => line.length > 0);
      
      console.log('Extracted data lines:', dataLines);
      
      // Join all lines to form complete JSON
      const jsonString = dataLines.join('');
      console.log('Reconstructed JSON string:', jsonString);
      
      // Parse the reconstructed JSON
      const parsed = JSON.parse(jsonString);
      
      if (this.isValidBackendResponse(parsed)) {
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.error('Partial JSON parse failed:', error);
      return null;
    }
  }

  /**
   * Attempts to fix common JSON formatting issues
   * @param jsonString - The potentially malformed JSON string
   * @returns string - Fixed JSON string
   */
  private attemptJsonFix(jsonString: string): string {
    let fixed = jsonString;
    
    // Remove any trailing commas
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    
    // Ensure proper line endings and spacing
    fixed = fixed.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Try to ensure the JSON is properly closed
    const openBraces = (fixed.match(/{/g) || []).length;
    const closeBraces = (fixed.match(/}/g) || []).length;
    
    if (openBraces > closeBraces) {
      // Add missing closing braces
      for (let i = 0; i < (openBraces - closeBraces); i++) {
        fixed += '}';
      }
    }
    
    return fixed;
  }

  /**
   * Validates if the parsed data matches the backend response format
   * @param data - The data to validate
   * @returns boolean - True if valid BackendStreamResponse
   */
  private isValidBackendResponse(data: any): data is BackendStreamResponse {
    console.log('Validating response data:', data);
    
    if (!data || typeof data !== 'object') {
      console.error('Data is not an object:', data);
      return false;
    }
    
    if (typeof data.module_name !== 'string') {
      console.error('module_name is missing or not string:', data.module_name);
      return false;
    }
    
    if (!data.metadata || typeof data.metadata !== 'object') {
      console.error('metadata is missing or not object:', data.metadata);
      return false;
    }
    
    const requiredMetadataFields = [
      'target_audience',
      'difficulty_level', 
      'estimated_completion_time',
      'keywords',
      'prerequisites'
    ];
    
    for (const field of requiredMetadataFields) {
      if (typeof data.metadata[field] !== 'string') {
        console.error(`metadata.${field} is missing or not string:`, data.metadata[field]);
        return false;
      }
    }
    
    if (typeof data.agent_notes !== 'string') {
      console.error('agent_notes is missing or not string:', data.agent_notes);
      return false;
    }
    
    if (typeof data.interpretation !== 'string') {
      console.error('interpretation is missing or not string:', data.interpretation);
      return false;
    }
    
    console.log('Response validation passed');
    return true;
  }

  /**
   * Transforms the backend response to our expected NewModuleResponse format
   * @param backendData - The data from the SSE stream
   * @returns NewModuleResponse - The formatted response
   */
  private transformStreamToResponse(backendData: BackendStreamResponse): NewModuleResponse {
    const now = new Date();
    
    return {
      moduleId: `MOD${Date.now()}`, // Generate a temporary ID
      moduleName: backendData.module_name,
      targetAudience: backendData.metadata.target_audience,
      difficultyLevel: backendData.metadata.difficulty_level,
      estimatedCompletionTime: backendData.metadata.estimated_completion_time,
      prerequisites: backendData.metadata.prerequisites,
      keywords: this.parseKeywordsToRecord(backendData.metadata.keywords),
      otherMetadata: this.parseOtherMetadata(backendData.metadata.other_metadata),
      agentNotes: backendData.agent_notes,
      interpretation: backendData.interpretation,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates a new module with timeout support for SSE
   * @param moduleData - The module data to be sent to the backend
   * @param timeoutMs - Timeout in milliseconds (default: 60 seconds)
   * @param onProgress - Optional progress callback
   * @returns Promise<NewModuleResponse> - The response from the backend
   */
  async createModuleWithTimeout(
    moduleData: NewModuleRequest, 
    timeoutMs: number = 60000,
    onProgress?: (message: string) => void
  ): Promise<NewModuleResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = `${this.baseURL}${this.endpoint}`;
      
      // Transform to backend format
      const backendRequest = this.transformToBackendRequest(moduleData);
      
      console.log('Creating module with timeout:', timeoutMs + 'ms');
      console.log('Sending request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(backendRequest),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const streamData = await this.handleSSEStream(response, onProgress);
      const moduleResponse = this.transformStreamToResponse(streamData);
      
      console.log('Module created successfully:', moduleResponse);
      return moduleResponse;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout: Server did not respond within ${timeoutMs / 1000} seconds.`);
      }
      
      console.error('Error creating module:', error);
      throw error instanceof Error 
        ? error 
        : new Error('An unexpected error occurred while creating the module.');
    }
  }

  /**
   * Validates the module request data before sending
   * @param moduleData - The module data to validate
   * @returns boolean - True if valid, throws error if invalid
   */
  validateModuleData(moduleData: NewModuleRequest): boolean {
    const requiredFields: (keyof NewModuleRequest)[] = [
      'moduleName',
      'targetAudience',
      'difficultyLevel',
      'estimatedCompletionTime',
      'prerequisites',
      'keywords',
      'otherMetadata',
      'agentNotes',
      'interpretation'
    ];

    for (const field of requiredFields) {
      if (!moduleData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate interpretation word count (max 100 words)
    const wordCount = moduleData.interpretation.trim().split(/\s+/).length;
    if (wordCount > 100) {
      throw new Error(`Interpretation must be 100 words or less. Current count: ${wordCount} words.`);
    }

    return true;
  }

  /**
   * Creates a new module with validation and progress tracking
   * @param moduleData - The module data to be sent to the backend
   * @param onProgress - Optional progress callback
   * @returns Promise<NewModuleResponse> - The response from the backend
   */
  async createModuleWithValidation(
    moduleData: NewModuleRequest,
    onProgress?: (message: string) => void
  ): Promise<NewModuleResponse> {
    // Validate data before sending
    this.validateModuleData(moduleData);
    
    // Create the module
    return this.createModuleWithTimeout(moduleData, 60000, onProgress);
  }

  /**
   * Transforms form data to the backend request format
   * @param formData - Raw form data from the component
   * @param accessToken - Optional access token
   * @returns NewModuleRequest - Formatted request data
   */
  transformFormDataToRequest(formData: any, accessToken: string = 'default-token'): NewModuleRequest {
    return {
      accessToken: accessToken,
      moduleName: formData.module_name?.trim() || '',
      targetAudience: formData.target_audience?.trim() || '',
      difficultyLevel: formData.difficulty_level || '',
      estimatedCompletionTime: formData.estimated_completion_time?.trim() || '',
      prerequisites: formData.prerequisites?.trim() || '',
      keywords: this.parseKeywords(formData.keywords?.trim() || ''),
      otherMetadata: this.parseOtherMetadata(formData.other_metadata?.trim() || ''),
      agentNotes: formData.agent_notes?.trim() || '',
      interpretation: formData.interpretation?.trim() || '',
    };
  }

  /**
   * Parses comma-separated keywords into a Record<string, string>
   * @param keywordsString - Comma-separated keywords string
   * @returns Record<string, string> - Parsed keywords object
   */
  private parseKeywords(keywordsString: string): Record<string, string> {
    if (!keywordsString) return {};
    
    const keywords: Record<string, string> = {};
    const keywordArray = keywordsString.split(',').map(k => k.trim()).filter(k => k);
    
    keywordArray.forEach((keyword, index) => {
      keywords[`keyword_${index + 1}`] = keyword;
    });
    
    return keywords;
  }

  /**
   * Parses keywords string from backend response into Record format
   * @param keywordsString - Keywords string from backend
   * @returns Record<string, string> - Parsed keywords object
   */
  private parseKeywordsToRecord(keywordsString: string): Record<string, string> {
    if (!keywordsString) return {};
    
    const keywords: Record<string, string> = {};
    const keywordArray = keywordsString.split(',').map(k => k.trim()).filter(k => k);
    
    keywordArray.forEach((keyword, index) => {
      keywords[`keyword_${index + 1}`] = keyword;
    });
    
    return keywords;
  }

  /**
   * Parses other metadata string into a Record<string, any>
   * @param metadataString - Metadata string
   * @returns Record<string, any> - Parsed metadata object
   */
  private parseOtherMetadata(metadataString: string): Record<string, any> {
    if (!metadataString) return {};
    
    const metadata: Record<string, any> = {};
    
    try {
      if (metadataString.startsWith('{') && metadataString.endsWith('}')) {
        return JSON.parse(metadataString);
      }
      
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
    } catch (error) {
      console.warn('Error parsing metadata, storing as raw string:', error);
      metadata.raw_metadata = metadataString;
    }
    
    return metadata;
  }

  /**
   * Gets the service configuration
   * @returns Object with service configuration
   */
  getConfig() {
    return {
      baseURL: this.baseURL,
      endpoint: this.endpoint,
      fullURL: `${this.baseURL}${this.endpoint}`,
    };
  }
}

// Export a singleton instance
export const newModuleService = new NewModuleService();
export default newModuleService;