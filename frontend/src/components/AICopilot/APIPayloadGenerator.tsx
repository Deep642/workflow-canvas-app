import React, { useState } from 'react';
import { aiService } from '../../services/aiService';

interface APIPayloadGeneratorProps {
  apiDescription: string;
  method?: string;
  onPayloadGenerated: (payload: Record<string, any>) => void;
}

export const APIPayloadGenerator: React.FC<APIPayloadGeneratorProps> = ({
  apiDescription,
  method = 'GET',
  onPayloadGenerated,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<Record<string, any> | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.generateAPIPayload({
        description: apiDescription,
        method,
      });
      if (response.success) {
        setPayload(response.payload);
        onPayloadGenerated(response.payload);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to generate payload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          background: '#FF9800',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {loading ? '📝 Generating...' : '📝 Generate Payload'}
      </button>

      {error && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>
          Error: {error}
        </div>
      )}

      {payload && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            background: '#f5f5f5',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '11px',
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        >
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
