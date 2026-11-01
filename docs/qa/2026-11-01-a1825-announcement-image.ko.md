# 개발 A 18:25 공개 공지 사진 첨부 필터 — QA (2026-11-01)

**기준 main:** `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`. **코드 체크포인트:** `d4902dfba5b3e9b754fbe52673ba14af0aefaec7`. **판정:** Draft / Release HOLD.

- 공개 공지 웹, Nest 공개 API, 앱 전용 `/content/announcements`, Android 게이트웨이에 `withImage=1` 필터를 구현했습니다. PostgreSQL의 기존 승인·공개 공지 조회 함수가 반환하는 **최근 20건 안에서만** 사진 유무를 판정합니다. 전체 과거 공지 검색은 아닙니다. 신규 마이그레이션·직접 권한 부여·원장 변경은 없습니다.
- 중복·미지원 파라미터를 400으로 거부하고, 필터 증명(`filterApplied=with-image`, `sourceLimit=20`)을 제공합니다. Android는 증명 누락·사진 없는 행·중복 ID·20건 초과·잘못된 응답 형식을 503으로 차단하며 캐시·색인을 금지합니다. 웹은 키보드 사용 가능한 GET 필터, 초기화, 오류·빈 결과 안내, 필터 페이지 noindex를 제공합니다. Android 계약 184개와 영문·국문 참조 문서를 갱신했습니다.
- RED→GREEN: Backend 3건, Frontend·Android 12건 PASS, SSR 추가 3건 PASS. `NODE_ENV=test`에서 Backend 전체 **2,966 PASS / 518 SKIP**, Frontend 전체 **2,914 PASS**(SSR 추가 전), DB 단위 **62 PASS / 4 SKIP**. Typecheck, Backend·Frontend Build, Android 계약 검사 PASS. Lint 오류 0/경고 1,022. 보안 테스트 12 PASS, 운영 의존성 감사 알려진 취약점 0건. 최종 SHA 전체 재검증은 별도 진행해야 합니다.
- 초기 실행의 Backend 2건/Frontend 496건 실패는 테스트 환경 변수 미설정 상태에서 발생했으며, 올바른 환경으로 전체 재실행해 통과했습니다. 워크트리 패키지 의존성 링크 및 보안 검사 스크립트 경로도 바로잡았습니다. 실패 로그를 삭제하거나 PASS로 바꾸지 않았습니다.
- 실제 개발 PostgreSQL 17.11에서 `moneyverse_app` 역할의 READ ONLY/ROLLBACK 조회: 최근 공개 공지 1건, 사진 첨부 필터 0건. 실제 사진 첨부 양성 데이터는 없어 단위 테스트로만 검증했습니다. 기존 P0 #993: 개발 DB 앱 역할에 `announcements`·`users` SELECT, `account_balances` UPDATE, `user_items` DELETE 직접 권한이 남아 있습니다. 운영 DB의 동일 문제는 입증되지 않았습니다.
- 감사 시 열린 PR 110개(충돌 22개), 비-main 브랜치 121개(고유 미통합 115개, main 선조 6개). #2347·#2272·#2243과 통합 충돌 가능성이 있어 보존합니다. 공식 Test SHA `bc8cd8a6…`, Production Backend `353c6d5d…`, Frontend `1793450413898`은 후보와 불일치합니다. 공식 Test 정확 SHA 인증 E2E·백업 복원·최소 권한·릴리스 게이트가 미충족이므로 병합·배포 금지입니다.
