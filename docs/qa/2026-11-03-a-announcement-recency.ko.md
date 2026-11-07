# 개발 A QA — 공개 공지 최근 게시 기간 (2026-11-03)

**초안 / 운영 보류.** 기준 main f5c3fbedae1c3b3ec2374882b049aac43a655eb4, 복구 코드 SHA 81843c78ee18fa332cffdaacac61bf0d7e642cca. 최종 문서 SHA·CI는 PR #2561에 기록한다.

공개 공지의 최근 7일·30일 필터를 웹, Nest, Android App API에 구현했다. 기존 PostgreSQL SECURITY DEFINER 함수에서 조회한 **최신 공개 공지 20건**만 필터링하며 전체 과거 공지 검색은 아니다. 중복·잘못된 조건은 400, Android의 검증 불가능한 성공 응답은 503으로 거부한다. 필터 결과는 noindex 및 no-store 정책을 적용한다. 신규 DB 마이그레이션·금융 원장·권한 확대는 없다.

최초 코드 SHA fee081bf157fba4e9b9af28e903c22a75d394e39: Backend 전체 2,988 PASS / **2 FAIL** / 518 SKIP, Frontend 전체 2,952 PASS. 기존 프로필 인증 테스트 2건은 HTTP 200 대신 401(#2265). 최초 CI는 Next metadata/generateMetadata 동시 export로 실패했고 별도 repair 브랜치에서 수정했다.

복구 코드 SHA에서 Backend/Frontend 빌드·타입검사, Backend 대상 14건, Frontend 대상 5건, 계약 41건 PASS, DB 단위 72 PASS / 5 SKIP. 전체 의존성 감사 **9건 FAIL**, 운영 의존성 취약점 0건. 개발 PostgreSQL 17.11 읽기 전용 검증: 최근 공개 공지 1건, 7일 0건, 30일 1건. 앱 역할에 공지 직접 SELECT/UPDATE, account_balances UPDATE, user_items DELETE 권한이 남아 **P0 최소 권한 실패**다. 운영 DB 동일 여부는 미확인.

공식 Test SHA 0c70a114da5f4cc5374bc4b80e0403a044f8546f, Production SHA 305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b로 후보와 다르다. 정확한 SHA 공식 Test, 인증 E2E, 독립 복원, 접근성 실측, 롤백 검증 미완료. 타 PR 고유 변경 보호, 병합·배포·재시작·DB 쓰기·브랜치 삭제 없음.
