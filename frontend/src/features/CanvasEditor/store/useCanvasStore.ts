import { create } from 'zustand';
import type { Edge } from '@xyflow/react';

import type { CanvasDto, SaveCanvasPayload, WorkflowNode, WorkflowNodeData } from '../../../types';

interface CanvasState {
	canvasId: string | null;
	name: string;
	nodes: WorkflowNode[];
	edges: Edge[];
	hydrated: boolean;
	dirty: boolean;
	lastSavedAt?: string;
	setNodes: (nodes: WorkflowNode[]) => void;
	setEdges: (edges: Edge[]) => void;
	setName: (name: string) => void;
	addNode: (node: WorkflowNode) => void;
	removeNode: (nodeId: string) => void;
	updateNodeContent: (nodeId: string, patch: Partial<WorkflowNodeData>) => void;
	duplicateAsNew: (name: string) => void;
	loadCanvas: (canvas: CanvasDto) => void;
	markSaved: (canvas: CanvasDto) => void;
	buildPayload: () => SaveCanvasPayload;
	resetCanvas: (name?: string) => void;
}

const initialName = 'default-workflow';

export const useCanvasStore = create<CanvasState>((set, get) => ({
	canvasId: null,
	name: initialName,
	nodes: [],
	edges: [],
	hydrated: false,
	dirty: false,
	lastSavedAt: undefined,
	setNodes: (nodes) => set({ nodes, dirty: true }),
	setEdges: (edges) => set({ edges, dirty: true }),
	setName: (name) => set({ name, dirty: true }),
	addNode: (node) => set((state) => ({ nodes: [...state.nodes, node], dirty: true })),
	removeNode: (nodeId) =>
		set((state) => ({
			nodes: state.nodes.filter((node) => node.id !== nodeId),
			edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
			dirty: true
		})),
	updateNodeContent: (nodeId, patch) =>
		set((state) => ({
			nodes: state.nodes.map((node) => (
				node.id === nodeId
					? {
						...node,
						data: {
							...node.data,
							...patch
						}
					}
					: node
			)),
			dirty: true
		})),
	duplicateAsNew: (name) =>
		set((state) => ({
			canvasId: null,
			name,
			nodes: state.nodes,
			edges: state.edges,
			hydrated: true,
			dirty: true,
			lastSavedAt: undefined
		})),
	loadCanvas: (canvas) =>
		set({
			canvasId: canvas._id ?? null,
			name: canvas.name || initialName,
			nodes: canvas.nodes || [],
			edges: canvas.edges || [],
			hydrated: true,
			dirty: false,
			lastSavedAt: canvas.updatedAt
		}),
	markSaved: (canvas) =>
		set({
			canvasId: canvas._id ?? null,
			name: canvas.name || initialName,
			nodes: canvas.nodes || [],
			edges: canvas.edges || [],
			hydrated: true,
			dirty: false,
			lastSavedAt: canvas.updatedAt
		}),
	buildPayload: () => {
		const state = get();
		return {
			id: state.canvasId ?? undefined,
			name: state.name,
			nodes: state.nodes,
			edges: state.edges
		};
	},
	resetCanvas: (name = initialName) =>
		set({
			canvasId: null,
			name,
			nodes: [],
			edges: [],
			hydrated: true,
			dirty: true,
			lastSavedAt: undefined
		})
}));
