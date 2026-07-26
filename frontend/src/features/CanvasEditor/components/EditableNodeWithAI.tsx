import { Handle, Position, type NodeProps } from '@xyflow/react';
import { type ChangeEvent } from 'react';
import { useState as useReactState } from 'react';
import { createWorker } from 'tesseract.js';

import { useCanvasStore } from '../store/useCanvasStore';
import type { NodeKind, WorkflowNode } from '../../../types';
import {
  GenerateButton,
  SimilarTasksPanel,
  DecisionRouter,
  APIPayloadGenerator,
} from '../../../components/AICopilot';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { NodeDetailsFlyout } from './NodeDetailsFlyout';

const NODE_KIND_META: Record<NodeKind, { label: string; icon: string }> = {
  task: { label: 'Task', icon: 'TK' },
  decision: { label: 'Decision', icon: 'IF' },
  api: { label: 'API', icon: 'API' },
  database: { label: 'Database', icon: 'DB' },
  note: { label: 'Note', icon: 'NT' }
};

export function EditableNodeWithAI({ id, data, selected }: NodeProps<WorkflowNode>) {
  const updateNodeContent = useCanvasStore((state) => state.updateNodeContent);
  const removeNode = useCanvasStore((state) => state.removeNode);
  const nodeKind = data.nodeKind || 'task';
  const [showAIPanel, setShowAIPanel] = useReactState(false);
  const [showDetailsFlyout, setShowDetailsFlyout] = useReactState(false);
  const [ocrLoading, setOcrLoading] = useReactState(false);
  const [ocrMessage, setOcrMessage] = useReactState<string | null>(null);

  const handleTextChange = (field: 'title' | 'description') => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNodeContent(id, { [field]: event.target.value });
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;

      updateNodeContent(id, { imageUrl: reader.result });
      setOcrLoading(true);
      setOcrMessage('Reading text from image...');

      try {
        const worker = await createWorker('eng');

        try {
          const recognition = await worker.recognize(file);
          const extractedText = recognition?.data?.text?.trim();

          if (extractedText && extractedText.toUpperCase() !== 'NO_TEXT_FOUND') {
            const currentDescription = data.description?.trim() || '';
            const nextDescription = currentDescription
              ? `${currentDescription}\n\n${extractedText}`
              : extractedText;
            updateNodeContent(id, { description: nextDescription });
            setOcrMessage('Text extracted into the description.');
          } else {
            setOcrMessage('No readable text found in that image.');
          }
        } finally {
          await worker.terminate();
        }
      } catch (error) {
        console.error('OCR failed:', error);
        setOcrMessage('OCR failed. Please try another image.');
      } finally {
        setOcrLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateNodeContent(id, { imageUrl: event.target.value });
  };

  const handleKindChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateNodeContent(id, { nodeKind: event.target.value as NodeKind });
  };

  const handleDelete = () => {
    removeNode(id);
  };

  const handleDescriptionUpdate = (newDesc: string) => {
    updateNodeContent(id, { description: newDesc });
  };

  const renderAIFeatures = () => {
    if (!showAIPanel) return null;

    return (
      <ErrorBoundary>
        <div style={{ marginTop: '12px', padding: '10px', background: '#f0f8ff', borderRadius: '4px' }}>
          {(nodeKind === 'task' || nodeKind === 'note') && (
            <>
              <GenerateButton
                nodeTitle={data.title}
                context={data.description}
                onGenerated={handleDescriptionUpdate}
              />
              <SimilarTasksPanel
                currentDescription={data.description}
                onTaskSelect={(task) => handleDescriptionUpdate(task.description)}
              />
            </>
          )}

          {nodeKind === 'decision' && (
            <DecisionRouter
              nodeText={data.description}
              branches={['Branch 1', 'Branch 2', 'Branch 3']}
              onRouted={(idx) => {
                console.log(`Routed to branch ${idx}`);
              }}
            />
          )}

          {nodeKind === 'api' && (
            <APIPayloadGenerator
              apiDescription={data.description}
              method="GET"
              onPayloadGenerated={(payload) => {
                console.log('Generated payload:', payload);
              }}
            />
          )}
        </div>
      </ErrorBoundary>
    );
  };

  const handleCopyShareLink = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setOcrMessage('Share link copied to clipboard.');
    } catch {
      setOcrMessage('Unable to copy share link.');
    }
  };

  return (
    <>
    <div className={`editable-node kind-${nodeKind} ${selected ? 'is-selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      
      <div className="editable-node__meta">
        <span className="editable-node__badge">{NODE_KIND_META[nodeKind].icon}</span>
        <select className="editable-node__kind nodrag" value={nodeKind} onChange={handleKindChange}>
          {Object.entries(NODE_KIND_META).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </select>

        <button
          className="nodrag"
          onClick={() => setShowDetailsFlyout(true)}
          title="Open block details"
          style={{
            marginLeft: '8px',
            background: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold',
          }}
        >
          ⤢ Maximize
        </button>
        
        {/* AI Toggle Button */}
        <button
          className="nodrag"
          onClick={() => setShowAIPanel(!showAIPanel)}
          title="Toggle AI features"
          style={{
            marginLeft: 'auto',
            background: showAIPanel ? '#667eea' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold',
          }}
        >
          {showAIPanel ? '✨ AI ON' : '✨ AI OFF'}
        </button>
      </div>

      <input
        className="editable-node__title nodrag"
        value={data.title}
        onChange={handleTextChange('title')}
        placeholder="Architecture node title"
      />
      
      <textarea
        className="editable-node__description nodrag"
        value={data.description}
        onChange={handleTextChange('description')}
        placeholder="Add notes or flow rules"
        rows={3}
      />

      {/* AI Features Panel */}
      {renderAIFeatures()}

      <input
        className="editable-node__image-input nodrag"
        value={data.imageUrl ?? ''}
        onChange={handleImageUrlChange}
        placeholder="Paste an image URL"
      />
      
      <label className="editable-node__upload nodrag">
        <span>{ocrLoading ? 'Scanning image...' : 'Upload image'}</span>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </label>

      {ocrMessage ? (
        <div style={{ marginTop: '6px', fontSize: '11px', color: '#4a5568' }}>{ocrMessage}</div>
      ) : null}

      <div className="editable-node__danger-zone">
        <button type="button" className="editable-node__delete nodrag" onClick={handleDelete}>
          Delete Block
        </button>
      </div>

      {data.imageUrl ? (
        <img className="editable-node__preview" src={data.imageUrl} alt={data.title || 'Node preview'} />
      ) : null}

      <Handle type="source" position={Position.Bottom} />
    </div>

    <NodeDetailsFlyout
      isOpen={showDetailsFlyout}
      onClose={() => setShowDetailsFlyout(false)}
      title={data.title}
      description={data.description}
      nodeKind={nodeKind}
      imageUrl={data.imageUrl}
      onTitleChange={handleTextChange('title')}
      onDescriptionChange={handleTextChange('description')}
      onKindChange={handleKindChange}
      onImageUrlChange={handleImageUrlChange}
      onImageUpload={handleImageUpload}
      onDelete={handleDelete}
      aiPanelContent={renderAIFeatures()}
      showAIPanel={showAIPanel}
      onToggleAIPanel={() => setShowAIPanel(!showAIPanel)}
      ocrLoading={ocrLoading}
      ocrMessage={ocrMessage}
      onCopyShareLink={handleCopyShareLink}
    />
    </>
  );
}
