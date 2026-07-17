import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../../../services/api';
import type {
	AuthResponse,
	CanvasDto,
	CanvasExportPayload,
	CanvasLibraryItem,
	RenameCanvasPayload,
	SaveCanvasPayload
} from '../../../types';

export const useGetCanvasLibrary = () => {
	return useQuery<CanvasLibraryItem[]>({
		queryKey: ['canvas-library'],
		queryFn: async () => {
			const response = await api.get<CanvasLibraryItem[]>('/api/canvas/library');
			return response.data;
		}
	});
};

export const useGetCanvas = (id?: string) => {
	return useQuery<CanvasDto>({
		queryKey: ['canvas', id ?? 'latest'],
		enabled: id !== null,
		queryFn: async () => {
			const endpoint = id ? `/api/canvas/${id}` : '/api/canvas';
			const response = await api.get<CanvasDto>(endpoint);
			return response.data;
		}
	});
};

export const useSaveCanvas = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: SaveCanvasPayload) => {
			const response = await api.post<CanvasDto>('/api/canvas', payload);
			return response.data;
		},
		onSuccess: (savedCanvas) => {
			queryClient.setQueryData(['canvas', savedCanvas._id ?? 'latest'], savedCanvas);
			queryClient.setQueryData(['canvas', 'latest'], savedCanvas);
			queryClient.invalidateQueries({ queryKey: ['canvas-library'] });
		}
	});
};

export const useRenameCanvas = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: RenameCanvasPayload) => {
			const response = await api.patch<CanvasDto>(`/api/canvas/${payload.id}/rename`, {
				name: payload.name
			});
			return response.data;
		},
		onSuccess: (canvas) => {
			queryClient.invalidateQueries({ queryKey: ['canvas-library'] });
			queryClient.setQueryData(['canvas', canvas._id ?? 'latest'], canvas);
			queryClient.invalidateQueries({ queryKey: ['canvas', 'latest'] });
		}
	});
};

export const useDeleteCanvas = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			await api.delete(`/api/canvas/${id}`);
			return id;
		},
		onSuccess: (deletedId) => {
			queryClient.invalidateQueries({ queryKey: ['canvas-library'] });
			queryClient.removeQueries({ queryKey: ['canvas', deletedId] });
			queryClient.invalidateQueries({ queryKey: ['canvas', 'latest'] });
		}
	});
};

export const useRegister = () => {
	return useMutation({
		mutationFn: async (payload: { email: string; password: string }) => {
			const response = await api.post<AuthResponse>('/api/auth/register', payload);
			return response.data;
		}
	});
};

export const useLogin = () => {
	return useMutation({
		mutationFn: async (payload: { email: string; password: string }) => {
			const response = await api.post<AuthResponse>('/api/auth/login', payload);
			return response.data;
		}
	});
};

export const useShareCanvas = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: { id: string; enabled: boolean }) => {
			const response = await api.post<{ _id: string; shareToken: string | null; shareUrl: string | null }>(
				`/api/canvas/${payload.id}/share`,
				{ enabled: payload.enabled }
			);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['canvas-library'] });
		}
	});
};

export const useExportCanvas = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await api.get<CanvasExportPayload>(`/api/canvas/${id}/export`);
			return response.data;
		}
	});
};

export const useImportCanvas = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: CanvasExportPayload | CanvasDto) => {
			const response = await api.post<CanvasDto>('/api/canvas/import', payload);
			return response.data;
		},
		onSuccess: (canvas) => {
			queryClient.invalidateQueries({ queryKey: ['canvas-library'] });
			queryClient.setQueryData(['canvas', canvas._id ?? 'latest'], canvas);
			queryClient.setQueryData(['canvas', 'latest'], canvas);
		}
	});
};
