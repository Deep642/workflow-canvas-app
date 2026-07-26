import { api } from './api';

export interface GenerateTaskParams {
  title: string;
  context?: string;
}

export interface GenerateTaskResponse {
  success: boolean;
  data: {
    description: string;
    embedding: number[];
    pointId: number;
  };
}

export interface SearchSimilarParams {
  description: string;
}

export interface SearchSimilarResponse {
  success: boolean;
  similar: Array<{
    score: number;
    task: {
      type: string;
      title: string;
      description: string;
      timestamp: string;
    };
  }>;
}

export interface RouteDecisionParams {
  nodeText: string;
  branches: string[];
}

export interface RouteDecisionResponse {
  success: boolean;
  result: {
    selectedBranch: number;
    reasoning: string;
  };
}

export interface GenerateAPIPayloadParams {
  description: string;
  method?: string;
}

export interface GenerateAPIPayloadResponse {
  success: boolean;
  payload: Record<string, any>;
}

export interface OCRImageParams {
  imageBase64: string;
  mimeType?: string;
}

export interface OCRImageResponse {
  success: boolean;
  data: {
    text: string;
  };
}

export const aiService = {
  generateTaskDescription: async (params: GenerateTaskParams): Promise<GenerateTaskResponse> => {
    return api.post('/api/ai/generate-task', params);
  },

  searchSimilarTasks: async (params: SearchSimilarParams): Promise<SearchSimilarResponse> => {
    return api.post('/api/ai/search-similar', params);
  },

  routeDecision: async (params: RouteDecisionParams): Promise<RouteDecisionResponse> => {
    return api.post('/api/ai/route-decision', params);
  },

  generateAPIPayload: async (params: GenerateAPIPayloadParams): Promise<GenerateAPIPayloadResponse> => {
    return api.post('/api/ai/generate-api-payload', params);
  },

  ocrImage: async (params: OCRImageParams): Promise<OCRImageResponse> => {
    return api.post('/api/ai/ocr', params);
  },
};