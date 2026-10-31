# 기획 v1554 — F675-194 알림 판단기간·집계 정합성
- **GitHub v1554:** 초안 PR #2141 OPEN/HOLD (선행 #2135), 개발 이슈 #2134 갱신; main 병합·런타임·운영 배포 없음.
**2026-10-31 | Feature Improvement | DRAFT / RELEASE HOLD**
**이전:** Feature Addition v1552. **현재:** Feature Improvement v1554. **다음:** Feature Addition v1556(잠정).
**정본 main:** 761a55a094fb9dd383d213e817305e68c79fa23c; AGENTS.md, README.md, 영어 PROJECT_PLAN.md 정본과 국문 동등 문서. 미병합 Draft #2135 종속, 개발 #2134. 별도 브랜치·작업 폴더, 문서 전용.

**소스:** 마이그레이션 071·123, Nest 알림 서비스, Next 보관함/app-api 경로, GitHub 초안, 기존 QA v1411. T+7.5일 만료 아이템의 7일 전 판단기간은 T+0.5일에 시작하지만 기존 만료일<=T+7일 필터가 제외한다. T+36.5일 만료 아이템의 7일 전 기간 T+29.5일도 30일 조회에 포함돼야 한다. 판단기간 교집합으로 수정, UTC 고정 시간으로 DST 오류 방지. 071은 (user_id,catalog_id)당 만료 하나이므로 수량과 보유 종류를 혼동하지 않는다. 보유 종류·판단기간·기준일별·UNKNOWN·표시 카드·숨김 카드 집계를 분리한다. 조회기간에 새로 진입할 미래 기간과 51번째 이후 항목까지 validUntil에 반영. 발송·수신 보장 아님.

**개발 인계:** P0 OPS1554-01 SEC1554-02 FIN1554-03 REL1554-04, P1 PREVIEW1554-05~10. 기능 OFF, 본인 EXECUTE 전용 SQL, 비공개 CSRF POST·Android 동등. 실제 SQL/런타임·합성 수용시험 미실행. 기존 QA v1411, 13:09 KST 공개 /fx HTTP 200은 인증 FX 정상 증거 아님. Test 정확 SHA, DB 권한, 감사, 독립 복원, 승인 전 RELEASE HOLD. 외부 신규 검증 0, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS. miniPC 시작·중간·완료 기록과 GitHub 업데이트 구분.
