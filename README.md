# Omninews Web

뉴스와 RSS를 쉽게 볼 수 있는 웹 애플리케이션입니다.

## 링크

- 웹사이트: https://kang1027.com/omninews
- iOS 앱: https://apps.apple.com/kr/app/omninews/id6746567181?l=en-GB

## 기술 스택

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Material-UI** - UI 컴포넌트
- **React Router** - 라우팅
- **Zustand** - 상태 관리
- **React Query** - 서버 상태 관리
- **Google OAuth** - 인증

## 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
```

### 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값을 입력하세요.

```bash
cp .env.example .env
```

필요한 환경 변수:
- `VITE_API_BASE_URL` - API 서버 주소
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth 클라이언트 ID

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 프리뷰

```bash
npm run preview
```

## 주요 기능

- 뉴스 피드 조회
- RSS 피드 구독 및 관리
- 폴더별 피드 정리
- 검색 기능
- Google 로그인
