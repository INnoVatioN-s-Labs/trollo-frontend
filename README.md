# Trollo Frontend

Trollo 애플리케이션의 클라이언트(프론트엔드) 저장소입니다. 사용자가 워크스페이스를 생성하고 직관적인 칸반 보드(Kanban Board) 형태의 티켓 관리를 할 수 있도록 설계된 모던 웹 인터페이스입니다.

## 🚀 프로젝트 개요

- **목적**: 시각적으로 뛰어나고 생산성 높은 프로젝트 협업 도구(Trello Clone) UI/UX 제공.
- **주요 뷰포인트**:
    - Sunset & Ink 테마 기반의 독창적이고 따뜻한 컬러 팔레트 적용.
    - 다국어 완벽 지원 (한국어 / 영어 i18n 환경 구성 완료).
    - JWT 기반의 안전한 로그인/회원가입 세션 유지.
- **핵심 UI 컴포넌트**: 반응형 네비게이션, 칸반 컬럼 리스트, 상세 티켓 모달 뷰어.

## 🛠️ 기술 스택 (Tech Stack)

- **핵심 프레임워크 (Core)**: React 19 (TypeScript)
- **번들러 및 빌드 (Build Tool)**: Vite
- **스타일링 (Styling)**: Tailwind CSS v4, Radix UI, shadcn/ui 기반 컴포넌트
- **라우팅 (Routing)**: React Router Dom v7
- **HTTP/API 통신**: Axios (요청/응답 인터셉터 기반 권한 처리)
- **국제화 (i18n)**: i18next & react-i18next (클라이언트 브라우저 언어 자동 감지)
- **배포 (Deployment)**: Vercel (CI/CD 연동)

## 🎨 디자인 시스템 규칙

- **Color Palette (컬러 팔레트)**: 강렬한 Sunset 레드-오렌지 그라데이션과 가독성 높은 Ink Black 톤을 믹스매치하여 프리미엄하고 모던한 UI를 제공합니다. (`src/styles/palette.css`)
- **Typography (타이포그래피)**: `Pretendard Variable` 폰트를 사용하여 매끄러운 반응형 텍스트를 제공합니다.

## 📂 프로젝트 디렉토리 구조

```text
src/
├── api/            # 외부 백엔드 통신을 위한 로직 (Axios 인스턴스, 인증 인터셉터, 도메인별 API)
├── components/     # 재사용 가능한 UI 블록 (Kanban 모듈, shadcn/ui 공통 모듈 등)
├── hooks/          # 커스텀 훅 (비즈니스 로직 및 상태 분리용 리액트 훅)
├── locales/        # 다국어 번역 리소스 파일 (ko.json, en.json)
├── pages/          # 애플리케이션 라우트에 매핑되는 메인 뷰 페이지
├── styles/         # 글로벌 스타일 시트 및 CSS 변수 토큰 사전 (palette.css)
└── types/          # TypeScript 글로벌 타입 및 인터페이스 명세서
```

## 💻 환경 변수 설정 (Environment Variables)

API 연동을 위해 `.env` 파일 설정을 사용합니다. `.env.example`을 참고하여 로컬과 운영 환경의 API BASE URL을 설정할 수 있습니다.
저장소에는 보안을 위해 실제 `.env` 파일(e.g., `.env.local`, `.env.prod`)은 올라가지 않고 Gitignore 처리되어 있습니다.

- **`.env.local` (로컬 개발용)**
    ```env
    VITE_API_BASE_URL=http://localhost:8080/api
    ```
- **`.env.prod` (운영 및 Vercel 배포용)**
    ```env
    VITE_API_BASE_URL=https://api.yourdomain.com/api
    ```

## 💻 빌드 및 실행 방법 (Getting Started)

### 1. 요구 사항

- Node.js (v18 및 이상 권장)
- npm 호환 패키지 매니저

### 2. 의존성 설치

```bash
cd trollo-frontend
npm install
```

### 3. 개발 서버 실행

로컬 데이터베이스와 백엔드 서버(Spring Boot)를 함께 실행하고 진행해야 정상적인 작동이 가능합니다.

```bash
npm run dev
```

(기본 포트는 일반적으로 `http://localhost:5173` 입니다.)

### 4. 프로덕션 빌드 및 린트 검사

```bash
# 프로덕션 최적화 빌드 산출물 생성 (.dist 폴더)
npm run build

# 코드 정적 분석
npm run lint

# 빌드 산출물 서버로 임시 구동
npm run preview
```

## ☁️ 배포 (Deployment)

프론트엔드 프로젝트는 **Vercel**을 통해 배포되고 관리됩니다.

### Vercel 환경 변수 설정

Vercel 대시보드에서 프로젝트 설정 탭(Project Settings -> Environment Variables)으로 이동하여, 다음 변수를 필수로 등록해야 합니다.

- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://api.yourdomain.com/api`

> 💡 **Mixed Content 구조적 해결**
>
> Vercel에 배포된 애플리케이션은 기본적으로 안전한 `HTTPS` 환경에서 동작합니다. 브라우저 보안 정책 상, 이 환경에서 백엔드의 불안전한 `HTTP` API를 호출하면 통신이 강제 차단되는 **Mixed Content Block** 현상이 발생합니다.
>
> 이를 근본적으로 해결하기 위해, 로컬 프론트엔드 프록시 기능에 의존하던 기존의 우회 방식을 폐기하고 프론트엔드 코드는 그대로 두는 대신 서비스(클라우드 인스턴스)에 **Nginx 리버스 프록시와 Let's Encrypt를 통해 무료 SSL(HTTPS)** 인증서를 적용했습니다. 결과적으로 `https://api.yourdomain.com` 을 통해서 백엔드 역시 안전한 HTTPS 통신이 가능해져 운영 환경의 연결성이 보장되었습니다.

## 🌍 다국어 적용 (i18n)

`locales/ko.json`(기본 한국어) 파일과 `locales/en.json`(영문 폴백) 파일을 사용하여 문구를 매핑합니다.
개발 중 텍스트 추가가 필요하다면 UI상에 하드코딩하지 않고 번역 JSON 파일에 규칙적인 키(Key) 객체 형태로 등록한 뒤, `useTranslation()` 훅을 사용하여 렌더링해야 합니다.
