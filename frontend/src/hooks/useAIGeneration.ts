import { useState } from 'react';
import { aiService, GenerateTaskParams, GenerateTaskResponse } from '../services/aiService';

export const useAIGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateTaskResponse['data'] | null>(null);

  const generateDescription = async (params: GenerateTaskParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.generateTaskDescription(params);
      setResult(response.data);
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to generate description';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateDescription, loading, error, result };
};