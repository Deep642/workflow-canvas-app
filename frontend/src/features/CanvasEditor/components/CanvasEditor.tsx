import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  MiniMap,
  type NodeTypes,
  ReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';

import type { CanvasDto, NodeKind, WorkflowNode, WorkflowNodeData } from '../../../types';
import {
  useDeleteCanvas,
  useExportCanvas,
  useGetCanvas,
  useGetCanvasLibrary,
  useImportCanvas,
  useRenameCanvas,
  useSaveCanvas,
  useShareCanvas
} from '../hooks/useCanvasData';
import { useCanvasStore } from '../store/useCanvasStore';
import { EditableNodeWithAI } from './EditableNodeWithAI';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

const nodeTypes: NodeTypes = {
  editable: (props) => (
    <ErrorBoundary>
      <EditableNodeWithAI {...props} />
    </ErrorBoundary>
  ),
};

interface NodeTemplate {
  id: string;
  label: string;
  nodeKind: NodeKind;
  title: string;
  description: string;
  imageUrl?: string;
}

const NODE_KIND_META: Record<NodeKind, { label: string; prefix: string }> = {
  task: { label: 'Task', prefix: 'Task' },
  decision: { label: 'Decision', prefix: 'Decision' },
  api: { label: 'API', prefix: 'API' },
  database: { label: 'Database', prefix: 'DB' },
  note: { label: 'Note', prefix: 'Note' }
};

const NODE_TEMPLATES: NodeTemplate[] = [
  {
    id: 'onboarding-flow',
    label: 'Customer Onboarding',
    nodeKind: 'task',
    title: 'Customer Onboarding Intake',
    description: 'Collect profile data, required documents, and compliance confirmation.',
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=420&q=60'
  },
  {
    id: 'risk-check',
    label: 'Risk Decision Gate',
    nodeKind: 'decision',
    title: 'Risk Scoring Decision',
    description: 'Branch to manual review if score > 0.65, otherwise continue auto-approval.'
  },
  {
    id: 'payments-api',
    label: 'Payment API Call',
    nodeKind: 'api',
    title: 'POST /payments/authorize',
    description: 'Send transaction payload and capture authorization code for audit logs.'
  },
  {
    id: 'audit-storage',
    label: 'Audit Storage',
    nodeKind: 'database',
    title: 'Write Audit Trail',
    description: 'Persist immutable execution events, actor identity, and result metadata.'
  },
  {
    id: 'ops-note',
    label: 'Ops Checklist Note',
    nodeKind: 'note',
    title: 'Operational Note',
    description: 'Escalate to on-call if retries exceed 3 in any 10 minute window.'
  }
];

const createNode = (count: number, nodeKind: NodeKind): WorkflowNode => ({
  id: `node-${count}`,
  position: {
    x: 80 + (count % 3) * 220,
    y: 80 + Math.floor(count / 3) * 120
  },
  data: {
    title: `${NODE_KIND_META[nodeKind].prefix} ${count}`,
    description: 'Define the responsibility of this workflow step.',
    imageUrl: '',
    nodeKind
  },
  type: 'editable'
});

const buildNewWorkflowName = () => `architecture-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}`;

const formatTimestamp = (value?: string) => {
  if (!value) {
    return 'Unsaved';
  }

  return new Date(value).toLocaleString();
};

const toEditableNodes = (nodes: CanvasDto['nodes']): WorkflowNode[] => nodes.map((node) => ({
  ...node,
  type: 'editable',
  data: {
    title: typeof node.data?.title === 'string' ? node.data.title : typeof node.data?.label === 'string' ? node.data.label : node.id,
    description: typeof node.data?.description === 'string' ? node.data.description : '',
    imageUrl: typeof node.data?.imageUrl === 'string' ? node.data.imageUrl : '',
    nodeKind: typeof node.data?.nodeKind === 'string' ? (node.data.nodeKind as NodeKind) : 'task'
  }
}));

const normalizeCanvas = (canvas: CanvasDto): CanvasDto => ({
  ...canvas,
  nodes: toEditableNodes(canvas.nodes)
});

