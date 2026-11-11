# 🌙 월덕 머니버스 (Woldeok Moneyverse) — 공식 정본 문서

> **호스팅 도메인**: `https://easy-scraping.com`  
> **현재 릴리즈**: `prod-v2026.11.11.2330-ccd699e99a` (Next.js 16+, NestJS 11+, PostgreSQL 16)  
> **핵심 원칙**: 헌법적 금융 안전 거버넌스, 완전 복식부기 원장, 2FA 관리자 OTP 보안, 320px~1440px+ 다중 뷰포트 레이아웃 무결성

---

## 🏛️ 국가 금융 거버넌스 및 관리자 포털 바로가기

- 🏛️ **[대국민 중앙 국고 & 5대 목적별 금고 포털](/admin/treasury)**: 메인 금고, 복지(40%), 인프라(30%), 비상준비(20%), 영구소각(10%) 자율 순환 관제
- ⚡ **[원스톱 국고 긴급 충전 및 통화정책 발의](/admin/treasury)**: 조폐국-국고 직통 화폐발행 및 발의 즉시 승인(One-Stop Action)
- 🪙 **[국가조폐국 (National Mint Bureau)](/admin/mint)**: M0 본원통화 주조 증명서(UUID) 발행 및 유통량 감사
- 🏦 **[국가중앙은행 (Central Bank)](/admin/central-bank)**: 법정 기준금리(0.00%~15.00%), 지급준비율, 거시 통화정책 관제
- 🔐 **[관리자 2FA 보안 관제 (/admin/security)](/admin/security)**: 텔레그램/디스코드 즉시 채널 OTP, R2 15분 승격 세션 및 R3 단일 소모(Single-Use)
- ⏱️ **[국민연금공단 (NPS) 대국민 포털](/pension)**: 매 1시간 주기 자동 스윕 및 기본소득 복식부기 실시간 지급
- 📈 **[가상 주식 실시간 거래소 & 트레이딩뷰 작도 도구](/stocks)**: 상장 기업 주식 실시간 호가 및 체결 엔진
- 🎰 **[카지노 & 피구세(도박세 10%) 자동 환원 시스템](/casino)**: 베팅액 10% 자동 원천징수 국고 환원 및 거시 과열 방지
- 📰 **[공식 검증 기술 블로그](/blog)**: 머니버스 경제학 및 엔지니어링 소식지

---

## 📚 주요 마스터 문서 및 아키텍처 명세서

- 🌐 **[정본 종합 시스템 아키텍처 및 무결성 명세서 (v312)](docs/moneyverse_full_system_architecture_spec.md)**
- 🏆 **[통합 개발 진행상황 및 마스터 레퍼런스 총서](docs/DEVELOPMENT_STATUS_AND_MASTER_REFERENCE.ko.md)**
- 🌟 **[공식 마스터 통합 문서 허브 (5대 도메인 총괄 색인)](docs/DOCS_INDEX.md)**
- 🏛️ **[거시 경제 6대 기둥 총괄 기획서](docs/MACRO_SOVEREIGN_ECONOMIC_SYSTEM_MASTER_SPEC.ko.md)**
- 🏦 **[국민연금공단(NPS) 상세 기획서](docs/NATIONAL_PENSION_SERVICE_SPEC.ko.md)**
- 📈 **[대한민국 국채(KTB) & 레포 거래소 기획서](docs/TREASURY_BONDS_EXCHANGE_SPEC.ko.md)**
- 🏢 **[공공기관 경영정보 알리오(ALIO) 기획서](docs/STATE_ENTERPRISES_AND_CORPORATE_GOVERNANCE_SPEC.ko.md)**
- 🔐 **[보안 모델 및 다계층 방어 가이드](docs/operations/security-model.ko.md)**
- 🚀 **[프로덕션 불변 릴리즈 배포 운영 매뉴얼](docs/operations/production-deployment.ko.md)**
- 📜 **[누적 변경 기록 (CHANGELOG)](docs/changelog/CHANGELOG.ko.md)**

---

## 🧰 미니 PC 26대 전문 스킬 및 GPT/OpenAI 풀파이프라인

미니 PC(`C:\Users\sds\.gemini\config\skills`)에 설치되어 실시간으로 동작하는 4대 도메인 핵심 스킬 체계입니다:

