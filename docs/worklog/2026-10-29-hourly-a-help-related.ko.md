# 개발 A1425 — 검증된 관련 도움말 (P1) — 2026-10-29

## 범위 및 상태
- **격리 브랜치에 코드 구현, 운영 배포 보류.** 기준 main `b84d645a87e8fa0d544ca3ee17e785e737e477ea`를 시작·중간·종료 시 확인. AGENTS, README, 영문 프로젝트/통합기획서 및 한국어 대응 문서, QA v1366 확인.
- 검증된 도움말 상세에서 동일 언어·분야의 독립 승인·검토기한 내 도움말 최대 5개를 제안한다. Android `/app-api/v1/help/articles/{locale}/{slug}/related`는 허용된 공개 경로만 전달하고 상위 응답의 캐시 정책과 무관하게 `private, no-store`를 강제한다.
- DB는 기존 마이그레이션 282의 `help_public_article`, `help_public_search` SECURITY DEFINER 함수만 재사용한다. 원문이 철회·만료·삭제된 경우 404, DB 장애는 503으로 처리한다. 선택적 관련 목록 조회 실패 시 임의의 내용을 만들지 않는다. 신규 마이그레이션·테이블 권한·금융 원장·사용자 추적 변경 없음.

## 검증
- TDD 실패 재현 후 수정: 인증된 원문 여부, 언어/분야, 원문 제외, 최대 5건, 기능 스위치, DB 장애, Android 허용 목록·캐시, 접근 가능한 관련 링크 확인.
- 전체 lint 오류 0건(기존 경고 1,091건), typecheck·Backend/Frontend build·Android API 계약 PASS. 전체 `pnpm test`: 보안/릴리스 32 PASS, API 계약 38 PASS, DB 47 PASS/4 SKIP, Backend 1,959 PASS/440 SKIP, Frontend 1,913 PASS. 봇 11 PASS. 의존성 감사 High/Critical 0건(일반 9 moderate/3 low), 봇 0건.
- 네트워크 격리 PostgreSQL 17.11에 마이그레이션 282와 양성·음성·신규 관련 도움말 픽스처 적용 PASS. 앱 계정의 직접 SELECT/UPDATE 및 PUBLIC 함수 EXECUTE 거부 확인. 컨테이너 제거. 전체 마이그레이션 294개 적용 성공을 뜻하지 않는다.
- 첫 임시 Frontend 테스트는 `NODE_ENV=test` 누락으로 React `act` 오류가 발생했으나 정식 테스트 환경 재실행에서 1,913건 모두 통과. 의존성 링크 문제도 작업 폴더 내부에서 해결.

## 통합·배포 보류
- 도움말 관련 기존 Draft #1825/#1833/#1836/#1839/#1843과 소스가 겹치므로 순차 재기반·전체 재검증 필요. 다른 개발자 브랜치 삭제 없음.
- 공식 Test/Production 조회 SHA는 `b44ffd0af9e2bd6e7c2be7345b72094827078c3d`로 후보와 다르며, 기능 스위치는 기본 OFF. 정확 SHA 인증 E2E, 독립 백업 복원, 18,000 WLD 과거 분개 근거, 마이그레이션 체크섬 불일치 5건이 미해결. **main 병합, Test/Production 배포, 운영 DB 수정, 롤백, 브랜치 삭제·PR 종료 없음.**
- 롤백 방안: 기존 OFF 상태 유지 또는 추후 애플리케이션 커밋 되돌리기. DB/데이터 롤백은 불필요.
