# Woldeok Moneyverse — 통합 기획 전면 재검토 v2026.09.24.435

**영문 기준** | 한국어 대응본

> 상태: PLANNING / 현재 전면 재검토 권위
> 날짜: 2026-09-24
> 브랜치: `docs/full-planning-rereview-v2026.09.24.435`
> 시작 main: `d058df3d29191e48c5ab9b12ec10014d015b5812`
> 런타임 주장: 없음. 기획/문서 전용

## 재검토 방식
- 현재 `docs/`의 Markdown 1,525개(전체 파일 1,540개)를 구조적으로 전수 스캔했다.
- 문서 정책, PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, 기존 v402 전면 재검토, 최신 delta/세부명세, 런타임 기준, update/changelog/worklog와 실제 소스를 심층 대조했다.
- `docs/planning/` 영/한 쌍 누락은 0건이다.
- 역사 기록은 증거로 보존하며 현재 진실처럼 덮어쓰지 않는다.

## 상위 재정의 결과

### G435-01 — P0 유료 작업 정산 드리프트
현재 `main`에는 `POST /api/v1/work/tasks/:id/complete` 즉시 유료 완료 경로가 남아 있다. `547399ce`가 assignment -> 최소 수행시간 -> submit -> verify 흐름을 강제했지만 `d058df3d29191e48c5ab9b12ec10014d015b5812`에서 즉시 revert되었다. 따라서 v433 유료 작업 페이싱은 현재 main에서 **기획됨, 구현 미완료**다.

필수 계약: 일반 참여/반복은 가능할 수 있지만 클라이언트 클릭만으로 즉시 사용 가능한 WLD가 생성되면 안 된다. 보상 작업은 서버 권위 수행시간/완료 경계, 멱등 정산, 동시성 안전 원장 반영, 재시도 안전 영수증과 exact-candidate Test 근거가 필요하다.

### G435-02 — P0/P1 작업·경제 문구 충돌
기존 기획에는 유한 일일 제한과 `null = 무제한` 표현이 함께 남아 있다. 이것을 무제한 유료 발행으로 해석해서는 안 된다.

상위 규칙: 무제한은 **참여/성장 가능성**이며 즉시 WLD 무제한 발행이 아니다. 유료 발행은 서버 권위 작업시간, 정책 예산/상한/감쇠, 자동화 방어와 경제 텔레메트리의 제약을 받는다. 보상 예산 소진 후 계속 플레이할 경우 명시적으로 설계된 비화폐성 성장만 허용한다.

### G435-03 — P1 API 인벤토리 드리프트
이번 기준 소스에서 **컨트롤러 파일 58개, raw HTTP 메서드 데코레이터 370개**를 확인했다. 유지 문서에는 57/335/361 과거 수치가 남아 있다. raw 데코레이터 수는 권위 endpoint 수가 아니다.

필수 계약: 생성 OpenAPI/route introspection을 수량 권위로 사용한다. 모든 릴리스 후보는 method/path, 인증/권한/CSRF, 요청/응답 스키마, 멱등성, 페이지네이션/자원 제한, deprecation, 모바일 사용 가능 여부, 담당 기능을 포함한 semantic API diff를 생성한다.

### G435-04 — P1 전면 재검토 권위 드리프트
`INDEX.md`는 기획이 v433까지 진행됐는데도 v402를 현재 전면 재검토로 가리킨다. v435가 현재 전면 재검토 진입점으로 v402를 대체하며 v402는 역사 증거로 보존한다.

### G435-05 — P1 구형 제어 문구 분리
전수 스캔에서 폐기된 관리자 TOTP/`SecondFactorGuard`, 44px를 WCAG AA 규범 최소치처럼 적은 문구, 구형 direct-to-main 문구가 남아 있다.

현재 유지 명세는 실제 활성 제어(`AdminSessionGuard`, 위험 기반 최근 재인증/step-up, 브라우저 mutation CSRF, 서버 권한검사, append-only audit)를 사용한다. WCAG 2.2 SC 2.5.8은 예외가 있는 24x24 CSS px 최소치로 적고 Moneyverse >=44x44는 더 강한 제품 기준으로만 유지한다. 역사 문서는 현재 acceptance 기준으로 사용하지 않는다.

