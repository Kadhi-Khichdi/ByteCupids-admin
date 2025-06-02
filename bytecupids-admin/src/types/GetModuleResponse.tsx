export interface GetModuleResponse {
  message: string;
  success: boolean;
  code: number;
  timestamp: string;
  modules: {
    moduleId: string;
    moduleName: string;
    targetAudience: string;
    difficultyLevel: string;
    estimatedTime: number;
    prerequisites: string[];
    agentNotes: string;
    interpretation: string;
    noOfTopics: number;
    noOfSubTopics: number;
    organization: string;
    lastUpdateTime: string;
  }[];
}
