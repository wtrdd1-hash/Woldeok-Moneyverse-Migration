# 전 사이트 런타임 / SEO / 릴리스 감사 — v2026.10.02.505

> 상태: 감사 완료 / 읽기 전용 / 승격하지 않음  
> 날짜: 2026-10-02 KST  
> 시작 / 중간 / 최종 권위: `origin/main=5a7c658b38853f564983d19f961c689a494dc4b6`  
> 범위: 운영 + Test HTTP 표면, 런타임 정체성, 라우트 인벤토리, SEO/색인, 다국어, 광고 경계, 보안 헤더, 최근 서비스/접근 로그, 소스 typecheck/tests, 인프라 상태.  
> 애플리케이션 코드, DB 데이터, 서비스 설정, Test 런타임, Production 런타임은 변경하지 않았다.

## 총괄

공개 사이트는 전반적으로 열리고, 최신 소스 테스트도 건강하며, 보안 헤더와 서버 자원도 대체로 양호하다. 현재 핵심 위험은 “사이트 전체 다운”이 아니라 **릴리스 정체성 분리, 운영 Next.js 캐시 쓰기 실패, 로그인 사용자 대상 채팅 게이트웨이 500 반복, SEO 색인/canonical 결함**이다.

현재 소스 인벤토리: **Next.js page 112개 / 관리자 24개 / 동적 12개**. 인벤토리 SHA-256: `6d7772e18e22d6370652aa645a8a135e33a397f941ba90b78ac7971e15c31259`.

## 릴리스 차단 / 최우선 항목

### AUD505-01 / P0 — 운영과 Test가 동일 후보를 실행하지 않음
- `production-current -> prod-v504`, `test-current -> test-v504`.
- 실제 프로세스 CWD:
  - 운영 frontend: `prod-v504/frontend`
  - 운영 backend: `prod-v495/backend`
  - Test frontend: `test-v503/frontend`
  - Test backend: `test-v495/backend`
- 운영/Test backend `/api/version`은 모두 `7080738e656aca099d5c871278d178d69a984fcc`를 보고하지만 현재 main / v504 소스는 `5a7c658b...`.
- backend가 보고한 SHA 이후 main에 6개 커밋이 있고, 비교 시 backend 14개 파일 / frontend 77개 파일 변경이 존재한다.
- 직접 증거: `/feed.xml`은 운영 200, Test 404.
- exact-candidate/Test-first 승격 계약을 충족하지 못한다.

**수용:** Test frontend/backend가 운영에 올릴 동일 exact SHA를 실행하고 Test 증거가 먼저 통과해야 한다. frontend/backend 모두 외부에서 검증 가능한 런타임 정체성을 가져야 한다.

### AUD505-02 / P0 — 운영 Next.js가 prerender/fetch cache에 쓰지 못함
- 운영 frontend 서비스 사용자는 `debian`.
- `prod-v504/frontend/.next`, cache 디렉터리와 생성 파일이 `root:root`이며 runtime 사용자에게 쓰기 권한이 없다.
- 감사 중 최근 2시간에 **EACCES cache-write 199건** 확인.
- fetch-cache뿐 아니라 `sitemap.xml.body`, `robots.txt.body` 갱신에서도 실패.
- Test v503 cache는 `debian:debian`으로 운영에만 발생하는 결함이다.

**수용:** 불변 release tree 전체를 느슨하게 쓰기 가능하게 만들지 않으면서 runtime cache 경로만 서비스 사용자에게 안전하게 쓰기 가능해야 한다. 재시작/cutover 뒤에도 rollback 가능성을 유지하고 crawl/load smoke 동안 EACCES가 0이어야 한다.

### AUD505-03 / P0 — 전역 1:1 채팅 폴링이 로그인 트래픽에서 반복 500 생성
- 최신 Nginx access 20,000줄에서 `/app-api/v1/chat/conversations` **HTTP 500 502건** 확인.
- 20:41 KST까지 home/account/stocks 등 다양한 referrer에서 계속 발생.
- 전역 플로팅 채팅 위젯은 로그인 상태이면 닫혀 있어도 **30초마다**, 활성 채팅이면 5초마다 conversations를 폴링한다.
- 비로그인 요청은 현재 정상 401이므로 익명 요청으로는 재현되지 않고 로그인 상태/요청 컨텍스트와 연관된 결함이다.
- 같은 시간 운영 backend journal에는 대응 오류가 없어 frontend gateway/backend/DB request-id 추적이 필요하다.

**수용:** 일반 Test 계정으로 재현하고 request ID를 frontend gateway → backend → DB까지 연결해 원인을 제거한다. 적어도 한 폴링 주기 매트릭스 동안 반복 5xx가 없어야 한다.

### AUD505-04 / P0 — 현재 112개 라우트에 대한 필수 전수 QA 증거 없음
- 현재 112 pages인데 과거 기획 스냅샷은 86 pages였다.
- full-route QA 계획은 존재하지만 체크되지 않은 상태이며 현재 exact-candidate 5회 전수 ledger를 찾지 못했다.
- 정적 HTTP smoke는 로그인 브라우저 인터랙션, 동적 valid/not-found/permission fixture, 반응형 잘림, 관리자 조작, 5회 전체 반복을 대체하지 못한다.

