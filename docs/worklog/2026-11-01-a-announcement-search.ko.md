# 개발 A — 공개 공지 제목 검색 (2026-11-01 02:25 KST)

## 작업 전
- 최신 main `f13bbce273ffc65e8576170992d82ea00c27a1c9`에서 독립 브랜치 `auto/hourly-a-20261101-0225-announcement-search` 생성.
- 기존 작업공간의 미커밋 변경, 다른 개발자의 PR·브랜치, 운영 데이터 및 적용된 마이그레이션을 보호.
- 공개 공지 중 최근 최대 50개 제목 검색. 전체 기록 검색으로 표현하지 않음.

## 진행 중
- PostgreSQL의 기존 발행 공지 전용 SECURITY DEFINER 함수를 재사용해 문자 그대로 제목 필터 적용. 신규 테이블 권한·마이그레이션·금융 원장 변경 없음.
- NestJS 검색 조건 검증, Next.js 정적/ISR 페이지 검색 UI, Android app-api 요청·응답 검증 추가.
- 테스트 우선 작성으로 실패(RED) 확인 후 대상 테스트 통과(GREEN).
- Backend 전체 2,954 PASS/517 SKIP. Frontend 최초 전체 2,904 PASS/1 FAIL(신규 앱 API 그룹 기대 목록 누락), 해당 테스트 수정 후 대상 20 PASS; 전체 재검증 진행 중.
- 개발 PostgreSQL 읽기 전용 검증 PASS. 단 `moneyverse_app`의 `public.announcements` 직접 SELECT 권한이 확인되어 최소 권한 P0 차단 상태.

## 종료
- 최종 검증 결과와 SHA는 영문 작업일지 및 QA/Release HOLD 문서에서 추적. 공식 Test/Production 배포·병합·브랜치 삭제 금지.
