import { useState } from 'react';
import { aiService, RouteDecisionParams, RouteDecisionResponse } from '../services/aiService';

export const useDecisionRouting = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RouteDecisionResponse['result'] | null>(null);

  const routeDecision = async (params: RouteDecisionParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.routeDecision(params);
      setResult(response.result);
      return response.result;
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to route decision';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { routeDecision, loading, error, result };
};