### G435-06 — P1 웹/모바일 교차 저장소 정합
app `main`만으로 최신 웹/백엔드 계약이 Android/app에서 끝까지 소비되는지 증명할 수 없다. 이후 기능 브랜치 작업이 있으므로 정합은 추정이 아니라 검증한다.

필수 계약: feature, web route, backend endpoint, app screen/client call, 인증/세션, schema version, negative-path coverage, 정확한 테스트 SHA를 가진 자동 생성 교차 저장소 정합 표를 유지한다.

### G435-07 — P1 런타임/릴리스 근거 최신성
기획·구현·릴리스 기록은 서로 다른 속도로 진행된다. release/update 기록은 당시 검증의 증거이지 현재 Production identity 자체가 아니다.

모든 현재 상태 주장은 실제 활성 frontend/backend runtime identity, Git SHA, DB migration 상태, 세션 연속성, health check, rollback target에 연결되어야 한다. 문서 전용 버전은 런타임 identity를 바꾸지 않는다.

### G435-08 — P1 사용자 공개/API 경계
사용자 기능 페이지는 공개 기능을 설명할 수 있지만 내부 관리자 endpoint inventory, 비밀값, 서명 세부, 권한 프로시저명, 공격에 도움이 되는 운영 메타데이터를 노출하면 안 된다. 상세 API 문서는 GitHub/개발자 문서에 두고 인증/권한 경계를 명시한다.

## 12개 영역 상태
| 영역 | 현재 상태 | 다음 acceptance 근거 |
|---|---|---|
| 인증/세션 | PARTIAL | exact-SHA 재시작/전환 연속성, 폐기, 최근 재인증, 음성 권한검사 |
| 경제/원장/국고 | PARTIAL + P0 | 즉시 유료 작업 우회 제거, 원자적/재시도 안전 정산, 경제 텔레메트리 |
| 주식/시장/카지노 | PARTIAL | 생성 계약 diff, 조작/정산 동시성, 거래정지/환불 테스트 |
| 인벤토리/마켓/사업 | PARTIAL | escrow/멱등/소유권 권한검사, real DB reconciliation |
| 커뮤니티/채팅 | PARTIAL | BOLA/IDOR, cursor/멱등, 보존/모더레이션, abuse control |
| 공개 콘텐츠/SEO | PARTIAL | 공개/비공개 경계, canonical/noindex/hreflang, 진실한 콘텐츠 |
| 네이티브 앱/API | PARTIAL | 교차 저장소 정합 표, exact app+backend E2E |
| UI/반응형/접근성 | PARTIAL | 320px+ viewport, 키보드/스크린리더, target-size, contrast |
| AI/자동화 | PARTIAL | 기존 AI 전체 재감사, bounded changes, provenance, rollback |
| 데이터/백업/DR | PARTIAL | restore rehearsal, RPO/RTO, 암호화/보존, DB 권위 |
| 릴리스/브랜치/런타임 | PARTIAL | isolated Test exact SHA, 무중단/세션 연속성, Production identity |
| 분석/수익화/컴플라이언스 | PARTIAL | 동의/연령/플랫폼 정책, 이벤트 스키마, 실험 guardrail, 개인정보 |

## 구현 우선순위
1. **P0-1:** 경제 조정 전에 G435-01 즉시 유료 작업 우회를 닫는다.
2. **P0-2:** 권위 semantic API inventory를 생성하고 숫자만으로 완료를 주장하지 않는다.
3. **P0-3:** exact-SHA 인증/세션, 원장/멱등, 권한, real DB 회귀 게이트를 실행한다.
4. **P1-1:** 현재 유지 명세를 실제 보안/접근성/문서 정책과 정합시킨다.
5. **P1-2:** 웹/백엔드/앱 정합 표를 게시하고 모든 기능을 IMPLEMENTED/PARTIAL/BLOCKED/PLANNED로 분류한다.
6. **P1-3:** 최신 구현을 Production 검증 완료라고 부르기 전에 runtime identity와 release lineage를 갱신한다.
7. **P2:** 구형/중복 역사 문서는 compatibility stub와 inbound-link 안전 이전 방식으로만 정리한다.

## 범위 진실
v435는 기획/문서 권위만 변경한다. P0 작업 정산 문제가 수정되었다고 주장하지 않고, raw 370 데코레이터를 semantic endpoint 수라고 주장하지 않으며, 새 Test/Production 배포를 주장하지 않는다.
