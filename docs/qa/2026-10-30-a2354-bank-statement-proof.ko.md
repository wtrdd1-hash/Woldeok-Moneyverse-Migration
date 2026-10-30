# QA — A 2026-10-30 23:54 은행 잔액 CSV 검증 (운영 보류)

- 기준 `origin/main` bf8d0d48f810932b43783d8605dce53954c60cff, 영문 원본 통합기획서와 한국어 대조본을 시작·중간·통합 직전 확인. 다른 기획 변경 없음.
- 회원 본인 은행 잔액 CSV에서 실제 UTF-8 BOM/CRLF를 출력하도록 수정하고 Android app-api의 위조·불완전한 HTTP 200 응답을 503으로 차단. 기존 Nest 인증/동의와 PostgreSQL 본인 UUID 조회 함수 재사용. 신규 마이그레이션·권한 확대·원장 쓰기 없음.
- RED 7실패/4통과 → GREEN 웹·Android·링크 13통과, Backend 3통과, 모바일 게이트웨이 계약 15통과, DB 단위 62통과/4건너뜀, 보안 7통과. Typecheck·Backend/Frontend Build·변경 파일 ESLint 통과. 운영 의존성 알려진 취약점 0건.
- 격리 PostgreSQL 17.11에 마이그레이션 311개(002~312) 적용. 합성 회원 2명의 2^53 초과 WLD 문자열과 역할별 조회, 대출 테이블 직접 SELECT·원장 INSERT 차단 확인. ROLLBACK 후 합성 회원 0건, 자체 테스트 컨테이너만 제거. DB 함수 인자만으로 독립 신원 인증이 되는 것은 아니며 Nest 세션/동의가 필요.
- 전체 Backend 2,653통과/126실패/501건너뜀, Frontend 2,707통과/55실패. 실패 식별자는 이전 A 기록과 일치하나 필수 게이트 통과 아님. 전체 Lint 1오류/1,043경고, 기존 구매 영수증 테스트 구문 오류는 별도 PR #2038에서 처리 중.
- 공식 Test SHA c2129625… (후보 SHA 아님), 국고 HTTP 200 미검증 데이터 노출. Production SHA bf8d0d48…·국고 HTTP 503 UNVERIFIED. 운영 배포 링크는 19:35 버전이나 Backend/Frontend 실행 프로세스 경로는 삭제된 15:15 디렉터리로 확인되어 P0 #1984 지속.
- 공식 Test 정확 SHA 인증 E2E·전체 CI·독립 복원·GitOps 게이트 미통과. main 병합/운영 DB 변경/서비스 재시작/Test·Production 배포 없음. 최종 **RELEASE HOLD**.
