# 개발 B v661 — 회원 주식 알림 응답 캐시 보안 (초안 / 배포 보류)

**기준 main:** `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`. 독립 브랜치 `auto/hourly-b-v661-stock-alert-private-cache-20261030-1639`.

회원별 주식 알림 설정·발생 내역·등록/삭제 영수증 4개 API에서 명시적인 캐시·색인 방지 헤더가 누락된 사실을 HTTP 회귀 테스트 4건의 실패로 재현했다. 실제 정보 유출 증거는 없다.

GET `/stocks/alerts`, GET `/stocks/alerts/events`, POST `/stocks/alerts`, DELETE `/stocks/alerts/:id` 정상 응답에 `Cache-Control: private, no-store`와 `X-Robots-Tag: noindex`를 적용했다. 인증·인가·동의·CSRF·회원별 조회·입력 검증과 API 본문은 유지했다. DB 마이그레이션·권한·금융 원장·WLD 잔액 변경은 없다. 가드 실패 응답 및 다운스트림 브라우저/엣지의 헤더는 이번 검증 범위 밖이다.

검증: 수정 전 RED 4건, 수정 후 GREEN 4건. Backend 주식 알림 집중 9 PASS, Frontend 집중 14 PASS, 전체 Lint 오류 0/경고 1,043, Typecheck/Backend·Frontend Build PASS, 모바일 API 계약 183개 PASS, DB 정적 56 PASS/4 SKIP, 보안·릴리스 14 PASS, Production 의존성 알려진 취약점 0건. 그러나 Backend 전체 119 FAIL, Frontend 전체 53 FAIL이며 공식 Test 정확 SHA, 실 PostgreSQL 통합, 인증 E2E, GitOps 승격은 미검증이다.

**결정: DRAFT / RELEASE HOLD.** main 병합·Test/Production 배포 금지. 기존 P0 운영 프로세스 SHA 불일치, 국고 대사, DB 직접 DML 권한, 마이그레이션 체크섬 및 전체 테스트 문제를 해결하기 전 승격하지 않는다. 다른 개발 A/C·기획·QA 작업은 변경하지 않는다.
