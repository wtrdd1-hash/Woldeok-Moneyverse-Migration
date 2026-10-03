# v2026.10.03.510 — 글로벌 SEO / 해외 서비스 심화기획 작업기록

상태: PLANNING / 문서 전용 조사 확장
일자: 2026-10-03
브랜치: `docs/global-growth-deep-plan-v2026.10.03.510`
시작 `origin/main`: `ac4dd484a90b266d945993d7bd8be57a74e8e1df`
상위 권위: v2026.10.03.509 (PR #774 병합 완료)

## 시작 기록
- 사용자의 더 자세한 기획과 더 많은 레퍼런스 요청을 받은 뒤 모든 remote를 다시 fetch했다.
- v509가 이미 main에 병합된 것을 확인했으므로 삭제된 v509 브랜치에서 계속하지 않고 exact 최신 main에서 새 회차를 시작했다.
- v507 글로벌 성장 조사/명세, v509 통합 작업기록, 현재 PROJECT_PLAN/INTEGRATED_PLANNING_MASTER, 문서 거버넌스를 다시 확인했다.
- 이번 회차는 깊이, 근거, 실행 분해, 국가/locale/검색/수익/품질 게이트를 확장한다. 런타임 구현 완료로 잘못 해석하지 않는다.
- 제품/공개 fallback은 계속 한국어(`ko`)이며 명시 locale URL과 저장 사용자 언어가 GeoIP/Accept-Language 추정보다 우선한다.
- 상위 사업/세무/법률 권위가 명시적으로 바뀌기 전까지 현금 수익화는 광고 전용이다.
- 런타임 코드, DB, Test, Production은 이번 기획/조사 작업 범위 밖이다.

## 조사 방법
- Google Search Central, Google Ads/AdSense, Naver Search Advisor, W3C/IETF/Unicode 및 관련 국가 개인정보/규제기관의 최신 1차문서를 재확인한다.
- 대규모 학술/산업 discovery corpus와 사람이 직접 확인한 1차자료를 분리한다. corpus 폭을 수동 전문검토로 표현하지 않는다.
- 질의군, raw 수, 중복제거 수, manifest hash를 기록해 레퍼런스 수량 주장을 감사 가능하게 만든다.

## 작업 상태
STARTED

## 중간 작업 기록
- 중간 fetch에서 `origin/main=ac4dd484a90b266d945993d7bd8be57a74e8e1df`을 확인했고 v510 시작 기준과 동일했다.
- 기획을 확장하기 전에 현재 locale/proxy/layout, GSC backend/frontend, sitemap generator, pSEO 소스를 다시 감사했다.
- P0/P1 공백으로 영어 runtime default, 추정 locale의 장기 선호 저장, 가짜 GSC 지표, 폐기된 Google sitemap ping과 실패 성공처리, 기계적 locale alternate, 고정 release `lastmod`, config-only pSEO 입장, metadata/본문 언어 불일치를 확인했다.
- 신규 독립 Crossref discovery를 완료했다: 30개 질의군 × 7,000건 = raw 210,000건, v510 내부 중복제거 121,320건, API 수집오류 0건, manifest SHA-256 `f16c6deceb18fa96fdd7b1132b2fc58e13f908899d477c9ce252a897adae7704`.
- v507 corpus는 별도로 유지하고 검증되지 않은 교차 unique 합계는 주장하지 않는다.
- 영/한 구현준비형 실행명세, 심화 조사보고서, v510 기획 delta, 내부/GitHub 업데이트를 추가했다.
- PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, 상위 글로벌 성장 명세, 문서 인덱스를 v510 현재 기획 권위로 연결했다.

## 작업 상태
DEEP_PLAN_DRAFTED

## 종료 기록
- 커밋 직전 최종 fetch에서 `origin/main=ac4dd484a90b266d945993d7bd8be57a74e8e1df`을 확인했고 시작/중간과 동일했다.
- EN/KO v510 실행명세 19개 주요 섹션과 EN/KO 심화 조사보고서 8개 주요 섹션을 완료했다.
- 신규 discovery 근거는 raw 210,000건 / v510 내부 중복제거 121,320건 / API 수집오류 0 / SHA-256 `f16c6deceb18fa96fdd7b1132b2fc58e13f908899d477c9ce252a897adae7704`로 정확히 기록했고 허위 교차 unique 합계를 만들지 않았다.
- 현재 기획 권위, 통합 원장, 상위 글로벌 성장 설계, 문서 인덱스에 모두 v510을 연결했다.
- 검증은 `git diff --check`, 영/한 권위·corpus parity, 변경 Markdown 상대링크, 유지 문서쌍, conflict marker 검사를 통과했다.
- 런타임 코드, DB, Test 환경, Production 환경은 변경하지 않았다. 따라서 Test/Production 승격은 이번 문서 전용 회차 범위 밖이다.

## 작업 상태
READY_FOR_PR
