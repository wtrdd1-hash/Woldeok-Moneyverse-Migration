# 로컬 비밀번호 복구 — v2026.09.19.266

영문 문서가 기준입니다. 로컬 이메일 계정 사용자는 `/forgot-password`에서 비밀번호 재설정을 요청할 수 있습니다. 존재하지 않는 이메일도 같은 응답을 반환해 계정 존재 여부를 노출하지 않습니다. 실제 계정에는 30분 동안 한 번 사용할 수 있는 링크를 보내며, 완료 시 Argon2id 비밀번호 검증값을 교체하고 보안 이벤트를 기록한 뒤 해당 사용자의 모든 활성 세션을 폐기합니다. `/reset-password`와 로그인 화면의 복구 링크까지 사용자 흐름을 연결했고 App API도 같은 request/complete endpoint를 사용합니다.

Production 승격 전 migration 209, exact-SHA CI, real PostgreSQL 재사용·만료·세션 폐기 검증, isolated Test 이메일 전달, 기존 GitOps gate를 모두 통과해야 합니다.
