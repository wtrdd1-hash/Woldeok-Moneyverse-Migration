# A 갤러리 게시일 QA — 후보/릴리스 PASS 아님
- 기준 main `f13bbce273ffc65e8576170992d82ea00c27a1c9`, 브랜치 `auto/hourly-a-20261101-1225-gallery-day`.
- 구현 전 RED: Backend 11 실패/4 통과, Frontend 검증 모듈 부재·날짜 무시, UI 2 실패, 비JSON/204 2 실패.
- 구현 후 대상 Backend 15/15, Frontend 10/10 PASS. Android 계약 184개 PASS.
- 실제 개발 PostgreSQL 앱 역할: 승인 사진 함수 EXECUTE 허용, 사진 테이블 직접 SELECT 불허, 최근 사진 2건, 읽기 전용 ROLLBACK. 개발 ACL P0 #993 잔존.
- 전체 빌드/린트/타입/단위/통합/격리 DB E2E/보안/접근성/SEO/공식 Test 정확 SHA 별도 게이트. 대상 테스트만으로 전체 성공 주장 금지.
- Test 미변경·정확 SHA 인증 E2E BLOCKED, Production 미변경·HOLD. 롤백은 브랜치 폐기, DB/런타임 변경 없음.

## v2 회귀 및 최초 빌드 실패
- 최초 Next 빌드 exit 1: 기본값을 둔 GalleryPage/generateMetadata 인자가 자동 생성 PageProps와 불일치. 수정 후 새 SHA 빌드 필요.
- Android `/app-api/v1/photos` 별칭 검증 누락 RED 1건→수정 후 Frontend 11/11 PASS. 최종 SHA 전체 게이트 재검증 필수.
