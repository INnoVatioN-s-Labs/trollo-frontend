import type { AuthResponse, LoginRequest, ReturnMessage, SignupRequest } from '@/types';
import apiClient from './client';

/** 회원가입 API */
export const signup = async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ReturnMessage<AuthResponse>>('/auth/signup', data);
    return response.data.data;
};

/** 로그인 API */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ReturnMessage<AuthResponse>>('/auth/login', data);
    return response.data.data;
};
