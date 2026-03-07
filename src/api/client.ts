import axios from 'axios';

/**
 * Axios 기본 인스턴스
 * - baseURL: Vite 프록시를 통해 /api → localhost:8080 으로 전달
 * - 인터셉터(Interceptor)로 JWT 토큰 자동 첨부
 */
const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터: 로컬 스토리지에서 토큰을 가져와 Authorization 헤더에 추가
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('trollo_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 응답 인터셉터: 401 응답 시 토큰을 제거하고 로그인 페이지로 리다이렉트
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('trollo_token');
            localStorage.removeItem('trollo_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
