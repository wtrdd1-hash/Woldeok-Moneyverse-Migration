# Moneyverse 기획 v1182 — 알림 동의 안전성 보완 (한국어 작업일지)
**2026-10-23 19시 KST | Feature Improvement | DRAFT/HOLD**

- 이전 v1180 Feature Addition / 현재 v1182 Feature Improvement / 다음 v1184 Feature Addition(잠정).
- miniPC Debian 13.6 및 주요 서비스 정상, 개발 PostgreSQL 연결. `skills__list` 결과 빈 목록; miniPC 설치 Superpowers `using-superpowers`, `brainstorming`, `writing-plans`, `verification-before-completion` 열람.
- 원격 main `f032c4aebd518c8730e56058327ca35f97b4165b`, AGENTS·README·PROJECT_PLAN 국영문 확인, 시작·중간 main 재조회 안정. 기존 v1180 Draft PR #1005 SHA `cb348d01f066528aafa2814ba6cdeff2045cd732`, main 대비 8커밋 앞/1커밋 뒤. #1005 기반 분리 문서 후속 브랜치.
- QA v1183(18:20) FAILED/HOLD: Next.js 16.3.8 Critical 2/High 1, 금융 앱 광범위 DML, Migration266 체크섬, 지갑 CSV 린트, 홈페이지 테스트, Cron 백업, 운영 실행 SHA 불일치, 정확 SHA Test 미검증. QA 이후 main 봇 커밋 추가, 재검증 필수. 개발 원장 제한적 정상은 운영 인증 아님.
- 개발 DB 읽기 전용: `notification_preferences` 조회 당시 0행, `state DEFAULT 'OPTED_IN'`, 정책 문자열 `policy_version`만 있고 정수형 `version` 없음, 회원+목적+채널 PK, 앱 INSERT/UPDATE/DELETE/TRUNCATE 가능·RLS OFF. 향후 state 생략 INSERT의 동의 오인 위험이며 실제 무단 발송 증거는 아님.
- main 회원 알림 화면은 `?saved=1` URL만으로 성공 표시, `actions.ts`가 `mutate` 후 해당 URL로 이동. URL은 서버 저장 영수증이 아니다. 기존 알림 Controller는 목록·읽음 기능만 있고 동의 API는 없다.
- 설계: 자동 OPTED_IN 제거·동의 출처 검증·신규 행 잠금, 세션 연결 영수증 UI·결과불명 조회, 철회/발송 시작 펜스와 pending/effective 구분, actor-bound 최소권한, DST·Android·SEO·접근성·관리자·KPI, DB 부정권한·동시 100건·감사 10,001건 테스트 기준. 개발 연계는 기존 이슈 #1004, A/B/C·QA 코드 변경 중복 금지.
- 기존 통합기획/PROJECT_PLAN/UPDATE_LOG 국영문 6개 문서 갱신. 분산 세부기획 추가 없음, 코드·DB·WLD·스위치·Test·운영 변경 없음. **테스트는 계획만, 실행하지 않음**.
- PostgreSQL·OWASP·Android 공식 문서 검토. 신규 최종 승인 0, 누적 중복제거 미확인, 목표 10,000 **BLOCKED**. https://www.postgresql.org/docs/current/ddl-default.html ; https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html ; https://developer.android.com/develop/ui/compose/notifications/notification-permission .
- PR은 #1005 위에 쌓는 Draft/HOLD. 국영문 검토, 정확 SHA CI·실 PG·인증 Test, 동의 법률 검증, 복원·롤백·운영 승인 전 병합/배포 금지. 기존 예약·병렬 작업 보존.
