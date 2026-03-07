import { useState, useCallback } from 'react';
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
import type { Board, Ticket, User } from '@/types';
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

    // Mock 데이터: 보드와 티켓 (체크리스트, 라벨 등 풍부한 데이터)
    const [boards, setBoards] = useState<Board[]>([
        {
            id: 1,
            name: 'To-Do',
            position: 1,
            tickets: [
                {
                    id: 101,
                    title: 'Implement login authentication module',
                    description: '',
                    position: 1,
                    labels: [
                        { id: 1, name: 'Frontend', color: '#61BD4F' },
                        { id: 2, name: 'Auth', color: '#0079BF' },
                    ],
                    assignees: [{ id: 1, nickname: 'ME' }],
                    commentCount: 2,
                    checklist: [
                        { id: 1, text: 'Database Schema Design', checked: true },
                        { id: 2, text: 'API Documentation with Swagger', checked: false },
                        { id: 3, text: 'Frontend Dashboard Prototype', checked: false },
                    ],
                    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: 102,
                    title: 'Refactor dashboard layout for mobile responsiveness',
                    description: '',
                    position: 2,
                    labels: [{ id: 3, name: 'UI/UX', color: '#FF9F1A' }],
                    assignees: [{ id: 2, nickname: 'AS' }],
                    attachmentCount: 1,
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ],
        },
        {
            id: 2,
            name: 'In Progress',
            position: 2,
            tickets: [
                {
                    id: 201,
                    title: 'API Integration: DataStore Module',
                    description: 'DataStore 모듈 API 연동 작업',
                    position: 1,
                    labels: [{ id: 4, name: 'Backend', color: '#EB5A46' }],
                    assignees: [
                        { id: 3, nickname: 'BK' },
                        { id: 1, nickname: 'ME' },
                    ],
                    dueDate: '2024-01-24T17:00:00',
                    checklist: [
                        { id: 4, text: 'Database Schema Design', checked: true },
                        { id: 5, text: 'API Documentation with Swagger', checked: false },
                        { id: 6, text: 'Frontend Dashboard Prototype', checked: false },
                    ],
                    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ],
        },
        {
            id: 3,
            name: 'Testing',
            position: 3,
            tickets: [
                {
                    id: 301,
                    title: 'Unit tests for checkout flow',
                    description: '결제 흐름 유닛 테스트 작성',
                    position: 1,
                    assignees: [{ id: 4, nickname: 'JD' }],
                    attachmentCount: 1,
                    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ],
        },
        {
            id: 4,
            name: 'Done',
            position: 4,
            tickets: [
                {
                    id: 401,
                    title: 'Setup initial project repository',
                    description: '프로젝트 초기 저장소 설정 완료',
                    position: 1,
                    labels: [{ id: 5, name: 'COMPLETED', color: '#61BD4F' }],
                    assignees: [{ id: 2, nickname: 'AS' }],
                    dueDate: '2024-01-20T17:00:00',
                    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ],
        },
    ]);

    const [isAddBoardDialogOpen, setIsAddBoardDialogOpen] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const [draggedTicket, setDraggedTicket] = useState<{ ticket: Ticket; sourceBoardId: number } | null>(null);
    const [nextTicketId, setNextTicketId] = useState(500);

    // 티켓 디테일 모달 상태
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [selectedBoardName, setSelectedBoardName] = useState('');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // 보드 추가
    const handleAddBoard = () => {
        if (!newBoardName.trim()) return;
        const newBoard: Board = {
            id: Date.now(),
            name: newBoardName.trim(),
            position: boards.length + 1,
            tickets: [],
        };
        setBoards((prev) => [...prev, newBoard]);
        setNewBoardName('');
        setIsAddBoardDialogOpen(false);
    };

    // 보드 삭제
    const handleDeleteBoard = (boardId: number) => {
        setBoards((prev) => prev.filter((b) => b.id !== boardId));
    };

    // 티켓 생성
    const handleCreateTicket = (boardId: number, title: string, description?: string) => {
        setBoards((prev) =>
            prev.map((board) => {
                if (board.id !== boardId) return board;
                const newTicket: Ticket = {
                    id: nextTicketId,
                    title,
                    description,
                    position: (board.tickets?.length ?? 0) + 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                setNextTicketId((id) => id + 1);
                return { ...board, tickets: [...(board.tickets || []), newTicket] };
            })
        );
    };

    // 티켓 삭제
    const handleDeleteTicket = (ticketId: number) => {
        setBoards((prev) =>
            prev.map((board) => ({
                ...board,
                tickets: board.tickets.filter((t) => t.id !== ticketId),
            }))
        );
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
    const handleUpdateTicket = (updatedTicket: Ticket) => {
        setBoards((prev) =>
            prev.map((board) => ({
                ...board,
                tickets: board.tickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
            }))
        );
        setSelectedTicket(updatedTicket);
    };

    // 드래그 앤 드롭: 시작
    const handleTicketDragStart = useCallback((_e: React.DragEvent, ticket: Ticket, sourceBoardId: number) => {
        setDraggedTicket({ ticket, sourceBoardId });
    }, []);

    // 드래그 앤 드롭: 드롭
    const handleTicketDrop = useCallback(
        (_e: React.DragEvent, targetBoardId: number, targetPosition: number) => {
            if (!draggedTicket) return;
            const { ticket, sourceBoardId } = draggedTicket;
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
            setDraggedTicket(null);
        },
        [draggedTicket]
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

                <span className="text-sm font-bold text-white">Development Board</span>

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
