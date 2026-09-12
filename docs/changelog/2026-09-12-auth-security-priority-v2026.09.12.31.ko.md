# 인증 보안 및 구현 우선순위 v2026.09.12.31

## 요약

Moneyverse의 미구현 기능 우선순위와 실제 서비스용 자체 회원가입·로그인 보안 명세를 추가했다.

## 변경사항

- 미구현 작업을 P0 보안/계정 기반 → P1 제품 완성 → P2 성장/수익 순서로 재정렬했다.
- 자체 `local_email` 인증을 기존 OAuth/세션 코어에 추가하는 provider로 정의했다.
- 최종 NIST SP 800-63B-4를 기준으로 single-factor 비밀번호 최소 15자, 64자 이상 지원, compromised-password blocklist, 임의 조합규칙 및 주기적 강제변경 금지를 반영했다.
- Argon2id adaptive hashing, 사용자별 salt, 버전/파라미터 저장, rehash를 요구했다.
- SQL Injection을 release blocker로 지정하고 parameterized query/고정 검토 DB 함수, identifier allowlist, 자동 injection regression test를 요구했다.
- 개인정보 DB 최소권한, 관리자 masking, negative permission test, Production 데이터 환경분리, backup 삭제재적용 절차를 추가했다.
- 이메일 인증/복구, 계정열거 방지, credential stuffing/spraying, mail bombing, 세션 보안센터/revoke-all, MFA/재인증, identity linking 보안을 추가했다.
- 2026-09-11 시행된 한국 개인정보 유출 예방·피해구제 강화 제도의 적용성 검토 gate와 침해사고 대응을 추가했다.

## 배포

문서-only 변경이다. 이 버전은 Test/Production 배포가 필요하지 않다. 실제 구현은 별도 개발 브랜치에서 진행하고 격리 Test exact-SHA 보안검증 후 Production으로 승격한다.