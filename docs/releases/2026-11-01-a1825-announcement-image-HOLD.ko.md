# 개발 A 18:25 공지 사진 필터 — 운영 배포 보류

후보 브랜치 `auto/hourly-a-20261101-1825-announcement-image`, 기준 main `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`. 최종 SHA와 CI 상태는 PR에 기록합니다.

로컬 전체 테스트·빌드·타입검사·Lint·보안·Android 계약·개발 DB 읽기 검증이 통과하더라도, 기존 개발 DB P0 직접 권한(#993), 실제 사진 첨부 양성 데이터 부족, 다른 공지 PR과의 중복, 최종 SHA CI 및 공식 Test 인증 E2E, 독립 백업 복원과 Production 실행 코드 출처가 확인되지 않으면 운영 승격을 금지합니다.

공식 Test Backend/Frontend SHA는 `bc8cd8a6c654af0336f550643f23049a58ee1d16`, Production Backend는 `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, Frontend는 SHA가 아닌 `1793450413898`입니다. 이번 후보는 어느 환경에도 배포하지 않았습니다. DB 변경·서비스 재시작·GitOps 승격·롤백은 0건입니다. 미배포 기능의 철회는 Draft PR을 닫거나 별도 검토 브랜치에서 필터 코드를 제거하는 방식으로 처리합니다.
