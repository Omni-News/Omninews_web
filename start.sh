#!/bin/bash

# OmniNews Web 시작 스크립트

set -e

echo "🚀 OmniNews Web 시작 중..."

# 환경 확인
if [ ! -f ".env" ]; then
    echo "⚠️  경고: .env 파일이 없습니다."
    echo "   환경 변수가 제대로 설정되지 않을 수 있습니다."
fi

# Docker 빌드 및 실행
echo "📦 Docker 이미지 빌드 중..."
docker-compose build

echo "🔄 컨테이너 시작 중..."
docker-compose up -d

echo "⏳ 컨테이너가 준비될 때까지 대기 중..."
sleep 3

echo ""
echo "✅ OmniNews Web이 시작되었습니다!"
echo ""
echo "📊 상태 확인: docker-compose ps"
echo "📝 로그 확인: docker-compose logs -f"
echo "🛑 중지: docker-compose down"
echo ""
echo "🌐 웹 앱: http://localhost:3000"
echo ""
