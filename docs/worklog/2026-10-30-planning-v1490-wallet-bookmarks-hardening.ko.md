# 기획 v1490 — 지갑 북마크 보완 (2026-10-30 KST)

- 이전 Feature Addition v1488 → 현재 Feature Improvement v1490 → 다음 Feature Addition v1492(잠정).
- 기준 main 62c6cd038951d65c94b709302bdaec6e75b080b6, AGENTS.md·README.md·영문 원본/국문 대조 계획서 시작·중간 확인. 선행 Draft PR #1937 미병합, 기존 개발 이슈 #1936 유지. QA v1380 FAILED/P0.
- 미니PC Debian 13.6 서비스 정상, 조사 당시 루트/데이터 92%/97%. SQL 파일 304개 번호 중복 0, 적용 293개 중 체크섬 5건 불일치, 과거 참조 누락 462개/비조상 346개. SWF 집중 시험 6 FAIL/3 PASS. 운영 개인정보 유출·WLD 이동 증거로 해석하지 않음.
- 실제 소스: 기존 거래 커서 JS Date 밀리초와 DB 마이크로초 불일치, Android Idempotency-Key 전달 누락, 지갑 게이트웨이 noindex 강제 누락, 북마크 CTA 없음. 기존 개인정보 이슈 #1935와 변경 분리.
- 설계: 회원별 세대 결속 커서, 불변 영수증 재시도 24시간/보존 90일, 본인 거래 SQL, 모바일 헤더, 정확한 UI/SEO, 최대 100개. 영문·국문 통합 기획과 P0 4/P1 6 개발 인계. 격리 PG 10,001/100/100/50/30건 시험은 **미실행**.
- 외부 독립 근거 신규 승인 0건, 누적 UNKNOWN/10,000건 → BLOCKED/IN PROGRESS. 런타임·SQL·공유 DB·원장·WLD·Test·Production·타 개발자 브랜치 변경 없음. Draft / RELEASE HOLD.
