import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TicketCard from './TicketCard';
import type { Board, Ticket } from '@/types';
import { Plus, MoreHorizontal, Trash2, X } from 'lucide-react';

interface BoardColumnProps {
    board: Board;
    onCreateTicket: (boardId: number, title: string, description?: string) => void;
    onDeleteTicket: (ticketId: number) => void;
    onEditTicket: (ticket: Ticket) => void;
    onDeleteBoard: (boardId: number) => void;
    /** 티켓 드래그 시작 */
    onTicketDragStart: (e: React.DragEvent, ticket: Ticket, sourceBoardId: number) => void;
    /** 드롭 영역 이벤트 */
    onTicketDrop: (e: React.DragEvent, targetBoardId: number, targetPosition: number) => void;
}

/**
 * 칸반 보드 열 컴포넌트 (디자인 시안: trollo_main_board_cleaned)
 * - 반투명 흰색 배경 (글래스몰피즘)
 * - 하단 "+ Add a card" 버튼
 */
const BoardColumn = ({
    board,
    onCreateTicket,
    onDeleteTicket,
    onEditTicket,
    onDeleteBoard,
    onTicketDragStart,
    onTicketDrop,
}: BoardColumnProps) => {
    const [isAddingTicket, setIsAddingTicket] = useState(false);
    const [newTicketTitle, setNewTicketTitle] = useState('');
    const [newTicketDesc, setNewTicketDesc] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    // 티켓 추가 폼 제출
    const handleAddTicket = () => {
        if (!newTicketTitle.trim()) return;
        onCreateTicket(board.id, newTicketTitle.trim(), newTicketDesc.trim() || undefined);
        setNewTicketTitle('');
        setNewTicketDesc('');
        setIsAddingTicket(false);
    };

    // 드래그 오버 이벤트
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    // 드롭 이벤트 (보드의 마지막 위치에 드롭)
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const nextPosition = (board.tickets?.length ?? 0) + 1;
        onTicketDrop(e, board.id, nextPosition);
    };

    // 특정 위치에 드롭
    const handleDropAtPosition = (e: React.DragEvent, position: number) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        onTicketDrop(e, board.id, position);
    };

    const sortedTickets = [...(board.tickets || [])].sort((a, b) => a.position - b.position);

    return (
        <div
            className={`
                flex flex-col w-72 shrink-0 rounded-xl transition-all duration-200
                bg-white/70 backdrop-blur-sm shadow-sm
                ${isDragOver ? 'ring-2 ring-white/50 shadow-lg scale-[1.01]' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* 보드 헤더 */}
            <div className="p-3 pb-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-trollo-navy tracking-tight">{board.name}</h3>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-trollo-gray-500 hover:text-trollo-navy"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                                onClick={() => onDeleteBoard(board.id)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                보드 삭제
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* 티켓 목록 */}
            <ScrollArea className="flex-1 max-h-[calc(100vh-280px)]">
                <div className="px-2 pb-2 space-y-2">
                    {sortedTickets.map((ticket, index) => (
                        <div key={ticket.id}>
                            {/* 드롭 영역 (티켓 사이) */}
                            <div
                                className="h-1 rounded transition-all duration-150 hover:h-8 hover:bg-trollo-orange/10 hover:border hover:border-dashed hover:border-trollo-orange/30"
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onDrop={(e) => handleDropAtPosition(e, index + 1)}
                            />
                            <TicketCard
                                ticket={ticket}
                                onDelete={onDeleteTicket}
                                onEdit={onEditTicket}
                                onDragStart={(e, t) => onTicketDragStart(e, t, board.id)}
                            />
                        </div>
                    ))}

                    {/* 빈 보드일 때 드롭 안내 */}
                    {sortedTickets.length === 0 && (
                        <div className="py-8 text-center text-xs text-trollo-gray-500/60">
                            <p>티켓이 없습니다</p>
                            <p className="mt-1">여기에 드래그하거나 추가하세요</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* 티켓 추가 영역 */}
            <div className="p-2">
                {isAddingTicket ? (
                    <div className="space-y-2">
                        <Input
                            placeholder="티켓 제목"
                            value={newTicketTitle}
                            onChange={(e) => setNewTicketTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddTicket();
                                }
                                if (e.key === 'Escape') setIsAddingTicket(false);
                            }}
                            autoFocus
                            className="h-8 text-sm border-trollo-gray-300 focus:border-trollo-orange"
                        />
                        <Textarea
                            placeholder="설명 (선택사항)"
                            value={newTicketDesc}
                            onChange={(e) => setNewTicketDesc(e.target.value)}
                            className="text-sm min-h-[60px] resize-none border-trollo-gray-300 focus:border-trollo-orange"
                            rows={2}
                        />
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleAddTicket}
                                className="flex-1 h-7 text-xs bg-trollo-orange hover:bg-trollo-orange/90 text-white"
                            >
                                추가
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setIsAddingTicket(false);
                                    setNewTicketTitle('');
                                    setNewTicketDesc('');
                                }}
                                className="h-7 w-7 p-0"
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        variant="ghost"
                        className="w-full h-8 text-xs text-trollo-gray-500 hover:text-trollo-navy justify-start"
                        onClick={() => setIsAddingTicket(true)}
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add a card
                    </Button>
                )}
            </div>
        </div>
    );
};

export default BoardColumn;
