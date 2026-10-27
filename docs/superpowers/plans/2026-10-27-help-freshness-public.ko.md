# 검증된 도움말의 공개 근거 유효기한 표시 — 개발 계획 (2026-10-27)
상태: 개발 후보 / DRAFT / RELEASE HOLD. 기준 main c2a9306d.
1. RED: 공개 검색·상세 SQL 결과와 Backend Repository가 reviewed_until을 반환하도록 실패 테스트를 먼저 작성한다.
2. GREEN: 아직 적용되지 않은 신규 280번 마이그레이션만 수정하고 SECURITY DEFINER 공개 함수에서 만료 시각을 반환한다. 테이블 직접 권한은 부여하지 않는다.
3. RED/GREEN: 한국어·영어 화면에 UTC 기준 유효기한을 표시하고 잘못되거나 만료된 근거는 숨긴다. no-store/noindex 유지, Android 공개 app-api와 동일 응답을 사용하고 관리자 경로는 차단한다.
4. 실제 격리 PostgreSQL17·권한·만료 음성 사례·전체 테스트/계약/타입/린트/빌드/보안/접근성/SEO 및 가능한 정확 SHA Test를 검증한다.
5. 최신 main·영문 정본/국문 통합기획 재확인, 타 작업 보호, Draft/hold PR, 릴리스 게이트 미충족 시 병합·운영배포 금지, SHA·변경파일·테스트·롤백 기록.
