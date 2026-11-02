# 2026-11-02 18:25 개발 A — 릴리스 보류

Draft PR #2499의 공개 게시판 `media=text`는 웹·Nest·PostgreSQL 조회·Android App API에 구현됐으나 **운영 승격 금지**입니다. 기존 Backend 프로필 인증 테스트 2건 실패(#2265), 전체 의존성 취약점 9건, 개발 DB 최소 권한 P0(#993), 공식 Test 정확 SHA 6건 불일치, 인증 E2E·독립 복원 미완료, 기존 A PR들과 병합 충돌이 남아 있습니다. 로컬 빌드는 2,048MiB 워커 SIGABRT 및 1,024MiB 힙 OOM으로 실패했습니다.

Test 공개 SHA `bb5e99ae46cf279851a888dec0d27c0647be3e51`, Production `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`으로 후보와 다릅니다. 이번 회차에서는 Test·Production 배포, 운영 DB 변경, 서비스 재시작, 로그인·스모크 인증, 롤백 및 브랜치 삭제를 하지 않았습니다. 나중에 승인되어 배포할 경우 `media` 조건을 제거하면 기존 전체 글 검색으로 복귀하며 DB 롤백은 필요 없습니다.

모든 필수 게이트가 PASS하기 전에는 main 병합 및 Production 승격을 금지합니다. 정확한 SHA의 CI·빌드 최종 결과는 영문 릴리스 기록과 PR 댓글에 남깁니다.
