## v1642 후속 작업 — 2026-11-02 09:05 KST (기능 보완 / 초안 / 배포 보류)
**검증/런타임:** 정책·보안·백업 기본 시험 176/176 PASS, 릴리스 분류 24/24 PASS, 확장 정책 180/181 PASS·기존 읽기 전용 브랜치 정리 기대치 1 FAIL, QA 22/23 PASS·기존 공성전 문구 #2391 1 FAIL, 한영 4쌍 ×20 표지자 PASS, git diff --check PASS. Test·Production 공개 버전 API 모두 510dbe6...로 최신 main과 다름(실행 이미지 증명 아님). F675-216 수용시험 미실행.
이전 기능 추가 v1640 → 현재 기능 보완 v1642 → 다음 기능 추가 v1644(잠정). miniPC Superpowers 스킬·기획/워크트리/검증 지침, origin/main a8541927c3a351d980454c66e95a3356c47e0722, AGENTS/README, 영문 정본·국문 대조, 마이그레이션 196/302, Next 문의 액션, GitHub 열린 PR 및 QA #2391을 확인했다. 상위 Draft #2444와 분리된 문서 전용 워크트리. 개발 DB 읽기 전용 실측: 문의 테이블 직접 권한 거부, user_items/account_balances UPDATE 허용, Test·Production 미확인. 제안된 슬라이딩 요청량 제한의 동시성 위험과 영수증 404의 진행 중 커밋 가능성을 발견해 회원 잠금·키 분리·첫 메시지 증빙·동일 키 복구를 명세했다. 런타임/DB/금융/운영 변경 없음. P0 4/P1 6, 외부 신규 승인 0·누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS, RELEASE HOLD. 검증·PR·CI는 별도 최종 기록.


# 기획 v1640 — F675-216 회원 보유품 상태 증빙 연계 문의
**GitHub 인계:** Draft PR #2444 OPEN/HOLD; 개발 이슈 #2442; 병합·배포 없음.
**검증:** 정책·보안·백업 171/171 PASS, 릴리스 분류 24/24 PASS, QA 22/23 PASS·기존 공성전 문구 검증 1건 FAIL(#2391), 영문·국문 4쌍 대조 PASS, git diff --check PASS. 신규 기능 수용시험 미실행.
**개발 DB 읽기 전용 실측:** PostgreSQL 17.11, support_threads 3행·user_items 6행; DEV moneyverse_app의 user_items SELECT/UPDATE와 account_balances UPDATE 권한이 모두 true. P0 #993 유지; Test·Production 권한 상태는 확인하지 않았으며 이를 동일하다고 단정하지 않는다.
**2026-11-02 08:00 KST | 기능 추가 | 초안 / 운영 배포 보류**

이전 기능 보완 v1638 → 현재 기능 추가 v1640 → 다음 기능 보완 v1642(잠정). 상위 Draft #2439, 개발 이슈 #2442 연결. AGENTS.md·README.md·영문/국문 통합 기획서를 읽고 origin/main a8541927c3a351d980454c66e95a3356c47e0722 시작·중간 재확인. miniPC Debian 13 서비스 정상, 개발 PostgreSQL 연결 확인.

**확인 근거:** /inventory 활성 조회 실패가 []로 표시되고, 마이그레이션 123은 만료 행을 제외하며, 104는 수량 증가 시 만료일을 재설정한다. 마이그레이션 196의 기존 support_create_thread 멱등 재실행은 소유자·키만 확인하고 제목/본문 동일성은 검사하지 않는다. 이에 소유자 연계 미리보기 토큰, 단일 트랜잭션 현행 행 검증 및 요청 해시 연계 문의 영수증을 제안했다. 실제 운영 사고가 확인됐다는 뜻은 아니다. 런타임·DB 변경 없고 A/B/C/QA 브랜치 미변경.

**인계:** P0 4 / P1 6 영문·국문 통합 기획서 반영. 공식 Test 정확 SHA·금융/권한/독립 복원 미완료로 RELEASE HOLD. 외부 독립 근거 신규 승인 0, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS. 검증·GitHub PR/이슈는 별도 최종 기록.
