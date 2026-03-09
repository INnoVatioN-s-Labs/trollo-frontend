import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { getWorkspaces, createWorkspace, deleteWorkspace, joinWorkspace, getMyActivities } from '@/api/workspace';
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
    Trash2,
    KeySquare,
} from 'lucide-react';

interface WorkspaceListPageProps {
    user: User | null;
    onLogout: () => void;
}

/** 화면에 표시할 활동 이력(UI 용 래퍼) */
interface RecentActivity {
    id: string; // 고유하게 만들기 위해 string (wsId_activityId)
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
    const { t } = useTranslation();

    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

    // 컴포넌트 마운트 시 워크스페이스 목록 조회
    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const timeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now.getTime() - past.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        return `${diffDays}일 전`;
    };

    const getActivityIconType = (type: string): 'edit' | 'user' | 'archive' => {
        if (type.includes('MEMBER') || type.includes('HOST')) return 'user';
        if (type.includes('DELETE') || type.includes('ARCHIVE')) return 'archive';
        return 'edit';
    };

    const fetchWorkspaces = async () => {
        try {
            const data = await getWorkspaces();
            setWorkspaces(data);

            // 통합 API를 통해 내가 속한 모든 워크스페이스의 활동 이력을 한번에 가져옵니다.
            const allActivities = await getMyActivities();

            // UI 타입으로 매핑
            const formattedActivities: RecentActivity[] = allActivities.map((act) => ({
                id: `${act.workspaceId}_${act.id}`,
                icon: getActivityIconType(act.type),
                text: act.content,
                subText: `${act.workspaceName} · ${act.userNickname}`,
                timestamp: timeAgo(act.createdAt),
            }));

            setRecentActivities(formattedActivities);
        } catch (error) {
            console.error('Failed to fetch workspaces and activities:', error);
        }
    };

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
    const [inviteCodeInput, setInviteCodeInput] = useState('');
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

    const handleDeleteWorkspace = async (e: React.MouseEvent, workspaceId: number) => {
        e.stopPropagation(); // 카드 클릭 이벤트(이동) 방지
        const confirmDelete = window.confirm(t('workspace.delete_confirm'));
        if (!confirmDelete) return;

        try {
            await deleteWorkspace(workspaceId);
            await fetchWorkspaces(); // 삭제 후 목록 리로딩
        } catch (error) {
            console.error('Failed to delete workspace:', error);
            alert('워크스페이스 삭제 기능 중 오류가 발생했습니다.');
        }
    };

    const handleJoinWorkspace = async () => {
        if (!inviteCodeInput.trim()) return;

        try {
            await joinWorkspace({ inviteCode: inviteCodeInput.trim() });
            await fetchWorkspaces(); // 참여 후 목록 갱신
            setIsJoinDialogOpen(false);
            setInviteCodeInput('');
        } catch (error: any) {
            console.error('Failed to join workspace:', error);
            alert(error?.response?.data?.message || '워크스페이스 참여에 실패했습니다.');
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
                    <div className="w-9 h-9 rounded-full bg-theme-primary-light flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-theme-primary" />
                    </div>
                );
        }
    };

    // 워크스페이스 커버 색상에 맞는 아이콘 배경 생성
    const getWorkspaceIcon = (ws: Workspace) => {
        return (
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
                style={{ backgroundColor: ws.coverColor || 'var(--color-theme-primary)' }}
            >
                <span className="text-white text-lg">{ws.iconEmoji || ws.name.charAt(0).toUpperCase()}</span>
            </div>
        );
    };

    return (
        <div className="h-screen flex flex-col bg-white">
            {/* 글로벌 네비게이션 바 */}
            <header className="h-14 border-b border-theme-gray-100 bg-white px-6 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-theme-primary flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="14" y="14" width="4" height="4" rx="1" fill="white" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold text-theme-dark">Trollo</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-theme-gray-500">
                        <button className="text-theme-dark hover:text-theme-primary transition-colors">
                            {t('nav.workspaces')}
                        </button>
                        <button className="hover:text-theme-dark transition-colors">{t('nav.recent')}</button>
                        <button className="hover:text-theme-dark transition-colors">{t('nav.starred')}</button>
                        <button className="hover:text-theme-dark transition-colors">{t('nav.templates')}</button>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    {/* 검색 */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-gray-300" />
                        <input
                            type="text"
                            placeholder={t('nav.search')}
                            className="h-9 pl-9 pr-4 w-56 rounded-lg border border-theme-gray-100 bg-theme-gray-100/50 text-sm focus:outline-none focus:border-theme-primary focus:bg-white transition-colors"
                        />
                    </div>

                    <Button
                        size="sm"
                        className="bg-theme-primary hover:bg-theme-primary/90 text-white font-semibold h-9 px-4"
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        {t('nav.create')}
                    </Button>

                    <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-theme-gray-100 transition-colors">
                        <Bell className="w-4.5 h-4.5 text-theme-gray-500" />
                    </button>

                    {/* 유저 아바타 */}
                    <button
                        onClick={onLogout}
                        className="w-9 h-9 rounded-full bg-theme-primary flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-opacity"
                        title={t('nav.logout')}
                    >
                        {user?.nickname.charAt(0).toUpperCase() || 'U'}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* 좌측 사이드바 */}
                <aside className="w-56 border-r border-theme-gray-100 bg-white p-4 flex flex-col gap-1 shrink-0 hidden lg:flex">
                    <SidebarItem icon={<LayoutGrid className="w-4.5 h-4.5" />} label={t('sidebar.home')} />
                    <SidebarItem icon={<LayoutGrid className="w-4.5 h-4.5" />} label={t('sidebar.workspaces')} active />
                    <SidebarItem icon={<Clock className="w-4.5 h-4.5" />} label={t('sidebar.recent_boards')} />
                    <SidebarItem icon={<Star className="w-4.5 h-4.5" />} label={t('sidebar.starred')} />
                    <div className="mt-4" />
                    <SidebarItem icon={<Settings className="w-4.5 h-4.5" />} label={t('sidebar.settings')} />

                    {/* Quick Links */}
                    <div className="mt-auto pt-6 border-t border-theme-gray-100">
                        <p className="text-[10px] uppercase tracking-wider text-theme-gray-300 font-semibold mb-2 px-3">
                            {t('sidebar.quick_links')}
                        </p>
                        <SidebarItem icon={<HelpCircle className="w-4 h-4" />} label={t('sidebar.help_center')} small />
                        <SidebarItem
                            icon={<PlayCircle className="w-4 h-4" />}
                            label={t('sidebar.product_tour')}
                            small
                        />
                    </div>
                </aside>

                {/* 메인 콘텐츠 영역 */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
                    {/* 제목 + 생성 버튼 */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-theme-dark">{t('workspace.title')}</h1>
                            <p className="text-sm text-theme-gray-500 mt-1">{t('workspace.subtitle')}</p>
                        </div>
                        <div className="hidden md:flex gap-2">
                            <Button
                                className="bg-white border border-theme-gray-300 text-theme-dark hover:bg-theme-gray-100 font-semibold"
                                onClick={() => setIsJoinDialogOpen(true)}
                            >
                                <KeySquare className="w-4 h-4 mr-1.5 text-theme-gray-500" />
                                {t('workspace.join_workspace')}
                            </Button>
                            <Button
                                className="bg-theme-primary hover:bg-theme-primary/90 text-white font-semibold flex"
                                onClick={() => setIsCreateDialogOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                {t('workspace.create_new')}
                            </Button>
                        </div>
                    </div>

                    {/* 탭 필터 */}
                    <div className="flex gap-6 border-b border-theme-gray-100 mb-6">
                        {(['all', 'owned', 'shared', 'archived'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                                    activeTab === tab
                                        ? 'border-theme-primary text-theme-primary'
                                        : 'border-transparent text-theme-gray-500 hover:text-theme-dark'
                                }`}
                            >
                                {t(`workspace.tabs.${tab}` as const)}
                            </button>
                        ))}
                    </div>

                    {/* 워크스페이스 카드 그리드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
                        {workspaces.map((ws) => (
                            <Card
                                key={ws.id}
                                className="overflow-hidden border-theme-gray-100 hover:shadow-lg hover:border-theme-gray-300 transition-all duration-200 group cursor-pointer"
                                onClick={() => handleOpenWorkspace(ws.id)}
                            >
                                {/* 커버 영역 */}
                                <div
                                    className="h-32 relative"
                                    style={{
                                        background: `linear-gradient(135deg, ${ws.coverColor || 'var(--color-theme-primary)'}, ${ws.coverColor ? ws.coverColor + '88' : 'var(--color-theme-primary-light)'})`,
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
                                                    className="w-7 h-7 rounded-full bg-theme-gray-300 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                                                >
                                                    {m.nickname.charAt(0)}
                                                </div>
                                            ))}
                                            {(ws.memberCount || 0) > 3 && (
                                                <div className="w-7 h-7 rounded-full bg-theme-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-theme-gray-500">
                                                    +{(ws.memberCount || 0) - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start justify-between mb-1 gap-2">
                                        <h3 className="font-semibold text-theme-dark text-base">{ws.name}</h3>
                                        {/* 삭제 버튼 */}
                                        <button
                                            onClick={(e) => handleDeleteWorkspace(e, ws.id)}
                                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-theme-gray-300 hover:text-red-500 transition-colors"
                                            title={t('workspace.delete_tooltip')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-theme-gray-500 line-clamp-2 mb-2 leading-relaxed mt-1 h-8">
                                        {ws.description}
                                    </p>

                                    {ws.inviteCode && (
                                        <div
                                            className="text-[10px] font-mono bg-theme-gray-100/50 hover:bg-theme-gray-100 text-theme-gray-500 py-1 px-2 rounded mb-3 inline-block font-medium w-fit transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(ws.inviteCode!);
                                                alert(`초대 코드(${ws.inviteCode})가 클립보드에 복사되었습니다.`);
                                            }}
                                            title="초대 코드 복사하기"
                                        >
                                            Code: <span className="text-theme-dark">{ws.inviteCode}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-theme-gray-500">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>
                                                {ws.memberCount} {t('workspace.members')}
                                            </span>
                                        </div>
                                        <button className="text-xs font-bold text-theme-primary hover:underline uppercase tracking-wide flex items-center gap-1 group-hover:gap-2 transition-all">
                                            {t('workspace.open_board')}
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* 새 워크스페이스 추가 카드 */}
                        <Card
                            className="border-2 border-dashed border-theme-gray-300 hover:border-theme-primary/50 hover:bg-theme-primary-light/30 transition-all cursor-pointer flex items-center justify-center min-h-[280px]"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            <div className="text-center py-8">
                                <div className="w-14 h-14 rounded-full bg-theme-gray-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-theme-primary-light transition-colors">
                                    <Plus className="w-6 h-6 text-theme-gray-500 group-hover:text-theme-primary transition-colors" />
                                </div>
                                <h3 className="font-semibold text-theme-dark text-base mb-1">
                                    {t('workspace.new_workspace')}
                                </h3>
                                <p className="text-xs text-theme-gray-500">{t('workspace.start_fresh')}</p>
                            </div>
                        </Card>

                        {/* 워크스페이스 참여 카드 */}
                        <Card
                            className="border-2 border-dashed border-theme-gray-300 hover:border-theme-primary/50 hover:bg-theme-primary-light/30 transition-all cursor-pointer flex items-center justify-center min-h-[280px]"
                            onClick={() => setIsJoinDialogOpen(true)}
                        >
                            <div className="text-center py-8">
                                <div className="w-14 h-14 rounded-full bg-theme-gray-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-theme-primary-light transition-colors">
                                    <KeySquare className="w-6 h-6 text-theme-gray-500 group-hover:text-theme-primary transition-colors" />
                                </div>
                                <h3 className="font-semibold text-theme-dark text-base mb-1">
                                    {t('workspace.join_workspace')}
                                </h3>
                                <p className="text-xs text-theme-gray-500">{t('workspace.join_workspace_title')}</p>
                            </div>
                        </Card>
                    </div>

                    {/* 최근 활동 */}
                    <div>
                        <h2 className="text-lg font-bold text-theme-dark mb-4">{t('workspace.recent_activity')}</h2>
                        <div className="space-y-1">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-theme-gray-100/50 transition-colors"
                                    >
                                        {getActivityIcon(activity.icon)}
                                        <div className="flex-1 min-w-0 flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-theme-dark">{activity.text}</p>
                                                <p className="text-xs text-theme-gray-500">{activity.subText}</p>
                                            </div>
                                            <span className="text-[10px] text-theme-gray-400 font-medium bg-theme-gray-100/50 px-2 py-1 rounded">
                                                {activity.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-theme-gray-400 py-4 text-center bg-theme-gray-50/50 rounded-xl">
                                    최근 활동이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* 워크스페이스 생성 다이얼로그 */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-theme-dark">{t('workspace.modal_title')}</DialogTitle>
                        <DialogDescription>{t('workspace.modal_desc')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            placeholder={t('workspace.name_placeholder')}
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
                            autoFocus
                            className="border-theme-gray-300 focus:border-theme-primary"
                        />
                        <Input
                            placeholder={t('workspace.desc_placeholder')}
                            value={newWorkspaceDesc}
                            onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                            className="border-theme-gray-300 focus:border-theme-primary"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            {t('workspace.cancel')}
                        </Button>
                        <Button
                            onClick={handleCreateWorkspace}
                            disabled={!newWorkspaceName.trim()}
                            className="bg-theme-primary hover:bg-theme-primary/90 text-white"
                        >
                            {t('workspace.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 워크스페이스 참여 다이얼로그 */}
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-theme-dark">{t('workspace.join_workspace_title')}</DialogTitle>
                        <DialogDescription>{t('workspace.join_workspace_desc')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            placeholder={t('workspace.invite_code_placeholder')}
                            value={inviteCodeInput}
                            onChange={(e) => setInviteCodeInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoinWorkspace()}
                            autoFocus
                            className="border-theme-gray-300 focus:border-theme-primary uppercase text-center font-mono tracking-widest text-lg"
                            maxLength={8}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
                            {t('workspace.cancel')}
                        </Button>
                        <Button
                            onClick={handleJoinWorkspace}
                            disabled={!inviteCodeInput.trim() || inviteCodeInput.length < 8}
                            className="bg-theme-primary hover:bg-theme-primary/90 text-white"
                        >
                            {t('workspace.join')}
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
                    ? 'bg-theme-primary-light text-theme-primary font-semibold'
                    : 'text-theme-gray-500 hover:bg-theme-gray-100/70 hover:text-theme-dark'
            }
        `}
    >
        {icon}
        {label}
    </button>
);

export default WorkspaceListPage;
