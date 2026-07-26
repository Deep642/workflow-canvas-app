import { useState } from 'react';
import { aiService, SearchSimilarParams, SearchSimilarResponse } from '../services/aiService';

export const useSimilarTasks = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchSimilarResponse['similar'] | []>([]);

  const searchSimilar = async (params: SearchSimilarParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.searchSimilarTasks(params);
      setResults(response.similar);
      return response.similar;
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to search similar tasks';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { searchSimilar, loading, error, results };
};