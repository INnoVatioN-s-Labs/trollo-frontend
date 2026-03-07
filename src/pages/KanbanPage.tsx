import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import BoardColumn from '@/components/kanban/BoardColumn';
import TicketDetailModal from '@/components/kanban/TicketDetailModal';
import { getKanbanView } from '@/api/workspace';
import { createBoard, deleteBoard } from '@/api/board';
import { createTicket, deleteTicket, updateTicket, moveTicket } from '@/api/ticket';
import type { Board, Ticket, User, Workspace } from '@/types';
import { useParams } from 'react-router-dom';
import { Plus, Star, Users, Filter, Search, Bell, MoreVertical, ArrowLeft } from 'lucide-react';

interface KanbanPageProps {
    user: User | null;
    onLogout: () => void;
}

/**
 * 칸반보드 메인 페이지 (디자인 시안: trollo_main_board_cleaned)
 * - Trello 스타일 상단 네비게이션 + 보드 서브헤더
 * - 틸/그린 그래디언트 배경
 * - 하단 도구모음 (Inbox, Planner, Board, Switch)
 * - 티켓 클릭 시 TicketDetailModal 오픈
 */
const KanbanPage = ({ user, onLogout }: KanbanPageProps) => {
    const navigate = useNavigate();

    const [boards, setBoards] = useState<Board[]>([]);

    const [isAddBoardDialogOpen, setIsAddBoardDialogOpen] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const [draggedTicket, setDraggedTicket] = useState<{ ticket: Ticket; sourceBoardId: number } | null>(null);

    // 티켓 디테일 모달 상태
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [selectedBoardName, setSelectedBoardName] = useState('');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const { workspaceId } = useParams();
    const [workspace, setWorkspace] = useState<Workspace | null>(null);

    // 컴포넌트 마운트 시 칸반 통합 조회
    useEffect(() => {
        if (workspaceId) {
            fetchKanbanData(Number(workspaceId));
        }
    }, [workspaceId]);

    const fetchKanbanData = async (id: number) => {
        try {
            const kanbanData = await getKanbanView(id);
            setBoards(kanbanData.boards || []);
            setWorkspace({
                id: kanbanData.workspaceId,
                name: kanbanData.workspaceName,
                description: kanbanData.workspaceDescription,
                createdAt: '',
                updatedAt: '',
            });
        } catch (error) {
            console.error('Failed to fetch kanban view', error);
        }
    };

    // 보드 추가 (API 연동)
    const handleAddBoard = async () => {
        if (!newBoardName.trim() || !workspaceId) return;

        try {
            await createBoard(Number(workspaceId), {
                name: newBoardName.trim(),
            });

            // 보드 생성 후 서버에서 다시 가져와 동기화
            await fetchKanbanData(Number(workspaceId));
            setNewBoardName('');
            setIsAddBoardDialogOpen(false);
        } catch (error) {
            console.error('Failed to create board:', error);
            alert('보드 생성에 실패했습니다.');
        }
    };

    // 보드 삭제
    const handleDeleteBoard = async (boardId: number) => {
        if (!workspaceId) return;
        try {
            await deleteBoard(Number(workspaceId), boardId);
            setBoards((prev) => prev.filter((b) => b.id !== boardId));
        } catch (error) {
            console.error('Failed to delete board', error);
        }
    };

    // 티켓 생성
    const handleCreateTicket = async (boardId: number, title: string, description?: string) => {
        if (!workspaceId) return;
        try {
            await createTicket(Number(workspaceId), boardId, { title, description });
            await fetchKanbanData(Number(workspaceId));
        } catch (error) {
            console.error('Failed to create ticket', error);
        }
    };

    // 티켓 삭제
    const handleDeleteTicket = async (ticketId: number) => {
        if (!workspaceId) return;
        const parentBoard = boards.find((b) => b.tickets.some((t) => t.id === ticketId));
        if (!parentBoard) return;

        try {
            await deleteTicket(Number(workspaceId), parentBoard.id, ticketId);
            setBoards((prev) =>
                prev.map((board) => ({
                    ...board,
                    tickets: board.tickets.filter((t) => t.id !== ticketId),
                }))
            );
        } catch (error) {
            console.error('Failed to delete ticket', error);
        }
    };

    // 티켓 클릭 → 디테일 모달 오픈
    const handleEditTicket = (ticket: Ticket) => {
        // 소속 보드명 찾기
        const parentBoard = boards.find((b) => b.tickets.some((t) => t.id === ticket.id));
        setSelectedTicket(ticket);
        setSelectedBoardName(parentBoard?.name || '');
        setIsDetailModalOpen(true);
    };

    // 티켓 업데이트 (모달에서)
    const handleUpdateTicket = async (updatedTicket: Ticket) => {
        if (!workspaceId) return;
        const parentBoard = boards.find((b) => b.tickets.some((t) => t.id === updatedTicket.id));
        if (!parentBoard) return;

        try {
            await updateTicket(Number(workspaceId), parentBoard.id, updatedTicket.id, {
                title: updatedTicket.title,
                description: updatedTicket.description,
            });

            setBoards((prev) =>
                prev.map((board) => ({
                    ...board,
                    tickets: board.tickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
                }))
            );
            setSelectedTicket(updatedTicket);
        } catch (error) {
            console.error('Failed to update ticket', error);
        }
    };

    // 드래그 앤 드롭: 시작
    const handleTicketDragStart = useCallback((_e: React.DragEvent, ticket: Ticket, sourceBoardId: number) => {
        setDraggedTicket({ ticket, sourceBoardId });
    }, []);

    // 드래그 앤 드롭: 드롭
    const handleTicketDrop = useCallback(
        async (_e: React.DragEvent, targetBoardId: number, targetPosition: number) => {
            if (!draggedTicket || !workspaceId) return;
            const { ticket, sourceBoardId } = draggedTicket;

            // UI 상태 반영
            setBoards((prev) => {
                return prev.map((board) => {
                    if (board.id === sourceBoardId && board.id !== targetBoardId) {
                        return {
                            ...board,
                            tickets: board.tickets
                                .filter((t) => t.id !== ticket.id)
                                .map((t, i) => ({ ...t, position: i + 1 })),
                        };
                    }
                    if (board.id === targetBoardId) {
                        const filteredTickets = board.tickets.filter((t) => t.id !== ticket.id);
                        const insertIndex = Math.min(targetPosition - 1, filteredTickets.length);
                        const newTickets = [...filteredTickets];
                        newTickets.splice(insertIndex, 0, { ...ticket, position: targetPosition });
                        return {
                            ...board,
                            tickets: newTickets.map((t, i) => ({ ...t, position: i + 1 })),
                        };
                    }
                    return board;
                });
            });

            // 티켓 위치 변경 API 연동
            try {
                await moveTicket(Number(workspaceId), sourceBoardId, ticket.id, {
                    targetBoardId,
                    targetPosition,
                });
                // 정확한 동기화를 위해 백엔드에서 다시 가져오기
                await fetchKanbanData(Number(workspaceId));
            } catch (error) {
                console.error('Failed to move ticket', error);
                // 실패시 원래 상태 복구 등의 예외 처리 (여기서는 다시 불러오기로 처리)
                await fetchKanbanData(Number(workspaceId));
            }

            setDraggedTicket(null);
        },
        [draggedTicket, workspaceId]
    );

    const sortedBoards = [...boards].sort((a, b) => a.position - b.position);

    return (
        <div className="h-screen flex flex-col">
            {/* 글로벌 네비게이션 바 (Navy) */}
            <header className="h-11 bg-trollo-navy px-4 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-6 h-6 rounded bg-trollo-orange flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="14" y="14" width="4" height="4" rx="1" fill="white" />
                            </svg>
                        </div>
                        <span className="text-sm font-bold text-white">Trollo</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-3 text-xs font-medium text-white/70">
                        <button className="hover:text-white transition-colors">Workspaces</button>
                        <button className="hover:text-white transition-colors">Recent</button>
                        <button className="hover:text-white transition-colors">Starred</button>
                    </nav>

                    <Button
                        size="sm"
                        className="bg-trollo-orange hover:bg-trollo-orange/90 text-white font-semibold h-7 px-3 text-xs"
                    >
                        Create
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="h-7 pl-8 pr-3 w-44 rounded-md border border-white/20 bg-white/10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-colors"
                        />
                    </div>
                    <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                        <Bell className="w-3.5 h-3.5 text-white/70" />
                    </button>
                    <button
                        onClick={onLogout}
                        className="w-7 h-7 rounded-full bg-trollo-orange flex items-center justify-center text-white text-xs font-bold hover:opacity-90"
                        title="로그아웃"
                    >
                        {user?.nickname.charAt(0).toUpperCase() || 'U'}
                    </button>
                </div>
            </header>

            {/* 보드 서브 헤더 */}
            <div className="h-12 px-4 flex items-center gap-3 bg-board-bg-from/80 backdrop-blur-sm shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-white/70 hover:text-white hover:bg-white/10 p-1"
                    onClick={() => navigate('/')}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>

                <span className="text-sm font-bold text-white">{workspace?.name || 'Development Board'}</span>

                <Button variant="ghost" size="sm" className="h-7 text-white/60 hover:text-white hover:bg-white/10 p-1">
                    <Star className="w-4 h-4" />
                </Button>

                {/* 멤버 아바타 */}
                <div className="flex items-center -space-x-1.5 ml-2">
                    {['AS', 'BK', 'ME'].map((initials, i) => (
                        <div
                            key={i}
                            className={`w-7 h-7 rounded-full border-2 border-board-bg-from/80 flex items-center justify-center text-[10px] font-bold text-white ${
                                ['bg-green-500', 'bg-red-500', 'bg-blue-500'][i]
                            }`}
                        >
                            {initials}
                        </div>
                    ))}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-white/70 hover:text-white hover:bg-white/10 text-xs gap-1.5"
                >
                    <Users className="w-3.5 h-3.5" />
                    Share
                </Button>

                <div className="flex-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-white/70 hover:text-white hover:bg-white/10 text-xs gap-1.5"
                >
                    <Filter className="w-3.5 h-3.5" />
                    Filters
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-white/60 hover:text-white hover:bg-white/10 p-1">
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </div>

            {/* 칸반 보드 영역 - 그래디언트 배경 */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-gradient-to-br from-board-bg-from via-board-bg-via to-board-bg-to">
                <div className="flex gap-4 p-4 h-full min-w-max">
                    {sortedBoards.map((board) => (
                        <BoardColumn
                            key={board.id}
                            board={board}
                            onCreateTicket={handleCreateTicket}
                            onDeleteTicket={handleDeleteTicket}
                            onEditTicket={handleEditTicket}
                            onDeleteBoard={handleDeleteBoard}
                            onTicketDragStart={handleTicketDragStart}
                            onTicketDrop={handleTicketDrop}
                        />
                    ))}

                    {/* 새 보드 추가 */}
                    <button
                        onClick={() => setIsAddBoardDialogOpen(true)}
                        className="w-72 shrink-0 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
                    >
                        <div className="flex items-center gap-2 font-medium text-sm">
                            <Plus className="w-5 h-5" />
                            Add another list
                        </div>
                    </button>
                </div>
            </div>

            {/* 하단 도구 모음 (시안 반영) */}
            <div className="h-11 bg-white border-t border-trollo-gray-100 flex items-center justify-center gap-2 shrink-0">
                {[
                    { icon: '📥', label: 'Inbox' },
                    { icon: '📅', label: 'Planner' },
                    { icon: '📋', label: 'Board', active: true },
                    { icon: '🔄', label: 'Switch' },
                ].map((item) => (
                    <button
                        key={item.label}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            item.active
                                ? 'bg-trollo-gray-100 text-trollo-navy'
                                : 'text-trollo-gray-500 hover:bg-trollo-gray-100/50'
                        }`}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </div>

            {/* 보드 추가 다이얼로그 */}
            <Dialog open={isAddBoardDialogOpen} onOpenChange={setIsAddBoardDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-trollo-navy">새 보드 추가</DialogTitle>
                        <DialogDescription>워크스페이스에 새로운 상태 열을 추가합니다.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="예: 🚀 배포 준비"
                            value={newBoardName}
                            onChange={(e) => setNewBoardName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddBoard();
                            }}
                            autoFocus
                            className="border-trollo-gray-300 focus:border-trollo-orange"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddBoardDialogOpen(false)}>
                            취소
                        </Button>
                        <Button
                            onClick={handleAddBoard}
                            disabled={!newBoardName.trim()}
                            className="bg-trollo-orange hover:bg-trollo-orange/90 text-white"
                        >
                            추가
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 티켓 디테일 모달 */}
            <TicketDetailModal
                ticket={selectedTicket}
                boardName={selectedBoardName}
                open={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}
                onUpdate={handleUpdateTicket}
            />
        </div>
    );
};

export default KanbanPage;
