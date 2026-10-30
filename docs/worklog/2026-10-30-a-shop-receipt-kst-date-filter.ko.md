# 개발 A — 회원 구매 영수증 한국시간 날짜 필터 (2026-10-30)

상태: **초안 / 운영 배포 보류**. [영문 정본](2026-10-30-a-shop-receipt-kst-date-filter.md).

기준 main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`, 별도 `auto/hourly-a-20261030-1500-shop-receipt-dates` worktree. 작업 전·중 QA v1390과 영문·국문 통합기획서를 확인했고 다른 개발자의 작업영역과 미병합 커밋은 변경하지 않았다.

회원 구매 영수증에 한국시간(Asia/Seoul) 양끝 포함 날짜 `from`·`to`(1~366일) 필터를 추가했다. 상품명 검색과 날짜 필터는 **본인의 최근 100건 안에서만** 결합되며, 필터가 없으면 기존 최근 30건을 유지한다. 기존 `shop_list_my_purchases` SECURITY DEFINER 함수의 소유권 경계를 재사용한다. 잘못된 날짜·중복·한쪽만 입력·역순을 거부하며 Next/Android API의 비공개 캐시 금지·색인 방지 정책을 유지한다. 웹에는 접근성 레이블, 날짜 적용·초기화, 오류 상태를 추가했다. DB 마이그레이션·권한 확대·원장 및 금액 변경은 없다.

검증: RED→GREEN, Backend 8건 및 Frontend/Android 9건 PASS, TypeScript·빌드 PASS, 전체 Lint 오류 0건(기존 경고 1,043건), 모바일 API 계약 183개 PASS, DB 단위 56 PASS/4 SKIP. 격리 PostgreSQL 17.11에서 마이그레이션 305개, 합성 균형 거래 108건, 본인 30/100건 제한·한국시간 경계·구매 테이블 직접 SELECT/INSERT 거부·ROLLBACK PASS. 보안 테스트 11 PASS, 운영 의존성 알려진 취약점 0건. 전체 Backend 119 FAIL, Frontend 53 FAIL로 **전체 품질 게이트 미통과**. 기존 Prettier 형식 문제도 남았다. 공식 Test 정확 SHA 인증 E2E·독립 복원·GitOps 게이트 미인증.

**main 병합, 공식 Test/운영 배포, 서비스 재시작, 운영 DB 변경, 롤백 및 브랜치 삭제 없음.** 되돌릴 때 날짜 파라미터와 UI를 제거하되 기존 검색·30/100건 동작을 보존한다. 격리 합성 데이터는 ROLLBACK되었고 전용 테스트 컨테이너는 통제된 정리 전까지 남겨둔다.
