# 머니버스 전체 기획·소스·기능·운영 재분석 — v2026.10.16.711

**최종 판정: 전 기능 및 금융 수용은 BLOCKED.** [영문 정본](MONEYVERSE_FULL_PLAN_CODE_FUNCTION_REAUDIT_v2026.10.16.711.md)

## 1. 검사 기준과 실제 배포
- 최초 원격 `main=8ba6b4426f9e662f7196f364bfc19c9350476cc1`로 독립 작업트리에서 검사했다. 도중 원격 최신 `1eb65c685c7d116d569283c7971ab9efdaf32019`에 v701 보안/용량 개선이 병합되어 충돌 없이 fast-forward했다. **테스트·빌드는 최초 8ba6b442에서 수행**, 새 main과 달라진 16개 경로는 v701 문서와 `ops/security/v701-*.sql`뿐이며, 최신 SHA에서 동일 전체 테스트를 반복했다는 뜻은 아니다.
- 운영: `prod-v2026.10.15.697` 실제 소스 `a5a1e9da6fc55ac71c44c4cf6ee138e9442f4e73`; 3213/3214 새 백/프론트 서비스 활성 및 버전 API 일치. Test 포인터 `test-v2026.10.15.696-a5a1e9da6fc5`. 기존 v600 서비스도 롤백·백그라운드 작업으로 살아 있다. v701에서는 공개 SECURITY DEFINER 권한 11→0 개선.
- Android GitHub main `ee97ddfc5a93d7198d2d1ee94bb5a13c3b62ebcb` 소스만 검사. 미병합 v710 블로그 작업과 동시 v712 기획은 침범하지 않았다.
- 최우선 권위는 `docs/DOCUMENTATION_POLICY.md` → `docs/planning/PROJECT_PLAN.md` → `INTEGRATED_PLANNING_MASTER.md` → 명시 채택 상세 기획서. v523/542/543 원장 보전·v530 전 경로 UI 게이트는 운영 업데이트로 자동 해제되지 않는다.
- 조사 기준 Git 추적 4,337파일, Markdown 2,289개, Next 페이지 163개, Nest 컨트롤러 약 82개, Next API 핸들러 78개, SQL 마이그레이션 270개. 이는 기능 정상 숫자가 아니다.

## 2. 실행된 테스트 및 실제 라우트
| 검증 | 결과 | 한계 |
|---|---|---|
| 의존성 오프라인 설치 | 성공 | 격리 작업공간 |
| `pnpm test` | 종료 0; 백엔드 **1,212 통과 / 396 스킵**, 프론트 **1,220 통과** | DB·인증 E2E 스킵은 합격 아님 |
| `pnpm typecheck` | 통과 | 정적 타입 |
| `pnpm lint` | 오류 0, 경고 **1,088** | 품질 부채 |
| `pnpm build` | Nest/Next 운영 빌드 통과 | 브라우저 기능 보장 아님 |
| `pnpm bot:test` | 실패: 격리 bot 의존성 `youtube-dl-exec` 미설치 | 환경 실패와 로직 실패 구분 |
| Discord 광고 QA `node --check` | 7행 `SyntaxError` 재현 | 실제 소스 결함 |
| 올바른 Host/HTTPS 프록시 헤더를 넣은 운영 익명 GET | `/`, `/status`, `/blog`, 본문, `/stocks`, 복리 계산기, `/admin/blog`, `/robots.txt`, 블로그 사이트맵 등 HTTP 200 | 로그인 후 저장·구매·정산 미검증 |
| 익명 `/app-api/v1/account/identities` | 401 정상 | 로그인 상태 미검증 |
| 개발 DB `moneyverse_app` | public 241 테이블 중 SELECT 238, INSERT/UPDATE/DELETE 각 237 | 운영 DB 권한과 동일하다는 단정 금지 |
| SECURITY DEFINER PUBLIC | 최초 485개 함수 중 공개실행 11개 → v701 이후 다시 조회 시 **0개** | 앱 직접 테이블 DML은 여전히 위험 |

## 3. 문제별 판정

**A711-01 / P0 DB 권한:** 개발 DB에서 앱 계정이 237개 테이블에 쓰기/삭제할 수 있다. `SECURITY DEFINER` 함수에 금융 권한을 한정한다는 설계와 충돌한다. 운영 v697/v701 기록에서도 직접 잔액 UPDATE·전표 INSERT 권한 미해결. 모든 호출자 파악, 분리 Test DB 거부 테스트, 원장 대사, 새 번호의 정방향 마이그레이션 이후 단계적 회수해야 한다.

**A711-02 / P0 국고 허위 대사:** `backend/src/admin/treasury/treasury.repository.ts:506,879`은 실제 원장 순흐름을 계산·대조하지 않고 금고 합계를 원장 합계로 복사하며 `RECONCILED`, 차액 0을 반환한다. 사실상 비교 근거 없는 정상 표시로, 미대사일 때 UNKNOWN/차단이 필요하다. 미병합 v683~690 PR의 개선 주장을 운영 완료로 간주하지 않는다.

**A711-03 / P0 PvP 직접 잔액 갱신:** `backend/src/casino/pvp-arena.repository.ts:347~373`에서 패자·승자·국고 계좌를 직접 UPDATE하므로 복식부기 원장 posting과 분리된다. **기존 v687 보고서의 일부 설명을 정정**한다: 최신 코드에는 이미 `withPgTransaction`, 계좌 순서 잠금, 암호학적 `randomInt`가 들어 있다. 그러나 원장 보존·멱등 정산 검증은 아직 안 됐다.

