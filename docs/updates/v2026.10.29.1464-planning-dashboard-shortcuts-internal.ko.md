# Moneyverse 기획 v1464 — F675-172 회원 전용 대시보드 바로가기

**상태:** DRAFT / RELEASE HOLD, 기능 추가; 이전 보완 v1462, 다음 보완 v1466(잠정).
**기준:** main 9ebc5613845ba2e8179a0051e86db996593c8a19 시작·중간 확인; Test·Production 앱 c2129625aa6629c616fb31ce790950618b8d92b2; QA v1367 FAILED/P0. 기획 Draft #1856 및 선행 #1846/#1837/#1830에 누적.
**발견:** 대시보드 다음 활동은 quests/work/wallet/stocks 고정 링크. 확인한 FE/BE/DB에는 회원별 편집 기능이 없고 기존 상점 관심 목록 F675-160과는 분리함.
**설계:** 회원 전용 allowlist 경로 최대 6개, 명시적 순서 변경·초기화, CAS 버전, 본문 해시 불변 영수증, SECURITY DEFINER, 본인 전용 API, Android 동등성, noindex/no-store, 320px·키보드 접근성, 기본 OFF, WLD 부작용 0. 상세 영문 원본과 국문 대조는 통합 PROJECT_PLAN에 반영.
**백로그:** [#1865](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1865): P0 REPO1464-01 FIN1464-02 SEC1464-03 REL1464-04, P1 SHORTCUT1464-05, SHORTCUT1464-06, SHORTCUT1464-07, SHORTCUT1464-08, SHORTCUT1464-09, SHORTCUT1464-10. 합성 10,001건·동시 100·권한 위조 100·응답 유실 50·경로 경합 30 시험 목표 미실행.
**게이트:** 과거 체크섬 불일치 5건, 국고 미연계 552행, MINT 조정 19건/18,000 WLD 출처, 브랜치 보존, 외부 독립 복원·공식 정확 SHA Test 미인증. 외부 독립 근거 신규 승인 0, 누적 UNKNOWN/10,000, BLOCKED / IN PROGRESS.
**변경 범위:** 기획 문서만 변경. runtime·DB·Test·Production·WLD·원장·스위치·병합 없음.

**GitHub update:** [Draft PR #1866](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1866) opened against unmerged v1462; [Issue #1865](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1865) contains P0/P1 acceptance contract. Initial documentation commit d1a77682493826d6f83d4e12c71e34132f9d1cc6. Release classifier 17/17 PASS; no official exact-SHA Test, CI still to be verified.
