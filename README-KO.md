# 🌙 월덕 머니버스 — 한국어 문서

이 페이지는 월덕 머니버스의 **한국어 문서 진입점**입니다.

## 한국어 문서 바로가기

- 📚 [한국어 문서 전체 색인](docs/INDEX.ko.md)
- 📝 [기획서](docs/planning/PROJECT_PLAN.ko.md)
- 🧭 [시스템 개요](docs/architecture/system-overview.ko.md)
- 🤖 [디스코드 음악 봇 & 음성 상주 데몬](bot/README-KO.md)
- 🎮 [기능 문서](docs/features/jobs-and-progression.ko.md)
- 🔐 [보안 모델](docs/operations/security-model.ko.md)
- 🚀 [운영 배포](docs/operations/production-deployment.ko.md)
- 💾 [백업 및 복구](docs/operations/backup-and-recovery.ko.md)
- 📱 [모바일 / 외부 앱 API](docs/mobile-api.ko.md)
- 📜 [한국어 변경 기록](docs/changelog/CHANGELOG.ko.md)
- 🧾 [한국어 업데이트 로그](docs/UPDATE_LOG.ko.md)

## 🤖 디스코드 음악 봇 (Discord Bot)

월덕 머니버스는 웹 플랫폼과 긴밀히 연동되는 전용 디스코드 음악 봇 및 24/7 음성방 상주 데몬을 자체 탑재하고 있습니다.

- **무제한 음악 스트리밍**: 3시간 제한 없는 장시간 음원 및 로파이/수면음악 연속 재생 (`/play`)
- **실시간 볼륨 조절**: 끊김 없는 온더플라이 볼륨 제어 (`/volume 0~200%`)
- **SponsorBlock & FFmpeg 정밀 절단**: 유튜브 자체 광고 및 잡담 인트로를 0초 만에 완벽 제거하고 음악 본편 즉시 재생
- **24/7 불사 음성 상주**: 강제 퇴장이나 채널 이동 시 1초 내 즉시 원위치 자동 복귀
- **명령어 전체 공개**: 모든 멤버가 신청곡과 대기열을 실시간으로 함께 확인

자세한 명령어와 실행 방법은 [디스코드 봇 상세 문서](bot/README-KO.md)를 참조하세요.

## 한국어 문서 이동 원칙

한국어 문서에서 기능, 아키텍처, 운영, **기획서**, 변경 기록, 작업 로그 등 다른 일반 문서로 이동할 때는 **한국어 문서(`*.ko.md`)를 우선 연결**합니다.

- 기획 관련 문서는 사용자에게 **기획서**로 표시합니다.
- 일반 문서 링크가 영문 문서로 자동 이동하지 않도록 합니다.
- 영어 문서는 영어 문서 체계에서 별도로 유지합니다.
- 기본 문서 언어 순서는 **1. English / 2. 한국어**입니다.

영문 메인 문서가 필요한 경우에만 [English README](README.md)를 직접 선택하세요.
