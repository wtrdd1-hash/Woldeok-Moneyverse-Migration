## v1466 / F675-172 — 바로가기 상태·레지스트리 무결성 보완 (기능 보완 / 초안 / 보류)

- 이전 기능 추가 v1464 → 현재 기능 보완 v1466 → 다음 기능 추가 v1468(잠정). 시작·중간 main `9ebc5613845ba2e8179a0051e86db996593c8a19`, QA v1368 진행 중 / 마지막 완료 v1367 FAILED/P0. 선행 [Draft #1866](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1866) 의존, [개발 #1865](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1865) 인계. 런타임 변경 없음.
- v1464 모호성 해결: 최초 기본값 세대 0, 저장된 DEFAULT 세대 >0, SAVED_EMPTY와 초기화 구분, 세대 단조 증가로 초기화·편집 ABA 방지. 서버 전용 버전형 경로 레지스트리·권한 검증, 임의 URL 금지, 상점 `/shop` 명시 매핑. 본인 CAS·레지스트리 세대 불일치 412, 해시 결합 불변 영수증은 후속 수정 이후에도 당시 결과 재생; 응답 불명 시 가짜 성공 금지·타인 접근 차단.
- 비공개 웹·Android 접근성, noindex/no-store, 20명 이상 개인정보 보호 관리자 집계, 기본 OFF·비파괴 롤백. P0 REPO1466-01 FIN1466-02 SEC1466-03 REL1466-04; P1 SHORTCUT1466-05 SHORTCUT1466-06 SHORTCUT1466-07 SHORTCUT1466-08 SHORTCUT1466-09 SHORTCUT1466-10. 합성 10,001·동시 100·위조 100·재시도 50·경로 경합 30·ABA 30·과거 영수증 30 수용시험 **미실행**, WLD 영향 0 필수.
- 외부 독립 근거 신규 승인 **0건**, 누적 **UNKNOWN / 10,000건**, **BLOCKED / IN PROGRESS**. 상세는 기존 영문 PROJECT_PLAN.md 원본·국문 동등 문서, 기획 전용·운영 보류.
