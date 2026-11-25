# 디자인 스킬 설치 — v2026.11.25.1639
[English](DESIGN_SKILLS_INSTALL_v2026.11.25.1639.md) | 한국어

미니PC Debian 개발 계정에만 설치했다. Impeccable 4.10.0 공식 소스 https://github.com/pbakaus/impeccable 커밋 b49177d32788f2dc585c42831d845dacf1ebed2c, 엔진 매니페스트 0.1.27. 공급자별 수동 복사 후 파일 비교를 통과했다. 기존 Frontend Design과 UI UX Pro Max를 보존했다. Gemini CLI는 공용 ~/.agents/skills에서 세 스킬을 인식한다. Gemini config용 Impeccable 및 UI UX Pro Max 복사본을 설치하고 중복 경고를 발견하여 이번에 만든 CLI 심볼릭 링크만 제거했다. 공용 UI UX Pro Max 문서의 Claude 전용 헬퍼 경로 15개를 실제 공용 절대 경로로 교체하고 원본을 백업했다.

검증: 3개 AI 경로의 Impeccable --version 4.10.0, 격리 환경 context 실행, UI UX Pro Max 검색 결과, Gemini 세 스킬 Enabled 및 대상 중복 경고 없음. 실제 모델 호출, 브라우저 시각 QA, Claude 공식 마켓플레이스 등록은 미검증. 자동 훅, 권한, 앱 코드, 예약, 테스트/운영 서버 변경 없음.

스킬은 구현 품질과 접근성 및 디자인 QA 보조 수단이다. 승인 디자인, 통합 기획, 실제 Spring API, 영어 우선/한국어 두 번째, 독립 테스트 및 승격 규칙을 우선한다. 현행 디자인 기준 문서 상단은 G2 Guild Ledger Terminal이나 다른 문서에 과거 G1/v10 표현이 남아 있다. 임의 재디자인 금지 및 미해결 충돌 확인 후 UI 변경. 이번 작업은 디자인 기준 자체를 변경하지 않는다.

시작/중간 main: 3fcf446f05c06e32aa31fcd83053e1b409203c42. [작업 기록](../worklog/2026-11-25-design-skills-v1639.ko.md).
