# 개인정보 요청 접수 기록 CSV

로그인 회원은 개인정보 센터에서 **최근 접수 기록 최대 30건**을 CSV로 내려받을 수 있습니다. 기존 PostgreSQL `privacy_list_my_requests(actor, 30)`를 사용하며, 회원 ID는 서버 세션에서 결정합니다. 항목은 요청 ID·유형·상태(`received`, 접수됨)·접수 시각·본인이 작성한 상세 내용입니다. 이 파일은 **개인정보 전체 사본, 전체 과거 기록, 법정 처리 완료 증명, 삭제 완료 영수증이 아닙니다.**

NestJS `GET /api/v1/privacy/requests/snapshot`는 조회 범위와 소유권을 고정합니다. Next.js `/account/privacy/requests.csv`는 응답 검증·CSV 수식 삽입 방어 후 다운로드하며, Android `/app-api/v1/privacy/requests/snapshot`는 로그인 쿠키를 전달합니다. 개인정보 응답은 캐시·검색 색인을 금지합니다. DB 마이그레이션이나 금융 원장 쓰기는 없습니다.

**배포 보류:** 정확한 SHA 전체 CI, 격리 PostgreSQL 권한·실제 사용자 흐름, 보안·접근성·SEO 및 승인 GitOps 검증 전까지 Test/Production 승격 금지. 병합 전 롤백은 Draft PR 보존이며, 승인 배포 후 문제 발생 시 검토된 읽기 전용 기능 되돌리기 PR을 사용합니다.
