import React, { useState } from 'react';
import { useDecisionRouting } from '../../hooks/useDecisionRouting';

interface DecisionRouterProps {
  nodeText: string;
  branches: string[];
  onRouted: (selectedIndex: number, reasoning: string) => void;
}

export const DecisionRouter: React.FC<DecisionRouterProps> = ({
  nodeText,
  branches,
  onRouted,
}) => {
  const { routeDecision, loading, error, result } = useDecisionRouting();
  const [showResult, setShowResult] = useState(false);

  const handleRoute = async () => {
    try {
      const res = await routeDecision({
        nodeText,
        branches,
      });
      if (res) {
        setShowResult(true);
        onRouted(res.selectedBranch, res.reasoning);
      }
    } catch (err) {
      console.error('Routing failed:', err);
    }
  };

  return (
    <div style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
      <button
        onClick={handleRoute}
        disabled={loading}
        style={{
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 14px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {loading ? '🤖 Routing...' : '🤖 Route Decision'}
      </button>

      {error && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>
          Error: {error}
        </div>
      )}

      {showResult && result && (
        <div style={{ marginTop: '10px', padding: '8px', background: 'white', borderRadius: '4px' }}>
          <div style={{ fontWeight: 'bold', color: '#2196F3' }}>
            Suggested: {branches[result.selectedBranch]}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Reasoning: {result.reasoning}
          </div>
        </div>
      )}
    </div>
  );
};
