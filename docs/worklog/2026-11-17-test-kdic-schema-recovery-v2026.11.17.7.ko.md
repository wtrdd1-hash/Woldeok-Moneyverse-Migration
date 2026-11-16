# v2026.11.17.7 — 공식 테스트 DB의 KDIC 조회 기능 복구

## 시작 — 2026-11-17 약 08:08 KST
운영과 분리된 테스트 사이트 /api/v1/kdic/portal이 500 오류이고 운영 Nest는 200임을 확인. 통합 기획·배포 규칙 확인. 초기 기본 CI DB에도 KDIC 스키마가 없어 별도 백업·복제해 257·335 마이그레이션 사전 검증.

## 진행 중
실제 테스트 백엔드의 시스템 프로세스 환경을 추가 확인해 DB가 기본 CI가 아닌 wdmv_v761_test_acl_v1544_restore (127.0.0.1:5585)임을 발견. 기존 CI 복제본 결과를 실제 테스트 복구 성공으로 오인하지 않도록 정정. 이 정확한 테스트 DB는 KDIC 테이블이 있으나 v1743 조회 함수 4개가 없음. 21,932,123바이트 pg_dump -Fc 백업 SHA256 b140de45a7c16e5c8aa425fc54fbce2b78fa3dc2c5ac81ec68732851f19bd419 보관 후 별도 복제 DB에 공식 migration335 적용 성공. Test 앱 역할의 원본 테이블 SELECT 거부, 읽기 전용 함수 EXECUTE 허용 및 기금 1건·기관 2건 확인.

## 종료 — 2026-11-17 약 08:14 KST
정확한 공식 Test DB에 이미 GitHub에 있는 마이그레이션 335만 적용했다. 운영 DB/원장/회원 잔액 미수정. 공식 Test 백엔드 재시작 없이 KDIC 공개 포털 500→200, 관리자 비로그인 401 유지. 테스트 홈·버전 200. 실제 금융 지급·출석 기능이나 전체 Spring 공식 배포 승인으로 확장 해석 금지. 정상 로그인·OTP/CSRF 및 독립 복원 검증이 남아 있다.

GitHub review / 검토 기록: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3224

## 사후 저장 보안
실제 Test DB 스냅샷은 root 0600 암호화 파일 actual-test-baseline.dump.enc로 보존. 암호문 SHA e9036164e02d4ec301da5bb655a846fdd839c0a3a4286cfe55ca5193eab6c751, 원문 SHA b140de45a7c16e5c8aa425fc54fbce2b78fa3dc2c5ac81ec68732851f19bd419 복호화 대조 완료. 기본 CI 스냅샷도 별도 암호화, 원본 평문 덤프 파일 제거. 임시 테스트 복제 DB 2개는 연결 0건 확인 후 삭제. 공식 Test DB 유지, KDIC 포털 Test/Prod 200 확인.
