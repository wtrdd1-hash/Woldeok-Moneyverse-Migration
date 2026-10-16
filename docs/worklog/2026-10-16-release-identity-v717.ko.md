# v2026.10.16.717 — 운영 세대별 릴리스 식별 검증기 수정 기록

[영문 정본](2026-10-16-release-identity-v717.md).

## 작업 전
- 시작 GitHub main `e69058a51509fb66b99776be42df455bf940fb22`; 은행 PR #884가 다른 작업자에 의해 병합됨. 실제 운영과 Test는 모두 v712 소스 `142e36b5b0955c575992ca95b1706ba85e8dc909`.
- 지침: 통합 기획서·배포 규칙·공식 PostgreSQL/OWASP 참고를 먼저 읽고, 금융 P0/회원 세션/백업/무중단 확인 없이는 신규 운영승격을 정상으로 주장하지 않음. 전용 v717 작업트리로 분리하고 사전 기록 작성.
- read-only 운영 preflight에서 **운영 v712 정상 서비스인데** 이전 v600 systemd 서비스와 고정된 오래된 /etc env를 참조해 잘못 실패하는 결함 재현. Test 조회는 보호 env 읽기권한 부족으로 EACCES; 실제 릴리스 env를 변경해서 해결하지 않음.

## 중간 TDD
- Git/manifest에서 v712 세대 번호를 엄격 파싱해 실제 `moneyverse-release-v712-backend/frontend.service`를 검사하도록 변경. Test는 `test-main-backend/frontend.service` 유지.
- 선택된 서비스 자체의 `EnvironmentFiles` 순서·덮어쓰기 우선순위로 유효한 BUILD_ID 비교. 한 파일에 중복키, 잘못된 버전/누락키는 실패로 처리하며 사용자의 비밀 값은 출력하지 않음.
- RED 실패 확인 뒤 테스트 추가해 단위 **10/10 PASS**. 실제 Debian에서 sudo 허용 read-only 현재 v712 Test/Production preflight 각각 exit 0·SHA 전부 일치. v716을 현재 운영값이라고 잘못 지정하면 exit 1·실제 SHA 불일치 탐지.
- 영한 배포문서 모두 실 서비스·읽기 권한을 안내하도록 갱신. v716 은행 Test 검증과 실제 금융 P0 차단은 여전히 별도.

## 완료 구분
- 별도 브랜치 PR/CI로 수정 증거 남김. 제품 은행 금액·원장·서비스 설정·운영포인터 및 운영 실제 사용자 데이터 변경 없음.
- DB 원장 대사, 대규모 앱 DML 권한, 모든 인증 회원 실제 Test E2E, 백업 복원, 무중단 전환 미승인 상태는 그대로. 이 검증기의 통과를 전체 운영 승인으로 바꾸지 않음.
