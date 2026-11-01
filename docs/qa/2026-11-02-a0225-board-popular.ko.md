# 개발 A QA — 최근 공개 게시글 댓글 많은 순 정렬 (2026-11-02)

**판정: 기능 구현 / 로컬 코드 검증 대부분 PASS / 개발 도구 전체 의존성 감사 FAIL / 정확 SHA 공식 Test 차단 / 운영 HOLD.** 병합·배포 승인 문서가 아니다.

## 기준과 격리
- 기준 main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`; 독립 브랜치 `auto/hourly-a-20261102-0225-board-popular`.
- 1차 코드 SHA `2fd4c243699bb6cf58a32327ab2f2381f287fa5e`, 2차 코드 SHA `94ae1f160c928ad05bbe61c6ab022cb20ba28e27` 이후 기본 정렬 버그 수정. 문서 포함 최종 SHA는 PR #2412와 서버 증거에 별도 기록하며 전체 게이트 재검증 필요.
- 정책, README, 영문 정본/국문 통합기획, 미병합 기획 #2410(v1628), 기존 QA/개발 로그/PR/CI 확인.

## 구현 및 회귀시험
- 기존 DB `SECURITY DEFINER` 함수가 제공하는 **최신 공개 게시글 50건 내부에서만** 댓글 많은 순 정렬. 전체 게시글 인기 순위 아님. 기존 종목·제목 검색 유지. 신규 DB 마이그레이션·권한·원장·잔액·인증 변경 없음.
- Nest는 `sort=recent|popular`를 허용하며 인기순일 때만 적용 증거를 반환. 웹은 접근성 있는 44px 선택 메뉴, 검색 범위, noindex 제공. Android API는 중복·잘못된 조건과 검증 불가 HTTP 200을 차단하고 no-store/noindex 강제.
- 기존 백엔드 15 PASS. 신규 실패 재현: 백엔드 3 FAIL/프론트 7 FAIL → 수정 후 백엔드 23 PASS/프론트 18 PASS. SEO/접근성 추가 시험에서 모바일 정렬 응답의 색인 방지 누락 RED 1/2 발견, 수정 후 UI·Android 10 PASS. 세 번째 RED에서 기본 선택 메뉴가 `sort=recent`를 항상 제출하여 HTTP 400이 되는 결함을 발견(백엔드 1 FAIL·프론트 3 FAIL), 명시적 recent를 허용하도록 수정해 백엔드 23 PASS·프론트 22 PASS.
- 모바일 계약 184개 엔드포인트. 종목/제목/정렬(recent|popular) 매개변수의 선택 여부와 영문·국문 스키마 문서 정정.

## 최초 코드 전체 게이트
| 검증 | 결과 |
|---|---|
| 백엔드 전체 | 2,988 PASS / 518 SKIP |
| 프론트엔드 전체 | 2,940 PASS (추가 UI 2건 이전) |
| DB 단위 | 62 PASS / 5 SKIP |
| 타입검사·Backend/Frontend 빌드·계약 | PASS |
| 전체 린트 | 오류 0 / 경고 1,027 |
| 보안 정책 스크립트 | 11 PASS |
| 운영 의존성 감사 | 알려진 취약점 0건 |
| 전체 개발 의존성 감사 | **9건(낮음 1·보통 8) FAIL**, #1075 |

`@vitest/mocker@4.1.11`의 신규 취약점은 >=4.1.12에서 수정되지만 기존 4.1.11 정책 스크립트는 PASS하므로 감사 실패를 면제하지 않는다. 타 개발자의 의존성 수정 영역은 보호한다.

## 실제 DB·배포·브랜치
- 개발 PostgreSQL 17.11, 앱 역할, READ ONLY/ROLLBACK. 공개 글 1건·댓글 0건, SQL 실행 PASS. 실제 여러 글의 정렬 증거는 부족하며 3건 합성 데이터 정렬 시험만 추가 PASS.
- 개발 DB `account_balances` 직접 UPDATE 및 `user_items` 직접 DELETE 허용: 기존 P0 #993. 운영 DB 동일 여부 미확인.
- 원격 브랜치 169개(main 포함), 비-main 168개 중 고유 미통합 156개, 선조 12개. 열린 PR 153개 중 충돌 29개. A의 #2393/#2399/#2407/#2411과 가상 병합 충돌. **삭제 0건**: 고유 변경·다른 작업자 worktree·롤백 보존.
- 공식 Test는 main SHA `510dbe6...`, Production Backend는 `353c6d5...`, Frontend는 타임스탬프 ID. 정확 SHA Test 사전검증 FAIL(6개 SHA 불일치), 인증 E2E·독립 복원·GitOps 증거 미충족.
- Test/Production 배포·main 병합·서비스 재시작·운영 DB 변경·롤백·예약 중지 없음. 최종 SHA 전체 게이트 및 CI 재검증 전까지 Draft/HOLD.

증거: `/srv/moneyverse-data/tasks/mv-a-20261102-0225-board-popular/evidence/` 및 PR #2412.
