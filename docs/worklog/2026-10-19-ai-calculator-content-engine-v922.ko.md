# v2026.10.19.922 — 내부 AI 계산기 수요·블로그 위젯 성장엔진 작업 기록

[English canonical](2026-10-19-ai-calculator-content-engine-v922.md)

## START — 2026-10-19 KST
- 요청: 실제 검색수요가 큰 금융 계산기를 내부 AI로 발굴·기획하고, 관련 블로그 글에 해당 계산기 위젯이 연결되도록 아주 상세한 기획서를 작성한다.
- 최초 기준 main: `01c34e4b08f200066eca2c35d87788e3fdfd1361`.
- 통합문서, v527 SEO 수요기획, v681 계산기→학습 기획, v719/v721/v735 AI 블로그 안전 기록, 현재 계산기·블로그 소스를 대조했다.
- 최신 main에는 과거 12대가 아니라 19대 계산기 카탈로그가 존재하므로 신규 도구 복제를 금지하고 기존 19대 재사용/확장을 우선한다.
- 미니PC 전용 MCP는 연속 타임아웃으로 GitHub fallback을 사용했다.
- 이번 작업은 문서/기획 전용이다. DB·WLD·런타임·기능스위치·Test·Production·색인 제출은 변경하지 않는다.

## MID — 2026-10-19 KST
- 현재 블로그 인라인 위젯이 글 주제와 무관하게 복리 위젯 하나에 고정되어 있음을 확인했다.
- 현재 `POST /api/blog/generate`는 출처 없는 금융 주장 재발 방지를 위해 `EDITORIAL_REVIEW_REQUIRED` 503으로 fail-closed 상태임을 확인했다. v922는 이를 우회하지 않는다.
- Google Search Console, Google Ads historical keyword metrics, NAVER API HUB 검색어 트렌드, Google people-first/YMYL 및 생성형 AI 정책을 근거로 공급자 기반 수요 증거 계약을 설계했다.
- 영문/한국어 상세 기획서를 작성하고, 검색수요→계산기 gap→공식/출처→golden test→typed widget→AI source-grounded draft→자동 QA→편집 승인→게시→GSC 피드백 루프를 정의했다.
- 작업 중 main이 `68f20881ce5e82b67c6b1f9aa6256617c56d77b5`로 변경되어 v243 듀얼서피스 구현계획 갱신을 확인했다. 브랜치에 2-parent merge commit `bc61e941`로 동기화했다.
- 종료 직전 main이 다시 `74d98ca58db9201a187dd6f20107e32393358684`로 변경되어 v244 글로벌 벤치마크/기술 청사진의 `implementation_plan.md` 추가분을 재확인했다. 2-parent merge commit `6ff2e0b3`로 다시 동기화했다.

## END — 2026-10-19 KST
- 상세 기획: `docs/planning/AI_CALCULATOR_BLOG_WIDGET_GROWTH_ENGINE_SPEC_v2026.10.19.922.md` / `.ko.md`.
- 실제 검색량 수치는 AI가 생성하지 않고 공급자 원본값만 저장한다.
- 신규 후보는 실업급여·주휴수당·국민연금·VAT·상속세·전월세비교 등 seed queue일 뿐, 실제 provider evidence 이전에는 BUILD 승인이 아니다.
- 구현 1차는 신규 계산기 대량생성이 아니라 기존 연봉·대출/DSR·증여세 또는 복리 등 3개 계산기로 widget/content pipeline을 검증하도록 설계했다.
- 런타임/DB/Production에는 변경 없음. 코드 구현과 운영승격은 별도 승인·브랜치·CI·exact-SHA Test·백엔드 health·무중단 승격 절차 대상이다.
