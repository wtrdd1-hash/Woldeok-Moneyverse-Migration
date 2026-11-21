# Spring 상태 UI/API v2026.11.19.29.1 운영·원복 지침

**2026-11-19 KST · [영문 정본](2026-11-19-spring-status-v29-production-runbook.md). 일부 실제 운영 적용, 전체 UI/API 미완료.** [상세 결과](../findings/2026-11-19-spring-status-real-api-v2026.11.19.29.ko.md).

## 실행 버전과 DB 권한
- 코드 `9626746a892d91ce37de2bb091bd87eab6772ec1`, 불변 JAR `/srv/moneyverse-data/releases/spring-frontend-v2026.11.19.29.1-9626746a/app.jar` SHA **`2c92302aca1ce5001132baef69b3c6b7ba382897f36c1b9d183fd76916e98f3c`**, Java 전체 `clean test bootJar` **JUnit232/232 PASS,60스위트**.
- Test PG 읽기전용 Spring **4655**, 운영 PG 읽기전용 Spring **4656**(디스코드/예약작업 OFF), 기존 운영 Spring4550 PID368434·구 계산기 CSS4653·구 주식4650 및 다른 인스턴스 유지. 운영 DB/원장/계정 쓰기 없음.
- DB 실제 `content_status_sources` 공개+활성3종, `content_status_snapshots` 최신 인덱스조회, 최대200, 비공개 minecraft/detail 숨김. 운영 최신 공개 관측은 2026-11-17 UTC로 유효180초 만료, 따라서 3종 모두 상태 **unknown/기록 만료** (과거 정상이라고 현재 정상 아님). Test DB 관측0이라 unknown/기록없음. **상태 자동 수집기 재가동 별도 P0 미완료.**
- Test용 `moneyverse_app`만 상태2테이블 SELECT가 누락(운영 계정은 기존 허용); **Test DB `wdmv_v761_test_acl`에서만** `public.content_status_sources`·`public.content_status_snapshots` SELECT 권한 부여. 운영 권한 미변경. 새 Test DB를 재구축할 경우 해당 Test 전용 최소권한만 별도 적용, 광범위 권한 금지.

## 정확한 Nginx SHA 및 조건부 원복
- 본설정 `/etc/nginx/sites-enabled/moneyverse` SHA **`306b4aa556c4bfb22a056dd7df31be54f4e2192537d71092173c60dfc8dbb873`** 전후 불변. 공개 정적 스니펫 `/etc/nginx/snippets/moneyverse-frontend-v24-pages.conf` 변경 전 **`0cefe07e7ab8b5d589e88f543173b5c7436a1e02d35de0e934d0beb0f280316d`**, 후 **`06059c2e621ad0f96af7484937abc64c1eb91b104591bfc2b9b3bbe880d68c20`**. 두 기존 원본은 MiniPC 비공개 `/srv/moneyverse-data/tasks/gpt-spring-frontend-production-v2026.11.19.29/private/nginx-static-before-v29-production.conf`/`nginx-main-before-v29-production.conf` 권한600으로 백업. 전체 원본·자격증명/세션 원시 로그 GitHub 업로드 금지.
- Nginx 기존 include(내부4400/외부80) 정확 경로5개만 추가: `/status`→4656, `/status/`→308, `/api/v1/status`·`/api/status`→4656, `/mv-spring/v29/status.css`→4656. GET/HEAD만, POST405. HTML/API 캐시금지·SEO noindex·CSP, RSC406. 이전 26정적 경로·금융/관리자/개인정보 차단·상점/주식 유지. 변경 전 SHA 재확인 후 `nginx -t`·무중단 reload PASS.
- **원복 조건(실제 독립 훈련 미완료):** 현재 본설정/스니펫 SHA가 위 변경 후와 일치하고 Gemini/타작업자 변경 없는지 먼저 확인, 이전 스니펫 백업 SHA가 변경 전과 일치하는지 확인. 문제가 있으면 **스니펫 한 파일만** 기존 상태로 복원→`sudo nginx -t`→무중단 reload→홈/상점/주식/로그인 보호401·403/상태 API 및 브라우저 회귀. 본설정은 이번에 변경하지 않아 임의 덮어쓰기 금지. 원복 시 기존 상태 API404가 다시 생기므로 신규 검증된 forward fix가 우선.

## 실제 QA 및 남은 게이트
- 독립 Nginx4454 실 브라우저6화면+언어클릭7/7, Test/운영 DB 후보 EN·KO×320·390·1440 총12/12, Java232/232. 운영 외부 HTTPS 실제 **39/39** 상태·상점146·주식10·계산기·인증401/403/관리302·RSC406/204/잘못된 POST405, 실 Chromium 7/7. 외부 Cloudflare Analytics 자체 스크립트1개만 허용(Next/React 앱 JS 아님).
- Spring OpenAPI **903경로/GET580**, Test 실 비로그인 GET459: **200160/401271/50328**, 예상밖500·502·5040. Test 임시 실회원 상태200/상점146·채팅/지원200, 타인 헤더 위조3건403, 임시 회원·세션 삭제 PASS. 이는 관리자/돈거래 긍정 영수증 검증까지 의미하지 않음.
- 수집기 멈춤(11월17일), API503 28경로, 신규 Spring 신디자인 미검증176원천 경로, 전체 회원/관리자/전역채팅 실제쓰기/금융 원장/외부 공식 Test403/독립 원복 미완료. 단계별 Test·브라우저·원장 실증을 통과한 코드만 운영에 확대 적용, 전체 완료 허위 표기 금지.
