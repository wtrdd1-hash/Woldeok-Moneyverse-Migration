# 릴리스 게이트 — 공개 게시판 종목 기호순 (HOLD)

기준 main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`, 후보 코드 `5abe3792d80e5f11db4dc80cc0f0d15355a3cbea`. 기능 대상 테스트·계약·빌드는 통과했지만 Backend 인증 HTTP 2건 FAIL, 전체 의존성 감사 9건 FAIL, 개발 DB 최소 권한 P0 FAIL, 공식 Test 정확 SHA 인증 E2E·복원 미완료입니다.

공식 Test `0c70a114da5f4cc5374bc4b80e0403a044f8546f`, Production `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`로 후보와 다릅니다. 모든 필수 게이트를 정확한 SHA에서 재검증하기 전에는 병합·배포 금지. 운영 변경이 없어 롤백 미실행. 향후 배포 후 문제가 발생하면 승인된 되돌림 커밋 및 검증된 이미지로 복구하며 DB 원장·적용 마이그레이션은 변경하지 않습니다. 고유 브랜치 285개 보호, 삭제 0개.

**판정: HOLD / main 병합·Test/Production 배포 없음.**
