# v2026.11.18.27.1 UI/API 운영 부분 승격·원복 지침

**2026-11-18 KST · [영문 정본](2026-11-18-ui-api-readonly-v27-release.md).** 읽기 전용 주식·상점·일부 Next 링크 라우팅만 수정, 전체 180화면 새 디자인 전환 아님. 민감 운영 설정/원복 사본·세션 로그는 **MiniPC 내부에만** 보관.

## 테스트 후 실제 운영 순서
- 기준 v26 SHA `235dd8ca...`, v27 코드 `82be273f...`→`781e9231...`, 원격 main0590fac4·Gemini 공유 main 미수정. 분리 MiniPC 작업트리/작업자. Spring 전체 `clean test bootJar` **JUnit216/216 PASS**, 56스위트. 불변 JAR `/srv/moneyverse-data/releases/ui-api-v2026.11.18.27.1-781e9231/app.jar` SHA `a241e3aeb677bbd15a86a3dae9aadc07ea2b671c96bbff2a05308be0b75078ad`. 내비 스크립트 `/srv/moneyverse-data/releases/frontend-compat-v2026.11.18.27-155d4e60/static-navigation-v27.js` SHA `155d4e60c333091abf8495b283d9084698b1fb9181b21856afd4c80f6ca6afd9`.
- Test DB readonly Spring4649, 운영 DB readonly Spring4650(봇/스케줄러 OFF). 기존 운영 Spring4550 PID368434·v24/v25 이전 버전 유지, 운영 개인정보/금융 원장/스키마 쓰기 없음. 별도 Nginx Test4452·Node 클릭 정책11개·실브라우저 링크3개 통과. 운영 HTTPS30/30, 주식 EN/KO×320/390/1440 화면6/6, 정본 상점146, 임시 회원 정리·타인 위조403.
- 내부4400/외부80 Nginx 정확 GET/HEAD만 `/stocks`→Spring4650, `/stocks/` 정규화, `/api/v1/shop/public-catalog`·`/api/shop/public-catalog`(공개 실상품), 구 `/api/v1/shop/catalog`·`/api/shop/catalog`(로그인 회원 실세션 보유량)→4650. JS는 13개 v24 공개 HTML/슬래시별칭25경로에 정확히 1회 주입; 거짓 RSC HTML200 대신204. **주문·제작·금융 POST는 승격하지 않음.** 거래소 읽기 전용 영/한·실종목10개, 가짜 체결 없음. 기존 P0 관리자·금융·개인정보 차단 및 v25 고객지원/채팅 GET 보호 유지.

## 설정 백업 SHA·원복 조건
- Nginx 본 설정 `/etc/nginx/sites-enabled/moneyverse` 변경 전 `8702a578f7c91348c98c90c7a44341e9863bbfeeac23cceed9dff284a6b8c2b4`, 변경 후 `306b4aa556c4bfb22a056dd7df31be54f4e2192537d71092173c60dfc8dbb873`.
- HTML 스니펫 `/etc/nginx/snippets/moneyverse-frontend-v24-pages.conf` 변경 전 `76fb3dee20e19cf6d57182444e231046a9d4134a5b49c9263600b0fb9245b60c`, 변경 후 `8bc6d032135bad86707c7161a1678d1e76d5a5346e96d9db0041c55db7e39fbb`.
- 사본은 MiniPC `$TASK/private/nginx-main-before-v27-release.conf`, `$TASK/private/nginx-v24-pages-before-v27-release.conf` 각각600권한(전체 원본 보안 설정 GitHub 금지). 원복 시 **현재 두 SHA가 변경 후 값과 같고 동료가 건드리지 않았는지 우선 대조**, 백업 두 SHA가 변경 전 값인지 확인, **두 파일을 함께** 복구→`sudo nginx -t`→무중단 reload→공개/관리자/금융/주식·상점 QA. 원복은 실제 훈련까지 수행된 것이 아니라 문서화된 조건임. 구 오류 재발 가능성 주의.
- QA 재실행: `python3 scripts/qa/verify-v27-snapshot-navigation.py --release-dir /srv/moneyverse-data/releases/frontend-v2026.11.18.24-1794990553432/frontend-static` (13 HTML 원본 해시·RSC204 확인). 기존 v26 자산1005개 정상 검증, 이번 v27에서 원본 CSS/JS는 수정하지 않음. 상점 `catalogItems`·`items` 각146 및 필터400, 거래소 실제10개·오류503, 회원/관리자 권한401·403을 구분해 확인.

## 여전히 미완료
OpenAPI901경로 중 소스503 28, 계산기 React 수화 오류#418, 관리자/회원 v17 전체 신디자인·채팅 전송, 동적 공개5경로, 전 180화면 그래픽/모바일·실제 로그인 양성, 금융 정산/거래 불변 영수증, 외부 공식 Test Cloudflare403, Discord/완전 복원 훈련. **전체 승격 완료 표기 금지**, Draft로 유지.
