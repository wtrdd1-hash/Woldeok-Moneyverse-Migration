# 2026-09-12 — 제품 기획 작업 로그 v2026.09.12.29

## 작업 초점

현재 미구현 기능의 우선순위를 다시 정하고, 실제 공개 서비스에 필요한 자체 회원가입/로그인을 최우선 보안 기반으로 기획했습니다.

## 확인한 기준

- 최신 Living Project Plan과 main 상태
- 기존 NestJS auth 모듈, OAuth/OIDC, 세션 쿠키, 재인증, TOTP/관리자 보안 구현
- 최신 OWASP Authentication, Password Storage, SQL Injection Prevention, Session Management, Credential Stuffing 가이드
- NIST Digital Identity 최신 지침
- 한국 개인정보보호위원회 개인정보 안전조치/접근통제 원칙

## 우선순위 결정

P0: 자체 인증, 세션/보안센터, 개인정보 DB 경계, 자동공격 방어, 개인정보 lifecycle, 서비스 복구 후 인증 Runtime Audit.
P0.5: 한국/미국 법률·개인정보 문구 정합성, 동의 버전, 삭제/내보내기/복구 runbook, 모니터링/사고대응/복구 증명.
P1: 핵심 제품/콘텐츠 완성.
P2: 계정 보안 계측이 검증된 뒤 SEO, 수익화, 추천/공유.

## 핵심 보안 결정

- 기존 OAuth/서버세션/관리자 보안 기반을 재사용하고 local credential을 추가합니다.
- 비밀번호는 Argon2id 또는 승인된 동급 방식으로 단방향 해시하고 평문/복호화 저장을 금지합니다.
- 인증 관련 SQL은 전부 parameterized query/prepared function을 사용하며 사용자 입력 문자열 연결을 금지합니다.
- 인증 토큰/세션ID를 localStorage/sessionStorage에 저장하지 않습니다.
- 로그인/복구 응답은 계정 존재 여부를 노출하지 않도록 합니다.
- 로그인/인증강도 변경 후 session ID를 회전하고 logout-all/사고대응용 서버측 revoke를 제공합니다.
- 이메일/계정 개인정보를 공개 프로필과 분리하고 관리자 UI 기본 masking + 최소권한 DB를 사용합니다.
- verification/reset token은 단기만료·1회성·가능하면 hash 저장합니다.
- CSRF, XSS, session fixation, credential stuffing, password spraying, brute force, BOLA 테스트를 배포 필수조건으로 둡니다.

## 동시변경 확인

작업 중 main이 `f4d86b110c14ee4853f9e6491ac1b6dbf7ae10e9`에서 `1b430f540d978751e67f1417ae5747e048f8bd74`로 변경됐습니다. 동시 변경은 한국어 문서/내비게이션 영역으로 인증 보안 로직과 직접 충돌하지 않았습니다. 병합 전 최신 main 동기화가 필요합니다.

## 배포

문서-only이므로 이번 기획 변경 자체는 테스트서버 배포가 필요하지 않습니다. 실제 런타임 구현은 별도 개발 브랜치에서 진행하고 exact-SHA 테스트서버에서 백엔드/DB/API/보안 검증 후 운영으로 올립니다.