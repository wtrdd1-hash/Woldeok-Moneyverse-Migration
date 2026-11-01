# 기획 v1630 — F675-213 단일 보유품 행·만료일 재설정 근거
**v1630 GitHub:** Draft PR #2416 OPEN/HOLD (기준 #2410); 인계 #2409.


**일자:** 2026-11-02 KST. **회차:** 이전 Feature Addition v1628 → 현재 Feature Improvement v1630 → 다음 Feature Addition v1632(잠정).
**상태:** DOCUMENTATION CANDIDATE / DRAFT / RELEASE HOLD. **main 시작·중간:** 510dbe6bf4d5c2a8089fc06b480776053da7a2e3. **선행:** 미병합 Draft #2410 (v1628 c9bb5d4f30a8ef25d2c88079344c2432fa3fae60). **인계:** #2409.

**실제 검증:** 표준 171/171 PASS, 분류기 24/24 PASS, 확장 175/176(오래된 파괴적 정리 기대 시험 FAIL), 기능 수용시험 미실행.

## 실제 근거와 보완
- miniPC Debian 13 서비스·개발 PostgreSQL 연결 확인. Superpowers 설치된 using-superpowers/brainstorming/worktree/writing-plans/verification 확인. skills__list가 URI 0개를 반환해 skills__read 방식만 BLOCKED, 설치 파일 직접 적용.
- 071 PK(user_id,catalog_id), quantity>=0; 104 수량 증가 시 전체 기간제 보유품 만료일 재설정, 감소 시 연장 없음; 072/165 동일 행 수량 합산. 개발 DB 읽기 전용으로 PK·인덱스 확인. 개발 양수 6행·기간제/72시간 후보 0행, Production 일반화 금지.
- v1628의 가상 중복 로트 묶음 대신 현재 회원·상품별 단일 행의 24/72시간 조회, totalCatalogHoldings COUNT·totalUnits SUM·상위 10개·hasMore>10. 재구매로 전체 만료시각 변경 가능성 안내. DB asOf 1회, 클라이언트 회원 UUID 금지, 불명확하면 503, 304·직접 앱 역할 권한·WLD/원장/아이템 변경 금지.
- P0 OPS1630-01 SEC1630-02 FIN1630-03 REL1630-04, P1 ROW1630-05~ROW1630-10, 공식 정확 SHA Test·독립 복원 운영 보류. 외부 신규 승인 0건, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS.
- 중간 main·한영 정본 대조 완료. 런타임·DB·아이템·WLD·Test·Production 변경 없음. 실제 시험/PR/CI 확인 후 결과 기록.
