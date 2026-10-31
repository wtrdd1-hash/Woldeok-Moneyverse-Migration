# 개발 C v1239 — 회원 전용 화면 HTTP 개인정보 보호 헤더

## 작업 전 — 2026-11-01 00:15 KST
- 기준 main `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, 신규 독립 브랜치와 worktree.
- Debian 13.6 미니PC 서비스 7개 정상, 개발 PostgreSQL 연결. 다른 개발자의 작업은 변경하지 않음.
- AGENTS/README 및 영어·한국어 통합기획서, 열린 PR, QA v1423, Backend B v701, 개발 C v1236–v1238 확인.
- 실제 결함: 전역 X-Robots-Tag가 로그인/지갑/관리자 등 회원 전용 화면에 `index, follow`를 반환함(기존 #2012 및 QA v1423). 페이지 메타데이터만으로 HTTP 응답을 보호할 수 없음.
- 범위: 인증 화면과 언어별 별칭에 `noindex, nofollow`, `private, no-store`, `no-referrer`; 공개 SEO·인증·API·DB·원장은 유지.

## 진행 중 — 2026-11-01 00:16 KST
- RED: 보호된 `/account` 경로에 HTTP 헤더 규칙이 없어 집중 테스트 1건 실패 확인.
- GREEN: 집중 테스트 10/10 PASS. 인증 경로와 5개 언어 별칭에 HTTP noindex/no-store/no-referrer 규칙을 전역 공개 정책 뒤에 추가.
- 공개 `/stocks`, `/shop`, `/blog`, `/guide` 색인 정책은 유지. 실제 Next 빌드/HTTP 및 전체 검증은 진행 중.

## 종료
- 미완료. 모든 배포 게이트 충족 전 운영 보류.
