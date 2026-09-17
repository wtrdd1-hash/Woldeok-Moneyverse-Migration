# v2026.09.17.172 — Bootstrap 로컬 UI 개선

## 요약
- Bootstrap 5.3.8을 프론트엔드 로컬 의존성으로 추가해 런타임에서 외부 CDN을 사용하지 않도록 했습니다.
- 원본 배포 ZIP은 보조 데이터 드라이브 `/srv/moneyverse-data/vendor/bootstrap/5.3.8/`에 보관했습니다.
- 공통 페이지 셸, 카드, 버튼에 절제된 그림자·포커스·반응형 간격·동작 감소 지원을 추가했습니다.
- 기존 머니버스 색상, 테마 토큰, 한국어 글꼴, 다크 모드는 그대로 우선 적용됩니다.

## 검증
- Bootstrap 기준 문서: getbootstrap.kr v5.3.8 다운로드 문서.
- 보관 ZIP SHA-256: `3258c873cbcb1e2d81f4374afea2ea6437d9eee9077041073fd81dd579c5ba6b`.
- `git diff --check`: 통과.
- 프론트엔드 타입 검사: 워크스페이스 contract 빌드 후 통과.
- 프론트엔드 테스트: 68개 파일 / 614개 테스트 통과.
- Next.js 운영 빌드: 통과.

## 배포
- 브랜치: `feat/local-bootstrap-ui-v2026.09.17.172`.
- 테스트/운영 승격은 저장소의 exact-SHA 릴리스 게이트를 따르며 런타임 증거는 별도 기록합니다.