1. **기획 및 명세 주도 개발 (3종)**:
   - `product-manager`: AI 최적화 PRD 작성, 사용자 스토리, 성공 지표(OKR/KPI) 및 기능 로드맵 수립
   - `spec-driven-development`: 명세 주도 개발(SDD), API 계약 및 데이터 모델 사전 확정 후 단계별 구현
   - `product-manager-toolkit`: 복잡 비즈니스 엣지 케이스 및 정책 충돌 정밀 분석
2. **UI/UX 디자인 및 디자인 토큰 시스템 (8종)**:
   - `design-system`: 시맨틱 디자인 시스템 구축 및 컴포넌트 거버넌스
   - `design-tokens-color-palette`: WCAG AAA 고대비 접근성 컬러 팔레트 및 다크모드 무손실 동기화
   - `design-tokens-typography-scale`: 금융 수치 전용 모노스페이스 및 반응형 산세리프 타이포그래피 스케일
   - `design-tokens-spacing-system`: 4px/8px 그리드 기반 완벽한 패딩, 마진 및 플렉스 갭 스페이서
   - `design-tokens-shadows-elevation`: 입체감 있는 3D 뎁스 및 레이어 엘리베이션 그림자 시스템
   - `design-tokens-interactive-states`: 호버, 포커스, 액티브, 비활성화 등 마이크로 인터랙션 상태 관리
   - `design-tokens-tailwind-sync`: 디자인 토큰을 Tailwind CSS 및 CSS 변수에 실시간 자동 동기화
   - `figma-automation`: Figma 디자인 컴포넌트 및 토큰을 Next.js React 코드로 자동 변환
3. **GPT & 프롬프트 엔지니어링 (12종)**:
   - `prompt-library`: 글로벌 awesome-chatgpt-prompts 기반 300+ 실전 역할별 프롬프트 컬렉션
   - `ai-wrapper-product`: OpenAI API 연동 상용 서비스 개발 (비용 최적화, 계량, AI UX)
   - `autonomous-agent-patterns`: OpenAI Codex / Cline 계열 자율 코딩 에이전트 아키텍처 패턴
   - `seo-geo`: ChatGPT / Perplexity 등 AI 검색 엔진 최적화 (Generative Engine Optimization)
   - `code-review-ai-ai-review`: GPT 지능형 정적 분석 결합 전문 코드 리뷰 및 품질 진단
   - `llm-prompt-optimizer`: 프롬프트 압축, Few-shot 최적화, Chain-of-Thought(CoT) 강화
   - `enhance-prompt`: 단순 입력을 전문적이고 정밀한 메타 프롬프트로 자율 확장
   - `agent-prompt-meta-prompting`: 멀티 에이전트 시스템 프롬프트 아키텍처 및 역할 정밀 분담
   - `agent-prompt-scratchpad-buffering`: 중간 추론 버퍼링을 통한 다단계 논리적 일관성 유지
   - `agent-prompt-task-decomposition-prompting`: 대규모 작업을 원자적 하위 단위로 분해하는 프롬프팅 기법
   - `agent-prompt-self-improving-prompt-loop`: 프롬프트 자가 평가 및 피드백 기반 자동 반복 개선 루프
   - `agent-prompt-injection-defense`: 프롬프트 인젝션 및 시스템 프롬프트 유출 방어 아키텍처
4. **개발 및 모던 소프트웨어 아키텍처 (3종)**:
   - `clean-architecture-dependency-inversion`: 계층 격리, 도메인 주도 설계(DDD), 의존성 역전 원칙(DIP)
   - `api-design-principles`: RESTful, RPC, SSE, WebSocket 규격의 고정밀 API 계약 수립
   - `frontend-architecture`: React Server Components(RSC), Feature-Sliced Design(FSD) 아키텍처

---

## 🤖 전용 디스코드 음악 봇 (Discord Bot)

웹 플랫폼과 완벽하게 연동되는 전용 디스코드 봇을 자체 탑재하고 있습니다:
- **무제한 음악 스트리밍**: 3시간 제한 없는 장시간 음원 및 로파이/수면음악 연속 재생 (`/play`)
- **실시간 볼륨 조절**: 끊김 없는 온더플라이 볼륨 제어 (`/volume 0~200%`)
- **SponsorBlock & FFmpeg 정밀 절단**: 유튜브 자체 광고 및 인트로 0초 제거 후 음악 본편 즉시 재생
- **24/7 불사 음성 상주**: 강제 퇴장 시 1초 내 즉시 원위치 자동 복귀
- 자세한 내용은 [디스코드 봇 상세 문서](bot/README-KO.md)를 참조하세요.
