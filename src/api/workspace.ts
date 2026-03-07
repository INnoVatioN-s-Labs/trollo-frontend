import type { KanbanView, ReturnMessage, Workspace, WorkspaceRequest } from '@/types';
import apiClient from './client';

/** 워크스페이스 목록 조회 */
export const getWorkspaces = async (): Promise<Workspace[]> => {
    const response = await apiClient.get<ReturnMessage<Workspace[]>>('/workspaces');
    return response.data.data;
};

/** 워크스페이스 생성 */
export const createWorkspace = async (data: WorkspaceRequest): Promise<Workspace> => {
    const response = await apiClient.post<ReturnMessage<Workspace>>('/workspaces', data);
    return response.data.data;
};

/** 칸반 통합 조회 (워크스페이스 내 보드 + 티켓 계층 구조) */
export const getKanbanView = async (workspaceId: number): Promise<KanbanView> => {
    const response = await apiClient.get<ReturnMessage<KanbanView>>(`/workspaces/${workspaceId}/kanban`);
    return response.data.data;
};

/** 워크스페이스 단건 조회 */
export const getWorkspaceById = async (workspaceId: number): Promise<Workspace> => {
    const response = await apiClient.get<ReturnMessage<Workspace>>(`/workspaces/${workspaceId}`);
    return response.data.data;
};

/** 워크스페이스 삭제 */
export const deleteWorkspace = async (workspaceId: number): Promise<void> => {
    await apiClient.delete(`/workspaces/${workspaceId}`);
};
