# Nov18 통일 중 실제 재현한 미해결 결함

전체 웹 통일·기능 QA 완료를 의미하지 않는다. 기존 사용자 로그인과 실제 운영 화면·API·코드·격리 Nginx 재현을 구분해 기록한다. 원시 회원 데이터·로그·세션은 포함하지 않는다.

## P1 — API 관제의 미측정 안내와 정상 수치가 모순
- 실제 `/admin/api-health`의 초기 로딩이 끝난 뒤 `DATABASE PROBE MEASURED · API ROUTES UNMEASURED` 안내와 `경로별 측정되지 않음` 문구를 확인했다. 동시에 평균10ms/99.9%와14개 도메인의 OPERATIONAL·개별 지연·성공률이 표시된다.
- 실제 `/api/v1/admin/api-health/status`는14개 도메인을 반환했고 첫 인증 도메인의8ms/99.9%/OPERATIONAL 및 measurementSource=ROUTE_METRICS를 확인했다. 현재 소스 `AdminApiHealthController`에도 같은 도메인 수치·상태와 측정 출처 문자열이 정적으로 존재한다. 해당 소스 SHA가 전체 운영 backend에 승격되었다고 추가 추정하지 않는다.
- 숫자·배지 옆 미측정 안내만으로 허위 정상 상태를 상쇄하지 못한다. 실측 전에는 경로별 건강/지연/성공률을 미측정으로 표시하고 실제 관측 수집과 연결해야 한다. Nov18 화면 전환도 미완료다.
- 로컬 백업 목록은 현재 조회 불가이며 복구 성공으로 판정하지 않았다. 호스트/DB ping 실측과 경로별 SLA는 별도다.

## P1 — 숨김파일 차단 regex가 일반 경로를 함께 차단
- 기존 세션의 프로필 링크 실제 클릭에서도 `/account`403. `/support`·`/chat`도403.
- 비인증 loopback upstream4550/4632 및 내부4400은 같은 경로에200HTML을 반환하고 default80 edge는403이다.
- 현재 `moneyverse-pentagi-scanner-shield.conf`의 `location ~ /.(?!well-known).*`를 별도 Nginx4925에 그대로 재현했다. `/account`·`/support`·`/chat`·`/.env`·`/.git/config`는403, `/`는204이며 `/.well-known/indexnow.key`도 뒤쪽 slash에서 매칭되어403이다. 실서비스 해당경로의 exact예외 유무는 따로 확인해야 한다.
- 실제 보호 규칙을 변경하거나 해제하지 않았다. 점 하나의 escaping 오류를 전역 수정하면 현재 막힌 기존 HTML이 공개될 수 있으므로, 소유자 인증·private/no-store·데이터 소스·동작 계약을 검증한 화면부터 exact 경로로 전환해야 한다. 이 보고서는200HTML에 개인정보가 노출된다는 추가 판정을 하지 않는다.

## 기존 OPEN
- 관리자 `/admin/logs/errors` 실제 불러오기 실패. FRONTEND journal의 제거된 서비스명과 전체 backend source 수정 승격은 별도 미완료.
- 나머지 관리자 동작·재무·회원/도구/정책·전체 언어/접근성/실기기는 경로 원장의 OPEN 범위다. 기존 변경 기능을 읽기 전용 표로 없애서 완료로 판정하지 않는다.
- 이전 Next QA5실패 및 금융·출처·수동346·projection·복구/출시 게이트는 해결·면제하지 않았다.
