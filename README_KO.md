# OmniNews Web App

OmniNews 백엔드 API를 사용하는 완전한 기능의 웹 애플리케이션입니다.

## 기능

### 인증
- 데모 로그인 (이메일/비밀번호)
- JWT 토큰 자동 갱신
- 보호된 라우트

### 뉴스 뷰어
- 카테고리별 뉴스 조회 (정치, 경제, 사회, 생활/문화, 세계, IT/과학)
- 뉴스 요약 및 원본 링크
- 반응형 카드 레이아웃

### RSS 피드 관리
- 구독 채널 관리
- RSS 피드 추가/삭제
- 추천 채널 탐색
- 채널별 RSS 아이템 조회
- 페이지네이션

### 폴더 관리
- 폴더 생성/수정/삭제
- 채널을 폴더로 구성
- 폴더에 채널 추가/제거

### 검색
- RSS 아이템 검색
- RSS 채널 검색
- 외부 뉴스 API 검색
- 정확도/인기도/최신순 정렬

### 설정
- 테마 변경
- 푸시 알림 설정
- 계정 정보
- 로그아웃
- 계정 삭제

## 기술 스택

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Material-UI (MUI)** - UI 컴포넌트
- **React Router** - 라우팅
- **TanStack Query (React Query)** - 서버 상태 관리
- **Zustand** - 클라이언트 상태 관리
- **Axios** - HTTP 클라이언트
- **Vite** - 빌드 도구

## 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일이 이미 생성되어 있습니다:
```
VITE_API_BASE_URL=http://127.0.0.1:1027/v1/api
```

프로덕션 서버를 사용하려면:
```
VITE_API_BASE_URL=http://61.253.113.42:1027/v1/api
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:5173 으로 접속

### 4. 로그인
데모 계정 정보를 사용하여 로그인하세요.

## 프로젝트 구조

```
src/
├── api/                    # API 클라이언트 및 엔드포인트
│   ├── client.ts          # Axios 인스턴스 (인증 인터셉터)
│   └── endpoints/         # API 엔드포인트 함수들
│       ├── auth.ts        # 인증 API
│       ├── news.ts        # 뉴스 API
│       ├── rss.ts         # RSS API
│       ├── subscription.ts # 구독 API
│       ├── folder.ts      # 폴더 API
│       └── search.ts      # 검색 API
├── components/            # React 컴포넌트
│   ├── Layout.tsx         # 메인 레이아웃
│   └── ProtectedRoute.tsx # 보호된 라우트
├── pages/                 # 페이지 컴포넌트
│   ├── Login.tsx          # 로그인 페이지
│   ├── News.tsx           # 뉴스 페이지
│   ├── RssFeed.tsx        # RSS 피드 페이지
│   ├── Folders.tsx        # 폴더 관리 페이지
│   ├── Search.tsx         # 검색 페이지
│   └── Settings.tsx       # 설정 페이지
├── store/                 # Zustand 스토어
│   └── authStore.ts       # 인증 상태
├── types/                 # TypeScript 타입 정의
│   └── index.ts          # API 응답 타입들
├── App.tsx               # 메인 앱 (라우팅)
└── main.tsx             # 진입점
```

## 주요 기능 설명

### 자동 토큰 갱신
API 클라이언트는 401 에러 발생 시 자동으로 refresh token을 사용하여 access token을 갱신합니다.

### 사용자별 데이터
모든 API 요청에 JWT 토큰이 포함되어 사용자별로 데이터가 분리됩니다:
- 구독 채널
- 폴더 구성
- 테마 설정
- 알림 설정

### 반응형 디자인
Material-UI를 사용하여 모바일과 데스크톱 모두 지원합니다.

## 빌드

프로덕션 빌드:
```bash
npm run build
```

빌드 미리보기:
```bash
npm run preview
```

## 개발 팁

### API 엔드포인트 추가
1. `src/types/index.ts`에 타입 추가
2. `src/api/endpoints/`에 API 함수 추가
3. 페이지 컴포넌트에서 React Query 사용

### 새 페이지 추가
1. `src/pages/`에 컴포넌트 생성
2. `src/App.tsx`에 라우트 추가
3. `src/components/Layout.tsx`에 메뉴 아이템 추가

## 문제 해결

### 백엔드 연결 안됨
- `.env` 파일에서 `VITE_API_BASE_URL` 확인
- 백엔드 서버가 실행 중인지 확인 (http://127.0.0.1:1027)

### 로그인 실패
- 올바른 데모 계정 정보 사용
- 브라우저 콘솔에서 에러 확인

### 토큰 만료
- 자동으로 갱신되어야 하지만, 실패 시 다시 로그인

## 라이선스
OmniNews 프로젝트의 일부
