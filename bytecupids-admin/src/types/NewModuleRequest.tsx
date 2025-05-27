export interface NewModuleRequest {
  accessToken: string;
  moduleName: string;
  targetAudience: string;
  difficultyLevel: string;
  estimatedCompletionTime: string;
  prerequisites: string;
  keywords: Record<string, string>;
  otherMetadata: Record<string, any>;
  agentNotes: string;
  interpretation: string;
}