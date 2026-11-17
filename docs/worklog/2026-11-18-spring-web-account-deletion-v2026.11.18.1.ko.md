# v2026.11.18.1 — Spring 웹 계정 삭제 안내 화면 전환

**상태:** 소스 구현 / 실제 테스트 차단 / 운영 승격 보류  
**날짜:** 2026-11-18 KST · [English canonical](2026-11-18-spring-web-account-deletion-v2026.11.18.1.md) · [적층 초안 PR #3253](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3253)

## 작업 전 (코드 변경 이전 기록)
- 사용자 지시: 프론트엔드와 백엔드까지 Spring으로 전환. 이번 작업은 **정식 경로가 아닌 안전한 한 화면 후보**, 전체 완료가 아님.
- 초기 `origin/main`: `e96e8f81f4d6b99b221392a2b6fe46356361b145`. AGENTS, 문서 정책, 최신 프로젝트 기획, 통합 기획, Spring 설계 및 실측 점검 조회.
- 독립 브랜치 `feature/spring-web-account-deletion-v2026.11.18.1`를 Spring 웹 기반 PR #3213 위에 적층. 별도 프론트 복구/로그 PR #3249 코드 미변경.
- Next `/account-deletion` 원본은 `DeletionRequestInfo`를 렌더링. 안내 절차·연락처·보관 기간·보안 주의사항 의미 유지. 정식 운영 경로 단일 소유자는 기존 Next.
- 미니PC Desktop Commander 장치 모두 오프라인. 호스트 Gradle, 공식 Test, Nginx, 실제 DB, 브라우저 E2E, 운영 검증 불가.
- 범위: 기본 비활성 Spring MVC 읽기 전용 `/spring-web/account-deletion` 후보, 영어 기본/한국어, 반응형·접근성, 보안 헤더, 회귀 테스트.
- 계정 변경·금융 변경·비밀값·DB 마이그레이션·정식 경로 변경·운영 배포 없음.

## 작업 중 (소스 검증 중간 기록)
- `SpringAccountDeletionController.java` 추가. 별도 플래그로 기본 비활성, 계정 동작 없음.
- `templates/spring-web/account-deletion.html`에 양언어 안내·기존 계정/개인정보 링크 제공, 반응형 CSS 추가.
- 활성/비활성 컨텍스트의 MockMvc/JUnit 테스트 메서드 5개 작성: 언어, 기본 영어 폴백, noindex/CSP/private 헤더, 라우트 비활성 확인. **실행하지 못함**.
- 기존 Next `DeletionRequestInfo`와 소스를 대조하여 OAuth, 사진, 감사·동의 보관 기간 및 법률 예외 한국어 문구 유지 확인. 이메일 연락처는 HTML 템플릿에 존재함. **소스 비교일 뿐 실제 HTML 실행 검증 아님**.
- 중간 `main` 재조회 결과 최초와 동일: `e96e8f81f4d6b99b221392a2b6fe46356361b145`.
- 선행 #3213 브랜치 대비 신규 15파일, 선행 파일 수정 0, #3249와 충돌 파일 0.

## 작업 종료 (소스 작업만 마감)
- `feature/full-spring-web-foundation-v2026.11.17.2`를 base로 하는 [초안 PR #3253](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3253) 생성. main 직접 변경 없음. PR 개설 시 선행 브랜치 SHA `859fc315111f25a9d1921bc72b023c8a027647d9`, 후보 브랜치 SHA(종료 기록 전) `9327a0e5f3849eb6885af1e654a8250195da30c9`.
- EN/KO 전환 상세 문서·변경 이력·GitHub용·내부용 업데이트 작성.
- **Gradle 통과를 주장하지 않음**: 미니PC 연결 대상 모두 오프라인. 공식 Test 배포·회원 브라우저 검증·금융 원장 변경·운영 배포·서비스 재시작·Nginx 변경 없음.
- **운영 보류:** Spring SecurityConfig 전역 허용/CSRF, 인증·금융 G0 테스트, 정확한 SHA 기반 Test, 롤백·독립 복구 증거 미확보. 현재 Next 정식 페이지 및 178개 페이지·124개 BFF 전환 과제 유지.
- 추후 연결 복구 시 최신 main과 적층 브랜치 재동기화, JDK21 개별 및 전체 Gradle 빌드/테스트, 플래그 활성 공식 Test, 정책/SEO/접근성/브라우저 비교 검증과 안전한 경로 단위 카나리 실시. 모든 검증 전 운영 승격 금지.
