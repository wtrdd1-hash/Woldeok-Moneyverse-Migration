# SEO · 광고 · 법적 고지 운영 점검

기준일: 2026-09-08

## 적용 원칙

- 검색 색인은 `SEO_INDEXING_ENABLED=true`인 정본 운영 배포에서만 허용한다. 테스트·임시 호스트는 기본 `false`로 실패 폐쇄한다.
- 광고는 `ADS_ENABLED=true`가 명시된 운영 배포에서만 활성화한다. Dockerfile 자체 기본값도 `false`로 두어 실수로 만든 테스트 이미지가 광고를 송출하지 않게 한다.
- `ads.txt`는 루트 `/ads.txt`에서 게시자 `pub-5220225531544323`을 DIRECT로 선언한다.
- 광고 배치는 홈, 운영 소식 목록·상세, 운영 검토 후 공개된 갤러리 같은 공개 정보 페이지로 제한한다.
- 상점 구매 화면, 계정, 지갑, 송금, 주식, 대출, 카지노, 보상, 관리자, 상태, 약관, 개인정보처리방침에는 광고를 배치하지 않는다.
- WLD는 현금 환전·출금·실물 경품 교환이 불가능한 서비스 내부 가상 데이터라는 경계를 유지한다.
- EEA·영국·스위스 방문자 광고 동의는 Google Privacy & messaging 또는 Google 인증 CMP의 실제 운영 설정과 개인정보처리방침 문구가 일치해야 한다.

## 2026-09-08 변경

- Docker SEO/AdSense 기본값을 opt-in(`false`)으로 변경.
- AdSense 런타임 설정도 명시적 enable이 없으면 비활성화하도록 변경.
- 상점 페이지의 광고를 제거해 거래·구매 UI 인접 광고 리스크를 줄임.
- 실제 광고 배치와 개인정보처리방침의 광고 범위를 일치시킴.
- 위 opt-in 동작을 회귀 테스트로 고정.

## 운영 확인 체크

1. 운영: `APP_BASE_URL=https://easy-scraping.com`, `SEO_INDEXING_ENABLED=true`.
2. 테스트: `SEO_INDEXING_ENABLED=false`, `ADS_ENABLED=false`.
3. 운영에서 `/robots.txt`, `/sitemap.xml`, `/ads.txt`가 200으로 응답하는지 확인.
4. Search Console에서 사이트맵 제출·색인 상태·페이지별 canonical 상태 확인.
5. AdSense에서 ads.txt 승인 상태와 정책 센터 경고 확인.
6. Google Privacy & messaging/CMP가 대상 지역에서 실제 노출되는지 브라우저 세션으로 확인.

> 이 문서는 기술·운영 점검 기록이며 법률 자문을 대체하지 않는다. 기능·수익화 방식이 바뀌면 개인정보 처리, 청소년 보호, 게임/사행성 관련 규제 적용 여부를 다시 검토한다.
