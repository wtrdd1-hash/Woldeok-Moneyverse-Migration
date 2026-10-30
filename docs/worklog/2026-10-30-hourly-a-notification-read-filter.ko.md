# 개발 A — 회원 읽은 알림 필터 (2026-10-30)

## 작업 전
- 기준 main: `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; 원격 참조 15개, 열린 Draft PR 13개. 미병합 변경 보존.
- 영문 원본 기획서와 국문 기획서, 저장소 정책, QA v1389 및 진행 중인 v1390 확인. 운영 릴리스 HOLD.
- 기존 알림 목록에 전체·읽지 않음·읽음 필터를 추가하고 카테고리, 페이지네이션, 본인 소유권을 유지. `unreadOnly` 호환 유지, `readOnly` 추가, 충돌 입력 거부. DB 변경 및 WLD 이동 없음.

## 작업 중
- main 기준 독립 worktree에서 실패 테스트 작성 후 최소 코드 구현, Android 앱 API 계약 검증.

## 작업 후
- 검증 완료 시 SHA, 실패/차단, Test/Production/rollback 및 브랜치 보존 사유를 기록할 예정.

### 중간 검증 및 차단
- 구현 전 실패 테스트 확인 후 수정. Backend 알림 18 PASS, Frontend 알림 43 PASS, Android app-api 쿼리 전달/비공개 헤더 검증.
- 격리 PostgreSQL 17.11에서 305개 마이그레이션 적용 및 합성 알림 160건 소유자·읽음 상태·분류·페이지네이션 검증 PASS, ROLLBACK 확인.
- **P0:** 원본 305개 마이그레이션 적용 직후 `public.in_app_notifications` 테이블 부재. 합성 SQL 검증은 실제 배포 스키마 검증을 대체할 수 없음. 기존 이슈 #1693 관련, 신규 권한/마이그레이션 변경 없음.
- Typecheck PASS, Lint 0 ERROR/1043 WARNING, Build PASS, 운영 의존성 감사 알려진 취약점 0건. 전체 Backend 2566 PASS/119 FAIL/495 SKIP, Frontend 2611 PASS/53 FAIL; 실패 항목은 QA v1389와 일치. DB 단위 56 PASS/4 SKIP.
- 공식 Test exact SHA·인증 E2E·독립 백업 복원·GitOps 미충족. 병합·운영 배포·원장 변경 없음. RELEASE HOLD.
