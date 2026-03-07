import type { ReturnMessage, Ticket, TicketCreateRequest, MoveTicketRequest, UpdateTicketRequest } from '@/types';
import apiClient from './client';

/** 티켓 생성 */
export const createTicket = async (
    workspaceId: number,
    boardId: number,
    data: TicketCreateRequest
): Promise<Ticket> => {
    const response = await apiClient.post<ReturnMessage<Ticket>>(
        `/workspaces/${workspaceId}/boards/${boardId}/tickets`,
        data
    );
    return response.data.data;
};

/** 티켓 삭제 */
export const deleteTicket = async (workspaceId: number, boardId: number, ticketId: number): Promise<void> => {
    await apiClient.delete(`/workspaces/${workspaceId}/boards/${boardId}/tickets/${ticketId}`);
};

/** 티켓 정보 수정 */
export const updateTicket = async (
    workspaceId: number,
    boardId: number,
    ticketId: number,
    data: UpdateTicketRequest
): Promise<Ticket> => {
    const response = await apiClient.patch<ReturnMessage<Ticket>>(
        `/workspaces/${workspaceId}/boards/${boardId}/tickets/${ticketId}`,
        data
    );
    return response.data.data;
};

/** 티켓 이동 (드래그 앤 드롭) */
export const moveTicket = async (
    workspaceId: number,
    boardId: number,
    ticketId: number,
    data: MoveTicketRequest
): Promise<void> => {
    await apiClient.patch(`/workspaces/${workspaceId}/boards/${boardId}/tickets/${ticketId}/move`, data);
};
