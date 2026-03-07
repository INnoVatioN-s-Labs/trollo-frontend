import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { User } from '@/types';
import { login } from '@/api/auth';
import { parseJwt } from '@/lib/utils';
import { Mail, Lock, LogIn, Github } from 'lucide-react';

interface LoginPageProps {
    onLogin: (token: string, user: User) => void;
}

/**
 * 로그인 페이지 (디자인 시안: trollo_login_updated)
 * - Brand Orange CTA 버튼
 * - 소셜 로그인 (Google / GitHub) - 디자인만 구현
 * - 하단 풋터 (Terms, Privacy, Help Center)
 */
const LoginPage = ({ onLogin }: LoginPageProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('이메일과 비밀번호를 모두 입력해 주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await login({ email, password });
            const token = res.accessToken;

            // JWT에서 유저 이메일 추출
            const decoded = parseJwt(token);
            const userEmail = decoded?.sub ?? email;

            // 프론트엔드 상태 관리를 위한 임시 User 객체 생성
            const user: User = {
                id: Date.now(), // 또는 토큰의 id 값을 쓰지만 없다면 임시 발급
                email: userEmail,
                nickname: userEmail.split('@')[0], // 이메일 앞부분을 닉네임으로
            };

            onLogin(token, user);
        } catch {
            setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30">
            {/* 메인 콘텐츠 */}
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl border-0 bg-white">
                    <CardHeader className="text-center space-y-4 pt-10 pb-2">
                        {/* 로고 */}
                        <div className="mx-auto w-14 h-14 rounded-xl bg-trollo-orange flex items-center justify-center shadow-lg shadow-trollo-orange/20">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="14" y="14" width="4" height="4" rx="1" fill="white" />
                                <path d="M20 14.5V18.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                <path d="M18 16.5H22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-trollo-navy tracking-tight">Trollo Login</h1>
                            <p className="text-sm text-trollo-gray-500 mt-1">
                                Welcome back! Manage your team tasks effectively.
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="px-8 pt-4 pb-2">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* 에러 메시지 */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                                    {error}
                                </div>
                            )}

                            {/* 이메일 */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="flex items-center gap-1.5 text-sm font-medium text-trollo-navy"
                                >
                                    <Mail className="w-4 h-4 text-trollo-gray-500" />
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 border-trollo-gray-300 focus:border-trollo-orange focus:ring-trollo-orange/20"
                                />
                            </div>

                            {/* 비밀번호 */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="flex items-center gap-1.5 text-sm font-medium text-trollo-navy"
                                    >
                                        <Lock className="w-4 h-4 text-trollo-gray-500" />
                                        Password
                                    </Label>
                                    <button
                                        type="button"
                                        className="text-xs text-trollo-orange hover:underline font-medium"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 border-trollo-gray-300 focus:border-trollo-orange focus:ring-trollo-orange/20"
                                />
                            </div>

                            {/* 로그인 유지 */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="keepLoggedIn"
                                    className="w-4 h-4 rounded border-trollo-gray-300 text-trollo-orange focus:ring-trollo-orange/20 accent-trollo-orange"
                                />
                                <label htmlFor="keepLoggedIn" className="text-sm text-trollo-gray-500">
                                    Keep me logged in
                                </label>
                            </div>

                            {/* 로그인 버튼 */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 bg-trollo-orange hover:bg-trollo-orange/90 text-white font-semibold text-base rounded-lg shadow-md shadow-trollo-orange/20 transition-all"
                            >
                                {isSubmitting ? (
                                    '로그인 중...'
                                ) : (
                                    <>
                                        Sign In
                                        <LogIn className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* 구분선 */}
                        <div className="relative my-6">
                            <Separator className="bg-trollo-gray-100" />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-trollo-gray-500 uppercase tracking-widest">
                                or continue with
                            </span>
                        </div>

                        {/* 소셜 로그인 */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                type="button"
                                className="h-11 border-trollo-gray-300 text-trollo-navy hover:bg-trollo-gray-100/50"
                            >
                                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                className="h-11 border-trollo-gray-300 text-trollo-navy hover:bg-trollo-gray-100/50"
                            >
                                <Github className="w-4 h-4 mr-2" />
                                GitHub
                            </Button>
                        </div>
                    </CardContent>

                    <CardFooter className="justify-center pb-8 pt-4">
                        <p className="text-sm text-trollo-gray-500">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-trollo-orange font-semibold hover:underline">
                                Create an account
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>

            {/* 하단 풋터 */}
            <footer className="py-6 text-center space-y-2">
                <div className="flex items-center justify-center gap-6 text-sm text-trollo-gray-500">
                    <button className="hover:text-trollo-navy transition-colors">Terms of Service</button>
                    <button className="hover:text-trollo-navy transition-colors">Privacy Policy</button>
                    <button className="hover:text-trollo-navy transition-colors">Help Center</button>
                </div>
                <p className="text-xs text-trollo-gray-300">© 2024 Trollo Productivity Inc. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LoginPage;
