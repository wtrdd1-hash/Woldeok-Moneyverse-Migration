# Moneyverse 자동 기획 v1488 — 회원 전용 지갑 거래 북마크

**2026-10-30 04:05 KST | 기능 추가 | DRAFT / RELEASE HOLD**

**회차:** 이전 v1486 기능 보완 → 현재 v1488 기능 추가 → 다음 v1490 기능 보완(잠정). **main:** `62c6cd038951d65c94b709302bdaec6e75b080b6` 시작/중간 확인. **개발 이관:** [#1936](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1936). Draft PR 주소는 개설 후 GitHub 업데이트 로그에 기록.

## 시작 조사
- 미니PC Debian 13.6 백엔드/프론트엔드/Discord/MCP/Nginx/Docker active, 개발 DB 연결. 디스크 root 87%, 데이터 94%; 타인 작업·백업 임의 삭제 금지.
- `skills__list`가 URI를 반환하지 않아 `skills__read` 직접 호출 불가. 저장소의 using-superpowers/brainstorming/writing-plans/using-git-worktrees/verification-before-completion을 읽고 기획에 적용. 사람 승인 없는 런타임 구현 없음.
- 최신 main의 AGENTS.md·README.md·영문 PROJECT_PLAN 정본·국문 대조, GitHub PR·QA·이슈 확인. 다른 개발 브랜치와 분리된 작업 폴더.

## 근거와 설계
- 프론트엔드 지갑 내역은 본인 거래 50건/페이지·기간·커서만 제공하고 북마크 CTA가 없음. 백엔드 지갑 컨트롤러에도 북마크 API 없음. 원장·계정 SQL 확인. 개발 PostgreSQL 읽기 전용 검사에서 북마크 테이블 없음, 거래 891건(운영 수량 아님).
- F675-178은 저장 필터(F675-176), 월별 요약(F675-177)과 별도. 본인 WLD 거래 100개 저장/삭제, 수신 송금 및 동결/종료 계정 과거 내역, 20/50 키셋, HMAC 커서, 50개 상태 조회, 동일 키 멱등 트랜잭션, 직접 DML 없는 권한, 자유입력·원장 변경 없음. UX/API/DB/보안/관리/Android/접근성/SEO/KPI/테스트/롤백을 영문·국문 통합 문서에 명세.
- QA v1379 금융 집중 6 FAIL/3 PASS, lint 오류 3, 소스 SQL 304개 중 적용 293개·체크섬 불일치 5건, 과거 Git 참조 462개 누락. SWF/국고 출처 미검증. 운영에서 자금 유출이 발생했다는 증거로 해석 금지.

## 중간·완료 관리
- 수정 전 main 및 영문·국문 기획서 해시 재조회, main 동일. 최종 재조회·PR/CI 상태는 별도 업데이트 로그에 기록.
- P0 REPO1488-01 SEC1488-02 FIN1488-03 REL1488-04, P1 BOOKMARK1488-05..10, 총 10건. 격리 PG 합성 거래 10,001건·권한 위조 100·동시성 100·응답 유실 50·계정 전환 30 시험은 **계획, 미실행**.
- 외부 독립 근거 신규 검증 승인 **0건**, 누적 **UNKNOWN / 10,000건**, **BLOCKED / IN PROGRESS**. 기능 OFF, 문서만 작성, 운영 승격 HOLD. Test·Production·WLD·원장·타인 브랜치 미변경.
