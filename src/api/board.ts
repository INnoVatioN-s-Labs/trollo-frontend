import type { Board, BoardCreateRequest, BoardReorderRequest, ReturnMessage } from '@/types';
import apiClient from './client';

/** 보드 생성 (워크스페이스 내) */
export const createBoard = async (workspaceId: number, data: BoardCreateRequest): Promise<Board> => {
    const response = await apiClient.post<ReturnMessage<Board>>(`/workspaces/${workspaceId}/boards`, data);
    return response.data.data;
};

/** 보드 순서 변경 (드래그 앤 드롭) */
export const reorderBoard = async (workspaceId: number, boardId: number, data: BoardReorderRequest): Promise<void> => {
    await apiClient.patch(`/workspaces/${workspaceId}/boards/${boardId}/reorder`, data);
};

/** 보드 삭제 */
export const deleteBoard = async (workspaceId: number, boardId: number): Promise<void> => {
    await apiClient.delete(`/workspaces/${workspaceId}/boards/${boardId}`);
};
