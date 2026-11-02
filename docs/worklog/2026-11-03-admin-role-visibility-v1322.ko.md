# 개발 C v1322 — 관리자 역할 목록 근거 상태

상태: DRAFT / RELEASE HOLD. 기준 main: `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`.

관리자 콘솔에서 PostgreSQL `admin_list_roles`가 최고관리자가 아닌 사용자에게 의도적으로 반환하는 42501 권한 거부가 HTTP 500으로 처리되는 문제를 수정합니다. 다른 예상 오류가 역할 0건으로 잘못 표시되는 문제도 해결합니다. Nest 응답에 `rolesEvidence`(VERIFIED/RESTRICTED/UNAVAILABLE)를 추가하고 Next 화면에서 검증합니다. 권한 제한·조회 장애·실제 0건을 구분하며, 불확실한 상태에서는 역할 변경 폼을 차단하고 접근 가능한 상태 안내와 재조회 기능을 제공합니다. 실제 `permission denied for ...` 권한 오류는 숨기지 않습니다.

기존 관리자 인증, 데이터베이스 SECURITY DEFINER, 금융 원장, 역할 권한과 스키마는 변경하지 않습니다. RED/GREEN, 정확 SHA, CI, 격리 PostgreSQL 및 배포 여부는 작업 로그와 PR에 기록합니다. 필수 검증이 모두 통과하기 전에는 병합·운영배포하지 않습니다.