export function CanvasEditor() {
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | undefined>(undefined);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(NODE_TEMPLATES[0].id);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const canvasId = useCanvasStore((state) => state.canvasId);
  const name = useCanvasStore((state) => state.name);
  const nodes = useCanvasStore((state) => state.nodes);
  const edges = useCanvasStore((state) => state.edges);
  const hydrated = useCanvasStore((state) => state.hydrated);
  const dirty = useCanvasStore((state) => state.dirty);
  const lastSavedAt = useCanvasStore((state) => state.lastSavedAt);

  const setNodes = useCanvasStore((state) => state.setNodes);
  const setEdges = useCanvasStore((state) => state.setEdges);
  const setName = useCanvasStore((state) => state.setName);
  const loadCanvas = useCanvasStore((state) => state.loadCanvas);
  const markSaved = useCanvasStore((state) => state.markSaved);
  const buildPayload = useCanvasStore((state) => state.buildPayload);
  const addNode = useCanvasStore((state) => state.addNode);
  const duplicateAsNew = useCanvasStore((state) => state.duplicateAsNew);
  const resetCanvas = useCanvasStore((state) => state.resetCanvas);

  const { data: library = [] } = useGetCanvasLibrary();
  const { data: latestCanvas, isLoading, isError, error } = useGetCanvas(undefined);
  const { data: selectedCanvas } = useGetCanvas(selectedCanvasId);
  const saveMutation = useSaveCanvas();
  const renameMutation = useRenameCanvas();
  const deleteMutation = useDeleteCanvas();
  const shareMutation = useShareCanvas();
  const exportMutation = useExportCanvas();
  const importMutation = useImportCanvas();

  useEffect(() => {
    if (latestCanvas && !hydrated) {
      loadCanvas(normalizeCanvas(latestCanvas));
    }
  }, [latestCanvas, hydrated, loadCanvas]);

  useEffect(() => {
    if (selectedCanvas && selectedCanvasId === selectedCanvas._id) {
      loadCanvas(normalizeCanvas(selectedCanvas));
    }
  }, [selectedCanvas, selectedCanvasId, loadCanvas]);

  useEffect(() => {
    if (!dirty || !canvasId || saveMutation.isPending || renameMutation.isPending || deleteMutation.isPending || shareMutation.isPending || importMutation.isPending) {
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const saved = await saveMutation.mutateAsync(buildPayload());
        markSaved(normalizeCanvas(saved));
      } catch {
        // Mutation error is surfaced by TanStack state in the toolbar.
      }
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [
    dirty,
    canvasId,
    saveMutation,
    renameMutation.isPending,
    deleteMutation.isPending,
    shareMutation.isPending,
    importMutation.isPending,
    buildPayload,
    markSaved
  ]);

  const onNodesChange = useCallback(
    (changes: NodeChange<WorkflowNode>[]) => {
      setNodes(applyNodeChanges<WorkflowNode>(changes, nodes));
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges, setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(addEdge(connection, edges));
    },
    [edges, setEdges]
  );

  const handleLibrarySelect = (id: string) => {
    setSelectedCanvasId(id);
  };

  const handleAddNode = (nodeKind: NodeKind = 'task') => {
    addNode(createNode(nodes.length + 1, nodeKind));
  };

  const handleAddTemplateNode = () => {
    const template = NODE_TEMPLATES.find((entry) => entry.id === selectedTemplateId) || NODE_TEMPLATES[0];
    addNode({
      ...createNode(nodes.length + 1, template.nodeKind),
      data: {
        title: template.title,
        description: template.description,
        imageUrl: template.imageUrl || '',
        nodeKind: template.nodeKind
      }
    });
  };

  const handleSave = async () => {
    const saved = await saveMutation.mutateAsync(buildPayload());
    markSaved(normalizeCanvas(saved));
  };

  const handleSaveAsNew = async () => {
    const nextName = name.trim() || buildNewWorkflowName();
    duplicateAsNew(nextName);
    const saved = await saveMutation.mutateAsync({
      ...buildPayload(),
      id: undefined,
      name: nextName
    });
    setSelectedCanvasId(saved._id);
    markSaved(normalizeCanvas(saved));
  };

  const handleRename = async (id: string, currentName: string) => {
    const nextName = window.prompt('Rename architecture', currentName);
    if (!nextName || !nextName.trim() || nextName.trim() === currentName) {
      return;
    }

    const renamed = await renameMutation.mutateAsync({ id, name: nextName.trim() });
    if (canvasId === id || selectedCanvasId === id) {
      setName(renamed.name);
      markSaved(normalizeCanvas(renamed));
    }
  };

  const handleDelete = async (id: string, canvasName: string) => {
    const shouldDelete = window.confirm(`Delete architecture "${canvasName}"? This cannot be undone.`);
    if (!shouldDelete) {
      return;
    }

    await deleteMutation.mutateAsync(id);
    if (canvasId === id || selectedCanvasId === id) {
      setSelectedCanvasId(undefined);
      resetCanvas(buildNewWorkflowName());
    }
  };

  const handleShare = async (id: string, enabled: boolean) => {
    const shared = await shareMutation.mutateAsync({ id, enabled });
    if (shared.shareUrl) {
      await navigator.clipboard.writeText(shared.shareUrl);
      window.alert('Share link copied to clipboard');
      return;
    }

    window.alert('Sharing disabled for this architecture');
  };

  const handleExport = async (id: string) => {
    const payload = await exportMutation.mutateAsync(id);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${payload.canvas.name || 'architecture'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const imported = await importMutation.mutateAsync(parsed);
      setSelectedCanvasId(imported._id);
      markSaved(normalizeCanvas(imported));
    } catch {
      window.alert('Invalid import file format');
    } finally {
      event.target.value = '';
    }
  };

  const handleCreateNew = () => {
    setSelectedCanvasId(undefined);
    resetCanvas(buildNewWorkflowName());
  };

  const handleReset = () => {
    setSelectedCanvasId(undefined);
    resetCanvas(name);
  };

  const activeLibraryId = selectedCanvasId ?? canvasId ?? undefined;
  const hasUnsavedDraft = dirty && !canvasId;
  const savingInProgress =
    saveMutation.isPending ||
    renameMutation.isPending ||
    deleteMutation.isPending ||
    shareMutation.isPending ||
    exportMutation.isPending ||
    importMutation.isPending;

  return (
    <section className="editor-shell">
      <aside className="library-panel">
        <div className="library-panel__header">
          <div>
            <p className="panel-kicker">Saved architectures</p>
            <h2>Workflow library</h2>
          </div>
          <button type="button" onClick={handleCreateNew}>New Architecture</button>
        </div>
        <div className="library-list">
          {library.map((canvas) => (
            <button
              key={canvas._id}
              type="button"
              className={`library-card ${activeLibraryId === canvas._id ? 'is-active' : ''}`}
              onClick={() => handleLibrarySelect(canvas._id)}
            >
              <div className="library-card__head">
                <strong>{canvas.name}</strong>
                <span>{canvas.nodeCount} nodes · {canvas.edgeCount} edges</span>
              </div>
              <span>Updated {formatTimestamp(canvas.updatedAt)}</span>
              <div className="library-card__actions">
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleRename(canvas._id, canvas.name);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      void handleRename(canvas._id, canvas.name);
                    }
                  }}
                >
                  Rename
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleShare(canvas._id, !canvas.shared);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      void handleShare(canvas._id, !canvas.shared);
                    }
                  }}
                >
                  {canvas.shared ? 'Unshare' : 'Share'}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleExport(canvas._id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      void handleExport(canvas._id);
                    }
                  }}
                >
                  Export
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleDelete(canvas._id, canvas.name);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      void handleDelete(canvas._id, canvas.name);
                    }
                  }}
                >
                  Delete
                </span>
              </div>
            </button>
          ))}
          {!library.length ? (
            <div className="library-empty">No saved architecture yet. Create one and save it here.</div>
          ) : null}
        </div>
      </aside>

      <div className="editor-main">
        <div className="toolbar">
          <label className="workflow-name-field">
            <span>Workflow name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter architecture name" />
          </label>
          <button type="button" onClick={() => handleAddNode('task')}>Add Task</button>
          <button type="button" onClick={() => handleAddNode('decision')}>Add Decision</button>
          <button type="button" onClick={() => handleAddNode('api')}>Add API</button>
          <button type="button" onClick={() => handleAddNode('database')}>Add DB</button>
          <button type="button" onClick={() => handleAddNode('note')}>Add Note</button>
          <label className="template-picker">
            <span>Template</span>
            <select
              value={selectedTemplateId}
              onChange={(event) => setSelectedTemplateId(event.target.value)}
            >
              {NODE_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>{template.label}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={handleAddTemplateNode}>Add Template</button>
          <button type="button" onClick={handleSave} disabled={savingInProgress}>
            {savingInProgress ? 'Saving...' : 'Save Layout'}
          </button>
          <button type="button" onClick={handleSaveAsNew} disabled={savingInProgress}>
            Save As New
          </button>
          <button type="button" onClick={handleImportClick} disabled={savingInProgress}>Import JSON</button>
          <input ref={importInputRef} type="file" accept="application/json" hidden onChange={handleImportFile} />
          <button type="button" onClick={handleReset}>Reset Canvas</button>
          <div className="toolbar-state">
            <span>{isLoading ? 'Hydrating canvas...' : 'Canvas ready'}</span>
            {hasUnsavedDraft ? <span>Unsaved draft</span> : null}
            {!hasUnsavedDraft && dirty ? <span>Unsaved changes</span> : null}
            {!dirty && lastSavedAt ? <span>Saved at {formatTimestamp(lastSavedAt)}</span> : null}
            {isError ? <span>Load failed</span> : null}
            {saveMutation.isError || renameMutation.isError || deleteMutation.isError ? <span>Save failed</span> : null}
          </div>
        </div>

        {isError ? (
          <p className="error-message">{(error as Error).message}</p>
        ) : null}

        <div className="canvas-wrap">
          <ReactFlow
            <WorkflowNode, Edge>
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Controls />
            <MiniMap zoomable pannable />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          </ReactFlow>
        </div>
      </div>
    </section>
  );
}
