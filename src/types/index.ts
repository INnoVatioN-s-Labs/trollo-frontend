// ===========================
// 사용자(User) 관련 타입
// ===========================

/** 유저 정보 */
export interface User {
    id: number;
    email: string;
    nickname: string;
    avatarUrl?: string;
}

/** 회원가입 요청 */
export interface SignupRequest {
    email: string;
    password: string;
    nickname: string;
}

/** 로그인 요청 */
export interface LoginRequest {
    email: string;
    password: string;
}

/** 인증 응답 (JWT 토큰 포함) */
export interface AuthResponse {
    accessToken: string;
    tokenType: string;
}

// ===========================
// 워크스페이스(Workspace) 관련 타입
// ===========================

/** 워크스페이스 */
export interface Workspace {
    id: number;
    name: string;
    description?: string;
    coverColor?: string; // 커버 배경색 (hex)
    iconEmoji?: string; // 아이콘 이모지
    memberCount?: number; // 멤버 수
    members?: WorkspaceMember[];
    createdAt: string;
    updatedAt: string;
}

/** 워크스페이스 멤버 */
export interface WorkspaceMember {
    id: number;
    nickname: string;
    avatarUrl?: string;
}

/** 워크스페이스 생성/수정 요청 */
export interface WorkspaceRequest {
    name: string;
    description?: string;
}

// ===========================
// 보드(Board) 관련 타입
// ===========================

/** 보드 (칸반 열) */
export interface Board {
    id: number;
    name: string;
    position: number;
    tickets: Ticket[];
}

/** 보드 생성 요청 */
export interface BoardCreateRequest {
    name: string;
}

/** 보드 순서 변경 요청 */
export interface BoardReorderRequest {
    targetPosition: number;
}

// ===========================
// 티켓(Ticket) 관련 타입
// ===========================

/** 티켓 라벨 */
export interface TicketLabel {
    id: number;
    name: string;
    color: string; // 라벨 색상 (hex 또는 클래스명)
}

/** 체크리스트 항목 */
export interface ChecklistItem {
    id: number;
    text: string;
    checked: boolean;
}

/** 댓글/활동 로그 */
export interface ActivityLog {
    id: number;
    user: { nickname: string; avatarUrl?: string };
    action: string;
    timestamp: string;
}

/** 티켓 (작업 단위) */
export interface Ticket {
    id: number;
    title: string;
    description?: string;
    position: number;
    labels?: TicketLabel[];
    assignees?: WorkspaceMember[];
    dueDate?: string;
    checklist?: ChecklistItem[];
    activities?: ActivityLog[];
    attachmentCount?: number;
    commentCount?: number;
    createdAt: string;
    updatedAt: string;
}

/** 티켓 생성 요청 */
export interface TicketCreateRequest {
    title: string;
    description?: string;
}

/** 티켓 이동 요청 (드래그 앤 드롭) */
export interface MoveTicketRequest {
    targetBoardId: number;
    targetPosition: number;
}

/** 티켓 수정 요청 */
export interface UpdateTicketRequest {
    title: string;
    description?: string;
}

// ===========================
// 칸반(Kanban) 뷰 관련 타입
// ===========================

/** 칸반 통합 조회 응답 */
export interface KanbanView {
    workspaceId: number;
    workspaceName: string;
    workspaceDescription?: string;
    boards: Board[];
}

// ===========================
// API 공통 응답 래퍼
// ===========================

/** ReturnMessage 래퍼 (백엔드 공통 응답 형식) */
export interface ReturnMessage<T> {
    data: T;
    message?: string;
}
