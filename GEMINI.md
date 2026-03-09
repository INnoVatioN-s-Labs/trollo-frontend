# Trollo Frontend 프로젝트 가이드

Trollo Frontend는 사용자가 워크스페이스를 생성하고 칸반 보드(Kanban Board) 형식을 통해 작업을 관리할 수 있는 프로젝트 관리 도구의 프론트엔드 애플리케이션입니다.

## 🚀 프로젝트 개요 (Project Overview)

- **목적**: 효율적인 협업과 작업 추적을 위한 직관적인 칸반 보드 인터페이스 제공.
- **주요 기능**:
    - 사용자 인증 (로그인/회원가입, JWT 기반).
    - 워크스페이스 목록 조회 및 생성.
    - 칸반 보드 기반의 티켓 관리 (드래그 앤 드롭 지원 예정).
    - 다국어 지원 (한국어, 영어).
- **주요 기술 스택 (Tech Stack)**:
    - **Framework**: React 19 (TypeScript).
    - **Build Tool**: Vite.
    - **Styling**: Tailwind CSS v4, Radix UI, shadcn/ui.
    - **Routing**: React Router Dom v7.
    - **API Client**: Axios (인터셉터를 통한 인증 처리).
    - **i18n**: i18next (ko, en).

## 🛠 실행 및 빌드 (Building and Running)

- **개발 서버 실행**:
  ```bash
  npm run dev
  ```
- **프로젝트 빌드**:
  ```bash
  npm run build
  ```
- **린트(Lint) 체크**:
  ```bash
  npm run lint
  ```
- **빌드 결과물 미리보기**:
  ```bash
  npm run preview
  ```

## 📂 프로젝트 구조 (Directory Structure)

- `src/api/`: 백엔드 통신을 위한 API 모듈 (Axios 인스턴스 및 도메인별 API 함수).
- `src/components/`: 재사용 가능한 UI 컴포넌트 및 도메인별 컴포넌트.
    - `ui/`: shadcn/ui 기반의 기초 컴포넌트.
    - `kanban/`: 칸반 보드 관련 전용 컴포넌트.
- `src/hooks/`: 인증(useAuth) 등 비즈니스 로직을 분리한 커스텀 훅.
- `src/locales/`: 다국어 지원을 위한 JSON 번역 파일.
- `src/pages/`: 라우트별 페이지 컴포넌트.
- `src/types/`: TypeScript 인터페이스 및 타입 정의 (`index.ts`).
- `src/styles/`: 전역 스타일 및 테마 설정.

## 📝 개발 컨벤션 (Development Conventions)

1. **컴포넌트 작성**: 화살표 함수(Arrow Function) 형식을 사용하며, 명확한 역할 분담을 지향합니다.
2. **타입 정의**: 모든 데이터 구조는 `src/types/index.ts`에 정의하여 중앙 관리하고, API 응답과 요청에 적극 활용합니다.
3. **API 통신**: `src/api/client.ts`의 `apiClient`를 사용하며, 도메인별 API 함수는 별도 파일로 분리합니다.
4. **스타일링**: Tailwind CSS를 기본으로 사용하며, 테마 관련 변수는 `src/styles/palette.css` 및 `index.css`에서 관리합니다.
5. **다국어**: UI 텍스트는 직접 하드코딩하지 않고 `i18next`를 통해 번역 키를 사용합니다.
6. **주석 및 설명**: 코드 내 주석은 한국어로 작성하며, 기술 용어는 영어를 병기하여 이해를 돕습니다.

## ⚠️ 주의 사항

- **인증**: JWT 토큰은 로컬 스토리지(`trollo_token`)에 저장됩니다. 401 에러 발생 시 자동으로 로그아웃 처리됩니다.
- **API Base URL**: 현재 `/api`로 설정되어 있으며, Vite 설정(`vite.config.ts`)의 프록시를 통해 실제 백엔드 서버와 통신합니다.
