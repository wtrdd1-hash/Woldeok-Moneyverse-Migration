# 기획 v1594 — F675-204 기능 보완 (문서 전용)

**이전:** Feature Addition v1592. **현재:** Feature Improvement v1594. **다음:** Feature Addition v1596(잠정). **Draft #PENDING / RELEASE HOLD**.

## 조사 근거 및 설계 결정
- 시작·중간 `origin/main=f13bbce273ffc65e8576170992d82ea00c27a1c9` 확인, #2283 미병합·미배포. AGENTS, README, 영한 정본 기획서, SQL 071/123, Nest 컨트롤러/리포지토리, Next 보관함, QA #2285 확인. miniPC Debian 13 서비스 활성·개발 DB 연결, MCP cgroup 954/1027 작업.
- D1: 전체 지문은 현재 상태 차이만 감지하며 중간 ABA 변경 이력은 증명하지 못함. 모든 변경에서 409 보장 금지. 변경 리비전은 별도 감사·쓰기 경로 설계가 필요.
- D2: UUID·UTC 마이크로초·십진수 수량·상품 코드/이름/카테고리의 정렬된 JSONB 직렬화와 PG17 SHA-256, 페이지당 단일 SQL 문장, AEAD 알고리즘 버전.
- D3: 성공한 페이지마다 120초 비활동 커서 갱신, 최초부터 절대 30분; 최초 asOf/지문 불변, 기본 20/최대 50건, 분당 30회, 오래됨 표시와 409/410 다시 조회.
- D4: 구간당 20,000행·정규 바이트 4MiB·SQL 2초 제한 제안, 초과는 503, 부분 결과를 검증된 빈 목록으로 표시 금지. 구현 전 실측.
- QA #2285 AGENTS의 Debian 13과 NixOS/Kubernetes 운영 안내 충돌은 별도 문서 담당자에게 이관, 여기서 운영 파일 수정 금지. Test/Production 공개 버전은 main과 다르며 정확 SHA·DB 권한·금융·독립 복원은 RELEASE HOLD.
- 이슈 #2282에 P0 4건+P1 6건 연계. 외부 독립 근거 신규 승인 0건, 누적 UNKNOWN/10,000건, BLOCKED/IN PROGRESS.

## 작업 경계
SQL/API/Next/Android 런타임, 마이그레이션, DB, 아이템, WLD, 원장, Test/Production 변경 없음. 기능 OFF. 제안한 PG17 신규 수용시험 **미실행**. 개발 B/A/C/QA 별도 브랜치, 공식 Test 정확 SHA·독립 복원·운영자 승인 후 배포 가능.
