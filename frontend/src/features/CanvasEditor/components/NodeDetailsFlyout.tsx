import type { ChangeEvent, ReactNode } from 'react';
import type { NodeKind } from '../../../types';

const NODE_KIND_META: Record<NodeKind, { label: string; icon: string }> = {
  task: { label: 'Task', icon: 'TK' },
  decision: { label: 'Decision', icon: 'IF' },
  api: { label: 'API', icon: 'API' },
  database: { label: 'Database', icon: 'DB' },
  note: { label: 'Note', icon: 'NT' }
};

interface NodeDetailsFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  nodeKind: NodeKind;
  imageUrl?: string;
  onTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onKindChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onImageUrlChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
  aiPanelContent?: ReactNode;
  showAIPanel: boolean;
  onToggleAIPanel: () => void;
  ocrLoading: boolean;
  ocrMessage?: string | null;
  onCopyShareLink?: () => void;
  shareLabel?: string;
}

export function NodeDetailsFlyout({
  isOpen,
  onClose,
  title,
  description,
  nodeKind,
  imageUrl,
  onTitleChange,
  onDescriptionChange,
  onKindChange,
  onImageUrlChange,
  onImageUpload,
  onDelete,
  aiPanelContent,
  showAIPanel,
  onToggleAIPanel,
  ocrLoading,
  ocrMessage,
  onCopyShareLink,
  shareLabel = 'Copy share link',
}: NodeDetailsFlyoutProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: '60vw',
          height: '80vh',
          background: '#fff',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          padding: '24px',
          position: 'inherit',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#667eea' }}>
              {NODE_KIND_META[nodeKind].label} details
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: '20px' }}>Block details</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#eef2ff',
              color: '#4c51bf',
              padding: '8px 12px',
              borderRadius: '999px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ✕ Close
          </button>
        </div>

        <div style={{ display: 'grid', gap: '16px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '22px' }}>{NODE_KIND_META[nodeKind].icon}</span>
            <select className="nodrag" value={nodeKind} onChange={onKindChange} style={{ minWidth: '140px' }}>
              {Object.entries(NODE_KIND_META).map(([value, meta]) => (
                <option key={value} value={value}>{meta.label}</option>
              ))}
            </select>
            <button
              type="button"
              className="nodrag"
              onClick={onToggleAIPanel}
              style={{
                marginLeft: 'auto',
                background: showAIPanel ? '#667eea' : '#cbd5e1',
                color: showAIPanel ? '#fff' : '#334155',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {showAIPanel ? '✨ AI ON' : '✨ AI OFF'}
            </button>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>Title</span>
              <input className="nodrag" value={title} onChange={onTitleChange} placeholder="Block title" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </label>

            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>Description</span>
              <textarea className="nodrag" value={description} onChange={onDescriptionChange} placeholder="Add the full details for this block" rows={8} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
            </label>
          </div>

          {aiPanelContent ? <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', background: '#f8fafc' }}>{aiPanelContent}</div> : null}

          <div style={{ display: 'grid', gap: '12px' }}>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>Image URL</span>
              <input className="nodrag" value={imageUrl ?? ''} onChange={onImageUrlChange} placeholder="Paste an image URL" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '10px', cursor: 'pointer', width: 'fit-content' }}>
              <span>{ocrLoading ? 'Scanning image...' : 'Upload image'}</span>
              <input type="file" accept="image/*" onChange={onImageUpload} style={{ display: 'none' }} />
            </label>

            {ocrMessage ? <div style={{ fontSize: '12px', color: '#475569' }}>{ocrMessage}</div> : null}

            {imageUrl ? (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', maxHeight: '260px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
                <img src={imageUrl} alt="Block preview" style={{ maxWidth: '100%', maxHeight: '260px', objectFit: 'contain' }} />
              </div>
            ) : null}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {onCopyShareLink ? (
              <button type="button" onClick={onCopyShareLink} style={{ background: '#0f766e', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 12px', cursor: 'pointer' }}>
                {shareLabel}
              </button>
            ) : null}

            <button type="button" onClick={onDelete} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 12px', cursor: 'pointer' }}>
              Delete Block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
