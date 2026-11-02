## v2026.11.02.1648 — F675-218 처리 완료 문의 만족도 평가 (기능 추가 / 초안 / 운영 보류)
**주기:** 이전 기능 보완 v1646 → 현재 기능 추가 v1648 → 다음 기능 보완 v1650(잠정). main a8541927c3a351d980454c66e95a3356c47e0722 시작·중간 재확인, 미병합 #2460 종속, 개발 이슈 #2467. **제안/미구현**, 문서 전용.
**실측:** 마이그레이션 196은 resolved 상태를 변경하지만 불변 처리 완료 이벤트가 없고 /support에 만족도 평가가 없다. 최근 100건만 표시한다. 개발 PostgreSQL 17.11 읽기 전용 문의 3/완료 2/메시지 6행, 앱 계정 잔액·보유품 직접 UPDATE 허용 P0 #993(운영 증거 아님). QA v1461 FAILED/P0: 운영 다국어 표본 HTTP 500 16건, 전체 감사·라우트 원장·backend-prod-mode·QA 정책 실패, 비공개 401 헤더 문제.
**설계:** 회원 본인에게만 불변 처리 완료 회차당 선택적 1~5점·고정 사유 평가, 자유 입력·WLD·보상·금융 쓰기 없음. 실제 비종결→종결 관리자 변경과 감사 로그를 SECURITY DEFINER 단일 트랜잭션으로 기록, 회차당 평가 1행·영수증·내용 결속 멱등성, 재개 경합 409, 과거 미추적 건 소급 생성 금지. Nest 세션·동의·CSRF, 정확한 본인 문의, Next/Android 개인정보, 한영 WCAG 2.2 AA, 관리자 20명 이상 익명 집계, 기본 OFF, 추가형 마이그레이션·Test 정확 SHA/롤백. API/DB/인덱스/보안/SEO/KPI/회귀·배포 상세는 영문 정본과 국문 동등 PROJECT_PLAN.
**백로그:** P0 OPS/SEC/FIN/REL1648-01~04, P1 FEEDBACK1648-05~10 (#2467). 신규 기능 시험 미실행. Test·Production 공개 버전 510dbe6...은 main과 다름; 공식 Test 정확 SHA·최소 권한·금융 원장·QA·독립 복원 미해결. 외부 신규 승인 0, 누적 UNKNOWN/10,000 **BLOCKED / IN PROGRESS**. **DRAFT / RELEASE HOLD**, 런타임·DB·Test·운영 변경 없음.

## v2026.11.02.1646 — F675-217 관리자 답변 알림: 삭제 후 재시도 정합성 (기능 보완 / 초안 / 운영 보류)
**GitHub 인계:** Draft PR #2460 OPEN/HOLD (선행 #2456), 개발 이슈 #2455 갱신; 문서 전용, 기능 미구현, 운영 승격 보류.
**사이클:** 이전 기능 추가 v1644 → 현재 기능 보완 v1646 → 다음 기능 추가 v1648(잠정). 기준 main a8541927c3a351d980454c66e95a3356c47e0722 시작·중간 확인; 선행 미병합 Draft #2456, 이슈 #2455. **제안/미구현**, 런타임·DB·금융·Test·Production 변경 없음.
**실측:** 마이그레이션 196의 답변 멱등키 UNIQUE는 알림을 생성하지 않는다. 개발 PostgreSQL 17.11의 알림 dedupe_key는 부분 UNIQUE, 알림 회원 FK·문의 메시지 스레드 FK는 ON DELETE CASCADE다. 문의 3행/메시지 6행/알림 0행. 알림이 삭제되면 중복키 인덱스도 과거 생성 사실을 잃으므로 재시도 시 재생성 금지. 정식 번호형 알림 테이블 CREATE TABLE 계보 미확인, 개발 앱 계정 알림 INSERT/DELETE·잔액 UPDATE 허용은 P0 #993; 운영 권한 단정 금지.
**알림 분류 및 영수증:** SERVICE_OPERATIONAL, support_reply_notice_receipts.
**개선:** 새 ON 관리자 답변만 단일 SECURITY DEFINER 트랜잭션으로 문의 잠금·메시지/상태/감사/일반 문구 알림/최소 생성 영수증을 원자적 저장한다. 실패 시 전체 롤백. 동일 관리자/키/문의/본문 재실행은 기존 영수증 확인 후 삭제된 알림을 재발송하지 않는다. 과거/OFF 답변은 NOT_TRACKED_LEGACY_OR_OFF로 분리하고 소급 생성하지 않는다. 알림 ID는 보존 삭제를 막는 FK가 아닌 과거 식별자로 기록하고 회원 삭제 시 관련 영수증도 제거한다. 응답 CREATED_NOW / ALREADY_CREATED / HISTORICAL_CREATED_PURGED / NOT_TRACKED_LEGACY_OR_OFF는 전달·열람 증거가 아니다. 최근 100건 밖 정확한 본인 문의 링크, URL 제한, Next/Android 비공개, 국·영문 WCAG 2.2 AA. 상세 계약은 영문 정본 PROJECT_PLAN.md 및 국문 동등 문서.
**백로그:** P0 OPS/SEC/FIN/REL1646-01~04, P1 NOTICE1646-05~10. 신규 DB 설치·동시 재시도·보존 삭제·OFF/ON·FK/타인·Android 시험은 **명세만, 미실행**. 공개 Test/Production 버전 510dbe6...은 main과 다르고 실행 이미지 증거가 아니다. 독립 복원·국고·공식 Test 정확 SHA·QA 미해결. 외부 신규 승인 0건, 누적 UNKNOWN/10,000건 **BLOCKED / IN PROGRESS**. **DRAFT / RELEASE HOLD**.

## v2026.11.02.1644 — F675-217 관리자 답변 인앱 알림 (기능 추가 / 초안 / 배포 보류)
**GitHub 인계:** Draft PR #2456 OPEN/HOLD(#2450 상위), 개발 이슈 #2455 OPEN(P0 4 / P1 6). 문서 전용, 배포 없음.
**사이클:** 이전 기능 보완 v1642 → 현재 기능 추가 v1644 → 다음 기능 보완 v1646(잠정). 시작·중간 확인 main a8541927c3a351d980454c66e95a3356c47e0722, 상위 미병합 Draft #2450, 개발 인계 #2455. **제안/미구현**; 문서 전용, 런타임/DB/금융/Test/Production 변경 없음.
**실제 근거:** 마이그레이션 196은 관리자 문의 답변을 저장하고 waiting_user 상태로 바꾸지만 알림은 만들지 않는다. NotificationService는 in_app_notifications를 읽으나 safeNotificationLink가 /support를 거부한다. /support?thread는 회원 최근 100개에서만 선택하고 없으면 다른 문의를 열 수 있다. 개발 PostgreSQL 17.11 읽기 전용 실측: 알림 dedupe_key 고유 부분 인덱스, 회원·시각 및 읽음 인덱스, SERVICE_OPERATIONAL 분류 확인. DEV 앱 역할의 알림 INSERT/SELECT 허용은 운영 증거가 아니다. DEV user_items/account_balances UPDATE는 P0 #993. 알림 테이블 생성 출처/새 스키마 일치 검증 필요.
**V1 기능:** 로그인 회원에게 실제 커밋된 새 관리자 답변당 SERVICE_OPERATIONAL 인앱 알림 정확히 1건. 제목/본문은 고정 안내로 문의 내용·제목·개인정보 미포함. 외부 이메일·푸시·보상·환불 없음. 상태만 변경·과거 답변·회원 답변에는 알림 없음. /account/notifications → 문의 확인 → 정규 /support?thread=<UUID>; 최근 100건 밖 문의도 DB 소유자 단건 조회, 타인/삭제/무효 ID는 다른 문의로 대체하지 않음. 로딩/읽음/안읽음/정상 빈 목록/503 장애/401/403/404/409, KO/EN, 320px WCAG 2.2 AA, Android 계정 전환 및 캐시 보호.
**DB/API:** 기존 관리자 POST /api/v1/admin/support/threads/:id/messages, 세션/관리자/동의/CSRF 가드 유지. 플래그 OFF 기존 경로, ON 단일 SECURITY DEFINER 트랜잭션에서 스레드 잠금·권한·소유자 검증, 메시지·상태·감사·알림 INSERT, 영수증 확인 후 커밋. dedupe_key support:admin-reply:<message UUID>; 같은 키·본문 재실행 중복 0건, 다른 요청 키 재사용 409, 알림 실패는 답변 전체 롤백/503. 기존 고유 인덱스·FK·감사 유지, 앱 테이블 직접 권한 추가 금지, 마이그레이션 번호 미선점. 소유자 전용 GET /api/v1/support/threads/:id 또는 동등 함수 추가, 안전한 /support?thread 정규 UUID만 링크 허용. 외부 발송·금융 쓰기 없음.
**보안/관리/SEO/KPI:** Nest·실제 Next App API 엣지 및 오류에 private/no-store/noindex/no-referrer, 회원 SEO 색인 금지, 본문/토큰 로깅 금지. 관리자에게 알림 행 생성 사실만 표시, 읽음·전달됨 추정 금지. 신규 답변/알림 커밋/멱등 억제/롤백/링크 오류/독립 측정 첫 열람 KPI, 20명 이상 집단만 집계, 개인정보 제외.
**백로그:** P0 OPS1644-01 실행 SHA·복원, SEC1644-02 DEV ACL #993·새 스키마, FIN1644-03 Treasury·원장, REL1644-04 QA v1459·전체 CI·공식 정확 SHA Test. P1 NOTICE1644-05 DB 원자성, -06 Nest 영수증, -07 웹 정확 문의, -08 Android·엣지, -09 관리자 KPI, -10 격리 PG·KO/EN 접근성·배포. 동시성/재실행/알림 INSERT 실패/타인 소유/100건 초과/플래그/320px 시험은 **제안이며 미실행**. A/B/C/QA 별도 브랜치·정확 SHA Test·OFF 롤백·자동 병합 금지.
**배포 게이트:** 공개 Test/Production /api/version 510dbe6bf4d5c2a8089fc06b480776053da7a2e3 != main, 실제 실행 이미지 증빙 아님. 최소 권한·원장·공식 Test 인증 시험·독립 복원·QA P0 미해결. **DRAFT / RELEASE HOLD**. 외부 독립 근거 신규 승인 0건, 누적 UNKNOWN/10,000건 **BLOCKED / IN PROGRESS**.

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
