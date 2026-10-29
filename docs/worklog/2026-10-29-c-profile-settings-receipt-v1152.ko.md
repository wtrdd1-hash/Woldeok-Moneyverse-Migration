# 개발 C v1152 — 회원 프로필 공개 설정 저장 확인 (한국어 보조)

## 시작 — 2026-10-29 11:41 KST
- Debian 13.6 미니PC 주요 서비스 7개 정상, 개발 DB 연결. 시작 main `4595e8f660cd9646cabcbf2643e5309b9eb9a7b9`.
- AGENTS, README/한국어 안내, 영문/국문 통합기획서, QA·A/B·활성 PR 검토. 기존 C #1820 프로필 사진 기능과 중복하지 않고 보존.
- P1: 프로필 공개 범위가 실제 저장되지 않았어도 HTTP 성공만으로 저장 완료를 표시하는 문제.
- 구현 계획: PUT 응답과 회원 본인 GET 설정을 요청한 공개 설정 전체와 비교한 뒤에만 성공. 실패 시 보수적 오류 안내. 기존 API/DB 계약·모바일 접근성·noindex 유지.

## 중간 — 11:45 KST
- TDD RED: 기존 저장 액션에 새 검증 6건 중 6건 실패(기존 Frontend 전체 1,876 PASS, 신규 6 FAIL). GREEN: 저장 응답과 회원 전용 재조회 비교 후 신규 6/6 PASS, Frontend Typecheck PASS. 신규 3개 음성 사례 추가.
- 중간 main fetch `4595e8f660cd9646cabcbf2643e5309b9eb9a7b9` 동일, 통합기획서 변경 없음. 독립 작업 유지.

## 종료 / 배포 보류 — 11:52 KST 기준
- TDD 초기 실패 6건, 수정 후 신규 9건 통과. Frontend 전체 1,919 PASS, Backend(DB 미연결) 1,955 PASS / 440 SKIP, DB 패키지 46 PASS / 4 SKIP, 계약 38 PASS. Lint 오류 0건(기존 경고 1,091건), Typecheck·180개 app-api 계약·전체 빌드 통과.
- 보안 감사 전체 12건 및 운영 의존성 1건 실패. GitHub 첫 후보 빌드는 Next Google Fonts 로더 오류로 실패했고 동일 SHA 재시도 요청. 최종 HEAD CI 결과 별도 확인 필요.
- 최신 main `b84d645a87e8fa0d544ca3ee17e785e737e477ea`로 재기반화(운영 v1213 문서 변경, 개발 코드 충돌 없음). Test/Production 실제 앱 SHA `b44ffd0af9e2bd6e7c2be7345b72094827078c3d`는 이번 후보가 아님. 별도 운영 담당자가 v1213을 배포했으나 이 작업에서는 배포하지 않음.
- 자체 격리 PostgreSQL 컨테이너 생성 후 초기 기동 경쟁이 발생했고 재실행이 도구 안전 검사에 차단되어 컨테이너 제거. 로컬 실제 PG 통과 주장 금지, GitHub 격리 PG CI 확인 필요.
- Draft/HOLD 유지. main 병합, Test/Production 변경, 롤백, 타인 브랜치 삭제 없음. 최종 CI 상태는 PR 댓글로 후속 기록.