**수용:** exact candidate에서 source inventory 생성 후 관리자 24개/동적 12개를 포함한 전체 페이지를 필수 viewport/role/state matrix로 5회 통과하고 exact runtime SHA에 묶인 ledger를 남긴다.

## SEO / 검색 노출

### AUD505-05 / P1 — sitemap HTTP는 정상이나 내부 신호 불일치
운영 sitemap 실측:
- 416 entries, **403 unique URL**, 중복 extra 13.
- 고유 403개는 모두 HTTP 200.
- **sitemap URL 11개가 noindex**: 가상 주식 상세 10개 + `/stocks/derivatives`.
- **sitemap URL 12개 canonical 불일치**: 주식 상세 10개, `/marketplace/auction`, `/prediction`이 사이트 홈으로 canonical.
- 주식 상세 10개는 제목도 동일한 `가상 주식 · 월덕 머니버스`.
- `robots.txt` prefix와 sitemap이 최소 2개 충돌: `/account-deletion`은 `Disallow: /account`, `/businesses/ventures`는 `Disallow: /businesses`에 걸린다.

**수용:** sitemap은 canonical/indexable 200 URL만 포함하고 중복을 제거하며 robots/canonical/noindex 신호가 서로 충돌하지 않아야 한다.

### AUD505-06 / P1 — 임의 파라미터로 indexable URL 공간 생성 가능
- 인식되지 않는 stock preset은 일반적으로 404지만, 임의 ticker에 유효 scenario suffix를 붙이면 404가 아니다.
- `/tools/stock-calculator/zzzznotreal-minus-10`, `.../zzzznotreal-double-down`, `/this-is-junk-minus-50` 모두 **200 + index,follow + self-canonical**.
- 임의 초대코드 `/invite/not-real-code`도 **200 + index,follow**이며 프로모션 제목까지 생성한다.
- 검색 명세가 금지한 무한/thin URL 공간을 만들 수 있다.

**수용:** 권위 slug/code 집합으로 검증하고 잘못된 값은 404/410 또는 noindex 처리하며 self-canonical indexability를 제거한다. random-token 회귀 테스트를 추가한다.

### AUD505-07 / P1 — 공개 “20,000+ pSEO” 표현과 검증 가능한 코퍼스 불일치
- 운영 `/api/indexnow`은 `totalPseoUrls: 355`를 보고한다.
- 소스는 인기 종목 71 × 시나리오 5 = 355개 slug.
- sitemap에는 주식 계산기 361개, 전체 고유 URL 403개.
- 동적 임의 ticker 생성은 더 많은 URL을 만들 수 있지만, 이는 품질 검증된 20,000개 canonical/indexable 코퍼스와 동일하지 않다.

**수용:** 20,000개를 주장하려면 고유 사용자 가치, canonical, 품질 gate, sitemap discoverability를 갖춘 실제 코퍼스를 만들고, 아니면 공개 숫자를 검증 가능한 값으로 수정한다.

### AUD505-08 / P1 — 다국어 라우트는 열리지만 번역/canonical parity 미완성
KO/EN/JA/ZH 표본:
- 홈과 `/stocks`는 locale별 title/canonical 정상.
- `/en|ja|zh/guide`는 200이나 canonical이 한국어 `/guide`로 돌아가고 메타/본문이 일부 한국어/영어로 남아 있다.
- `/en|ja|zh/tools`는 title은 locale화됐지만 표본 H1은 한국어.
- `/privacy`, `/terms` locale variant는 한국어 본문/제목이 남고 한국어 base URL로 canonical.
- 주식 pSEO 계산기 EN/JA/ZH도 한국어 title이고 한국어 base URL로 canonical.

**수용:** 색인할 locale 페이지는 locale별 본문/메타/canonical/hreflang을 모두 맞추거나 번역 완료 전 의도적으로 noindex 처리한다.

### AUD505-09 / P1 — SEO 자동화에 fail-open / 남용 가능 표면 존재
- `/api/indexnow` POST에 인증 gate가 없고 외부 IndexNow 제출을 수행한다. 클라이언트가 준 URL array도 same-origin 검증 없이 전달한다.
- `/api/seo/submit`은 backend transport 예외 시 실제 제출이 없더라도 성공 payload를 만들어 반환한다.
- `/api/seo/status`에도 backend transport 실패 시 가짜 crawler metric fallback이 들어 있다.
- 현재 live GET `/api/seo/status`는 backend 401을 전달하고 있어 fallback은 발동하지 않았지만, fail-open 코드가 존재한다.

**수용:** SEO mutation은 권한 + CSRF/rate limit/audit를 요구하고 canonical registry에서 host/path를 검증해야 한다. transport 실패는 invented success/metric이 아니라 명시적 unavailable/unknown이어야 한다.

## 수익화 / 광고

