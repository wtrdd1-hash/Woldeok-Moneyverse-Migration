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

## 종료 (02:45 KST)
- 코드 SHA `fe1d918673d92fcc0c98197c2dd4e15e694a8519`, GitHub CI #41225039551 SUCCESS. 후보 이미지 #41225034250 진행 중.
- Backend 전체 2,954 PASS/517 SKIP, Frontend 전체 2,906 PASS, DB 단위 62 PASS/4 SKIP, 보안 11 PASS, Android API 계약 184개 PASS, 전체 lint 오류 0/경고 1,022, 타입 검사 PASS, Backend/Frontend 빌드 PASS. Frontend는 MCP cgroup의 작업 수 한계 근접으로 최초 빌드가 정체돼 해당 빌드 프로세스만 종료한 뒤 격리 systemd에서 성공함.
- 실제 개발 PostgreSQL의 함수 실행은 성공했으나 앱 계정의 공지 테이블 직접 SELECT 권한이 존재하여 P0 최소 권한 문제는 차단 상태. 운영 DB에 동일하다고 단정하지 않음.
- Test SHA `bc8cd8a6c654af0336f550643f23049a58ee1d16`, Production SHA `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`로 후보와 다름. 정확 SHA 인증 E2E 및 독립 백업 복원 미검증. Production HOLD.
- 원격 브랜치 23→24(메인 포함), 열린 PR 21→22, 고유 미통합 비-main 23개 모두 보존. 병합·브랜치 삭제·배포·재시작·롤백 0건.
