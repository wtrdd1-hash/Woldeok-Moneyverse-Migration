# Orca 헤드리스 개발 런타임 — v2026.11.25.1805
[English](ORCA_HEADLESS_INSTALL_v2026.11.25.1805.md) | 한국어

릴스 https://www.instagram.com/reel/DgHzCs1A3zr/ 공개 oEmbed 설명 확인, 영상 미검증. 공식 https://orca.dev/docs/remote-servers 및 https://orca.dev/docs/bots/security 확인. 공식 v1.4.274 Linux x64 서버 패키지 SHA256 b2f34c5a80e5b00f2b260833c1f9869e40e5e499cb2e9693e585a6c029c1c7ca 검증 후 개발 계정에 설치.

systemd 사용자 서비스 mv-orca.service 자동 시작 등록, 기존 linger 활성. 127.0.0.1:6768 로컬 바인딩, 외부 주소 거부, 페어링 비활성, 감독 실행, DO_NOT_TRACK=1. 메모리 상한 768M/CPU 50% 및 터미널 제한 요청. 이는 보안 샌드박스가 아니며 개발 계정 OS 권한을 공유한다. 외부 포트, 방화벽, 외부 계정, 예약, 실제 프로젝트 등록, 운영/테스트 변경 없음.

실측: 런타임 ready/reachable, TCP 연결, 서비스 enabled/running, PTY 자체검사, Claude/Codex/Gemini 감지, Orca 예약 0개. 가상 로컬 Git 저장소와 격리 worktree 생성 후 터미널 ORCA_SMOKE_OK 확인. 실제 모델 응답, 인증, 봇 승인 모드, 모바일 페어링 미검증. Chromium 미설정으로 브라우저 자동화 불가. 당시 여유 메모리 약 0.6~0.9 GiB 및 높은 swap 사용률로 동시 실행 보류. 봇 생성 및 승인 설정은 지원 클라이언트 UI에서 진행해야 한다.

실제 머니버스 작업 전 최신 통합문서, 격리 브랜치, Gemini 작업 소유권, 명시적 승인/읽기 전용 우선, 독립 Test 및 별도 운영 승격 승인 준수. 기존 예약 유지. 로컬 기록 ~/orca-install-20261125-1805.log.
