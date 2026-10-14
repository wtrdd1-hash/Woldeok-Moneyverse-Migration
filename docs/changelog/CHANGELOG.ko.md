## v2026.10.14.602 — 사이트 방향·운영 SEO 실측 심화 감사 (문서만)

## v2026.10.14.603 — 전체 코드·보안 감사 (문서만)
- 최신 main 6be44719·Android e24a2f8c 기반 SEC-603-01~14 등록, 웹 추적 파일 3,890개·코드/설정 1,916개 자동 인벤토리. 운영 변경 없음. [감사 보고서](../findings/MONEYVERSE_FULL_CODE_SECURITY_AUDIT_v2026.10.14.603.ko.md), [작업 기록](../worklog/2026-10-14-full-code-security-audit-v603.ko.md) 참조.

- 한영 제품전략/SEO 현황, 공개 레퍼런스 47개 목록, 36건 URL 표본과 사이트맵 원시 증거, 미승인 기획 DRAFT, 작업로그, 내부/GitHub 업데이트를 기록. 애플리케이션·테스트·운영 변경 없음.

## v2026.10.14.600 — 기획·운영 권위 불일치 조정 (문서 전용)
- 운영 관찰 v599·테스트 v541·기획 권위 v530을 구분하고 카지노·국고·API 차이를 AUTHORITY_DRIFT로 기록.
- 통합 문서 EN/KO, 작업기록, GitHub용·내부용 변경내역 갱신. 배포 없음.

## 2026-10-13 개발 A: 외부 리다이렉트 인증정보 보호 (PR #817 통합)
- 다른 origin으로 리다이렉트될 때 Authorization/Cookie/API 키 또는 요청 본문이 전달되지 않도록 차단하고 URL 내 사용자정보를 거부하는 런타임 수정 및 회귀 테스트 5개를 추가했다.
- 적용된 마이그레이션은 변경하지 않고 주식 호가창 type-only import와 격리 CI 데이터베이스 이름 일치 수정을 복구했다.

## v2026.09.23.390 — QA 브랜치 생명주기 정리 강화

- 작업 브랜치: `fix/qa-branch-cleanup-v2026.09.23.390`.
- squash merge된 PR의 현재 브랜치 HEAD가 병합 당시 PR HEAD SHA와 동일하면 원격 소스 브랜치를 자동 삭제하도록 정리 워크플로를 수정했습니다.
- 병합 후 브랜치에 새 커밋이 추가된 경우에는 삭제하지 않아 후속 작업 유실을 방지합니다.
- 병합 PR 증거가 없는 브랜치는 `main`에 내용이 포함돼 보여도 활성 작업일 수 있으므로 계속 보존합니다.
- 수동 정리에서는 고유 미병합 커밋을 보존한 채 오래된 원격/로컬 브랜치와 clean patch-equivalent worktree를 제거했습니다.

## v2026.09.23.383 — 자산 강제 조정 caller-owned idempotency
- 관리자 현금/은행 자산 강제 조정 API가 내부에서 대체 키를 생성하지 않고 호출자 소유 UUID idempotency key를 필수로 요구합니다.
- 기존 PostgreSQL ledger 함수와 step-up 인증 경계는 유지하면서 timeout/retry 시 HTTP 계약에서 동일 작업을 안전하게 재시도할 수 있습니다.
- 누락·잘못된 키에 대한 DTO 회귀 테스트를 추가했습니다.

## v2026.09.23.381 — 주식 운영 mutation idempotency 계약
- 수동 주가 변경, 시장 이벤트 게시, 기업행위에 호출자 소유 UUID idempotency key를 필수화했습니다.
- 기존 관리자 클라이언트는 이미 키를 보내며 schema, DB 권한, ledger 의미는 변경하지 않았습니다.

## v2026.09.22.367 — Backend API 완전성 감사 CI 차단 해소
- backend API 완전성 감사기의 prefer-const CI 차단을 감사 의미 변경 없이 해소했습니다.

## v2026.09.21.322 — 마이그레이션 권위 fail-closed 게이트
- Production migration 실행이 exact repository checkout에 없는 DB 적용 migration 파일명을 발견하면 실패하도록 보강했습니다.
