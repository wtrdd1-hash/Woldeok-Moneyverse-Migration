# v2026.10.02.507 — 글로벌 성장·해외 SEO·광고수익 기획 작업기록

상태: PLANNING / 문서 전용
일자: 2026-10-02
브랜치: `docs/global-growth-seo-v2026.10.02.507`
시작 `origin/main`: `5a7c658b38853f564983d19f961c689a494dc4b6`
범위: 한국어 기본 서비스를 유지하면서 GeoIP 보조 현지화, 해외 자연검색 유입, 반복사용, 광고수익을 함께 성장시키는 구조를 설계한다. 얇은 대량 페이지, 검색 조작용 자동생성, 가짜 측정값은 금지한다.

## 시작 기록
- 문서 권위 체계와 현재 통합 기획서, 국제 locale/jurisdiction 명세, 검색 노출 명세, 제품 성장 계획, 광고 전용 수익화 권위를 다시 확인했다.
- 현재 사용자 권위: 제품/공개 사이트 기본 언어는 한국어다. 최초 방문은 국가/IP를 이용해 언어를 보조 선택할 수 있으나 명시 URL과 사용자가 저장한 언어 선택이 항상 우선한다.
- 사업자/세무/법무 권위가 명시적으로 변경되기 전까지 현금 수익화는 광고 전용 상태를 유지한다.
- 검색 성장은 페이지 개수, 키워드 도배, 얇은 자동번역 페이지, 무효 트래픽이 아니라 자격 있는 실제 사용자 검색과 제품 가치를 최적화한다.
- 검색 측정은 두 종류로 분리한다. 실제 사이트 성과는 Search Console/Search Advisor, 시장 전체 키워드 수요 추정은 Keyword Planner 또는 명시된 외부 공급자를 사용한다. 실제 연결 데이터가 없으면 UNKNOWN으로 남긴다.
- 이번 주기는 코드·런타임·Test·Production 변경을 하지 않는다.

## 계획 산출물
1. EN 정본 + KO 동기화 형태의 글로벌 성장/SEO/수익 설계 명세.
2. 상위 기획서 연결과 기본 locale/검색성장 결정의 최신화.
3. 국가/언어 출시 웨이브와 해외 사용자 기능 포트폴리오.
4. 검색수요 운영 루프, 색인 게이트, 다국어 URL 계약, 콘텐츠 품질 게이트.
5. 시장/콘텐츠군별 광고 전용 수익 모델과 실제 RPM·UX·개인정보 가드레일.
6. 버전 delta, 조사 근거, 내부/GitHub 업데이트 내역, 종료 검증.

## 중간 작업 기록
- 중간 origin/main은 5a7c658b38853f564983d19f961c689a494dc4b6로 시작과 동일해 동시 main 드리프트가 없었다.
- 글로벌 성장 상세 명세를 EN/KO로 작성하고 PROJECT_PLAN, 통합 마스터, 국제 locale, 검색운영, 제품성장, 광고수익 명세에 연결했다.
- Google 다국어 지침에 맞춰 GeoIP 강제 언어 redirect가 아니라 공개 검색면의 추천/selector 기본값으로 정리했다. 비색인 앱 온보딩은 자동 첫 기본값을 허용한다.
- 실제 사이트 검색성과와 시장 검색량 추정을 분리하고 synthetic 운영 지표 금지를 명시했다.
- Crossref raw 150,000 -> dedup 121,810 discovery corpus와 공식 1차자료를 조사기록에 정리했다.

## 작업 상태
DESIGN_DRAFTED

## 종료 기록
- 최종 origin/main 재확인: 5a7c658b38853f564983d19f961c689a494dc4b6, 시작/중간과 동일하다.
- GLOBAL_GROWTH_SEO_REVENUE_SPEC.md 및 한국어 대응본으로 written architecture design을 작성했다.
- PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, 국제 locale/jurisdiction, 검색 노출, 제품 성장, 광고 전용 수익, 문서 인덱스를 상위 권위에 연결했다.
- Crossref discovery corpus raw 150,000 / dedup 121,810건, manifest SHA-256 4dc89e5af460f6bbbbea4ae68a923f9cab6b6c8a274eaff5787c77a05d95b729를 조사기록에 보존했다.
- self-review에서 현재 v507 권위의 영어 제품 default, IP 언어 강제전환, 한국어 prefix self-canonical 충돌문구를 정리했다.
- 검색 측정은 provenance를 의무화하고 생성/fallback GSC 값을 live 근거로 금지한다.
- 상대링크 검증 중 기존 docs/INDEX 영/한의 주식 명세 링크 2개가 깨진 것을 확인해 실제 v2026.09.22.356 파일명으로 수정했다.
- 검증 범위는 문서 diff whitespace, 상대링크, EN/KO 쌍, placeholder, 현재권위 핵심 assertion, docs-only 경로다.
- 이번 회차는 런타임 코드, DB, Test, Production을 변경하지 않았다.
- 다음 게이트는 사용자의 v507 written design 검토다. 구현계획과 코드는 의도적으로 아직 시작하지 않았다.

## 작업 상태
WRITTEN_SPEC_READY_FOR_REVIEW
