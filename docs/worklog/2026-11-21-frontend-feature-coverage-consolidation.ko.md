# 전체 기능 지원 확인·사용자 프론트엔드 연결·실행 정리

## 작업 전
사용자는 관리자 모든 기능과 사용자 프론트엔드 지원 여부를 확인하고 구현한 프론트엔드로 연결하며 여러 실행을 정리하도록 지시했다. 이전 구현/운영 승격 승인과 반복 질문 금지 요청을 유지한다. miniPC 기존 clean isolated worktree에서 current main c5c3c9d7c2f73ab6a05c2ab067d94535f328b8b5를 fetch/확인하고 전용 branch fix/frontend-feature-coverage-consolidation-20261121을 만들었다. 공유 dirty main과 다른 작업 폴더는 수정하지 않는다.

현재 운영은 공개5경로93a3/관리자8경로e2fb/전달1경로7d로 나뉘고 이전4782/4808 자산 의존성이 남아 있다. 다수 old Test/preview도 실행되어 MemAvailable 약926MB. 현재 신규 관리자는 조회9개이며 모든 변경 기능 지원이 아니다. 비활성 native stocks/shop/board는 조회 시안이므로 매매·구매 대체로 전환하지 않는다. 사용자 wallet/support/chat 소스와 owner-safe 클라이언트는 있지만 실서비스 연결·API 계약 검증이 필요하다. 계정 설정은 축소된 프로필로 몰래 대체하지 않는다.

## 진행 중
- [ ] 기능/실행/라우팅 기준선과 실제 지원 행렬
- [ ] 미참조·DB-free로 확인된 old Test5개 우선 stop/부팅 해제 및 역전환 증거
- [ ] 단일 frontend-presentation mode와 실제 소유자 사용자 화면 연결
- [ ] 도구 계정 헤더·실제 관리자 원천 점검
- [ ] 구버전 자산 bytes 보존, exact-main Test/운영·잔여 프로세스 정리
- [ ] 코드/브라우저/보안 검증·GitHub 문서/병합/브랜치 정리

## 종료 상태
아직 착수/조사 단계이며 신규 코드·운영 전환·서비스 정리는 실행 전이다. 전체 기능 정상으로 판정하지 않는다. SQL/grant/원장/잔액/세션 보정·메시지 발송·전체 backend 승격은 이 frontend 단계에 포함하지 않는다.
