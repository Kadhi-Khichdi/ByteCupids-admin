export interface SubTopic {
  subTopicId: string;
  moduleId: string;
  topicId: string;
  subTopicName: string;
  sequenceNumber: number;
  deleted: boolean; // Changed from isDeleted to deleted
}

export interface GetSubtopicsRequest {
  moduleId: string;
  accessToken: string;
}

export interface GetSubtopicsResponse {
  subTopics: SubTopic[]; // Changed from subtopics to subTopics
  message: string;
  timestamp: string;
  code: number;
  success: boolean;
}

export interface GenerateSubtopicsRequest {
  moduleId: string;
  topicId: string;
  accessToken: string;
}

export interface SaveSubtopicsRequest {
  moduleId: string;
  topicId: string;
  accessToken: string;
  subtopics: string[]; // Array of subtopic names
}