import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';

/**
 * 인증 상태 관리 커스텀 훅
 * - 로컬 스토리지에서 토큰과 사용자 정보를 관리
 * - 로그인/로그아웃 함수 제공
 */
export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 초기 로드 시 로컬 스토리지에서 인증 정보 복원
    useEffect(() => {
        const token = localStorage.getItem('trollo_token');
        const storedUser = localStorage.getItem('trollo_user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } catch {
                // 파싱 에러 시 정보 초기화
                localStorage.removeItem('trollo_token');
                localStorage.removeItem('trollo_user');
            }
        }
        setIsLoading(false);
    }, []);

    // 로그인 처리: 토큰과 사용자 정보를 로컬 스토리지에 저장
    const saveAuth = useCallback((token: string, userData: User) => {
        localStorage.setItem('trollo_token', token);
        localStorage.setItem('trollo_user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    }, []);

    // 로그아웃 처리: 로컬 스토리지에서 정보 제거
    const logout = useCallback(() => {
        localStorage.removeItem('trollo_token');
        localStorage.removeItem('trollo_user');
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    return { user, isAuthenticated, isLoading, saveAuth, logout };
};
