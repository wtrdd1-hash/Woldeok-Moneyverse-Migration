# 2026-10-30 — 개발 A / P0 국고 공개 응답 및 프론트엔드 경계 버전 검증

- 상태: 작업 중 / 운영 배포 보류. 기준 main `62c6cd038951d65c94b709302bdaec6e75b080b6`, 독립 브랜치 `auto/hourly-a-treasury-attestation-20261030-0025`.
- 근거: QA v1376 이슈 #1917. 공식 Test 국고 API는 가상 `disb-*` 내역을 정상 응답으로 노출하고 Production 공개 API는 503으로 차단한다. 양쪽 Backend `/api/version` SHA는 동일하지만 Production `/frontend-version`은 13자리 시각값을 반환한다.
- 범위: 기존 읽기 전용 배포 검증기에 공개 프론트엔드 빌드 ID 및 국고 공개 API의 fail-closed 상태 검사를 추가한다. 원장·금융 실행·SQL·운영 서비스는 수정하지 않는다. 활성 origin과 edge 경로 불일치는 별도 배포 차단 사유로 유지한다.
- 절차: 실패 재현 테스트 → 최소 구현 → 검증 → 최신 main 재확인 및 Draft PR 기록. 다른 개발자의 브랜치와 PR은 보호한다.
- 시작: Debian 13.6 주요 서비스 활성, DEV DB 연결 확인. 공유 기본 체크아웃은 다른 작업으로 수정 중이므로 건드리지 않았다. 감사 증거는 `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-30-0025/`에 저장.
- 검증: 대기. 공식 Test 정확 SHA 인증 E2E: BLOCKED. 운영 배포: HOLD. 롤백: 게이트 코드 커밋 되돌리기, DB 변경 없음.
- RED 검증: 신규 회귀 테스트 4개 그룹이 기존 게이트에서 실패함을 확인했다. 실제 관찰된 운영 프론트엔드의 시각형 ID와 Test 국고 가상 200 응답을 재현했다. 증거: `red-tests.log`. 다음 단계는 배포 없이 읽기 전용 검증기 보완.
