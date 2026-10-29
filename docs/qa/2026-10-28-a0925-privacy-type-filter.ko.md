# 개발 A QA — 2026-10-28 09:25 — 개인정보 요청 종류 필터

**PARTIAL / RELEASE HOLD.** 회원 본인의 최근 개인정보 요청을 5개 종류별로 필터링하는 Backend·PostgreSQL·Web·Android app-api 기능을 구현함. 기존 전체 조회는 최근 30건 유지, 종류 필터는 최근 100건 내 최대 30건. 잘못된 종류는 HTTP 400, 회원 전용 no-store/noindex. 신규 마이그레이션 및 금융 변경 없음.

TDD RED: Backend 3건·Web 2건 실패. GREEN: Backend 집중 4건·Web/Android 31건 통과. 전체 Backend 1,931 PASS/440 SKIP, Frontend 1,866 PASS, Bot 11 PASS, DB 45 PASS/3 SKIP, API 계약 180개 PASS, 타입 검사·Backend/기본 Next.js 빌드·전체 Lint 오류 0건·High 이상 보안 감사 PASS. 격리 PostgreSQL 17에서 최근 100건 제한, 최대 30건, 타 회원 차단, 직접 테이블 조회 거부 확인.

루트 전체 테스트는 100초 제한으로 중단. 공식 Test exact-SHA 로그인 E2E·전체 접근성/SEO·독립 복원·운영 승격 미검증. Test·Production 릴리스 링크 대상 부재. 운영 버전 응답 unknown. 병합·배포 금지. 일괄 PR 폐쇄 사건은 #1663에 기록하고 삭제된 352개 PR의 복구 가능 커밋을 로컬 참조로 보호함.
