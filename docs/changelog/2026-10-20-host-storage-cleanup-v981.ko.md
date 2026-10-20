# v2026.10.20.981 — 미니PC 루트 디스크 안전 정리

**상태: 실기기 확인 완료 / GitHub 문서만 갱신.** [영문](2026-10-20-host-storage-cleanup-v981.md).

- 오래된 Gradle 9.5.0 생성 캐시, root npm 캐시, 9월 19일 Next.js 산출물 등 재생성 가능한 비활성 폴더 3개 삭제.
- 시스템 디스크 사용률 64%→62%; 1,505,574,912바이트 확보, inode 26,830개 감소. 데이터 SSD는 23% 유지.
- 운영/테스트 릴리스, DB·WAL, 백업, Docker 볼륨, 모든 Git 작업트리·소스, Android AVD 및 최근 캐시 보존.
- 백엔드·프론트엔드·봇·MCP·Nginx·Docker active, PostgreSQL 정상, 로컬 홈페이지 HTTP 200, 운영/Test 포인터 유지.
- 앱 코드·마이그레이션·운영 승격 없음. [상세 작업기록](../worklog/2026-10-20-host-storage-cleanup-v981.ko.md).
