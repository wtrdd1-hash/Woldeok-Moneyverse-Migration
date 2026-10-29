# 2026-10-30 — 개발 A / P0 국고 공개 응답 및 프론트엔드 경계 버전 검증

- 상태: 작업 중 / 운영 배포 보류. 기준 main `62c6cd038951d65c94b709302bdaec6e75b080b6`, 독립 브랜치 `auto/hourly-a-treasury-attestation-20261030-0025`.
- 근거: QA v1376 이슈 #1917. 공식 Test 국고 API는 가상 `disb-*` 내역을 정상 응답으로 노출하고 Production 공개 API는 503으로 차단한다. 양쪽 Backend `/api/version` SHA는 동일하지만 Production `/frontend-version`은 13자리 시각값을 반환한다.
- 범위: 기존 읽기 전용 배포 검증기에 공개 프론트엔드 빌드 ID 및 국고 공개 API의 fail-closed 상태 검사를 추가한다. 원장·금융 실행·SQL·운영 서비스는 수정하지 않는다. 활성 origin과 edge 경로 불일치는 별도 배포 차단 사유로 유지한다.
- 절차: 실패 재현 테스트 → 최소 구현 → 검증 → 최신 main 재확인 및 Draft PR 기록. 다른 개발자의 브랜치와 PR은 보호한다.
- 시작: Debian 13.6 주요 서비스 활성, DEV DB 연결 확인. 공유 기본 체크아웃은 다른 작업으로 수정 중이므로 건드리지 않았다. 감사 증거는 `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-30-0025/`에 저장.
- 검증: 대기. 공식 Test 정확 SHA 인증 E2E: BLOCKED. 운영 배포: HOLD. 롤백: 게이트 코드 커밋 되돌리기, DB 변경 없음.
- RED 검증: 신규 회귀 테스트 4개 그룹이 기존 게이트에서 실패함을 확인했다. 실제 관찰된 운영 프론트엔드의 시각형 ID와 Test 국고 가상 200 응답을 재현했다. 증거: `red-tests.log`. 다음 단계는 배포 없이 읽기 전용 검증기 보완.
- GREEN 검증: 공개 `/frontend-version` 및 `/api/treasury/overview` 읽기 전용 검증 추가, 503·no-store·미검증·원장 빈 목록을 엄격히 확인한다. 대상 Node 테스트 14/14 PASS. 실제 호스트 게이트에서 Test는 가상 국고 HTTP 200으로, Production은 프론트엔드 빌드 ID 불일치로 차단되었다. 서비스 변경 없음.

## 검증 및 배포 판정
- 시작·중간·PR 직전 최신 main `62c6cd038951d65c94b709302bdaec6e75b080b6` 동일. 영문 원본/국문 기획서 재확인, 기획서 내용 변경 없음. 기준 QA v1376 / 이슈 #1917. 이전 코드 체크포인트 `5059a09b1c0143dcc29f3acd631454a52504b1a4`.
- 실패 재현 4개 그룹 확인 후 게이트 대상 **14 PASS**, 릴리스 전체 스크립트 **93 PASS**, 문법·diff 검사 PASS. 프론트 국고 **2 PASS**, 백엔드 국고 **2 PASS**, App API·SEO·접근성 **41 PASS**, DB 단위 **56 PASS / 4 SKIP**. Typecheck/Build PASS, 운영 의존성 알려진 취약점 0건.
- 전체 Lint **FAIL**: 기존 `stale-tab-notice.tsx` 오류 3건(QA PR #1894). 전체 테스트 **FAIL**: 모바일 API 생성 문서 3개 불일치(QA v1376). 프론트 전체 실행 시도는 제한시간 초과, 수정된 대상 실행은 PASS. 전체 게이트 성공으로 표현하지 않는다.
- 공식 Test/Production 실행 SHA `c2129625aa6629c616fb31ce790950618b8d92b2`: 실제 읽기 전용 게이트 **모두 BLOCKED**. Test는 가상 국고 200, Production은 프론트 빌드·공개 ID `1793277134644` 불일치. 조건 완화 금지.
- 원격 브랜치 19개(비-main 18, main 포함 완료 계보 3, 고유/미확정 15), 열린 Draft PR 12, 충돌 2. 삭제 0·강제 종료 0·병합 0. 다른 개발자 변경 모두 보존. 신규 사용자 Full-stack 기능이 아닌 **P0 배포 제어 안전장치** 수정이며 문서 작업만으로 개발 성공 판정하지 않는다.
- SQL/운영 PostgreSQL/원장/서비스/Test/Production 변경 없음. 실제 PG 종단·공식 Test 정확 SHA 인증 E2E는 CI·금융 출처·백업 복원·활성 origin 확인 전까지 **BLOCKED**. 운영 HOLD. 롤백은 검증기 코드 커밋 되돌리기(DB 영향 없음).
