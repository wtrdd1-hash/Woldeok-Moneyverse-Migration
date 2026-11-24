# GitHub 공개 업데이트 vAUTO.FE.TEST.2026.11.23.3: 프론트엔드 자동 개발→독립 Test 적용

5개 자동 예약 실제 강화 및 활성 확인: FE A 05분, QA1 15분, FE B 25분, FE C 45분, QA2 실제 브라우저 QA·Test 단독 자동 배포 55분(KST). QA2 기존 35분→55분으로 조정. 6번째 별도 배포 예약은 계정 최대 5개 제한으로 생성되지 않음.

디자인 정본: 11월23일 v2026.11.23.10 수정 180개 이미지 SHA 39888c7d26bdf688737a77b93a7da29e230b4168, PR #3400은 폐쇄·미병합. 통합기획서와 이후 승인 지시 우선.

FE A/B/C는 Spring MVC+Thymeleaf 실제 웹 코드, 원본 favicon, 네이비/보라 테마, EN 기본·KO 둘째·JA/ZH/VI, 실 API/DB·브라우저 반응형 구현. QA1은 실 Test 백엔드/금융 원장, QA2는 5언어/PC·모바일 브라우저/스크린샷·실 API 및 격리 Test 배포+실패 복구 수행. FE 개발자가 동시에 Test 전환하지 않도록 담당 분리.

이전 QA 147 고정 경로 중 114개 403, 동적33 미검사, 약관/개인정보·Socket.IO 403, null 제목을 필수 P0/P1로 추적. 검증된 부분 개선만 Test에 배포하며 180경로/240브라우저 전체 합격은 아직 미인증.

이번 변경은 예약 지시·GitHub 문서만 실제 수정. 현재 코드/Test 배포/DB/Nginx/운영/protected main은 미변경. [한글 상세 규정](../operations/2026-11-23-auto-fe-test-promotion-vAUTO.FE.TEST.2026.11.23.3.ko.md) · [영문](../operations/2026-11-23-auto-fe-test-promotion-vAUTO.FE.TEST.2026.11.23.3.md).