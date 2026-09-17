# v2026.09.17.186 — UI Bootstrap 전역 스타일 격리

- Bootstrap 5.3.8 전체 CSS를 Tailwind 의미 utility 네임스페이스에 전역 import해 발생한 모바일/웹 테마 회귀를 수정했다.
- Bootstrap 전역 stylesheet import를 제거하되 로컬 vendor 원본은 유지하며 CDN 의존성은 추가하지 않았다.
- Bootstrap 전역 재도입을 막고 제품 global style 순서를 검증하는 회귀 테스트를 추가했다.
- Backend/API/DB/경제/사용자 상태 동작 변경은 없다.
- 사전 QA에서 contract build, 변경 파일 ESLint, frontend typecheck, 69 test files / 616 tests, Next.js production build를 통과했다.
- Isolated Test frontend/backend/API/noindex 검증, exact-main 재빌드, 무중단 Production 승격, Production smoke를 통과해야 릴리스 완료다.
