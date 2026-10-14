# 운영 SEO·검색 랜딩페이지 실측 감사 및 기획 보완 — v2026.10.14.605

> Status: FINDINGS / PLANNING PROPOSAL. 관측 2026-10-14 KST. 운영 변경 없음.
> 상위 문서 PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, SEO_DEMAND_KEYWORD_EXPANSION_SPEC, FEATURE_SEO_GROWTH_EXPANSION_SPEC (v604 격리 브랜치, 미병합).
> 증거 경계: $pc 헬스/HTTP 응답, 공개 검색 결과의 렌더 텍스트. HTML 메타 전수 파싱·실제 GSC·Naver 지표는 이번에 확보하지 못함.

## 실측
- 미니pc홍 get_system_status: frontend/backend/nginx/docker 및 MCP active, 개발 DB 연결됨. 이는 검색 성공 증거가 아님.
- $pc 직접 curl: / 200 HTML 206603 bytes, /robots.txt 200 text/plain 486 bytes, /sitemap.xml 200 XML 1282085 bytes, /tools/compound-calculator 200 HTML 202601 bytes, /tools/salary-calculator 200 HTML 173761 bytes, /blog 200 HTML 433476 bytes. HTTP 존재와 응답 크기는 sitemap 유효성/색인/성능 보증 아님.
- 공개 검색 결과: /tools 허브 title은 '5 Calculators'인데 실제 렌더에는 연봉/청년도약/퇴직 등 추가 계산기 열거. /en/tools의 H1 및 본문 상당 부분이 한국어로 노출. /ja/tools/compound-calculator에서 H1과 설명이 한국어로 노출. 실제 표시 언어/메타 hreflang/canonical 검증 필요.
- /tools/stock-calculator에서 WLD 가상 종목 수치 옆에 실제 통화 FX/투자교육 문맥이 혼재. /ja/tools/compound-calculator에는 '실시간'으로 표기된 고정값처럼 보이는 금리/지수/환율 및 날짜 불명 경제 일정이 노출. 실시간 API 타임스탬프 확인 전 '실시간' 표시 차단.
- /guide의 100% 무손실 복식부기 및 /features의 '실시간' 표현은 기존 v603/경제 QA 차단 증거와 대조 전 마케팅 보증으로 사용 금지.
- 검색엔진 결과에 URL 일부 노출 확인. 이는 사이트 전체 색인률, 유입량, 순위 상승의 증거가 아님.

## 우선 수정 과제
| Gap | Severity | 설명 | 검증·개선 |
|---|---|---|---|
| SEO605-01 | P0 | /en 및 /ja 로컬라이즈드 페이지 한국어 본문 | URL별 실제 server HTML lang/title/H1/body/metadata 동언어 검증. 미완성 locale URL은 올바른 언어 콘텐츠 완성 전 색인 보류/통합 |
| SEO605-02 | P0 | 실시간 환율·금리·지수 및 경제 일정의 출처·시점 불투명 | API 계보, fetchedAt/asOf, 지연/오류 상태, no-data 표시; 가상 예시와 실측값 뚜렷이 분리 |
| SEO605-03 | P1 | 도구 허브 '5대' 명칭과 공개 목록 불일치 | 허브 제목·description·카테고리·실제 유효 도구 수 자동 동기화 |
| SEO605-04 | P1 | 가상 WLD 계산기와 실제 금융/세무 계산 혼합 | 'virtual example' vs 'real-world calculator' 모드·단위·법역·면책·인용 출처 분리 |
| SEO605-05 | P1 | sitemap.xml 1.28MB: 내용/분할/중복/lastmod 실제 검증 부재 | XML 파싱, loc 중복·canonical·indexability·gzip·분할·lastmod·locale 검증. 용량 자체를 오류로 단정 금지 |
| SEO605-06 | P1 | 페이지 규모 대비 indexable 후보 입장 근거 미확인 | v527 evidence gate, 콘텐츠/공식 독립성, canonical/cannibalization 판정, GSC/네이버 페이지별 인덱스·클릭 대조 |
| SEO605-07 | P1 | CTA/온보딩 SEO 방문자 전환 실측 부재 | 도구 사용 완료→가상경제 체험→가입→첫 액션 이벤트와 동의/코호트 검증 |
| SEO605-08 | P1 | 사이트 신뢰 표현 과장 우려 | '100% Verified/IndexNow Active/무손실' 수치·보증의 검증 출처 또는 조건부 문구 |
| SEO605-09 | P1 | SEO 기술 기반 전수 미검증 | canonical/hreflang/x-default/noindex/robots/structured data/HTTP redirects/404/SSR/heading/OG 점검 |
| SEO605-10 | P1 | 모바일 UI·보안 기존 차단 | v530 전라우트 5회, v603 인증·권한 및 인덱스 핑 보안 통과 전 운영 반영 금지 |

## 도구별 상세 검사 계약
각 실제 검색 가능 URL에 대해 200/redirect, server HTML title/meta description/lang/H1, canonical self-reference, hreflang reciprocal, JSON-LD schema validity, indexability, sitemap membership, content uniqueness, law jurisdiction, source/effective date, fresh-data status, internal contextual links, conversion CTA, mobile 320/360/390/430, CLS/LCP/INP 및 keyboard/focus를 수집한다.
검색 KPI: 국가×언어×query cluster×page×device별 GSC/네이버 노출/클릭/CTR/위치, 색인 등록/제외, 검색 유입→계산 완료→시나리오→가입→최초 활동, D7/D30. 실제 자료 전에는 수치 비워둔다.

## 계획 수정 제안
1. v604 기능과 SEO 전략에 번역 완료율 및 오류 발생시 자동 비색인, 신뢰 가능한 데이터의 시점/출처 경고를 필수 승인 조건으로 추가.
2. '가상 게임 WLD'와 '실제 금융 정보'를 콘텐츠 분류와 단위, 계산 엔진, 법역, 광고 배치로 분리.
3. 사이트맵·robots·hreflang·canonical 증거를 기반으로 대량 생성 URL을 점진 배포, 실측 쿼리/콘텐츠 고유성 없으면 HOLD.
4. 통합 기획서에 채택 전 기존 v527, v530, v603 차단 및 동시 Gemini 작업 확인. 본 문서는 새로운 제품 권위로 자동 승격되지 않음.

## 회차/감사
기준 main SHA c56af867ad8f7556e53f895b0bb294c4bfc8a02d; 미니pc홍 사용. 서버는 읽기 전용 점검. 몇몇 확장된 쉘 분석 호출은 안전 검사에 의해 차단되어 HTML 상세·sitemap XML은 전수 검증하지 못했음. 메인 중간 재확인 동일 SHA. 신규 격리 문서 브랜치만 갱신, Production/Test 미변경.
