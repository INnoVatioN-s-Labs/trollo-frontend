import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import WorkspaceListPage from '@/pages/WorkspaceListPage';
import KanbanPage from '@/pages/KanbanPage';

/**
 * Trollo 애플리케이션 루트 컴포넌트
 * - 인증 상태에 따라 라우팅 제어
 * - /login, /signup: 비인증 사용자용
 * - /: 워크스페이스 목록 (인증 필요)
 * - /workspace/:id: 칸반보드 (인증 필요)
 */
const App = () => {
    const { user, isAuthenticated, isLoading, saveAuth, logout } = useAuth();

    // 인증 상태 로딩 중 표시
    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-theme-primary flex items-center justify-center animate-pulse">
                        <span className="text-white font-bold text-lg">T</span>
                    </div>
                    <p className="text-sm text-muted-foreground">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <BrowserRouter>
                <Routes>
                    {/* 인증 라우트 */}
                    <Route
                        path="/login"
                        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onLogin={saveAuth} />}
                    />
                    <Route
                        path="/signup"
                        element={isAuthenticated ? <Navigate to="/" replace /> : <SignupPage onLogin={saveAuth} />}
                    />

                    {/* 워크스페이스 목록 (메인 페이지, 인증 필요) */}
                    <Route
                        path="/"
                        element={
                            isAuthenticated ? (
                                <WorkspaceListPage user={user} onLogout={logout} />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    {/* 칸반보드 (워크스페이스 내, 인증 필요) */}
                    <Route
                        path="/workspace/:workspaceId"
                        element={
                            isAuthenticated ? (
                                <KanbanPage user={user} onLogout={logout} />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    {/* 알 수 없는 경로는 메인으로 리다이렉트 */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    );
};

export default App;
