# 개발 A 06:50 — 공개 사진 게시월 검색 QA

**상태:** P1 코드 후보 / Draft / 운영 배포 보류.

기준 main SHA는 `a8541927c3a351d980454c66e95a3356c47e0722`입니다. 기존 SECURITY DEFINER 공개 사진 조회 함수가 반환하는 최근 승인 사진 최대 24건만 한국 시간 게시월(YYYY-MM)로 필터링합니다. 전체 과거 사진 검색이 아닙니다.

웹에는 레이블이 있는 월 선택, 초기화, 범위 안내, 잘못된 입력/조회 불가/검증된 빈 결과를 구분하는 상태를 추가했습니다. Backend는 중복·미지원 검색 조건을 거부하고 적용 월을 명시합니다. Android App API는 필터를 무시한 HTTP 200, 다른 월의 사진, 중복 ID, 잘못된 응답을 503으로 차단합니다. 필터 응답은 no-store/noindex/no-referrer 정책입니다.

테스트 주도 방식으로 Backend 통합 3건, Android/UI 4건의 최초 실패를 확인했습니다. 수정 후 Backend 대상 10건, Frontend helper 2건, Android/UI 6건이 통과했고 전체 타입검사는 PASS입니다. 변경 파일 lint는 오류 0건, 기존 img 경고 1건입니다.

개발 PostgreSQL 17.11에서 앱 역할로 READ ONLY/ROLLBACK 검증 결과 승인 사진 2건, 공개 함수 EXECUTE=true였습니다. 기존 P0 #993의 직접 UPDATE/DELETE 권한은 여전히 허용됩니다. 운영 DB 권한을 검증한 결과는 아닙니다.

전체 테스트·최종 SHA CI·공식 Test 인증 E2E·독립 복원·보안 감사 미완료로 **main 병합 및 Production 배포 금지**입니다. 마이그레이션·금융 원장 변경·운영 배포·서비스 재시작·브랜치 삭제는 수행하지 않았습니다.

## 코드 SHA 전체 검증 결과 — 07:05 KST
기능 SHA `277a3167e7135963a3c567d77ed0e77b52b2e375`에서 루트 전체 테스트 종료코드 0입니다. Node 34 PASS, 계약 41 PASS, DB 62 PASS/5 SKIP, Backend 2,990 PASS/518 SKIP, Frontend 2,928 PASS입니다. SKIP은 통과로 계산하지 않았습니다. 타입검사와 빌드는 PASS, lint는 오류 0/경고 1,027, 모바일 API 계약 184개 검증 PASS입니다.

운영 의존성 감사에서는 알려진 취약점 0건이지만 전체 의존성 감사는 9건(낮음 1, 보통 8)으로 FAIL입니다. 개발 DB P0 #993 권한 문제도 FAIL입니다. 개발 PostgreSQL 앱 역할 READ ONLY/ROLLBACK 결과 승인 사진 2건은 모두 한국 시간 2026-09에 속했습니다.

공식 Test와 Production 공개 버전은 `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`으로 후보와 다릅니다. 동일 SHA 인증 E2E·독립 복원·GitOps 검증은 BLOCKED입니다. 비-main 브랜치 191개 중 177개는 고유 미통합 변경, 14개는 main 선조이며 열린 PR 174개 중 29개가 충돌 상태입니다. 갤러리 기존 PR #2312/#2331/#2371/#2249 및 동시 작업 #2435와 가상 병합 충돌이 확인됐습니다. 어떤 브랜치도 삭제하지 않았습니다.

**운영 배포 및 main 병합 보류**입니다. 최종 문서 SHA의 GitHub CI 결과는 별도 확인이 필요합니다.
