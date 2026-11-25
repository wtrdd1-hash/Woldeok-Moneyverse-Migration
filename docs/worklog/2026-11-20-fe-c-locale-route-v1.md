# FE-C locale route verification v2026.11.20.1
Start: 2026-11-20 23:49 KST. Base 2a172ce199bbc4dfe123b0672fcb5fb548dea09e. Scope UiLocale support/chat route recognition and tests only. Existing root tree untouched. Release HOLD.

Mid: Existing UiLocale support/chat canonical and .html aliases correctly resolve explicit cookie preference. New parameterized regression test 8/8 PASS; no production defect found in this path. No controller or global shell changes.
End: Targeted test verified, full Spring/DB/Playwright/official Test exact SHA NOT run. No deployment; FULL RELEASE HOLD.
EN changelog: Add isolated eight-alias locale precedence regression test for Spring support/chat routes. No runtime behavior changed.
KO 변경내역: Spring 고객지원·채팅 8개 경로의 수동 언어 쿠키 우선순위 회귀 테스트 추가. 운영 동작 변경 없음.
