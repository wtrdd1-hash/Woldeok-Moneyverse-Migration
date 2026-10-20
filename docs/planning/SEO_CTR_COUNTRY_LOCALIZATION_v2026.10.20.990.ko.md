# 검색 클릭률·국가별 자연스러운 현지화 개선 — v2026.10.20.990

상태: 구현 후보 / 운영승격 보류. 영문 정본: SEO_CTR_COUNTRY_LOCALIZATION_v2026.10.20.990.md. 상위 권위는 PROJECT_PLAN → INTEGRATED_PLANNING_MASTER, 세부 근거는 v688 GSC, v860 검색 유입, v920 다국어 SEO, v976 AI 블로그 편집 안전 규격입니다.

## 실제 검색 증거
Google Search Console 도메인 sc-domain:easy-scraping.com, 확정 웹 데이터 2026-09-19~10-17: **노출 1,383회, 클릭 15회, CTR 1.08%, 평균위치 22.4위**. 일본어 대출 계산기 91회/0클릭, 중국어 대출 계산기 86회/0클릭, 중첩된 일본어/영어 사전 주소 102회/0클릭. 검색 순위와 표본 차이가 크므로 제목만 원인이라고 단정하지 않습니다.

실제 운영 HTML에서 일본어·중국어 대출 계산기 주소가 한국어 title/H1/canonical을 사용하고 /ja/en/과 같은 중복 언어 URL이 200으로 노출되는 것을 확인했습니다. 복리 계산기의 달러 초기값, 고정 환율 곱셈 및 출처 없는 환산 예시, 블로그의 한국어/원화 위젯도 원인 후보입니다.

## 수정한 기능의 범위
1. 중복된 언어 접두사를 실제 언어 주소로 HTTP 308 정규화. 쿼리 유지.
2. 미국 영어, 일본어, 중국어의 대출 계산기 독립 라우트 제공. 자연스러운 각국 레이블·금융용어·설명·고유 제목·자기 자신 canonical. KRW/USD/JPY/CNY 국가·통화 선택; 변경 시 독립된 예시 원금으로 전환하며 **임의 환율 환산은 하지 않음**.
3. 실제 완성된 번역 페이지에만 양방향 hreflang과 사이트맵 URL 허용. 미번역 세금·주식 계산기에는 거짓 다국어 링크를 추가하지 않음.
4. 금융용어사전의 한국어 설명/계산식이 일본어·중국어 메타와 본문으로 새어 나오지 않도록 정리하고 번역 검토된 계산식만 사용.
5. 계산기 제목에서 중복 브랜드/과한 약속을 줄이고 검색자의 목적과 맞춤.
6. 복리 계산기 및 국가별 장문 프리셋: EN/USD, JA/JPY, ZH/CNY 기본 단위와 Intl.NumberFormat 서식. 나라별 독립 예시 금액, 고정 배율 환율과 근거 없는 환산 결과 제거. EUR/GBP/KRW/CNY 선택 시에도 예시 금액으로 초기화하고 실제 환율인 척하지 않음.
7. 국가별 별도로 작성된 금융 블로그의 제도·법률 출처 유지, 국가별 도구로 연결. 복리 교육 글에만 국가 통화 미니 계산기를 넣고 다른 기사에는 무관한 한국어 위젯 대신 현지화된 도구 허브로 연결. 검증되지 않은 AI 자동 게시글은 여전히 색인·게시 제한.
8. 경제 원장, 사용자 잔고, DB, 서비스계정, 외부 색인 제출, 운영 환경은 변경하지 않음.

## 국가별 원칙
- 한국: 한국어·원화·한국 금융제도와 적용 연도.
- 미국: 미국 영어·미국 달러·CFPB/IRS/SEC 등 공식 자료.
- 일본: 자연스러운 일본어·엔화·金融庁/JPX/国税庁 자료.
- 중국: 중국 간체·위안화·中国人民银行/国家税务总局 자료.
언어만으로 세법 거주지를 확정하지 않고, 환율·대출 승인·상품 금리를 근거 없이 확정적으로 표시하지 않습니다.

## 검증·운영승격
타입검사, SEO 테스트, 실제 4개 언어 title/H1/body/lang/canonical/hreflang, 320/390px UI, 국가 단위 계산식/도구 이동 검사. 정확한 브랜치 SHA CI, 분리된 Test 실가동과 백엔드/DB, 인증 UI, 기존 원장·권한 P0, 세션 연속성, 백업·롤백 준비가 모두 합격하기 전에는 운영 완료가 아닙니다. 검색 성과는 GSC 확정 데이터의 검색어·페이지·국가·기기·순위대별로 7/14/28일 추적하며 CTR 향상을 보장하지 않습니다.

나머지 한국어 전용 금융 계산기까지 모두 번역됐다고 표시하지 않으며, 국가별 세율·법률·계산식의 개별 검증을 거쳐 후속 단계로 확대해야 합니다.

## 공식 레퍼런스
Google 다국어 SEO https://developers.google.com/search/docs/specialty/international/localized-versions
Google 대표 URL https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
Google 검색 실적 https://support.google.com/webmasters/answer/7576553
Microsoft 문체 가이드 https://learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides
MDN 통화 서식 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
Google 사람 중심 콘텐츠 https://developers.google.com/search/docs/fundamentals/creating-helpful-content
