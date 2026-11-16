# v2026.11.16.1 — 스프링 전환·보안 실측 및 QA 한정 승인 기록
- 시작: 2026-11-16 17:12 KST. 통합 마스터(영/한), AGENTS.md, v50 implementation_plan.md 확인.
- 기준: main 및 origin/main = 205c50d1c5511891be8b971b38786cd5f967c4a0. 동시 작업 충돌 방지용 QA 전용 브랜치.
- 사용자 승인: GitHub 기록 + 정기 QA 서비스 복구만. Spring 보안 수정, 인증정보 교체, 운영 백엔드 변경/승격은 미승인.
- 전환: Spring 컨트롤러 89개, 문서상 89/89. Spring 4550과 내부 게이트웨이 4400 확인. 구형 Node 실행도 확인. 기능 동등성/운영 전환 100%는 미인증.
- 보안 미해결(읽기 전용): permitAll, CSRF 비활성, 광범위 CORS, 서비스 파일 평문 비밀번호/토큰, 전체 인터페이스 바인딩, 격리 설정 부재. 민감한 실제 값 기록 금지.
- QA 실패: 2026-11-16 17:01:58 KST, 공개 HTTP 스모크 25통과/1실패, /tools/compound-calculator HTTP 000. 이후 동일 경로 3회 HTTP 200(약 4~6초). 이는 전체 기능/보안 QA가 아님.
- 복구 범위: 연결 실패(000)에만 한정된 재시도, 반복 실패는 그대로 실패. QA 전용 불변 릴리스 및 systemd 드롭인만 변경, 서비스 백엔드/DB/Nginx/보안 설정 유지.
- 중간/종료 기록은 검증 후 추가.

## 중간 및 종료 검증 — 2026-11-16 17:22 KST
- 브랜치 fix/qa-smoke-transient-20261116-v2026.11.16.1, origin/main 205c50d1c5 재확인, bash -n 및 git diff --check 통과.
- QA 전용 불변 릴리스 /srv/moneyverse-data/qa-scheduler-releases/v2026.11.16.1: 기존 v1627 복제 후 QA 스크립트만 교체.
- 적용 드롭인 /etc/systemd/system/moneyverse-qa.service.d/60-v2026.11.16.1-transport-retry.conf. 기존 드롭인과 타이머 유지.
- 실제 QA 서비스 수동 실행 성공(Result=success/ExecMainStatus=0), 공개 HTTP 스모크 26/26 통과, 실패 0건, 유효 세션 수 266. /tools 경로에서 1회 연결 실패 재시도로 복구됨. 전체 인증 기능 QA는 미실시. 다음 자동 실행 결과는 아직 미확인.
- 롤백: 60-v2026.11.16.1-transport-retry.conf만 제거 후 daemon-reload; 기존 v1627 릴리스 및 50-v1627 드롭인은 보존됨.
- 운영 앱/백엔드/DB/Nginx/프론트/보안 정책 변경 없음.
