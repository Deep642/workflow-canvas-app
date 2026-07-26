import React, { useState } from 'react';
import { useSimilarTasks } from '../../hooks/useSimilarTasks';

interface SimilarTasksPanelProps {
  currentDescription: string;
  onTaskSelect: (task: any) => void;
}

export const SimilarTasksPanel: React.FC<SimilarTasksPanelProps> = ({
  currentDescription,
  onTaskSelect,
}) => {
  const { searchSimilar, loading, results } = useSimilarTasks();
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async () => {
    try {
      await searchSimilar({ description: currentDescription });
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && results.length === 0) {
            handleSearch();
          }
        }}
        style={{
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        {isOpen ? '▼' : '▶'} Similar Tasks ({results.length})
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '10px',
            maxHeight: '200px',
            overflowY: 'auto',
            background: '#f9f9f9',
          }}
        >
          {loading ? (
            <p>Searching similar tasks...</p>
          ) : results.length === 0 ? (
            <p style={{ color: '#999' }}>No similar tasks found</p>
          ) : (
            results.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px',
                  marginBottom: '8px',
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={() => onTaskSelect(item.task)}
              >
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                  {item.task.title}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {item.task.description}
                </div>
                <div style={{ fontSize: '10px', color: '#999' }}>
                  Similarity: {(item.score * 100).toFixed(0)}%
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
