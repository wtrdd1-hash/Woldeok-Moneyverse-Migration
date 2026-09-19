# 계정 보안 활동 v2026.09.19.282

- `/account/security`에서 최근 계정 보안 활동을 확인할 수 있습니다.
- 사용자에게는 활동 종류와 시각만 표시하며 내부 metadata는 노출하지 않습니다.
- 최소 권한 DB 함수 `account_recent_security_events`와 App API `GET /account/security/events`를 추가했습니다.
- 최신 20건으로 제한하고 App API 계약/참조 문서를 동기화했습니다.
