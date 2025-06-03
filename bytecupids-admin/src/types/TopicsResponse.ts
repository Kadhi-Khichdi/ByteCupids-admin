export interface Topic {
  topicId: string;
  moduleId: string;
  topicName: string;
  deleted: boolean;
}

export interface GetTopicsRequest {
  moduleId: string;
  accessToken: string;
}

export interface GetTopicsResponse {
  topics: Topic[];
  message: string;
  timestamp: string;
  code: number;
  success: boolean;
}

export interface GenerateTopicsRequest {
  moduleId: string;
  accessToken: string;
  // Add any additional fields needed for topic generation
}

export interface SaveTopicsRequest {
  moduleId: string;
  accessToken: string;
  topics: string[]; // Array of topic names
}