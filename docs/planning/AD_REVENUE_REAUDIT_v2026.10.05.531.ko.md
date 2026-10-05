# 광고 수익화 재감사 — v2026.10.05.531

> 상태: PLANNING / BLOCKED_FOR_SCALE
> 기준: `origin/main=5c497639a919a5adf1ef648eba07f08bf7cd45a7`

## 총괄 판정
Moneyverse는 광고로 수익화 가능하다. Production에는 AdSense 설정, ads.txt, CSP 지원, 공개 광고 컴포넌트와 다수 계산기/가이드 배치가 이미 있다. 현재 병목은 광고 기능 부재가 아니라 **자격 있는 실제 사람 트래픽과 실측 광고경제가 확장 가능한 수준이라는 신뢰 가능한 증거 부족**이다.

광고 밀도나 페이지 수부터 늘리지 않는다. 측정 진실성과 광고 배치 드리프트를 먼저 고친 뒤 고가치 공개 도구/가이드로 자격 검색 트래픽을 키우고 적격 surface에서만 광고를 최적화한다.

## 확인된 문제
### P0 — 크롤러 포함 Hits를 PageView처럼 수익 계산
`totalHits24h`는 SEO 로그에서 만들어진다. 관리자 AdMonetizationCard는 이 값을 크롤러+방문자 Hits라고 표시하면서 월 예상수익과 목표 달성률 계산에 사용한다. Google Page RPM은 실제 pageview 기준이지 크롤러 포함 server hit 기준이 아니다.

판정: 현재 월 예상 광고수익/목표 달성률은 NON_AUTHORITATIVE. 공급자 기반 예상/확정수익, Page RPM/ad RPM, 적격 human pageview, ad impression/request, invalid-traffic 조정, 정책 상태, route/locale/device/source 분해로 교체해야 한다.

### P0 — 광고 배치가 현행 route 정책과 충돌
현행 기획은 casino/chance 및 거래·의사결정 민감 surface 광고를 차단한다. exact-main에는 `/casino`, `/stocks/[symbol]`에 `PublicAdvertisement`가 존재한다.

판정: AUTHORITY_DRIFT이며 내부 광고정책 release blocker다. 광고 확장 전에 runtime에서 제거 또는 fail-close하고 회귀시험해야 한다. Google이 실제 정책위반 판정을 내렸다는 의미는 아니다.

### P1 — 목표 산식과 실측 경제성은 다름
`월수익 = pageviews / 1000 × 실측 Page RPM` 산식은 맞다. 하지만 시나리오 RPM은 Moneyverse 공급자 보고서에서 실측되기 전까지 가설이다.

### P1 — 핵심 병목은 raw traffic이 아니라 qualified traffic
수익 funnel: 적격 indexable page -> 검색노출 -> 자격 human click -> landing 가치완료 -> 두 번째 유용행동 -> 재방문/가입 -> 적격 PV -> 유효 광고노출 -> 확정수익.

봇, crawler fetch, thin pSEO, 보상형 광고조회, 자체클릭, 클릭유도, traffic exchange, 저품질 구매트래픽은 제외한다.

### P1 — pSEO는 inventory-value gate 통과 후 수익화
programmatic page는 독립 사용자 가치, 고유 intent, review된 충분한 콘텐츠, canonical/index 적격성, 정책 안전 광고배치를 증명한 뒤에만 광고 inventory로 인정한다.

## 수익 민감도
| 실측 Page RPM | 월 100만원 PV | 월 500만원 PV | 월 1,000만원 PV |
|---:|---:|---:|---:|
| 2,000원 | 500,000 | 2,500,000 | 5,000,000 |
| 5,000원 | 200,000 | 1,000,000 | 2,000,000 |
| 10,000원 | 100,000 | 500,000 | 1,000,000 |
| 20,000원 | 50,000 | 250,000 | 500,000 |

예측이 아닌 민감도 산술이다. 순기여는 확정 광고수익에서 콘텐츠·번역·모더레이션·인프라·개인정보·지원·fraud 비용과 광고 유발 retention/session 손실을 뺀다.

## 필수 실행 순서
1. 측정 진실성: provider-backed 광고지표로 교체, 가상 시나리오는 명확히 표시.
2. 배치 안전: 중앙 allow/block 정책, casino/stock decision 광고 제거, 회귀시험.
3. 자격 유입: 검색수요 근거가 있는 독창 계산기·용어/가이드·공개 utility 우선.
4. SEO 전환: 가입 전 검색의도를 해결하고 관련 두 번째 행동 제공.
5. 광고 최적화: clean traffic 확보 뒤 통제 실험, CWV/retention/불만 guardrail.
6. 해외: 번역·동의/개인정보·수요·국가별 광고경제 gate 후 locale 단위 확대.

## SCALE 게이트
rolling 30일 provider-backed 확정수익, 안정 Page RPM, valid traffic, 미해결 정책경고 없음, 허용 LCP/INP/CLS, retention/task-completion 유의 악화 없음이 모두 충족될 때만 SCALE. 아니면 ITERATE/HOLD, invalid traffic·정책·기만배치·신뢰/retention 실패면 KILL/ROLLBACK.

## 2026-10-05 증거
- exact-main `frontend/public/ads.txt` 존재, Production `/ads.txt` HTTP 200 및 동일 publisher 선언 확인.
- 광고 컴포넌트를 참조하는 page 파일 36개 확인.
- exact-main `/casino`, `/stocks/[symbol]`에 `PublicAdvertisement` 존재.
- `totalHits24h`가 crawler 포함 상태로 월수익 추정에 사용됨.
- 검토한 저장소 증거에서 provider-backed 30일 확정수익/Page RPM dataset은 확인되지 않음.

## 릴리스 상태
문서/조사 전용. runtime code, AdSense 설정, Test 배포, Production 승격, 수익성과 또는 정책통과를 주장하지 않는다.
