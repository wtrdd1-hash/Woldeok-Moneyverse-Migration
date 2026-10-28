# 기획 v1424 — 검증 가능한 회원 컬렉션 쇼케이스 (초안 / 운영 보류)

- **시작:** 2026-10-28 20:05 KST; main `35971c600f25869c96f1c666d4b9f58927202730` 기반 독립 브랜치 `auto/planning-v1424-verified-collection-showcase-20261028-2005`.
- **회차:** 이전 기능 보완 v1422 → 현재 기능 추가 v1424 → 다음 기능 보완 v1426(잠정).
- **범위:** F675-162, 회원의 명시적 동의에 따라 유효기간과 철회 기능을 갖춘 **검증된** 컬렉션 공개 쇼케이스. 문서만 작성하며 기능 구현, DB 변경, 배포 및 테스트 통과를 주장하지 않음.
- **코드 근거:** `frontend/src/app/collections/curation-retention-flow.tsx`의 고정 `?showcase=arch-1063` 공유 링크, `DEFAULT_PIECES` 및 localStorage 대체 표시; `backend/src/collection/collection.repository.ts`의 조회 시 4개 조각 자동 INSERT와 직접 테이블 조회/변경; migration 232에는 획득 증빙 연결이 없음. 이는 검증된 소유권이 아님.
- **운영 차단:** QA v1347 FAILED, 과거 18,000 WLD 원장 불일치, 데이터 디스크 97–98%, 독립 백업 복원 미검증, 앱 계정 DML 및 마이그레이션 차이, 운영 버전 unknown, 공식 Test exact-SHA 미검증.
- **외부 근거:** 독립 근거 10,000건 게이트: 신규 승인 0, 누적 중복 제거 승인 UNKNOWN, BLOCKED / IN PROGRESS.
- **점검:** [x] 스킬·main 확인 [x] UI/API/DB/앱 경로 조사 [ ] 영문·국문 통합 기획 [ ] 프로젝트 계획·검토·로그 반영 [ ] 문서 대조 및 diff 검사 [ ] GitHub 이슈·Draft PR [ ] 완료 기록.
