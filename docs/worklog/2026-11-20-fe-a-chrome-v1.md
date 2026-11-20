# FE A v2026.11.20.1705.1 — Start

- Base: origin/main 88b70b90d7, isolated branch fix/fe-a-chrome-init-20261120-1705.
- Ownership: shared Spring-native chrome only; B/C areas excluded.
- Investigation: `chrome.js` returns before binding navigation and locale when support dialog is missing. Test isolated chrome bootstrap before any patch. No runtime/production changes.
- References: integrated master and November 18 responsive design, source files reviewed. Skills read: using-superpowers, using-git-worktrees, TDD, frontend-design.

## Midpoint / completion evidence
- Rechecked remote main: 88b70b90d7ee0049c1f75e1e68507caf3d261517, unchanged during this patch.
- RED: `node spring-backend/src/test/js/chrome-init.test.cjs` failed (`navigation must initialize without optional support dialog`).
- GREEN: same test PASS after guarding optional support bindings; `node --check` and `git diff --check` PASS.
- Updated shared Thymeleaf chrome asset SHA-256 query to prevent stale browser script.
- Scope: shared chrome JS + template + isolated Node regression test only; no finance/admin/translation source changed.
- NOT VERIFIED / RELEASE HOLD: full Spring test, real PostgreSQL/API E2E, browser screenshot 180-page matrix, exact-SHA isolated Test and production gate not executed. No deployment or merge.
- EN internal/GitHub changelog: Guard optional support widget so absent widget cannot disable navigation and locale selector; add regression and immutable asset cache revision.
- KO 내부/GitHub 변경내역: 지원 위젯이 없는 페이지에서도 모바일 메뉴 및 언어 선택이 초기화되도록 수정하고 회귀 테스트와 정적 자산 해시를 갱신함. 전체 Spring·DB·실브라우저·운영 검증 미완료.
