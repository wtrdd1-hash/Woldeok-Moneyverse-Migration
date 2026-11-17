# v2026.11.18.8 — Cloudflare 이메일 난독화·강한 CSP 충돌 복구

**한국어** · [English](2026-11-18-spring-policy-cf-email-v2026.11.18.8.md) · 시작 / 패치 승격 전

## 작업 전 — 2026-11-18 08:46 KST
- 사용자 목표는 전체 웹 프론트엔드 Spring 전환. 이전 v18.7 공개 정책 SSR 5개 경로 실제 운영이지만 **부분 전환**, Next 나머지 173개·BFF124·인증/금융 미완. 100%라고 보고하지 않음.
- main SHA `e96e8f81f4d6b99b221392a2b6fe46356361b145`와 최신 프로젝트/통합 기획·v18.7 운영 증빙 확인. PR #3259 브랜치에서 독립 패치 작업트리를 생성, 다른 AI 작업 공간 미수정. 기존 v18.7 Test :4580·운영 :4581 및 v18.6, Spring 기존 백엔드, P0 Next 복구, 프리뷰 서비스 가동.
- **실제 운영 P0:** 외부 `https://easy-scraping.com/privacy?lang=ko`가 Spring SSR 200이지만 Cloudflare가 이메일 `mailto:jungchwimisaenghwal63@gmail.com`을 `/cdn-cgi/l/email-protection#...`으로 바꾸고 `email-decode.min.js`를 주입함. 원본 Spring에는 정상 mailto·스크립트 0. 강한 `default-src 'none'` CSP가 주입 JS를 차단해 문의 링크 장애 위험. HTTP 코드만으로 추정하지 않고 내부/외부 실제 HTML 대조. Cloudflare 문서의 `<!--email_off-->...<!--/email_off-->`는 특정 이메일만 자동 변환 대상 제외하며 전체 보안 설정 변경 불필요.
- TDD: 영/한 정식 약관·개인정보 및 정식/미리보기 계정삭제 메일 링크에 주석 예외 있는지 RED 테스트 우선. 정책 원문/링크/제목 전수 동등성과 JS 없는 CSP 보존. 새 JDK21 불변 Spring JAR→격리 Test :4582·운영 :4583. Nginx 기존 v18.7 정확한 5경로+CSS만 v18.8로 교체, Test 외부 `mailto` 정상·주입 JS 0·CSP 유지 검증 후 운영에 적용. 실패 시 해당 include만 원복. 기존 로그인/금융/관리자/Next/P0 보존, 운영 PG 쓰기 없음.

## 작업 중 — 2026-11-18 08:55 KST
- Cloudflare 난독화/강한 CSP 충돌의 외부 HTML 원본을 확보. 정책 링크 4종(terms/privacy EN/KO)과 계정 삭제 공통 템플릿의 *해당 이메일 태그만* `<!--email_off-->...<!--/email_off-->` 범위로 감쌈. 원본 이용약관/개인정보 텍스트·링크/헤딩과 영문/한국어 문구는 그대로. Python RED 이후 3/3 GREEN, 기존 전체 인벤토리 4/4 통과.
- JDK21 Spring Boot `clean test bootJar` **42개 스위트, 162개 테스트 전부 통과, 실패/오류/건너뜀 0**, 추가 Java MockMvc 실제 템플릿·CSP·email_off 증빙 포함. 아티팩트 SHA256 `130eb378dae628dde87de10b4c3e55a3a7e4468de66fcf05506a29ab53dab37e`. 실제 Test/운영은 아직 이 새 JAR로 승격하기 전. 기존 v18.7 운영과 별도 사용자/원장 서비스 계속 유지.
- Nginx 원본 스니펫 v18.7을 통째로 덮어쓰지 않고, `v18.8` 새 정확한 8경로 스니펫 Test :4582·운영 :4583 및 원자적 사이트 include 교체/백업/실패 복구 스크립트 구축. Cloudflare 외부 `mailto`/주입 JS/CSP/언어를 확인하는 전용 실제 HTTP 검사 스크립트 추가. 인증·금융 DB 수정 없음.


## 종료
대기.
