# v2026.10.15.638 — 시스템·기능 오류 검증 작업기록

**범위:** 운영 읽기 전용 GET/로그/DB SELECT, 최신 main 격리 빌드·테스트. **브랜치:** `audit/system-function-runtime-v2026.10.15.638`.

## 작업 전 (2026-10-15 09:38 KST)
- 미니PC $pc 직접 접속, `AGENTS.md`, 문서 정책, 프로젝트·통합기획, 기존 v636/v637 보고서·열린 PR 확인. GitHub main SHA `c03b0a9b9c3018e7257c4be1d02bcbbf44d59961`. 실제 운영 `prod-v600`, 테스트 별칭 `test-v618`.
- 실서버 `/srv/moneyverse-tasks/audit-20261015-runtime-v638/00-before.md` 기록 생성 후 시작. 시스템 무변경·실거래 금지, 격리 worktree 테스트 계획.

## 작업 중 (09:39~09:50 KST)
- 핵심 서비스 active/재시작 0, 백엔드 health 200, 버전 API unknown, 시간제 QA/백업 정상 one-shot 및 별도 v635 canary 가동 확인.
- `http-smoke.py` 실행: 공개 GET 145개, 200×138·401×1·404×6·5xx×0, 13개는 로그인으로 이동. 원자료 `http-smoke.json`.
- Nginx 로그의 10/15 고객지원 502 1회·캔들 503 1회, 10/14 캔들 503·JS 500·일부 502와 Next 스트림 중단 37회 시간 분리. 고객지원 재검사 401 정상.
- 실제 주식/잘못된 문자열/전체 0 UUID/정상 형식의 존재하지 않는 UUID로 캔들 API 상태코드 직접 확인. 백엔드 400/500을 프론트가 503으로 왜곡하는 문제 재현.
- 신규 격리 의존성 설치 후 공통 계약 빌드 누락으로 최초 테스트 실행 실패, 계약 빌드 후 프론트 1,206·백엔드 DB 제외 1,185/29 skip·타입·전체 빌드·모바일 API 계약 통과. 봇 기본 4 통과, 부가 봇 QA 구문 실패. 전체 라우트 QA 명령의 `--inventory` 누락 재현.
- DB SELECT만 수행: 테이블 241, 앱 계정 DML 237, PUBLIC DEFINER 함수 11, 원장 거래 831/분개 1,692·장부 불균형 0. origin/main 재조회 SHA 불변, `01-midpoint.md` 보관.

## 작업 종료/배포
- [한국어 보고서](../findings/MONEYVERSE_RUNTIME_SYSTEM_FUNCTION_VERIFICATION_v2026.10.15.638.ko.md) · [영문 정본](../findings/MONEYVERSE_RUNTIME_SYSTEM_FUNCTION_VERIFICATION_v2026.10.15.638.md) · 내부용·GitHub용 변경내역과 버전 로그 기록.
- 결론 **BLOCKED**: 404 링크, 캔들 API 오류 코드, 과거 5xx, QA 미포괄, DB 최소권한 및 배포 불일치.
- 코드·금융 DB·계정·스위치·운영 심볼릭 링크 무변경. Test/운영 승격·main 병합 없음. 개선은 별도 승인과 동일 SHA 검증 선행.
