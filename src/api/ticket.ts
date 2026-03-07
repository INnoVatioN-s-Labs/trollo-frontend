import type { ReturnMessage, Ticket, TicketCreateRequest, TicketMoveRequest } from '@/types';
import apiClient from './client';

/** 티켓 생성 (보드 내) */
export const createTicket = async (boardId: number, data: TicketCreateRequest): Promise<Ticket> => {
    const response = await apiClient.post<ReturnMessage<Ticket>>(`/boards/${boardId}/tickets`, data);
    return response.data.data;
};

/** 티켓 이동 (드래그 앤 드롭 - 보드 간/보드 내 이동) */
export const moveTicket = async (ticketId: number, data: TicketMoveRequest): Promise<void> => {
    await apiClient.patch(`/tickets/${ticketId}/move`, data);
};

/** 티켓 삭제 */
export const deleteTicket = async (ticketId: number): Promise<void> => {
    await apiClient.delete(`/tickets/${ticketId}`);
};

/** 티켓 수정 */
export const updateTicket = async (ticketId: number, data: Partial<TicketCreateRequest>): Promise<Ticket> => {
    const response = await apiClient.patch<ReturnMessage<Ticket>>(`/tickets/${ticketId}`, data);
    return response.data.data;
};
