# v2026.11.18.1 — Spring MVC 계정 삭제 안내 화면 (G2 후보)

**상태:** 독립 소스 브랜치 구현 / 테스트 차단 / 운영 승격 보류  
**날짜:** 2026-11-18 KST | [English canonical](SPRING_ACCOUNT_DELETION_G2_v2026.11.18.1.md)

## 권위와 전환 범위
- 사용자 지시에 따라 웹 UI와 Next BFF까지 전부 Spring으로 단계적 전환. 이번 작업은 **기존 공개 페이지 한 개의 읽기 전용 미리보기**이며 전체 전환 완료가 아님.
- 선행 의존성: Thymeleaf와 Spring 웹 기반을 추가한 [PR #3213](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3213). 별도로 진행 중인 프론트 복원/로깅 [PR #3249](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3249)는 변경하지 않음.
- 원본: `frontend/src/app/account-deletion/page.tsx` 및 `frontend/src/components/deletion-request-info.tsx`. 운영 정식 경로 `/account-deletion`의 소유자는 계속 Next이고 폐기하지 않음.

## 화면 기능과 UI
- **Spring 후보:** `GET /spring-web/account-deletion`. 명시적으로 `moneyverse.web.account-deletion-preview-enabled=true`일 때만 컨트롤러 등록. 기본값 미설정/false이고 별도 차단 컨트롤러가 SPA 폴백을 막아 명시적 404를 반환. 현재 정식 경로를 Spring으로 매핑하지 않음.
- **서버 렌더링:** Thymeleaf 기반, 클라이언트 스크립트·계정 삭제 폼 없음. 기본 영어, `?lang=ko` 한국어, 미지원 언어는 영어. 문구 이스케이프, 사용자 ID·잔고·세션·토큰/API 사용 없음.
- **원본 보존:** 서비스/운영자 표시, 3단계 계정 삭제 요청 방법, 계정·개인정보처리방침 링크, 원본 연락처, 비밀정보 발송 금지, 30일·90일·1년·3년 보관 기간 및 법령/분쟁/보안 조사 예외 유지. Next 원본 정책 내용 변경 시 함께 수정 필요.
- **UI:** 기존 Spring 웹 다크 테마, 별도 반응형 CSS, 320px 이상 줄바꿈, 키보드 포커스, 본문 바로가기, 의미 있는 제목·목록, 고정 위젯 겹침 금지, 동작 감소 환경 대응.
- **보안:** `private, no-store`, `noindex, nofollow`, `no-referrer`, `nosniff`, 엄격한 CSP. 쓰기 엔드포인트 및 권한 데이터 없음.
- **한계:** 삭제 요청 접수·본인 인증·금융 서비스·DB 변경·Next 변경·SEO 정식 완료 여부와 무관.

## 필수 검증 및 승격 차단
1. 선행 Spring 웹 브랜치를 포함한 JDK21 환경에서 `cd spring-backend && ./gradlew test --tests 'com.moneyverse.api.domain.web.SpringAccountDeletion*'`, 이후 `./gradlew clean test bootJar` 실행. 실패는 승격 차단.
2. 승인된 동일 SHA Test에서만 프리뷰 플래그를 켜고 EN/KO HTML 200, 비활성 명시적 404 및 private/noindex, CSS 응답, 보안 헤더, 320/360/768/1280px 및 키보드/확대 검증. 운영 회원 계정 테스트 금지.
3. Next 원본과 법적 안내 문구·기간·링크·접근성을 브라우저에서 직접 비교하고 기존 운영 `/account-deletion` 경로가 유지되는지 확인.
4. 전체 G0–G6: Spring Security/CSRF/관리자 MFA, 금융 단일 원장, 178개 페이지·124개 BFF 동등성, Android API, 공식 Test/복원, 정확한 SHA 카나리/무중단 롤백은 여전히 미충족.

**현재 증거:** GitHub 소스의 원본 정책·연락처 점검 지점 5개가 컨트롤러와 템플릿에 존재함을 확인. 플래그·404 차단·테스트 코드가 추가된 것은 확인했지만 미니PC 원격 장치 오프라인으로 실제 Gradle 및 공식 Test/운영 검증 불가.

## 롤백 및 소유권
프리뷰 플래그는 기본 비활성이며 정식 Next 화면을 유지. 플래그 비활성화 또는 독립 브랜치 폐기만으로 후보 제거 가능. DB 복구나 운영 경로 변경은 불필요. 선행 PR과 전체 검증 게이트 없이는 main 병합 또는 운영 승격 금지.