**A711-04 / P1 은행 신용평가:** `backend/src/bank/bank.controller.ts`는 계정 경과 30일, 직업 5레벨, 상환 3회, 연체 0회라는 고정값을 실제 회원 신용등급 입력으로 사용한다. 보유량도 `Number()`로 변환. 실제 이력이 없으면 시뮬레이션이라고 표시하고 정수 정밀도를 지켜야 한다.

**A711-05 / P1 국가별 블로그 SEO:** 운영 `/blog`, `/en/blog`, `/ja/blog`, `/zh/blog`은 200 및 언어별 HTML lang을 반환하지만 실제 페이지 제목은 모두 한국어이며 canonical이 전부 `https://easy-scraping.com/blog`이다. `frontend/src/app/blog/page.tsx`, `[slug]/page.tsx`, `sitemap-blog.xml/route.ts`는 단일 한국어 본문/메타데이터·URL 중심이고, 본문 언어 선택은 `blog-post-client.tsx`에서 클라이언트 번역 표시다. 미국·일본·중국용 고유 원고/정확한 관할 세제/서버 렌더링 메타/언어별 사이트맵·hreflang·자기 정규 URL·이미지 저작권 검증이 필요. **작업 중인 v710은 별도로 보존.**

**A711-06 / P1 Discord QA:** `bot/scripts/qa_ads_sponsorblock_verification.mjs:7` 줄바꿈 문자열은 `SyntaxError`가 직접 재현됐다. 별도 봇 단위 테스트 실패는 의존성 설치 부족이므로 섞어 말하지 않는다.

**A711-07 / P1 배포 작업소유권:** 신 v697 백엔드의 뉴스/시세/Outbox/SWF 자동잡은 일부 비활성, 이전 백엔드가 여전히 백그라운드를 담당한다. 단일 작업자 소유권·재시작 및 롤백 후 중복 처리 방지, 전달 연속성은 별도 검증 필요.

**A711-08 / P2 Android 앱 버전:** GitHub 앱 `app/build.gradle.kts`의 `versionName=1.3.5`인데 `ApiClient.kt`의 User-Agent `APP_VERSION=1.3.0`이다. HTTPS 및 지정 호스트 제한 구현은 확인됐으나 실기기 빌드·로그인·쿠키·CSRF·API 계약 실사용 검증은 안 했다.

**A711-09 / P2 문서 진실성:** 오래된 `DOCS_INDEX.md`는 검증 근거 없이 구글 4.9점 스니펫·즉시 색인·보상 성과를 확정적으로 홍보한다. 현재 채택 기획의 미구현/검증대기 내용과 분리해 표시해야 한다.

## 4. 영역별 기능 수용 현황

| 기능군 | 이번 근거 | 판정 |
|---|---|---|
| 가입·OAuth·계정·세션·2FA | 익명 401, 단위/빌드 | 로그인 E2E **미검증** |
| 지갑·은행·송금·신용·환전·연금 | 라우트·테스트, 과다 DB 권한·신용 가짜 입력 | 금융 **P0 차단** |
| 국고·국채·보조금·SWF·세금 | 허위 대사, 미병합 시정 PR | **P0 차단** |
| 주식·체결·뉴스·AI 정책 | 공개 /stocks 200, 단위 테스트 | 실제 체결/잡 **미검증** |
| 카지노·PvP·보상 | 스위치 enabled, 직접 갱신 | **P0 차단** |
| 직업·사업·장터·상점·경매 | 구현 경로 확인, 일부 단위 테스트 | 거래·정산 **미검증** |
| 게시판·프로필·채팅·갤러리·알림 | 코드/페이지 존재 | 인증 쓰기/전송 **미검증** |
| 블로그·SEO·다국어·관리자 | 공개 화면 200, 국가 메타 일원화 | **P1 시정 필요** |
| 금융 계산기·학습 콘텐츠 | 복리 계산기 200, 빌드/단위 | 연도·법령 정확성 검토 필요 |
| Discord | QA 구문 오류, 별도 의존성 부재 | **P1 부분** |
| Android | GitHub Kotlin 57파일 / 테스트 9파일, 버전 차이 | 실기기·API **미검증** |
| 배포·CI·DB·복구 | v697 운영, v701 권한 개선, 빌드 정상 | 금융 릴리스 수용 **차단** |

## 5. 조치 우선순위
1. **P0** 국고 원장과 금고 실제 대사 후 허위 정상 표시 차단; PvP·리그 등 직접 잔액변경을 표준 원장 함수로 전환; 권한 회수는 신규 순차 마이그레이션과 복원 Test/잔액 보존 검사 후 수행.
2. **P0** 동일 SHA Test 인증·기존 세션·2FA/RBAC/CSRF·멱등·장애 불확정·백업 복원·무중단/롤백 실제 재현.
3. **P1** 신용평가 실제 입력, 백그라운드 잡 단일소유, Discord QA, 전체 화면/모바일 5회, 회원·관리자 브라우저 수용.
4. **P1** v710을 건드리지 않고 KR/US/JP/CN 국가별 블로그 고유 콘텐츠·법규·번역/이미지/SEO 정합성 검증.
5. **P2** ESLint 경고 1,088건 분류, Android User-Agent 버전 일치, 역사 문서 과장 제거.

**실시하지 않은 작업:** 운영 금액 쓰기/마이그레이션/스위치 변경/배포, 운영 회원 로그인 E2E, 실제 주식·송금·구매·정산, 모든 화면 실브라우저 5회, 기기 테스트, GSC 실시간 성과 입증. 문서 전용 감사로서 전 기능 정상/운영 승인이라고 주장하지 않는다.

[영문 작업 로그](../worklog/2026-10-16-full-plan-code-audit-v711.md) · [내부 업데이트](../updates/v2026.10.16.711-internal.ko.md) · [GitHub 업데이트](../updates/v2026.10.16.711-github.ko.md)
