# 개발 A QA — 본인 구매 영수증 최대 WLD 필터 (2026-10-31)
**상태:** P1 기능 후보, 로컬 게이트 통과, 공식 Test 정확 SHA 인증 E2E·릴리스 게이트 미충족, 운영 보류. 기준 main 761a55a094fb9dd383d213e817305e68c79fa23c. 브랜치 auto/hourly-a-20261031-0625-purchase-ceiling.
- 기존 본인 한정 PostgreSQL shop_list_my_purchases 재사용. maxAmount는 1~30자리 양의 정수 문자열, 상한 포함. 최소 금액·상품명·한국시간 날짜 필터와 조합. 역순/중복/잘못된 금액은 DB 접근 전에 400. 기본 최근 30건, 필터 시 최근 100건 내 검색. 표시된 건만 BigInt 정확 합계.
- Nest 인증·인가·동의 가드 유지. Next 비공개 BFF와 Android app-api는 조건에 어긋난 HTTP 200을 503으로 차단. 기존 Android 최소 금액 오류 코드를 보존. 웹 접근성 레이블·오류 안내, no-store/noindex.
- TDD 실패 재현: Backend 2건, 웹/Android 4건, UI 검증 모듈 부재, 기존 오류 코드 회귀 1건. 수정 후 Backend 9 PASS, 웹·Android·UI 20 PASS.
- 수정 전 전체 검증: Typecheck, Backend/Frontend 빌드 PASS; 전체 Lint 오류 0/경고 1049; Backend 2780 PASS/501 SKIP; Frontend 2776 PASS; DB 단위 62 PASS/4 SKIP; 모바일 API 계약 184개 PASS; 보안 11 PASS; 운영 의존성 알려진 취약점 0. 최종 SHA에서 재검증 필요.
- 격리 PostgreSQL 17.11: 311개 마이그레이션 적용, 실제 DB 통합 5 PASS, 합성 영수증 본인 105건·타인 3건, 최근 100건·40/70 WLD 경계·최소/최대 조합·본인 격리·원장 균형 검증 PASS. 앱 계정 함수 EXECUTE 허용, purchases 직접 SELECT/INSERT 차단. ROLLBACK 후 사용자·원장 0건.
- 시작 원격 브랜치 46개(기본 포함), 열린 PR 42개. 비-main 45개 모두 미통합 커밋이 있어 보존, 삭제 0건. 기존 복구 PR #2038의 변경사항 보호.
- 운영 보류: 공식 Test 후보 SHA 미배포, 인증 E2E·엣지·독립 복원·운영 출처 미검증. P0 #1984/#993 및 #2012 해결 전 병합·배포 금지. 운영 DB/서비스/잔액 변경 없음. 롤백은 커밋 되돌리기, DB 롤백 불필요.
증거: /srv/moneyverse-data/reports/Moneyverse-A-2026-10-31-0625-purchase-ceiling/
