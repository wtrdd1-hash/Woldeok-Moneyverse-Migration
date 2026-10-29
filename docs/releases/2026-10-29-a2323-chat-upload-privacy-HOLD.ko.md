# 운영 배포 보류 — A2323 채팅 이미지 업로드 보호

브랜치 `auto/hourly-a-chat-upload-privacy-20261029-2323`, 기준 main `62c6cd038951d65c94b709302bdaec6e75b080b6`. 대상 테스트·격리 PostgreSQL PASS이나 전체 Lint/테스트/API 계약 FAIL. 공식 Test·Production 기존 SHA `c2129625aa6629c616fb31ce790950618b8d92b2` 유지.

정확 SHA 인증 E2E, 독립 백업 복원, 보안·금융 검증, GitOps 승인 전 운영 승격 금지. main 병합·Test/Production 배포·운영 DB 변경·롤백·브랜치 삭제 없음. DB 변경이 없으므로 향후 승인된 롤백은 코드만 되돌립니다.
