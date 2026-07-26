import React from 'react';
import { useAIGeneration } from '../../hooks/useAIGeneration';

interface GenerateButtonProps {
  nodeTitle: string;
  context?: string;
  onGenerated: (description: string) => void;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  nodeTitle,
  context,
  onGenerated,
}) => {
  const { generateDescription, loading, error } = useAIGeneration();

  const handleClick = async () => {
    try {
      const result = await generateDescription({
        title: nodeTitle,
        context,
      });
      if (result?.description) {
        onGenerated(result.description);
      }
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={handleClick}
        disabled={loading}
        title="Generate description with AI"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? '✨ Generating...' : '✨ Generate'}
      </button>
      {error && (
        <span style={{ color: 'red', fontSize: '12px' }}>Error: {error}</span>
      )}
    </div>
  );
};
