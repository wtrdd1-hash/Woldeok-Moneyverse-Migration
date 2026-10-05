# SEO 수요·키워드 확장 기획 작업 기록 — v2026.10.05.527

- 기준일: 2026-10-05
- 브랜치: `docs/seo-demand-expansion-v2026.10.05.527`
- 시작 `origin/main`: `5318213f1eca644c7f36df7d967a53092de0814c`
- 범위: 기획/조사/문서 전용. 런타임, DB, API, Test, Production 동작 변경을 주장하지 않는다.
- 목표: Moneyverse 국내·해외 검색수요를 키워드/검색의도 단위로 크게 확장하고, 신규 10만+ 광역 레퍼런스 코퍼스를 구축하며, 적합 검색수요를 유용한 계산기/가이드/용어집/entity 페이지와 유지 사용자로 연결한다.
- 최상위 권위: `docs/planning/INTEGRATED_PLANNING_MASTER.md`; `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `GLOBAL_GROWTH_EXECUTION_SPEC.md`, `GLOBAL_GROWTH_SEO_REVENUE_SPEC.md` 및 현행 SEO/성장 명세를 하위 권위로 대조한다.
- 동시작업 경계: 아직 main에 병합되지 않은 `origin/plan/search-to-user-growth-v2026.10.04.525`는 이번 회차의 읽기 전용 입력으로만 사용하며 덮어쓰지 않는다. 동시 v524-v526 통화/생활경제 브랜치도 범위 밖이다.
- 조사 진실성: 대규모 discovery corpus 건수는 기계 수집한 후보 레퍼런스 수이며 10만 건을 수동 전문검토했다는 뜻이 아니다. 실제 기획 규칙은 별도 검증한 1차 공식자료와 연결된 실측 검색데이터를 우선한다.
- 언어정책: 유지 기획문서는 영어 정본 + 한국어 2차언어 parity를 유지한다.

## 중간/최종 기록
- 작업 중간 및 최종 검증 직전 `origin/main`: `5318213f1eca644c7f36df7d967a53092de0814c`; 시작 SHA 대비 drift 없음.
- 신규 Crossref discovery 완료: 40 lane, raw 200,000 -> 중복제거 111,313, 수집오류 0; stream SHA-256 `1629c7b24a688e84249d77eec2cd1ce2f8b906f91187fcbed413739aef54b523`.
- 키워드 registry 완료: 25개 cluster, 후보 10,473 = 한국어 6,207 + 영어 4,266; CSV SHA-256 `4e85672667970b41a33222b7005215ef630900daa935674cb8b7f21fcf901b79`.
- SEO 수요 상세명세 영/한, 조사검토, planning delta, changelog, 내부/GitHub 업데이트, 상위 기획권위 연결을 추가했다.
- 변경범위는 문서/조사 전용이며 runtime/Test/Production 변경이나 완료를 주장하지 않는다.
