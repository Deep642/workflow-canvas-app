import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useState, type ChangeEvent } from 'react';

import { useCanvasStore } from '../store/useCanvasStore';
import type { NodeKind, WorkflowNode } from '../../../types';

const NODE_KIND_META: Record<NodeKind, { label: string; icon: string }> = {
  task: { label: 'Task', icon: 'TK' },
  decision: { label: 'Decision', icon: 'IF' },
  api: { label: 'API', icon: 'API' },
  database: { label: 'Database', icon: 'DB' },
  note: { label: 'Note', icon: 'NT' }
};

export function EditableNode({ id, data, selected }: NodeProps<WorkflowNode>) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [zIndex, setZIndex] = useState(9999);
  const updateNodeContent = useCanvasStore((state) => state.updateNodeContent);
  const removeNode = useCanvasStore((state) => state.removeNode);
  const nodeKind = data.nodeKind || 'task';

  const handleMaximizedClick = () => {
    if (isMaximized) {
      setZIndex(Math.floor(Date.now() % 100000));
    }
  };

  const handleTextChange = (field: 'title' | 'description') => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNodeContent(id, { [field]: event.target.value });
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateNodeContent(id, { imageUrl: reader.result });
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

  return (
    <div 
      className={`editable-node kind-${nodeKind} ${selected ? 'is-selected' : ''} ${isMaximized ? 'editable-node--maximized' : ''}`}
      onClick={handleMaximizedClick}
      style={isMaximized ? { zIndex } : undefined}
    >
      {isMaximized && (
        <button
          type="button"
          className="editable-node__close nodrag"
          onClick={() => setIsMaximized(false)}
          title="Exit fullscreen"
          aria-label="Close fullscreen"
        >
          ✕
        </button>
      )}
      {!isMaximized && (
        <button
          type="button"
          className="editable-node__maximize nodrag"
          onClick={() => setIsMaximized(true)}
          title="Maximize"
          aria-label="Maximize node"
        >
          ⛶
        </button>
      )}
      <Handle type="target" position={Position.Top} />
      <div className="editable-node__meta">
        <span className="editable-node__badge">{NODE_KIND_META[nodeKind].icon}</span>
        <select className="editable-node__kind nodrag" value={nodeKind} onChange={handleKindChange}>
          {Object.entries(NODE_KIND_META).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </select>
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
      <input
        className="editable-node__image-input nodrag"
        value={data.imageUrl ?? ''}
        onChange={handleImageUrlChange}
        placeholder="Paste an image URL"
      />
      <label className="editable-node__upload nodrag">
        <span>Upload image</span>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </label>
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
  );
}
