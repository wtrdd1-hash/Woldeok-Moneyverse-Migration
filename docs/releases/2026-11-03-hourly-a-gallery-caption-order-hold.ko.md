# 배포 보류 — 갤러리 설명 문자순 정렬

- 현재 **Draft 후보**이며 운영 배포 승인 아님.
- Backend 전체 테스트 기존 프로필 HTTP 401 2건 실패, 전체 의존성 감사 취약점 9건. 공식 Test 정확 SHA 인증 E2E 및 독립 백업 복원 미검증. 개발 DB P0 원장/아이템 권한 미해결, 운영 DB 권한 미확인. 디스크 사용률 97%.
- 공개 Test `0c70a114da5f4cc5374bc4b80e0403a044f8546f`, Production `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`로 후보와 다름. **main 병합·Test/Production 배포·DB 마이그레이션·서비스 재시작·롤백 없음.**
- 배포 전 Backend/인증 전체 테스트 및 보안 감사 재통과, DB 권한·독립 복원·공식 Test 로그인/API/DB/Android/SEO, 최신 main/충돌 및 GitOps/스모크/롤백 게이트 확인 필수.
- 롤백: Draft PR을 병합하지 않고 유지. 추후 승인 시 검증된 GitOps 절차로만 되돌림. 고유 미통합 브랜치 보호, 삭제 없음.
