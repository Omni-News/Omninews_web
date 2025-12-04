# OmniNews Web - Docker 배포 가이드

## 필수 요구사항

- Docker
- Docker Compose

## 빠른 시작

### 1. 환경 변수 설정

`.env` 파일이 있는지 확인하고, 필요한 환경 변수를 설정하세요:

```bash
VITE_API_BASE_URL=https://www.kang1027.com/v1/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

### 2. Docker로 실행

**방법 1: 스크립트 사용 (권장)**

```bash
./start.sh
```

**방법 2: Docker Compose 직접 사용**

```bash
# 빌드 및 실행
docker-compose up -d

# 빌드 없이 실행 (이미 빌드된 경우)
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down

# 완전 제거 (볼륨 포함)
docker-compose down -v
```

## 접속

웹 앱이 실행되면 다음 주소로 접속할 수 있습니다:

- **웹 앱**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 포트 변경

다른 포트를 사용하려면 `docker-compose.yml` 파일에서 포트 매핑을 수정하세요:

```yaml
ports:
  - "8080:80"  # 8080 포트로 변경
```

## 문제 해결

### 빌드 실패

```bash
# 캐시 없이 다시 빌드
docker-compose build --no-cache

# 이미지 완전 재생성
docker-compose down
docker system prune -a
docker-compose up -d --build
```

### 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker-compose ps

# 상세 로그 확인
docker-compose logs -f omninews-web

# 컨테이너 내부 접속
docker-compose exec omninews-web sh
```

### 환경 변수 확인

```bash
# 컨테이너 환경 변수 확인
docker-compose exec omninews-web env
```

## 프로덕션 배포

프로덕션 환경에서는 다음을 고려하세요:

1. **HTTPS 설정**: Nginx에 SSL 인증서 추가
2. **환경 변수 보안**: `.env` 파일을 안전하게 관리
3. **리소스 제한**: Docker Compose에 메모리/CPU 제한 추가
4. **모니터링**: Health check 및 로그 모니터링 설정
5. **백업**: 볼륨 데이터 백업 전략 수립

## 아키텍처

```
Dockerfile (Multi-stage build)
├── Stage 1: Builder (Node.js)
│   ├── npm ci (의존성 설치)
│   └── npm run build (Vite 빌드)
└── Stage 2: Production (Nginx Alpine)
    ├── 빌드된 파일 복사
    ├── Nginx 설정 복사
    └── 포트 80으로 서비스
```

## 파일 구조

```
Omninews_web/
├── Dockerfile              # Multi-stage Docker 빌드 설정
├── docker-compose.yml      # Docker Compose 설정
├── nginx.conf              # Nginx 웹 서버 설정
├── .dockerignore           # Docker 빌드 제외 파일
├── start.sh                # 간편 실행 스크립트
└── .env                    # 환경 변수 (Git에 커밋하지 마세요!)
```

## 성능 최적화

- **Gzip 압축**: 모든 정적 파일 압축
- **캐싱**: 정적 리소스 1년 캐시
- **Alpine 이미지**: 작은 이미지 크기 (~50MB)
- **Multi-stage build**: 빌드 도구 제외

## 지원

문제가 발생하면 이슈를 등록해주세요.
