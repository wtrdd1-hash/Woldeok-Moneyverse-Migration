# v2026.10.02.505 — 전 사이트 분석 작업기록

상태: 완료 / 감사 전용 / 승격 없음
시작 권위: origin/main `5a7c658b38853f564983d19f961c689a494dc4b6`
중간 권위 재확인: `5a7c658b38853f564983d19f961c689a494dc4b6` — drift 없음
최종 권위 재확인: `5a7c658b38853f564983d19f961c689a494dc4b6` — drift 없음
날짜: 2026-10-02
범위: 운영/Test 런타임 정체성, 전체 프론트 라우트 인벤토리, 공개 HTTP smoke, SEO/색인, 다국어, 보안 헤더, 광고 수익화 표면, 성능 지표, 소스 테스트, 최근 로그, 인프라 상태.
가드레일: 운영 변경 없음, DB 변경 없음, 배포 없음, 권한 사용자 조작 없음. 읽기 전용 런타임 점검만 수행했다.

## 시작 기록
- Debian 13 원격 장치 온라인. `minipc` 이름의 장치는 오프라인.
- 저장소 작업트리 clean, origin/main과 동일.
- 현재 source inventory: Next.js page 112개, 관리자 24개, 동적 12개.
- 런타임 점검 시작 시 production-current/test-current 심볼릭 링크는 모두 v504를 가리킴.

## 중간 기록
- exact source route inventory 생성: SHA-256 `6d7772e18e22d6370652aa645a8a135e33a397f941ba90b78ac7971e15c31259`.
- 정적 live smoke: 운영 100개 정적 라우트 = HTTP 200 88개 + 로그인 필요 307 12개, 4xx/5xx/transport error 0. Test도 동일.
- 런타임 정체성 분리 확인:
  - 운영 frontend v504 / backend v495.
  - Test frontend v503 / backend v495.
  - backend version endpoint `7080738e656aca099d5c871278d178d69a984fcc`, 현재 main `5a7c658b...`.
- 운영 frontend cache EACCES 재현. root 소유 `.next` cache를 서비스 사용자 `debian`이 쓰지 못함.
- 최근 Nginx 로그에서 전역 30초 로그인 폴링과 일치하는 `/app-api/v1/chat/conversations` 500 반복 확인.
- sitemap 전수: 416 entries / 403 unique / 403개 모두 HTTP 200. 그러나 11 noindex, 12 canonical mismatch, duplicate extra 13.
- 임의 pSEO ticker + 유효 scenario가 indexable 200/self-canonical을 만들고 임의 invite code도 indexable함.
- locale 표본에서 home/stocks 외 번역/canonical parity 미완성 확인.
- 민감 경로 광고 차단은 표본에서 정상. 반대로 고의도 stock-calculator pSEO 상세에는 광고 없음.

## 종료 기록
- 운영 `/feed.xml`: 200 RSS 2.0 + public cache. Test: 404. Test/Production frontend 분리 직접 증거.
- 감사한 최근 2시간 동안 운영 frontend EACCES cache-write 199건.
- 최신 Nginx 20,000줄에서 `/app-api/v1/chat/conversations` HTTP 500 502건. 익명 요청은 현재 정상 401이므로 로그인 trace 연계가 추가로 필요.
- Test scheduler 반복 실패:
  - `work.auto_tune_policy`: administrator authority 없음.
  - `stock.ai_scenario_auto`: model API 접근 불가.
- 인프라 자원 병목 아님: load 약 0.29/0.63/1.29, root disk 약 51%, data disk 약 33%, 핵심 서비스 active, Nginx config syntax 정상.
- 보안 헤더 표본: HSTS/CSP/COOP/nosniff/frame DENY 존재, 악성 Origin 요청에 Access-Control-Allow-Origin 없음.
- exact main 소스 검증:
  - contract build PASS;
  - frontend typecheck PASS;
  - backend typecheck PASS;
  - frontend Vitest 169 files / 984 tests PASS;
  - backend Vitest 115 files / 1,050 tests PASS, 53 files / DB 조건 테스트 391개 SKIP.
- 검증 후 저장소 작업트리 clean 유지.
- 연결 Debian 장치에 그래픽 브라우저가 없어 필수 5회 시각/반응형/browser interaction QA 완료는 **주장하지 않는다**.

권위 findings:
- `docs/findings/FULL_SITE_AUDIT_v2026.10.02.505.md`
- `docs/findings/FULL_SITE_AUDIT_v2026.10.02.505.ko.md`

Test/Production 승격, 서비스 재시작, 권한 변경, application code 변경, DB mutation은 수행하지 않았다.
