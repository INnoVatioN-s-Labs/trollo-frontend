import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Ticket, TicketLabel, ChecklistItem, ActivityLog, WorkspaceMember } from '@/types';
import {
    X,
    Users,
    Tag,
    CheckSquare,
    Clock,
    Paperclip,
    ArrowRight,
    Copy,
    FileText,
    Archive,
    Share2,
    Eye,
    AlignLeft,
    MessageSquare,
    Plus,
} from 'lucide-react';

interface TicketDetailModalProps {
    ticket: Ticket | null;
    boardName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate?: (ticket: Ticket) => void;
}

/**
 * 티켓 디테일 모달 (디자인 시안: ticket_detail_modal)
 * - 제목, 소속 보드 표시
 * - MEMBERS / LABELS / DUE DATE 정보
 * - Description 편집
 * - Checklist (진행률 + 항목)
 * - Comments and activity 로그
 * - 우측: ADD TO CARD / ACTIONS 패널
 */
const TicketDetailModal = ({ ticket, boardName, open, onOpenChange, onUpdate }: TicketDetailModalProps) => {
    const { t } = useTranslation();
    const [description, setDescription] = useState(ticket?.description || '');
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [comment, setComment] = useState('');
    const [checklist, setChecklist] = useState<ChecklistItem[]>(ticket?.checklist || []);

    if (!ticket) return null;

    // Mock 데이터: 멤버
    const members: WorkspaceMember[] = ticket.assignees || [
        { id: 1, nickname: 'Kim Cheolsu' },
        { id: 2, nickname: 'Lee Younghee' },
    ];

    // Mock 데이터: 라벨
    const labels: TicketLabel[] = ticket.labels || [
        { id: 1, name: 'UI/UX', color: '#0079BF' },
        { id: 2, name: 'Backend', color: '#61BD4F' },
        { id: 3, name: 'Admin', color: '#C377E0' },
    ];

    // Mock 데이터: 마감일
    const dueDate = ticket.dueDate || '2023-10-24T17:00:00';
    const isLate = new Date(dueDate) < new Date();

    // Mock 데이터: 활동 로그
    const activities: ActivityLog[] = ticket.activities || [
        {
            id: 1,
            user: { nickname: 'Kim Cheolsu' },
            action: 'changed the due date of this card',
            timestamp: 'Oct 20 at 11:34 AM',
        },
        {
            id: 2,
            user: { nickname: 'Lee Younghee' },
            action: 'moved this card from To Do to Doing',
            timestamp: 'Oct 19 at 3:12 PM',
        },
    ];

    // 체크리스트 진행률
    const checkedCount = checklist.filter((item) => item.checked).length;
    const checkProgress = checklist.length > 0 ? Math.round((checkedCount / checklist.length) * 100) : 0;

    const handleToggleCheckItem = (itemId: number) => {
        setChecklist((prev) => prev.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)));
    };

    const handleSaveDescription = () => {
        setIsEditingDesc(false);
        if (onUpdate && ticket) {
            onUpdate({ ...ticket, description });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white">
                {/* 헤더 */}
                <DialogHeader className="p-6 pb-4">
                    <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded bg-theme-dark flex items-center justify-center mt-0.5 shrink-0">
                            <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-xl font-bold text-theme-dark leading-tight">
                                {ticket.title}
                            </DialogTitle>
                            <p className="text-sm text-theme-gray-500 mt-1">
                                {t('ticket_modal.in_list')}{' '}
                                <span className="text-theme-dark underline cursor-pointer">{boardName}</span>
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex px-6 pb-6 gap-6">
                    {/* 좌측: 메인 콘텐츠 */}
                    <div className="flex-1 min-w-0 space-y-6">
                        {/* 메타 정보 (MEMBERS / LABELS / DUE DATE) */}
                        <div className="flex flex-wrap gap-8 text-xs">
                            {/* Members */}
                            <div>
                                <p className="uppercase tracking-wider text-theme-gray-500 font-semibold mb-2">
                                    {t('ticket_modal.members')}
                                </p>
                                <div className="flex items-center gap-1">
                                    {members.map((m) => (
                                        <div
                                            key={m.id}
                                            className="w-8 h-8 rounded-full bg-theme-gray-300 flex items-center justify-center text-xs font-bold text-white"
                                            title={m.nickname}
                                        >
                                            {m.nickname.charAt(0)}
                                        </div>
                                    ))}
                                    <button className="w-8 h-8 rounded-full border-2 border-dashed border-theme-gray-300 flex items-center justify-center text-theme-gray-500 hover:border-theme-primary hover:text-theme-primary transition-colors">
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Labels */}
                            <div>
                                <p className="uppercase tracking-wider text-theme-gray-500 font-semibold mb-2">
                                    {t('ticket_modal.labels')}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    {labels.map((label) => (
                                        <Badge
                                            key={label.id}
                                            className="text-white text-xs font-semibold px-3 py-1 rounded"
                                            style={{ backgroundColor: label.color }}
                                        >
                                            {label.name}
                                        </Badge>
                                    ))}
                                    <button className="w-7 h-7 rounded border-2 border-dashed border-theme-gray-300 flex items-center justify-center text-theme-gray-500 hover:border-theme-primary hover:text-theme-primary transition-colors">
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div>
                                <p className="uppercase tracking-wider text-theme-gray-500 font-semibold mb-2">
                                    {t('ticket_modal.due_date')}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Clock className={`w-4 h-4 ${isLate ? 'text-red-500' : 'text-theme-gray-500'}`} />
                                    <span
                                        className={`text-sm font-medium ${isLate ? 'text-red-500' : 'text-theme-dark'}`}
                                    >
                                        {new Date(dueDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                        {' at '}
                                        {new Date(dueDate).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                    {isLate && (
                                        <Badge className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0 font-bold">
                                            {t('ticket_modal.late')}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-theme-gray-100" />

                        {/* Description */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <AlignLeft className="w-4.5 h-4.5 text-theme-dark" />
                                    <h3 className="font-bold text-theme-dark">{t('ticket_modal.description')}</h3>
                                </div>
                                {!isEditingDesc && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs border-theme-gray-300"
                                        onClick={() => setIsEditingDesc(true)}
                                    >
                                        {t('ticket_modal.edit')}
                                    </Button>
                                )}
                            </div>
                            {isEditingDesc ? (
                                <div className="space-y-2">
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder={t('ticket_modal.desc_placeholder')}
                                        className="min-h-[100px] border-theme-gray-300 focus:border-theme-primary"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-theme-primary hover:bg-theme-primary/90 text-white h-8 text-xs"
                                            onClick={handleSaveDescription}
                                        >
                                            {t('ticket_modal.save')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 text-xs"
                                            onClick={() => setIsEditingDesc(false)}
                                        >
                                            {t('ticket_modal.cancel')}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="bg-theme-gray-100/50 rounded-lg p-4 text-sm text-theme-gray-500 cursor-pointer hover:bg-theme-gray-100 transition-colors min-h-[80px]"
                                    onClick={() => setIsEditingDesc(true)}
                                >
                                    {description || t('ticket_modal.desc_placeholder')}
                                </div>
                            )}
                        </div>

                        {/* Checklist */}
                        {checklist.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <CheckSquare className="w-4.5 h-4.5 text-theme-dark" />
                                        <h3 className="font-bold text-theme-dark">{t('ticket_modal.checklist')}</h3>
                                    </div>
                                    <Button variant="outline" size="sm" className="h-7 text-xs border-theme-gray-300">
                                        {t('ticket_modal.delete')}
                                    </Button>
                                </div>

                                {/* 진행률 바 */}
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-xs text-theme-gray-500 w-8">{checkProgress}%</span>
                                    <div className="flex-1 h-2 bg-theme-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-theme-primary rounded-full transition-all duration-300"
                                            style={{ width: `${checkProgress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* 체크 항목들 */}
                                <div className="space-y-1.5">
                                    {checklist.map((item) => (
                                        <label
                                            key={item.id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-theme-gray-100/50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={item.checked}
                                                onChange={() => handleToggleCheckItem(item.id)}
                                                className="w-4 h-4 rounded border-theme-gray-300 accent-theme-primary"
                                            />
                                            <span
                                                className={`text-sm ${item.checked ? 'line-through text-theme-gray-300' : 'text-theme-dark'}`}
                                            >
                                                {item.text}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                <button className="mt-2 text-xs text-theme-gray-500 hover:text-theme-primary transition-colors font-medium">
                                    {t('ticket_modal.add_an_item')}
                                </button>
                            </div>
                        )}

                        <Separator className="bg-theme-gray-100" />

                        {/* Comments and Activity */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4.5 h-4.5 text-theme-dark" />
                                    <h3 className="font-bold text-theme-dark">{t('ticket_modal.comments_activity')}</h3>
                                </div>
                                <Button variant="outline" size="sm" className="h-7 text-xs border-theme-gray-300">
                                    {t('ticket_modal.show_details')}
                                </Button>
                            </div>

                            {/* 댓글 작성 */}
                            <div className="flex gap-3 mb-5">
                                <div className="w-8 h-8 rounded-full bg-theme-gray-300 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                    Me
                                </div>
                                <div className="flex-1 border border-theme-gray-100 rounded-lg overflow-hidden focus-within:border-theme-primary transition-colors">
                                    <Textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder={t('ticket_modal.write_comment')}
                                        className="border-0 focus-visible:ring-0 min-h-[60px] resize-none text-sm"
                                    />
                                    <div className="flex items-center justify-between px-3 py-2 bg-theme-gray-100/30">
                                        <div className="flex gap-2">
                                            <button className="text-theme-gray-500 hover:text-theme-dark">
                                                <Paperclip className="w-4 h-4" />
                                            </button>
                                            <button className="text-theme-gray-500 hover:text-theme-dark">@</button>
                                            <button className="text-theme-gray-500 hover:text-theme-dark">😊</button>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-theme-primary hover:bg-theme-primary/90 text-white h-7 text-xs px-4"
                                            disabled={!comment.trim()}
                                        >
                                            {t('ticket_modal.save')}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* 활동 로그 */}
                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-theme-gray-300 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                            {activity.user.nickname.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm">
                                                <span className="font-semibold text-theme-dark">
                                                    {activity.user.nickname}
                                                </span>{' '}
                                                {activity.action}
                                            </p>
                                            <p className="text-xs text-theme-gray-500 mt-0.5">{activity.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 우측: 사이드 패널 */}
                    <div className="w-44 shrink-0 space-y-4">
                        {/* ADD TO CARD */}
                        <div>
                            <p className="uppercase tracking-wider text-[10px] text-theme-gray-500 font-semibold mb-2">
                                {t('ticket_modal.add_to_card')}
                            </p>
                            <div className="space-y-1.5">
                                <SideButton icon={<Users className="w-4 h-4" />} label={t('ticket_modal.members')} />
                                <SideButton icon={<Tag className="w-4 h-4" />} label={t('ticket_modal.labels')} />
                                <SideButton
                                    icon={<CheckSquare className="w-4 h-4" />}
                                    label={t('ticket_modal.checklist')}
                                />
                                <SideButton icon={<Clock className="w-4 h-4" />} label={t('ticket_modal.dates')} />
                                <SideButton
                                    icon={<Paperclip className="w-4 h-4" />}
                                    label={t('ticket_modal.attachment')}
                                />
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div>
                            <p className="uppercase tracking-wider text-[10px] text-theme-gray-500 font-semibold mb-2">
                                {t('ticket_modal.actions')}
                            </p>
                            <div className="space-y-1.5">
                                <SideButton icon={<ArrowRight className="w-4 h-4" />} label={t('ticket_modal.move')} />
                                <SideButton icon={<Copy className="w-4 h-4" />} label={t('ticket_modal.copy')} />
                                <SideButton
                                    icon={<FileText className="w-4 h-4" />}
                                    label={t('ticket_modal.make_template')}
                                />
                                <div className="h-1" />
                                <SideButton icon={<Archive className="w-4 h-4" />} label={t('ticket_modal.archive')} />
                            </div>
                        </div>

                        {/* Share 버튼 */}
                        <Button className="w-full bg-theme-primary hover:bg-theme-primary/90 text-white font-semibold text-sm h-9">
                            <Share2 className="w-4 h-4 mr-1.5" />
                            {t('nav.share')}
                        </Button>

                        {/* Watching */}
                        <div className="bg-theme-primary-light rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <Eye className="w-4 h-4 text-theme-primary" />
                                <span className="text-xs font-bold text-theme-primary uppercase">
                                    {t('ticket_modal.watching')}
                                </span>
                            </div>
                            <p className="text-[10px] text-theme-gray-500 mb-2 leading-relaxed">
                                {t('ticket_modal.watching_desc')}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 w-full border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white"
                            >
                                {t('ticket_modal.stop_watching')}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

/** 사이드 패널 버튼 */
const SideButton = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md bg-theme-gray-100/70 hover:bg-theme-gray-100 text-sm text-theme-dark font-medium transition-colors text-left">
        <span className="text-theme-gray-500">{icon}</span>
        {label}
    </button>
);

export default TicketDetailModal;
