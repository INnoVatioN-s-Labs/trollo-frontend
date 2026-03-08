import type {
    ActivityLogResponse,
    JoinWorkspaceRequest,
    JoinWorkspaceResponse,
    KanbanView,
    ReturnMessage,
    TransferHostRequest,
    TransferHostResponse,
    Workspace,
    WorkspaceRequest,
} from '@/types';
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

/** 최근 활동 조회 */
export const getRecentActivities = async (workspaceId: number): Promise<ActivityLogResponse[]> => {
    const response = await apiClient.get<ReturnMessage<ActivityLogResponse[]>>(`/workspaces/${workspaceId}/activities`);
    return response.data.data;
};

/** 워크스페이스 참여 */
export const joinWorkspace = async (data: JoinWorkspaceRequest): Promise<JoinWorkspaceResponse> => {
    const response = await apiClient.post<ReturnMessage<JoinWorkspaceResponse>>('/workspaces/join', data);
    return response.data.data;
};

/** 멤버 강퇴 */
export const removeMember = async (workspaceId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
};

/** 호스트 양도 */
export const transferHost = async (workspaceId: number, data: TransferHostRequest): Promise<TransferHostResponse> => {
    const response = await apiClient.patch<ReturnMessage<TransferHostResponse>>(
        `/workspaces/${workspaceId}/transfer-host`,
        data
    );
    return response.data.data;
};
