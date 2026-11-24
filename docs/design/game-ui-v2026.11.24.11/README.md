# v11 repair candidates / v11 수정 후보

**Not approved / 승인 전.** Original v10 retained. [Home vector repair prototype](previews/home-icon-repair.svg) is an unverified overlay, not final art. [Batch candidate generator](../../../scripts/repair-v10-preview-icons.py) requires Pillow and the original manifest. It checks all 180 source hashes and emits separate PNGs; it has not run in the current session. Fixed-coordinate patches must be independently verified; no claim of no glyph corruption yet.

## Mandatory acceptance / 필수 합격 기준
- Replace unsupported glyph icons with SVG paths at source; check every icon in desktop/mobile, no missing glyph boxes.
- Clip hero art to rounded container; no overlap or outside pixels. Fix active navigation per exact route.
- Replace generic cards with actual page-specific controls; preserve actual favicon and navy/violet palette. Mobile must retain desktop functionality; use actual Spring contracts, never fake balances or transactions.
- Verify 5 languages, support/chat, legal links, ads, authorization and real API; independently inspect original and corrected PNG for every route, record evidence and SHA256. Preserve old assets; only then update EN/KO master/manifest and request protected merge. No deployment.

시각검수 12/180, 불합격 12, 나머지 168 미검수. SVG 홈 후보 1개, 최종 승인 0개. 일괄 생성 스크립트는 작성했으나 실행하지 못함. 배너·기능·모바일 수정은 추가 작업 필요. 기존 v10 및 과거 원본 보존. #3425, #3417, #3423.
