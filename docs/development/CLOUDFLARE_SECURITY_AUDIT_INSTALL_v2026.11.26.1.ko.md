# Cloudflare 보안 감사 스킬 — v2026.11.26.CFAUDIT.1

[English](CLOUDFLARE_SECURITY_AUDIT_INSTALL_v2026.11.26.1.md)

- 공식 저장소: https://github.com/cloudflare/security-audit-skill, 고정 커밋 `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` (MIT).
- 시작: 문서 권위 및 기존 설치 확인, 공식 원본 확보.
- 중간: Node v24.21.0 환경에서 공식 검증기 두 테스트 묶음 실행. 65개 통과, 실패·건너뜀 0개. 대상 앱 코드 실행 없음.
- 종료: 공통·Claude·Codex·Gemini 스킬 경로에 각 20개 파일 설치, 원본 일치 검사 통과.
- GPT는 guidance 모드로 보안 후보의 제한적 읽기 전용 소스 검토를 수행했다. 세부 관찰은 내부 기록에만 보관하며 신규 취약점 확정 또는 전체 감사 완료로 간주하지 않는다.
- 기존 AI 세션은 재시작하지 않았다. 모델별 스킬 인식 및 전체 멀티에이전트 감사는 미검증. 독립 검토, 범위 원장, 격리 환경, 비용 한도 및 TESTGATE.1을 준수한다. 운영 엔드포인트 공격, 비밀값 공개, 배포, DB 변경 없음.
