import type { Edge, Node } from '@xyflow/react';

export type NodeKind = 'task' | 'decision' | 'api' | 'database' | 'note';

export interface WorkflowNodeData extends Record<string, unknown> {
	title: string;
	description: string;
	imageUrl?: string;
	nodeKind: NodeKind;
}

export type WorkflowNode = Node<WorkflowNodeData, 'editable'>;

export interface CanvasDto {
	_id?: string;
	name: string;
	nodes: WorkflowNode[];
	edges: Edge[];
	createdAt?: string;
	updatedAt?: string;
}

export interface CanvasLibraryItem {
	_id: string;
	name: string;
	createdAt?: string;
	updatedAt?: string;
	nodeCount: number;
	edgeCount: number;
	shared?: boolean;
}

export interface SaveCanvasPayload {
	id?: string;
	name: string;
	nodes: WorkflowNode[];
	edges: Edge[];
}

export interface RenameCanvasPayload {
	id: string;
	name: string;
}

export interface AuthUser {
	id: string;
	email: string;
}

export interface AuthResponse {
	token: string;
	user: AuthUser;
}

export interface CanvasExportPayload {
	version: number;
	type: string;
	exportedAt: string;
	canvas: {
		name: string;
		nodes: WorkflowNode[];
		edges: Edge[];
	};
}
