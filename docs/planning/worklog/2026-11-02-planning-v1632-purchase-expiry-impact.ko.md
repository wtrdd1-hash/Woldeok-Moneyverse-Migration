# 기획 v1632 — F675-214 상점 구매 전 보유품 만료일 재설정 영향 미리보기
**v1632 GitHub:** Draft PR #2422 OPEN/HOLD (기준 #2416), 개발 인계 #2421. 병합·배포 없음.

**일자:** 2026-11-02 KST. **회차:** 이전 Feature Improvement v1630 → 현재 Feature Addition v1632 → 다음 Feature Improvement v1634(잠정). **상태:** 문서 후보 / DRAFT / RELEASE HOLD. **기준:** 최신 origin/main a8541927c3a351d980454c66e95a3356c47e0722, 미병합 Draft #2416 후속. 개발 인계 이슈 #2421 등록, Draft PR #2422 OPEN/HOLD.

## 시작·근거
- miniPC Debian 13.6 서비스 정상, 개발 PostgreSQL 연결. 설치된 Superpowers using-superpowers·brainstorming·using-git-worktrees·writing-plans·verification-before-completion 직접 확인. skills__list가 URI를 반환하지 않아 skills__read 방식만 BLOCKED.
- 최신 main의 AGENTS.md·README.md·영문/국문 PROJECT_PLAN을 읽고 v1630 누적 문서는 별도 작업공간에 유지. 최신 main을 병합하려다 무관한 Treasury UPDATE_LOG 충돌 및 런타임 변경 혼입 위험으로 병합을 정상 중단했으며 타 작업자 파일은 수정하지 않았다.
- 실제 상점 BuyForm 즉시 제출, 정식 POST /api/v1/shop/catalog/:id/purchases, 마이그레이션 071 회원·상품 PK, 072 원장 구매·수량 추가, 104 수량 증가 시 기간제 전체 보유품 만료일 재설정. 읽기 전용 GET /api/v1/shop/catalog/:id/purchase-impact?quantity=1..100과 회원 명시 확인 제안. 확정 견적·결제 후 정확한 만료일을 약속하지 않는다.
- main a8541927...와 04:09 KST 공개 Test·Production /api/version 510dbe6...는 다르다. 병합된 Treasury v1620 운영 기록은 특정 Production v1619 전환 증빙이며 전체 릴리스 승인이 아니다.

## 중간·설계
- RESTAMPS_ENTIRE_HOLDING / NEW_TIMED_HOLDING / NO_TERM_CHANGE, 단일 PostgreSQL 관찰시각, 만료된 기존 행과 구매별 가상 로트 구분. 세션·동의·DB 회원 신원·앱 역할 권한 검증 P0, 새 금융 경로 없음.
- 400/401/403/429/503 차단, Next/Android 비공개/no-store/noindex와 HEAD/조건부/304, 30초 STALE, 한영 접근성, 관리자 20명 이상 집계, 기본 OFF 및 OFF 우선 롤백. 구매 성공 근거는 기존 정식 영수증뿐.
- P0 OPS1632-01 SEC1632-02 FIN1632-03 REL1632-04; P1 IMPACT1632-05~IMPACT1632-10. 실제 기능/공식 Test 정확 SHA 미실행. 외부 신규 승인 0, 누적 UNKNOWN / 10,000 BLOCKED / IN PROGRESS.

## 완료 (검증 후 갱신)
- 표준 171/171 PASS, 분류기 24/24 PASS, 확장 193/194 PASS·1 FAIL(#2391), 이슈 #2421 등록. PR/CI·main 최종 확인 예정. 런타임·DB·아이템·WLD·원장·Test·Production 변경 없음.
