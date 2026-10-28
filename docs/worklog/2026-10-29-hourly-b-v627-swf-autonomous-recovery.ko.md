# 개발 B v627 — 국부펀드 자동 정산 안전 차단 복구

- 시작 main: `e7c22f4dbaa5f6540a2249567033305c4b23495f`.
- 종료·미병합 PR #1782의 자동 SWF 정산 안전 차단이 현재 main에 없음을 확인하여 독립 브랜치에서 복구했다. 환경 플래그를 활성화해도 자동 스케줄러가 작동하거나 검증되지 않은 124,000 WLD 세수를 생성하지 못한다.
- 관리자 재조정 API와 웹 게이트웨이 POST는 HTTP 503으로 차단하며 관리자 API에 CSRF 가드를 추가했다. SWF 조회와 설정 변경은 유지한다.
- 수정 전 회귀 테스트 3건 실패를 재현했고, 수정 후 Backend 집중 42건·Frontend 집중 1건·Backend 전체 1,955건(440건 건너뜀)·DB 패키지 46건(4건 건너뜀)·보안 12건·API 계약 180개, Typecheck/Backend Build/Lint를 통과했다.
- 의존성 보안 감사 `qs@6.16.0` Moderate 취약점으로 실패. 공유 디스크 100%, 격리 PostgreSQL/전체 Next 빌드/공식 Test 정확 SHA/E2E 및 GitOps 승인 미완료.
- 수동 SWF 청산은 별도의 위험 경로로 남아 있으며, 본 회차에서 해결하지 않았다. 운영 데이터와 원장·마이그레이션은 변경하지 않았다.
- Draft PR #1804 `hold`. 병합·Test/Production 배포·타 브랜치 삭제 없음. **PARTIAL / BLOCKED, Production HOLD**.
