import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Ticket } from '@/types';
import { MoreVertical, Trash2, MessageSquare, Paperclip, CheckSquare, Clock } from 'lucide-react';

interface TicketCardProps {
    ticket: Ticket;
    onDelete: (ticketId: number) => void;
    onEdit: (ticket: Ticket) => void;
    onDragStart: (e: React.DragEvent, ticket: Ticket) => void;
}

/**
 * 티켓 카드 컴포넌트 (디자인 시안: trollo_main_board_cleaned)
 * - 상단 컬러 라벨 바 (짧은 색상 스트라이프)
 * - 제목
 * - 마감일 뱃지, 체크리스트 카운트, 어사이니 아바타
 */
const TicketCard = ({ ticket, onDelete, onEdit, onDragStart }: TicketCardProps) => {
    const labels = ticket.labels || [];
    const assignees = ticket.assignees || [];
    const hasChecklist = ticket.checklist && ticket.checklist.length > 0;
    const checkedCount = ticket.checklist?.filter((i) => i.checked).length || 0;
    const totalCount = ticket.checklist?.length || 0;
    const hasDueDate = !!ticket.dueDate;
    const isLate = hasDueDate && new Date(ticket.dueDate!) < new Date();

    return (
        <Card
            className="bg-white rounded-lg shadow-sm hover:shadow-md border-0 cursor-pointer transition-all duration-150 group"
            draggable
            onDragStart={(e) => onDragStart(e, ticket)}
            onClick={() => onEdit(ticket)}
        >
            <div className="p-3">
                {/* 컬러 라벨 바 (시안처럼 짧은 색상 스트라이프) */}
                {labels.length > 0 && (
                    <div className="flex gap-1 mb-2">
                        {labels.map((label) => (
                            <div
                                key={label.id}
                                className="h-2 w-10 rounded-full"
                                style={{ backgroundColor: label.color }}
                                title={label.name}
                            />
                        ))}
                    </div>
                )}

                {/* 제목 + 메뉴 */}
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-theme-dark font-medium leading-snug flex-1">{ticket.title}</p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-theme-gray-100 transition-all shrink-0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="w-3.5 h-3.5 text-theme-gray-500" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(ticket.id);
                                }}
                                className="text-destructive focus:text-destructive text-xs"
                            >
                                <Trash2 className="mr-2 h-3 w-3" />
                                삭제
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* 메타 정보 (마감일, 체크리스트, 댓글, 첨부파일, 어사이니) */}
                {(hasDueDate ||
                    hasChecklist ||
                    ticket.commentCount ||
                    ticket.attachmentCount ||
                    assignees.length > 0) && (
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* 마감일 */}
                            {hasDueDate && (
                                <Badge
                                    className={`text-[10px] px-1.5 py-0.5 font-medium gap-1 ${
                                        isLate
                                            ? 'bg-red-100 text-red-600 border-red-200'
                                            : 'bg-theme-gray-100 text-theme-gray-500 border-theme-gray-100'
                                    }`}
                                    variant="outline"
                                >
                                    <Clock className="w-3 h-3" />
                                    {new Date(ticket.dueDate!).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </Badge>
                            )}

                            {/* 체크리스트 */}
                            {hasChecklist && (
                                <span
                                    className={`flex items-center gap-0.5 text-[10px] font-medium ${
                                        checkedCount === totalCount ? 'text-label-green' : 'text-theme-gray-500'
                                    }`}
                                >
                                    <CheckSquare className="w-3 h-3" />
                                    {checkedCount}/{totalCount}
                                </span>
                            )}

                            {/* 댓글 */}
                            {(ticket.commentCount ?? 0) > 0 && (
                                <span className="flex items-center gap-0.5 text-[10px] text-theme-gray-500">
                                    <MessageSquare className="w-3 h-3" />
                                    {ticket.commentCount}
                                </span>
                            )}

                            {/* 첨부파일 */}
                            {(ticket.attachmentCount ?? 0) > 0 && (
                                <span className="flex items-center gap-0.5 text-[10px] text-theme-gray-500">
                                    <Paperclip className="w-3 h-3" />
                                    {ticket.attachmentCount}
                                </span>
                            )}
                        </div>

                        {/* 어사이니 아바타 */}
                        {assignees.length > 0 && (
                            <div className="flex -space-x-1.5">
                                {assignees.slice(0, 2).map((a) => {
                                    const colors = [
                                        'bg-green-500',
                                        'bg-blue-500',
                                        'bg-red-500',
                                        'bg-purple-500',
                                        'bg-amber-500',
                                    ];
                                    const colorIndex = a.nickname.charCodeAt(0) % colors.length;
                                    return (
                                        <div
                                            key={a.id}
                                            className={`w-7 h-7 rounded-full ${colors[colorIndex]} flex items-center justify-center text-[10px] font-bold text-white border-2 border-white`}
                                            title={a.nickname}
                                        >
                                            {a.nickname.substring(0, 2)}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default TicketCard;
