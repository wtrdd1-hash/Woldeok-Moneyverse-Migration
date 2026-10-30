# 개발 A — 공개 게시판 최근 글 제목 검색 (2026-10-30)

상태: **진행 중 / Draft / 운영 배포 보류**. 영문 문서가 원본입니다.

- 기준 main: `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`.
- 독립 브랜치: `auto/hourly-a-20261030-1557-board-title-search`.
- 검색 범위는 기존 DB 함수에서 제공하는 **최신 공개 글 50건**으로 제한합니다. 전체 게시판 검색이라고 표시하지 않습니다.
- 기존 PostgreSQL SECURITY DEFINER 함수와 읽기 전용 SQL만 사용합니다. 신규 마이그레이션·금융 원장 변경 없음.
- Backend/Next.js/Android app-api 및 보안·접근성·SEO 회귀테스트 후 검증되지 않은 항목은 BLOCKED로 기록합니다.
- 다른 개발 작업과 미통합 브랜치를 보호하고 모든 필수 게이트가 PASS가 아니면 병합 및 배포하지 않습니다.
