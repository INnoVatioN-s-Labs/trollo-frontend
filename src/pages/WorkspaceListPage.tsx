import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
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
import { getWorkspaces, createWorkspace } from '@/api/workspace';
import type { User, Workspace } from '@/types';
import {
    Search,
    Plus,
    Bell,
    LayoutGrid,
    Clock,
    Star,
    Settings,
    HelpCircle,
    PlayCircle,
    Users,
    ArrowRight,
    Pencil,
    UserPlus,
    CheckCircle,
} from 'lucide-react';

interface WorkspaceListPageProps {
    user: User | null;
    onLogout: () => void;
}

/** 최근 활동 Mock 타입 */
interface RecentActivity {
    id: number;
    icon: 'edit' | 'user' | 'archive';
    text: string;
    subText: string;
    timestamp: string;
}

/**
 * 워크스페이스 목록 페이지 (디자인 시안: trollo_workspace_list_1/2)
 * - 상단 글로벌 네비게이션 바
 * - 좌측 사이드바 (메뉴 + Quick Links)
 * - 워크스페이스 카드 그리드 (커버 이미지 + 아이콘 + 설명 + 멤버)
 * - 새 워크스페이스 생성 카드
 * - 최근 활동 목록
 */
const WorkspaceListPage = ({ user, onLogout }: WorkspaceListPageProps) => {
    const navigate = useNavigate();

    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

    // 컴포넌트 마운트 시 워크스페이스 목록 조회
    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const data = await getWorkspaces();
            setWorkspaces(data);
        } catch (error) {
            console.error('Failed to fetch workspaces:', error);
        }
    };

    // Mock 최근 활동
    const recentActivities: RecentActivity[] = [
        {
            id: 1,
            icon: 'edit',
            text: '"Sprint Backlog" 카드를 수정했습니다',
            subText: 'Development Board · 2시간 전',
            timestamp: '2h',
        },
        {
            id: 2,
            icon: 'user',
            text: 'Sarah Miller님이 워크스페이스에 참여했습니다',
            subText: 'Marketing Team · 5시간 전',
            timestamp: '5h',
        },
        {
            id: 3,
            icon: 'archive',
            text: '"Q3 Retrospective" 보드가 보관되었습니다',
            subText: 'Personal Projects · 어제',
            timestamp: '1d',
        },
    ];

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'owned' | 'shared' | 'archived'>('all');

    const handleOpenWorkspace = (workspaceId: number) => {
        navigate(`/workspace/${workspaceId}`);
    };

    const handleCreateWorkspace = async () => {
        if (!newWorkspaceName.trim()) return;

        try {
            await createWorkspace({
                name: newWorkspaceName.trim(),
                description: newWorkspaceDesc.trim(),
            });
            // 새 워크스페이스 생성 후 목록 갱신
            await fetchWorkspaces();
            setIsCreateDialogOpen(false);
            setNewWorkspaceName('');
            setNewWorkspaceDesc('');
        } catch (error) {
            console.error('Failed to create workspace:', error);
            alert('워크스페이스 생성에 실패했습니다.');
        }
    };

    // 활동 아이콘 매핑
    const getActivityIcon = (type: RecentActivity['icon']) => {
        switch (type) {
            case 'edit':
                return (
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <Pencil className="w-4 h-4 text-blue-600" />
                    </div>
                );
            case 'user':
                return (
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-green-600" />
                    </div>
                );
            case 'archive':
                return (
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-trollo-orange" />
                    </div>
                );
        }
    };

    // 워크스페이스 커버 색상에 맞는 아이콘 배경 생성
    const getWorkspaceIcon = (ws: Workspace) => {
        return (
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
                style={{ backgroundColor: ws.coverColor || '#FF6B00' }}
            >
                <span className="text-white text-lg">{ws.iconEmoji || ws.name.charAt(0).toUpperCase()}</span>
            </div>
        );
    };

    return (
        <div className="h-screen flex flex-col bg-white">
            {/* 글로벌 네비게이션 바 */}
            <header className="h-14 border-b border-trollo-gray-100 bg-white px-6 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-trollo-orange flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="14" y="14" width="4" height="4" rx="1" fill="white" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold text-trollo-navy">Trollo</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-trollo-gray-500">
                        <button className="text-trollo-navy hover:text-trollo-orange transition-colors">
                            Workspaces
                        </button>
                        <button className="hover:text-trollo-navy transition-colors">Recent</button>
                        <button className="hover:text-trollo-navy transition-colors">Starred</button>
                        <button className="hover:text-trollo-navy transition-colors">Templates</button>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    {/* 검색 */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-trollo-gray-300" />
                        <input
                            type="text"
                            placeholder="Search workspaces..."
                            className="h-9 pl-9 pr-4 w-56 rounded-lg border border-trollo-gray-100 bg-trollo-gray-100/50 text-sm focus:outline-none focus:border-trollo-orange focus:bg-white transition-colors"
                        />
                    </div>

                    <Button
                        size="sm"
                        className="bg-trollo-orange hover:bg-trollo-orange/90 text-white font-semibold h-9 px-4"
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        Create
                    </Button>

                    <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-trollo-gray-100 transition-colors">
                        <Bell className="w-4.5 h-4.5 text-trollo-gray-500" />
                    </button>

                    {/* 유저 아바타 */}
                    <button
                        onClick={onLogout}
                        className="w-9 h-9 rounded-full bg-trollo-orange flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-opacity"
                        title="로그아웃"
                    >
                        {user?.nickname.charAt(0).toUpperCase() || 'U'}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* 좌측 사이드바 */}
                <aside className="w-56 border-r border-trollo-gray-100 bg-white p-4 flex flex-col gap-1 shrink-0 hidden lg:flex">
                    <SidebarItem icon={<LayoutGrid className="w-4.5 h-4.5" />} label="Home" />
                    <SidebarItem icon={<LayoutGrid className="w-4.5 h-4.5" />} label="Workspaces" active />
                    <SidebarItem icon={<Clock className="w-4.5 h-4.5" />} label="Recent Boards" />
                    <SidebarItem icon={<Star className="w-4.5 h-4.5" />} label="Starred" />
                    <div className="mt-4" />
                    <SidebarItem icon={<Settings className="w-4.5 h-4.5" />} label="Settings" />

                    {/* Quick Links */}
                    <div className="mt-auto pt-6 border-t border-trollo-gray-100">
                        <p className="text-[10px] uppercase tracking-wider text-trollo-gray-300 font-semibold mb-2 px-3">
                            Quick Links
                        </p>
                        <SidebarItem icon={<HelpCircle className="w-4 h-4" />} label="Help Center" small />
                        <SidebarItem icon={<PlayCircle className="w-4 h-4" />} label="Product Tour" small />
                    </div>
                </aside>

                {/* 메인 콘텐츠 영역 */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
                    {/* 제목 + 생성 버튼 */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-trollo-navy">Your Workspaces</h1>
                            <p className="text-sm text-trollo-gray-500 mt-1">
                                Manage and collaborate on your team's projects
                            </p>
                        </div>
                        <Button
                            className="bg-trollo-orange hover:bg-trollo-orange/90 text-white font-semibold hidden md:flex"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Create New Workspace
                        </Button>
                    </div>

                    {/* 탭 필터 */}
                    <div className="flex gap-6 border-b border-trollo-gray-100 mb-6">
                        {(['all', 'owned', 'shared', 'archived'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                                    activeTab === tab
                                        ? 'border-trollo-orange text-trollo-orange'
                                        : 'border-transparent text-trollo-gray-500 hover:text-trollo-navy'
                                }`}
                            >
                                {tab === 'all'
                                    ? 'All Workspaces'
                                    : tab === 'owned'
                                      ? 'Owned by me'
                                      : tab === 'shared'
                                        ? 'Shared with me'
                                        : 'Archived'}
                            </button>
                        ))}
                    </div>

                    {/* 워크스페이스 카드 그리드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
                        {workspaces.map((ws) => (
                            <Card
                                key={ws.id}
                                className="overflow-hidden border-trollo-gray-100 hover:shadow-lg hover:border-trollo-gray-300 transition-all duration-200 group cursor-pointer"
                                onClick={() => handleOpenWorkspace(ws.id)}
                            >
                                {/* 커버 영역 */}
                                <div
                                    className="h-32 relative"
                                    style={{
                                        background: `linear-gradient(135deg, ${ws.coverColor || '#FF6B00'}, ${ws.coverColor || '#FF6B00'}88)`,
                                    }}
                                >
                                    {/* 장식 도형 */}
                                    <div className="absolute right-4 top-4 w-24 h-24 rounded-full opacity-20 bg-white" />
                                    <div className="absolute right-12 bottom-2 w-16 h-16 rounded-full opacity-10 bg-white" />
                                </div>

                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        {getWorkspaceIcon(ws)}

                                        {/* 멤버 아바타 */}
                                        <div className="flex items-center -space-x-2">
                                            {(ws.members || []).slice(0, 3).map((m) => (
                                                <div
                                                    key={m.id}
                                                    className="w-7 h-7 rounded-full bg-trollo-gray-300 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                                                >
                                                    {m.nickname.charAt(0)}
                                                </div>
                                            ))}
                                            {(ws.memberCount || 0) > 3 && (
                                                <div className="w-7 h-7 rounded-full bg-trollo-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-trollo-gray-500">
                                                    +{(ws.memberCount || 0) - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="font-semibold text-trollo-navy text-base mb-1">{ws.name}</h3>
                                    <p className="text-xs text-trollo-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                        {ws.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-trollo-gray-500">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{ws.memberCount} members</span>
                                        </div>
                                        <button className="text-xs font-bold text-trollo-orange hover:underline uppercase tracking-wide flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Open Board
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* 새 워크스페이스 추가 카드 */}
                        <Card
                            className="border-2 border-dashed border-trollo-gray-300 hover:border-trollo-orange/50 hover:bg-trollo-orange-light/30 transition-all cursor-pointer flex items-center justify-center min-h-[280px]"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            <div className="text-center py-8">
                                <div className="w-14 h-14 rounded-full bg-trollo-gray-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-trollo-orange-light">
                                    <Plus className="w-6 h-6 text-trollo-gray-500" />
                                </div>
                                <h3 className="font-semibold text-trollo-navy text-base mb-1">New Workspace</h3>
                                <p className="text-xs text-trollo-gray-500">Start a fresh collaborative space</p>
                            </div>
                        </Card>
                    </div>

                    {/* 최근 활동 */}
                    <div>
                        <h2 className="text-lg font-bold text-trollo-navy mb-4">Recent Activity</h2>
                        <div className="space-y-1">
                            {recentActivities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-trollo-gray-100/50 transition-colors"
                                >
                                    {getActivityIcon(activity.icon)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-trollo-navy">{activity.text}</p>
                                        <p className="text-xs text-trollo-gray-500">{activity.subText}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* 워크스페이스 생성 다이얼로그 */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-trollo-navy">새 워크스페이스 만들기</DialogTitle>
                        <DialogDescription>팀 프로젝트를 위한 새 워크스페이스를 생성합니다.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            placeholder="워크스페이스 이름"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
                            autoFocus
                            className="border-trollo-gray-300 focus:border-trollo-orange"
                        />
                        <Input
                            placeholder="설명 (선택사항)"
                            value={newWorkspaceDesc}
                            onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                            className="border-trollo-gray-300 focus:border-trollo-orange"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            취소
                        </Button>
                        <Button
                            onClick={handleCreateWorkspace}
                            disabled={!newWorkspaceName.trim()}
                            className="bg-trollo-orange hover:bg-trollo-orange/90 text-white"
                        >
                            생성
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

/** 사이드바 메뉴 항목 컴포넌트 */
const SidebarItem = ({
    icon,
    label,
    active,
    small,
}: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    small?: boolean;
}) => (
    <button
        className={`flex items-center gap-2.5 w-full px-3 rounded-lg text-left transition-colors
            ${small ? 'py-1.5 text-xs' : 'py-2 text-sm'}
            ${
                active
                    ? 'bg-trollo-orange-light text-trollo-orange font-semibold'
                    : 'text-trollo-gray-500 hover:bg-trollo-gray-100/70 hover:text-trollo-navy'
            }
        `}
    >
        {icon}
        {label}
    </button>
);

export default WorkspaceListPage;
