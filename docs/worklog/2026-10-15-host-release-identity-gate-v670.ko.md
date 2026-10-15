# 호스트 릴리스 일치 검사 작업 기록 — v2026.10.15.670

## 작업 전
- 사용자가 운영 승격 시정을 승인했다. 최신 `main=57b37a3899964d805219f98f355c70bf1e052c05` 기준 독립 작업 브랜치를 만들고 다른 작업자(v651 관리자 인증, v653 금융, v654 웹, v661 주식 뉴스) 파일을 건드리지 않았다.
- `AGENTS.md`, 통합기획 정본, 현재 Debian 런타임·릴리스 정책 및 기존 QA/CI 스크립트 확인.
- 기존 Test 릴리스 manifest/프론트 SHA `7fa3f245...`와 백엔드/외부 API `888311cc...`가 일치하지 않으며 운영 v600은 출처 manifest가 없어 운영 승격 보류.

## 진행 중
- 실제 실행 파일과 manifest, 백엔드/프론트 릴리스 환경 `BUILD_ID`, 프론트 빌드 ID, 공개 버전 API 및 systemd 프로세스 경로를 동일 SHA로 비교하는 읽기 전용 검사기 작성.
- 잘못된 인용 환경변수 fixture 1개를 수정하고 회귀 테스트 **8건 통과, 실패 0**을 Debian 호스트에서 확인.
- 실제 Test에서 `--channel test` 실행 결과 실패 종료 코드 1, `backend_env_sha_mismatch`, `public_version_sha_mismatch` 정확히 검출. 프론트·manifest는 `7fa3f245...`로 동일.
- 한영 릴리스 절차 및 내부/GitHub 변경내역 동기화. PR #853 `classify`·`policy` CI 통과, 런타임 검사는 제어 스크립트 전용 변경으로 정상 스킵. 최신 main 재확인 후 병합 완료: `ae7da3992fddc8cccb9e5437268f509fe47b808d`.

## 종료/배포 판정
- 새 검사기와 실 Test 불일치 탐지는 완료. GitHub CI와 전체 Test 수용 판정은 별개.
- 금융 원장/DB 최소권한, 관리자 포함 UI 전체 5회, 세션·롤백·백엔드 무중단 검증이 완료되기 전 운영 전환 금지.
- Test/운영 포인터, systemd·Nginx, 실 DB·회원 자산, 기능 스위치 수정 없음.
