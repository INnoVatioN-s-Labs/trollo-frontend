import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { signup } from '@/api/auth';
import { User as UserIcon, Mail, Lock, ShieldCheck, ArrowRight, Github } from 'lucide-react';

/**
 * 회원가입 페이지 (디자인 시안: trollo_signup_updated)
 * - 상단 Trollo 네비게이션 바
 * - Full Name, Email, Password, Confirm Password
 * - 약관 동의 체크박스
 * - 소셜 로그인 (Google / GitHub)
 */
const SignupPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!nickname.trim() || !email.trim() || !password.trim()) {
            setError(t('auth.fill_all_fields'));
            return;
        }
        if (password !== confirmPassword) {
            setError(t('auth.passwords_do_not_match'));
            return;
        }
        if (password.length < 8) {
            setError(t('auth.password_min_length'));
            return;
        }
        if (!agreedToTerms) {
            setError(t('auth.terms_required'));
            return;
        }

        setIsSubmitting(true);
        try {
            await signup({ email, password, nickname });
            // Removed as per instruction, assuming navigation will handle post-signup flow
            navigate('/login'); // Redirect to login after successful signup
        } catch {
            setError(t('auth.signup_failed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-theme-primary-light/30 via-white to-slate-50">
            {/* 상단 네비게이션 바 */}
            <header className="h-14 border-b border-theme-gray-100 bg-white px-6 flex items-center justify-between shrink-0">
                <Link to="/login" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-theme-primary flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" />
                            <rect x="14" y="14" width="4" height="4" rx="1" fill="white" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-theme-dark">Trollo</span>
                </Link>
                <div className="flex items-center gap-2 text-sm text-theme-gray-500">
                    {t('auth.already_have_account')}{' '}
                    <Link to="/login" className="text-theme-primary font-semibold hover:underline">
                        {t('auth.log_in')}
                    </Link>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl border-0 bg-white">
                    <CardHeader className="text-center space-y-4 pt-10 pb-2">
                        <div className="w-16 h-16 rounded-2xl bg-theme-primary mx-auto flex items-center justify-center shadow-lg shadow-theme-primary/20">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="14" y="14" width="4" height="4" rx="1" fill="white" />
                            </svg>
                        </div>
                        <CardTitle className="text-2xl font-bold text-theme-dark">{t('auth.sign_up')}</CardTitle>
                        <CardDescription className="text-theme-gray-500">
                            {t('auth.create_account_to_get_started')}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pt-4 pb-2">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                                    {error}
                                </div>
                            )}

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="nickname" className="text-sm font-medium text-theme-dark">
                                    {t('auth.full_name')}
                                </Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-gray-500" />
                                    <Input
                                        id="nickname"
                                        placeholder={t('auth.enter_full_name')}
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        required
                                        className="h-12 pl-10 border-theme-gray-300 focus:border-theme-primary"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-theme-dark">
                                    {t('auth.email_address')}
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-gray-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder={t('auth.email')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 pl-10 border-theme-gray-300 focus:border-theme-primary"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-theme-dark">
                                    {t('auth.password')}
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-gray-500" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder={t('auth.password')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 pl-10 border-theme-gray-300 focus:border-theme-primary"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-medium text-theme-dark">
                                    {t('auth.confirm_password')}
                                </Label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-gray-500" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder={t('auth.repeat_password')}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="h-12 pl-10 border-theme-gray-300 focus:border-theme-primary"
                                    />
                                </div>
                            </div>

                            {/* 약관 동의 */}
                            <div className="flex items-start gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="w-4 h-4 mt-0.5 rounded border-theme-gray-300 accent-theme-primary"
                                />
                                <label htmlFor="terms" className="text-xs text-theme-gray-500 leading-relaxed">
                                    {t('auth.terms_agreement_prefix')}{' '}
                                    <span className="text-theme-primary cursor-pointer hover:underline">
                                        {t('auth.terms_of_service')}
                                    </span>{' '}
                                    {t('auth.terms_agreement_and')}{' '}
                                    <span className="text-theme-primary cursor-pointer hover:underline">
                                        {t('auth.privacy_policy')}
                                    </span>
                                    .
                                </label>
                            </div>

                            {/* 회원가입 버튼 */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 bg-theme-primary hover:bg-theme-primary/90 text-white font-semibold text-base rounded-lg shadow-md shadow-theme-primary/20 transition-all"
                            >
                                {isSubmitting ? (
                                    t('auth.signing_up')
                                ) : (
                                    <>
                                        {t('auth.sign_up')}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* 구분선 */}
                        <div className="relative my-6">
                            <Separator className="bg-theme-gray-100" />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-theme-gray-500 uppercase tracking-widest">
                                or continue with
                            </span>
                        </div>

                        {/* 소셜 로그인 */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                type="button"
                                className="h-11 border-theme-gray-300 text-theme-dark hover:bg-theme-gray-100/50"
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
                                className="h-11 border-theme-gray-300 text-theme-dark hover:bg-theme-gray-100/50"
                            >
                                <Github className="w-4 h-4 mr-2" />
                                GitHub
                            </Button>
                        </div>
                    </CardContent>

                    <CardFooter className="justify-center pb-6 pt-2">
                        <p className="text-xs text-theme-gray-300">© 2024 Trollo Inc. Productivity simplified.</p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default SignupPage;