### AUD505-10 / P1 — 민감 경로 광고 차단은 잘 지켜지나 SEO 수익 인벤토리가 적음
실측 광고 marker:
- 홈, `/tools`, `/board`, `/gallery` 등 공개 표면에는 광고 존재.
- account/security, bank, casino, chat, wallet, stocks/detail, admin, work, quests, prediction, auction 표본에는 광고 없음. 현행 광고전용 안전 경계와 일치.
- 반면 검색 의도가 높은 pSEO 상세 `/tools/stock-calculator/samsung-minus-10`에는 광고가 없다. 소스상 광고는 tools hub, tax/wealth calculator, gallery, announcements, board list, home 등 소수 route에만 삽입되어 있다.

**수용:** 기존 민감 경로 차단을 유지한 채 충분한 원문이 있는 허용 공개 콘텐츠에서만 UX/viewability 실험 후 광고를 확대하고 route family별 Page RPM을 실측한다.

## 성능 / 런타임 관측

### AUD505-11 / P1 — 공개 콘텐츠가 origin-dynamic이고 일부 pSEO 응답이 느림
- 표본 공개 HTML은 `Cache-Control: private, no-cache, no-store`, Cloudflare `DYNAMIC`.
- warm root 약 0.8~0.9초, `/guide` 약 0.95초.
- 주식 계산기 표본 약 2.5~4.8초.
- sitemap 403개 전수 감사 중 일부 pSEO 단일 요청은 약 9~12초까지 관측.
- 이는 특정 시점 서버/network 관측이며 Core Web Vitals 측정값은 아니다.
- AUD505-02와 결합하면 트래픽 확장 전 origin render/cache 경로 개선이 필요하다.

### AUD505-12 / P2 — 홈 semantic heading과 중복 응답 헤더 정리 필요
- 홈 source/render hero에 semantic `<h1>`이 없고 주요 제목을 paragraph + `aria-labelledby`로 사용한다.
- `x-frame-options`, `referrer-policy`, `permissions-policy`가 응답에 중복.
- CSP는 상당히 제한적이지만 script/style에 `unsafe-inline`이 남아 있다. 즉시 취약점 증거는 아니며 hardening 여지다.

## 소스 / 테스트 상태

현재 exact main에서의 긍정 증거:
- Contract build: PASS.
- Frontend TypeScript typecheck: PASS.
- Backend TypeScript typecheck: PASS.
- Frontend Vitest: **169 files / 984 tests 전부 통과**.
- Backend Vitest: **115 files / 1,050 tests 통과**, **53 files / DB 조건 테스트 391개 skip**.
- Frontend 테스트에는 React `act(...)` warning이 다수 있고 Vitest deprecated config warning이 존재한다.
- DB 조건 테스트 391개가 skip이므로 이 테스트 결과만으로 live DB 동작 전체를 증명할 수 없다.

## Test 예약/스케줄러

### AUD505-13 / P1 — Test scheduler 반복 실패
Test backend journal:
- `work.auto_tune_policy`: 매시간 실패, “the work console requires an administrator”.
- `stock.ai_scenario_auto`: 매시간 실패, “the model API could not be reached”.
- 같은 시간 `economy.anomaly_sweep`은 성공.

**수용:** Test 예약작업이 의도한 service authority와 model dependency를 사용하도록 고치거나 의도적으로 비활성화된 경우 truthful disabled state로 명시한다. 릴리스 수용 전 반복 scheduler error는 없어야 한다.

## 인프라 / 보안 긍정 사항

- Debian uptime 약 7일 10시간, 감사 시 load 약 0.29 / 0.63 / 1.29.
- root filesystem 약 51%, Moneyverse data disk 약 33% 사용.
- Nginx, 운영/Test frontend/backend, economy-AI 서비스 active.
- Nginx config syntax PASS.
- `easy-scraping.com` TLS 인증서는 2026-11-13까지 유효.
- 운영 보안 헤더: HSTS preload, CSP, COOP, nosniff, frame DENY, strict-origin referrer policy.
- 악성 Origin 표본 요청에 `Access-Control-Allow-Origin`이 반환되지 않음.
- Test 표본 페이지는 `X-Robots-Tag: noindex, nofollow`.
- 운영 RSS `/feed.xml`은 RSS 2.0, HTTP 200, public cache header 정상.

## 범위 한계

연결된 Debian 13 장치에 그래픽 브라우저가 없어 이번 감사는 필수 **5회 시각/반응형/브라우저 인터랙션 QA 완료를 주장하지 않는다.** HTTP/source/test 증거만으로 clipping, touch, focus, authenticated mutation, 모든 dynamic fixture를 증명할 수 없다.

## 권장 수정 순서

1. 릴리스 정체성 / Test-first 승격 규율 복구 및 exact candidate process 재기동.
2. 운영 Next.js cache ownership/write path 수정.
3. 로그인 `chat/conversations` 500 반복 재현 및 해결.
4. 임의 indexable 동적 URL 차단 + sitemap/canonical/noindex 충돌 해결.
5. 다국어 번역/canonical parity 수정.
6. SEO submission/status를 권한 기반 fail-closed로 변경.
7. 동일 candidate Test, DB 조건 테스트, 필수 5회 전수 browser QA 재실행.
8. 이후 public pSEO cache와 정책 허용 광고 인벤토리를 최적화.
