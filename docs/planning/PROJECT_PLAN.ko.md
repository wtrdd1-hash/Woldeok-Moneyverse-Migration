# 월덕 머니버스 — Living Project Plan

> **문서 상태:** Living Spec
> **최초 기획 기준:** 2026-08-26
> **실제 구현 동기화:** 2026-09-15
> **영문 기준 문서:** [PROJECT_PLAN.md](PROJECT_PLAN.md)

## 0. 문서 운영 원칙

이 문서는 고정된 최초 기획서가 아니라 **실제 구현과 함께 갱신되는 Living Spec**이다.

개발 과정에서 구현이 더 안전하거나 현실적인 구조로 의도적으로 발전했고 실제 코드·DB·테스트에서 검증된 경우, 그 구현을 기준으로 기획서를 같은 작업 흐름 안에서 수정한다. 반대로 코드가 여전히 유효한 보안·원장·개인정보·제품 불변 규칙을 실수로 위반한 경우에는 기획서를 바꿔 회피하지 않고 코드를 고친다.

기획과 구현의 차이는 숨기지 않는다. 변경 이유, 검증 방법, 적용 날짜, 남은 위험을 기록한다. 이미 적용된 DB 마이그레이션은 문서 정정 때문에 수정하지 않고 다음 번호 마이그레이션으로 교정한다.

GitHub 공식 문서는 영어를 우선하고 한국어 문서는 운영자·사용자 이해를 위해 동등하게 유지한다.

## 1. 제품 정의

월덕 머니버스는 Discord 커뮤니티와 웹에서 같은 가상경제를 사용하는 커뮤니티형 경제·게임 플랫폼이다. 사용자는 지원되는 로그인 제공자로 인증하고 WLD를 벌고 사용하며, 작업·직업 성장, 상점, 사업, 가상 은행, 가상 주식, 커뮤니티 및 게임 기능을 이용한다.

WLD, 가상 주식, 카지노 플레이, 예금·대출·보상 등은 모두 **서비스 내부 가상 데이터**다. 현금 환전, 실제 증권·예금·투자 수익, 실제 도박 상품을 제공하거나 보장하지 않는다.

## 2. 현재 실제 구현 기준

최초 기획 이후 실제 구현은 다음 구조로 발전했다.

- 브라우저 공개 프론트엔드: Next.js
- 내부 애플리케이션 API: NestJS
- 경제·권한의 최종 경계: PostgreSQL
- 민감 조회·쓰기: PostgreSQL `SECURITY DEFINER` 함수 중심
- 애플리케이션 DB 역할: 보호된 경제/원장 테이블에 직접 쓰기 권한을 주지 않는 최소 권한 모델
- 가치 이동: 이중분개 append-only 원장
- 재시도 가능한 가치 변경 요청: 멱등성 키 사용
- 외부 알림/Discord 전달: DB 커밋 이후 outbox 방식

운영 경제 DB는 PostgreSQL로 통일한다. SQLite는 로컬 단일 프로세스 도구나 격리된 실험용으로만 사용할 수 있으며 운영 경제 원장 DB로 사용하지 않는다.

## 3. 덕코어와 원장 불변 규칙

모든 가치 변동은 덕코어/DB 경제 계약을 통과한다. 애플리케이션이 사용자 잔액을 직접 UPDATE해 경제 이벤트를 만들지 않는다.

하나의 가치 변경은 정책·권한·한도·멱등성 검증, 원장 posting, 파생 잔액, 필요한 감사/outbox 기록을 하나의 일관된 트랜잭션 경계 안에서 처리한다.

차변·대변 합계는 항상 일치해야 한다. 음수 잔액을 허용하지 않는 계정은 트랜잭션 수준에서 음수로 내려갈 수 없다.

원장과 감사 로그는 append-only다. 잘못된 거래는 과거 행을 수정·삭제하지 않고 원거래를 참조하는 보정/반대 거래를 새로 생성한다.

WLD는 정수 최소단위와 정밀도 안전한 문자열/BigInt 계약을 유지한다. 큰 금액을 JavaScript `Number`로 강제 변환하지 않는다.

## 4. 로그인·계정·세션

Discord/Google OAuth/OIDC는 Authorization Code Flow와 최신 보안 기준을 따른다. `state`, 필요한 경우 `nonce`, 정확한 redirect URI, PKCE를 사용한다.

로그인 제공자 연결은 기존 내부 계정에 로그인된 상태에서만 허용한다. 이미 다른 사용자에게 연결된 provider subject를 자동 병합하지 않는다.

세션 쿠키는 `HttpOnly`, `Secure`, same-origin/host 기준을 사용하고 로그인·권한상승·민감 변경 시 필요한 회전/재인증 정책을 적용한다.

OAuth Client Secret, Discord Bot Token, 세션 키, DB 비밀번호, 백업 암호화 키 등은 Git·브라우저·일반 로그·오류 화면에 노출하지 않는다.

## 5. 최고관리자 모델 — 실제 구현 동기화

초기 기획과 현재 관리자 구현은 다르며, 현재 구현을 정식 기획으로 반영한다.

현재 모델은 **단일 `superadmin` + 보완 통제** 구조다. 필수적인 2인 승인 모델은 현재 구현 요구사항이 아니다.

현재 보안 계약은 다음과 같다.

- 관리자 경로는 역할/세션 요구사항에 따라 `AdminSessionGuard`로 보호한다.
- 관리자 콘솔 진입과 고위험 경계는 구현된 `ReauthGuard` 기준으로 최근 재인증을 확인한다.
- 고위험 작업은 현재 구현된 TOTP 기반 `SecondFactorGuard`를 추가로 통과한다.
- HTTP/UI 권한 확인만 믿지 않고 민감 PostgreSQL 함수가 실제 행위자(actor)와 관리자 역할을 다시 확인한다.
- 관리자가 호출한다는 이유로 보호된 경제/원장/감사 테이블에 애플리케이션 직접 쓰기 권한을 추가하지 않는다.
- 고위험 변경은 대상, 현재값, 변경값, 영향 범위, 금액, 사유, 멱등성, 감사 기록을 남긴다.
- 최고관리자도 기존 원장 행과 감사 로그를 직접 수정·삭제하지 않는다.
- 조회 전용 운영 화면에는 불필요한 step-up 인증을 강제하지 않되 관리자 세션과 권한 검증은 유지한다.

현재 실제 2차 인증 기준은 TOTP다. WebAuthn은 별도 구현·QA가 끝난 뒤 추가 또는 대체 수단으로 활성화할 수 있다.

기존 초안의 “정책 변경·국고 조정·대량 지급은 반드시 요청자와 승인자를 분리한다”는 문구는 현재 구현과 맞지 않으므로 현행 요구사항에서 제외한다. 대신 재인증, TOTP, DB actor 재검증, 미리보기, 멱등성, 불변 감사 로그를 필수 보완 통제로 둔다.

## 6. 관리자 통제 범위

마스터 콘솔은 구현된 백엔드/DB 계약이 존재하는 범위에서 다음을 제공할 수 있다.

- 사용자 조회·상태·제한·세션 종료
- 지갑·원장·대사·보정 거래·지급
- 보상·작업·직업·성장 정책
- 상점·사업 정책과 카탈로그
- 가상 주식·은행·대출 기능
- 가상 카지노 기능 플래그와 한도
- 시즌·공지·게시판·콘텐츠
- Discord 통합
- 허용된 Minecraft 운영 작업
- 기능 플래그, 점검 모드, 대사, 백업/큐/상태 확인

화면이 존재하더라도 실제 DB/API 안전 계약이 없는 기능은 조작 가능하다고 표시하지 않는다.

고위험 작업 UI에는 현재값, 변경 후 예상값, 대상 건수, 총액/영향, 되돌림 또는 보정 방식, 재인증 상태를 보여준다.

## 7. 블랙박스 감사 로그

관리자 작업, 인증 실패, 권한 거부, 고액/대량 경제 작업, 정책 변경, 보안 세션, 복구 관련 작업은 추적 가능해야 한다.

가능한 범위에서 request_id, trace_id, session_id, actor, 역할, 인증/재인증 수단, 시각, 대상, action code, 전후 값 요약, 정책 버전, 거래 ID, 처리 결과, 무결성 상태를 구조화해 기록한다.

비밀번호, 세션 쿠키, access/refresh token, OAuth Client Secret, Discord Token, DB 비밀번호, 암호화 키, 전체 개인정보, 무제한 request body는 로그에 남기지 않는다.

## 8. 작업·직업·초보자 성장

단순 “보상 버튼”이 아니라 **작업 배정 → 수행 → 완료 요청 → 서버 검증 → WLD/EXP 지급 → receipt** 흐름을 사용한다.

작업 카탈로그, 최소 수행시간, 일일 한도, 쿨다운, 보상, 경험치, 정책 버전은 서버/DB에서 결정한다.

경험치는 돈과 분리한다. 레벨업은 무한 현금 배율보다 새로운 작업, 전문화, 칭호, 사업 조건, 도감/콘텐츠 해금 중심으로 설계한다.

초보자 화면에는 오늘 남은 보상, 추천 작업, 예상 시간, 난이도, 경험치, 진행 중 작업, 다음 해금 조건, 최근 지급 영수증을 명확히 표시한다.

## 9. 상점·사업·사용자 시장

상점의 실제 가격, 할인, 재고, 구매 제한은 서버/DB 계약으로 확정한다. 브라우저가 결제 가격을 결정하지 않는다.

사업은 고정 일매출만 지급하는 무위험 복리 자산이 되지 않도록 발전시킨다. 순이익은 판매수량, 판매가, 재고 원가, 운영비, 수수료/세금, 관리 상태, 수요 등 실제 게임 내 요소와 연결한다.

사용자 장터는 등록, 구매, 취소, 만료, 에스크로, 환불/정산, 수수료, 시세 기록을 명시한다. 자기 거래, 반복 가장매매, 다계정 시세조작 등 악용 탐지를 추가한다.

## 10. 은행·성장신용

신규 사용자는 가입 기간, 출석, 작업 이력, 정상 수입 등 검증된 성장 조건을 충족하기 전까지 대출을 제한한다.

대출은 한도, 이자, 상환 일정, 최소 상환, 연체, 신용 등급, 목적 제한, 감사 기록, 재기 정책을 가진다.

대출금이 무제한 MINT가 되지 않도록 국고/은행 자금 풀 등 자금 출처 모델을 분명히 한다. 대출금의 카지노·주식·사용자 송금 제한은 실제 DB/API 구현과 일치하도록 유지한다.

## 11. 월덕거래소(WDX)

가상 주식은 실제 금융상품이 아니라 서비스 내부 게임 기능이다.

종목 가치 근거, 발행량, 주문/체결 방식, 배당 재원, 가격 제한폭, 거래 중지, 상장·폐지, 시세조작 방지 규칙이 충분히 구현·검증된 기능만 운영 활성화한다.

가격·정산 WLD 역시 정수 문자열 계약과 경제 원장 불변 규칙을 따른다.

## 12. 럭키존/확률형 기능

카지노/확률형 기능은 서버가 결과를 결정하고 브라우저는 선택·베팅 입력과 애니메이션만 담당한다.

확률, 배당, 이용 한도, 최대 손실 가능성을 사용자에게 공개한다. 결과 생성과 원장 반영은 일관된 트랜잭션으로 처리하고 동일 멱등성 키 재시도는 기존 결과/영수증을 재사용한다.

현금 충전·환전·외부 경품과 결합하지 않는다. 유료화 또는 실제 가치와 연동되는 방향으로 변경할 경우 별도 법률·제품 검토 없이 출시하지 않는다.

## 13. 경제맥박과 밸런스 파일럿

경제 지표는 M2, 발행/소각, 국고 유입·지출, 상위 보유자 집중도, 보상/소비/세금 흐름, 사용자 거래율, 원장-잔액 대사를 포함한다.

국고로 이동한 돈은 다시 지출될 수 있으므로 “소각”과 구분한다.

자동 경제 조정은 처음부터 무제한 자동 적용하지 않는다. 초기에는 제안 모드로 운영하고 충분한 관찰 기간, 최소 활성 사용자 수, 1회/주간 변경 상한, 시험군, 롤백 조건을 만족한 항목만 제한적으로 자동화한다.

과거 원장을 수정해 지표를 맞추지 않는다. 정책은 새 버전과 발효시각으로 적용한다.

## 14. 보안 기준

OWASP ASVS/API Security 수준의 방어 심층화를 목표로 한다.

- OAuth/session 보안
- CSRF
- IDOR/BOLA 및 권한상승 방지
- 입력 검증·출력 인코딩·XSS 방어
- SQLi/SSRF/path traversal/command injection 방어
- rate limit/abuse control
- secret 관리
- 파일 업로드 실제 타입/매직바이트 검증
- DB 최소권한 역할
- 컨테이너 비root/최소 capability/최소 mount
- 의존성·공급망 점검
- 백업/복구 및 사고대응

브라우저에 내부 API token을 전달하지 않는다. 내부 NestJS API는 일반 공개 API origin처럼 취급하지 않는다. 외부에 노출되는 integration endpoint는 예외 목록으로 제한하고 별도 서명/인증을 검증한다.

## 15. 파일·사진

JPEG, PNG, WebP 등 허용 형식을 명시하고 확장자/MIME만 믿지 않는다. 실제 이미지 디코딩과 매직바이트 검증을 사용한다.

크기, 해상도, 업로드 횟수, 총 저장공간을 제한한다. 파일은 웹루트 밖에 저장하고 서버 생성 이름을 사용한다.

비공개 사진은 권한 확인 뒤 제한된 방식으로 전달하며 디렉터리 열람을 허용하지 않는다.

## 16. SEO·Search Console

하나의 대표 공개 도메인을 기준으로 canonical과 리다이렉트 정책을 유지한다. 공개 콘텐츠는 정상 status code, 고유 title/H1/설명, 실제 본문, 내부 링크, sitemap, 반응형, 이미지 alt를 갖춘다.

로그인·계정·지갑·송금·관리·개인 거래 화면은 인증과 noindex/X-Robots 정책을 적용하고 sitemap에서 제외한다. `robots.txt`만으로 개인정보/민감 페이지를 보호하지 않는다.

배포마다 canonical, robots/noindex, sitemap, title/H1, 404/redirect, Core Web Vitals를 점검한다.

## 17. AdSense·광고

검토 완료된 공개 콘텐츠 광고는 기본 활성화(`ADS_ENABLED=true`)한다. 운영 빌드는 승인된 AdSense 게시자/슬롯을 기본 사용하며, 정책·법률·장애 대응이 필요한 경우 운영자가 `ADS_ENABLED=false`로 명시적으로 끌 수 있다. 격리 테스트 배포는 실제 광고 트래픽이 발생하지 않도록 `ADS_ENABLED=false`와 빈 광고 식별자를 명시한다.

허용 대상은 실질적 원본 본문이 있는 공개 안내/가이드/뉴스 등의 allowlist 경로다. 커뮤니티 게시판은 목록 화면에 한해 하단 단일 슬롯을 허용하고, 글쓰기 폼과 광고를 분리하며 개별 사용자 게시글·댓글 상세 화면은 광고 없이 유지한다. 게시판 광고는 사용자 제작 콘텐츠 정책 준수와 운영 검토·삭제 대응을 전제로 한다.

로그인, 계정, 지갑, 송금, 주식/시장, 카지노, 게임 조작, 관리자, 상태/오류/빈 화면, 개별 미검토 사용자 콘텐츠 상세 등 민감하거나 상호작용 중심 경로에서는 광고를 차단한다.

광고 클릭 유도, 보상과 광고 결합, 버튼 위장, 자동 클릭/새로고침, 트래픽 구매를 금지한다.

## 18. 개인정보·국내 법률 게이트

개인정보는 목적에 필요한 최소 항목만 처리한다. 개인정보처리방침은 실제 수집 항목, 목적, 보유기간, 위탁/국외이전, 파기, 이용자 권리, 연락처와 일치해야 한다.

14세 미만 가입/개인정보 처리 흐름은 법정대리인 동의 등 검증된 절차가 마련되기 전까지 단순 체크박스로 허용하지 않는다.

유료 기능, 광고성 결제, 확률형 유료 요소, 실제 가치 환전/경품 등 제품 성격이 바뀌는 변경은 별도 법률·소비자보호·게임 규제 검토를 릴리스 게이트로 둔다.

## 19. 사전 검증과 배포

격리된 `wdmv-test` Kubernetes/Flux 테스트 스택은 다시 활성 상태다. 릴리스 가능한 모든 `main` SHA는 운영보다 먼저 테스트 스택에 배포하고 검증한다. 테스트와 운영은 별도 namespace와 PostgreSQL 데이터베이스를 사용한다.

배포 게이트는 fail-closed다. CI와 불변 test image 빌드가 성공하고, `test.easy-scraping.com`에서 정확한 애플리케이션 SHA가 확인되며, 백엔드/DB smoke 경로까지 통과한 뒤에만 동일 SHA 운영 이미지와 GitOps 승격을 허용한다. 테스트 스택이 정확한 SHA를 제공하지 못하면 운영 자동 승격을 중단한다.

전용 테스트 서버가 없거나 정확한 SHA가 확인되지 않았는데 “테스트 서버 통과”라고 기록하지 않는다.

병합 직전 최신 `main`을 다시 동기화하고 다른 사람의 변경을 보존한다. `main`을 force-push하지 않는다. 통합 이후 필요한 검사를 다시 수행한다.

운영 배포 후에는 HTTP/API, 핵심 사용자 흐름, 인증 가능 범위, 로그/에러, 프로세스/컨테이너 상태, 리소스 사용량, 롤백 준비를 즉시 확인한다.

## 20. DB 마이그레이션

적용된 번호 마이그레이션은 불변이다. 수정이 필요하면 다음 번호의 새 마이그레이션을 만든다.

production checksum과 migration parity를 유지한다. 데이터/스키마 변경에는 무결성 검증, 하위 호환성 검토, 복구 전략을 포함한다.

파괴적인 운영 데이터 변경은 명확한 복구 경로 없이 실행하지 않는다.

## 21. 기획·문서·작업내역 동기화 규칙

기능·보안·운영 변경이 실질적인 설계 변경을 포함하면 같은 개발 작업에서 다음을 함께 수정한다.

1. 이 Living Project Plan
2. 관련 feature/architecture/operations 문서
3. 영문 변경 기록/릴리스 문서
4. 한국어 번역판
5. 작업내역서: 발견사항, 수정 이유, 변경 파일, 테스트, 실패/재수정, 병합/배포 상태, 롤백 정보, 남은 위험

구현과 기획이 다르다고 무조건 구현에 맞춰 문서를 바꾸지는 않는다. 구현 변경이 보안·무결성·개인정보 원칙을 약화시키는 회귀라면 코드를 수정한다.

## 22. 현재 우선 보완 항목

- 관리자/보안 실제 구현과 Living Spec을 지속 동기화
- 운영이 첫 실행 환경이 되지 않도록 격리된 사전 검증 환경 유지
- DB 권한과 actor-scoped 함수 지속 검증
- 원장 대사와 백업/복구 증빙 상시 유지
- 백엔드는 구현됐지만 UI에서 접근할 수 없는 기능/식별자 경로 제거
- 모바일/태블릿/데스크톱 반응형, 접근성, Core Web Vitals 점검
- Search Console/SEO 상태 지속 확인
- 광고·개인정보·확률형 기능을 명시적 정책/법률 게이트 뒤에 유지
- 경제 정책은 충분한 실제 데이터가 쌓이기 전 제안 모드 우선

## 23. 변경 기록

### 2026-09-13 — 검토된 광고 기본 활성화 v2026.09.13.37

- 공개 콘텐츠 allowlist의 검토된 광고 정책을 기본 비활성화에서 기본 활성화로 변경했다.
- 운영 빌드는 승인된 AdSense 게시자/슬롯을 자동 활성화하며, 운영자가 명시적으로 비활성화할 수 있다.
- 격리 테스트 배포는 계속 광고를 명시적으로 끄고 빈 광고 식별자를 사용한다.
- 로그인·지갑·송금·주식/시장·카지노/게임 조작·관리자 등 민감 경로의 광고 금지 경계는 변경하지 않았다.

### 2026-09-09 — 구현 동기화

- 2026-08-26 초안을 Living Spec 방식으로 전환했다.
- 운영 경제 DB를 PostgreSQL로 통일했다.
- 실제 관리자 구현인 단일 superadmin, `AdminSessionGuard`, `ReauthGuard`, TOTP `SecondFactorGuard`, DB actor 재검증, append-only 감사 구조를 정식 기획에 반영했다.
- 과거 필수 2인 승인 문구를 현행 요구사항에서 제거하고 재인증·TOTP·미리보기·멱등성·감사 로그를 필수 보완 통제로 명시했다.
- 상시 테스트 스택이 제거된 당시 상태를 기록하면서도 운영 전 검증 요구 자체는 유지했다.
- 앞으로 실제 구현이 의도적으로 진화할 경우 관련 코드 문서와 이 기획서를 같은 작업 흐름에서 함께 갱신한다.

---

## 24. 제품 확장 로드맵 (2026-09-09)

> 아래 항목은 현재 구현을 대체하는 약속이 아니라, 실제 구현·테스트·운영 검증을 거쳐 단계적으로 승격하는 제품 요구사항이다. 실제 금융상품이 아닌 서비스 내부 가상경제라는 기존 경계는 유지한다.

### P0 — 핵심 탐색·재방문·운영 기반

- **가상 종목 상세 허브**: 가격/캔들/핵심 지표/보유 현황/관련 커뮤니티 글을 하나의 canonical 페이지로 연결한다. 첫 회원용 허브 슬라이스를 `/stocks/[symbol]`에 구현하여 시장 정보, 보유 현황, 관심종목, 차트/거래, 비교/알림, 종목 태그 토론을 연결한다.
- **관심종목(Watchlist)**: 회원별 관심 가상 종목을 저장하고 홈/종목 화면에서 빠르게 접근한다.
- **공개 콘텐츠 SEO**: 비회원 공개 콘텐츠의 canonical URL, metadata, sitemap, robots, breadcrumb 및 내부 링크 구조를 지속 검증한다.
- **관리자 운영 콘솔 강화**: 사용자/경제/콘텐츠/오류/서비스 상태를 read model 기반으로 집계하며 위험한 쓰기 기능과 분리한다.
- **관리자 Audit Log**: actor, action, target, result, 변경 전/후의 비민감 정보와 마스킹된 네트워크 정보를 기록한다. 비밀번호, 세션 토큰, 내부 API token 등 secret은 기록하지 않는다.

### P1 — 데이터와 커뮤니티 결합

- **가상 종목 태그형 커뮤니티**: 게시글을 종목과 연결하여 종목 상세 ↔ 관련 글 사이의 탐색 경로를 만든다. 회원용 흐름은 구현되어 종목 상세에서 해당 종목으로 필터링된 게시판 글쓰기 화면으로 이동하며 작성 폼이 자동으로 열리고 종목코드가 미리 입력된다. 기존 서버 기준 태그 게시글 생성/조회 계약은 변경하지 않는다.
- **종목 비교**: 여러 가상 종목의 가격 추이와 서버가 제공하는 비교 지표를 동일 기준으로 비교한다. 종목 상세 허브에서 검증된 종목 심볼을 비교 화면으로 전달하고, 현재 선택한 2~3개 종목 조합을 브라우저 URL에 동기화하며, 동일한 비교 상태를 다시 열거나 공유할 수 있도록 비교 링크 복사를 제공한다. 비교 화면은 검증된 종목 심볼 딥링크, 현재 2~3개 선택 URL 동기화/복사 공유, 시가 대비 절대 변화와 정수 문자열 기반 등락률을 함께 제공한다.
- **조건 알림**: 가격/변동률/서비스 이벤트 등 서버가 검증 가능한 조건을 기반으로 알림을 제공한다. 가격·일일 변동 조건은 구현되어 있으며, 종목 상세의 알림 링크가 `/stocks/alerts`에서 해당 가상 종목을 자동 선택하도록 연결해 화면 간 이동에서도 사용자 의도를 유지한다. 알림 폭주 방지용 cooldown/rate limit을 둔다.
- **경제/이벤트 캘린더**: 서비스 내부 이벤트, 가상 종목 이벤트, 퀘스트/상점 이벤트를 날짜 기반으로 통합한다. 회원 캘린더는 이제 일일 사건, 주간 갱신, 시즌 이벤트 종료와 함께 서버 상점 카탈로그의 판매 종료 일정을 표시한다.
- **계정 보안 센터**: 활성 세션 확인, 다른 세션 종료, 로그인 보안 상태, 2단계 인증 확장 가능성을 포함한다.

### P2 — 개인화와 요약

- **개인 대시보드**: 관심종목, 최근 활동, 보유 자산, 퀘스트/경제 이벤트를 회원별로 구성한다.
- **포트폴리오 분석**: 현재 가상 주식 보유 데이터에서 평가액/구성 비중/손익을 서버 정밀도 계약을 유지한 채 계산한다.
- **AI 요약 보조 기능**: 운영 공지, 긴 가이드, 공개 커뮤니티 흐름 등을 요약할 수 있다. 생성 결과는 원문과 구분하고 출처/생성 시각을 표시하며 경제 결과를 직접 결정하지 않는다.

### P3 — 장기 확장

- 고급 경제 분석, 추천 및 시뮬레이션은 데이터 품질·비용·안전성·법적 표현을 검토한 뒤 도입한다.
- 외부 실제 금융 데이터가 도입될 경우 가상경제 데이터와 UI/API/문서에서 명확히 분리하고 라이선스·출처·지연시간을 표시한다.

### 공통 제품 요구사항

1. **검색 가능성**: 공개 페이지는 안정적인 URL과 서버 렌더링 가능한 핵심 콘텐츠를 가진다.
2. **접근성**: 키보드 탐색, focus 상태, label, 대비, reduced-motion을 회귀 테스트한다.
3. **반응형**: 모바일/태블릿/데스크톱에서 기능 자체가 사라지지 않도록 한다.
4. **관측성**: 신규 기능에는 성공/실패/지연시간/주요 비즈니스 이벤트를 관측할 수 있는 지표를 함께 설계한다.
5. **권한**: 공개 읽기와 인증/관리자 쓰기를 분리하고 서버/DB 경계에서 재검증한다.
6. **정합성**: 가치 이동 기능은 기존 원장·트랜잭션·idempotency·integer-string 계약을 그대로 따른다.
7. **점진 배포**: 기능 플래그 또는 동등한 안전장치로 테스트 환경 검증 후 운영에 승격한다.
8. **문서 동기화**: 구현이 기획과 달라지면 구현 현실을 확인한 뒤 PROJECT_PLAN, README, CHANGELOG, WORKLOG를 함께 갱신한다.

### 구현 승격 게이트

`기획 → 브랜치 구현 → 정적/단위/통합 테스트 → DB 정합성 확인 → 테스트 서버 배포 → 공개 동작/반응형/보안 확인 → 문서 갱신 → main 병합 → 운영 배포 → 운영 health 확인`

main은 테스트 서버 검증이 끝나기 전 직접 수정하거나 병합하지 않는다.

## 25. 통합 구현·QA·SEO·보안·수익성 계약 — v2026.09.15.103

이 절은 모든 기능군에 적용되는 규범적 통합 기준이다. `보안 강화`, `SEO 개선`, `수익화 검토`, `기능 추가`처럼 구현 범위를 확정할 수 없는 표현만으로 backlog를 만들지 않는다.

### 25.1 현재 운영승격 차단 이슈

**P0 — 직업 작업 일일 quota 계약 드리프트.** 운영 `/guide`는 직업 작업을 일일 횟수 제한 없이 반복하고 매번 WLD/EXP를 전액 보상한다고 설명하지만, 최신 `main` v2026.09.15.102는 작업별 `daily_limit`, 실제 완료 기준 `taken_today`, 한도 초과 거부, 사용자/작업 단위 동시성 보호를 DB authoritative 계약으로 복구했다. 공개/모바일/웹 안내를 동기화하고 검증하기 전까지 무제한 보상 문구를 사용하지 않는다. 수용조건은 실DB에서 0/부분/최대 quota, 최대+1 거부, 직업 전환 격리, 동시 중복 완료, 서울 날짜 경계, API/웹/모바일 parity가 모두 통과하는 것이다. 이미 적용된 migration은 수정하지 않으며 경제 동작 롤백은 새 migration으로만 수행한다.

**P0 — 운영 승격 증거 fail-closed.** CI 성공, 불변 test image, exact-SHA 테스트 배포, backend/DB smoke, migration parity/checksum, 핵심 사용자 흐름 QA, rollback 준비는 서로 다른 필수 증거다. GitHub status가 보이지 않으면 성공/실패로 추정하지 않고 `verification unavailable`로 기록한다. 필수 증거를 증명하지 못하면 운영 승격을 차단한다.

### 25.2 기능별 필수 상세명세

인증/세션, 프로필/보안센터, 인벤토리/컬렉션, 상점/장바구니/결제/구독, 시즌/퀘스트/직업/성장, 사업/은행/대출, 가상주식/포트폴리오/알림, 카지노/확률형, 커뮤니티/댓글/신고/차단, 친구/클럽/추천, 알림, 검색, 업로드, 공개 콘텐츠, 앱 API, 관리자/감사/백업, 분석/실험, 광고, SEO, 장애대응 등 모든 기능 backlog는 다음을 기록한다: 목적/사용자문제, 구현상태(`UNIMPLEMENTED`, `PARTIAL`, `IMPLEMENTED`, `REDESIGN_REQUIRED`), actor/권한/진입경로, 최초/재방문/복귀 흐름, loading/empty/error/offline/timeout, 반응형/접근성/i18n, 서버 권위와 데이터 소유권, 읽기/쓰기 권한, endpoint/method/request/response/error/idempotency/rate limit, 서비스 규칙, 테이블/인덱스/제약/트랜잭션/동시성, 감사/관측/관리자 운영, feature flag/fallback/backup 영향, 보안/개인정보/악용, SEO/index 정책, 분석 이벤트/KPI, 성능/cache 목표, 수익성/비용, unit/integration/E2E/실DB/security/regression 수용기준, 테스트환경 게이트, 운영승격/롤백.

### 25.3 보안 검증 매트릭스

object ID를 받는 모든 API는 서버에서 object-level authorization을 확인하고 다른 사용자 ID를 넣은 negative test를 포함한다. 이는 OWASP API1:2023 BOLA 기준을 따른다. 인증/세션은 credential stuffing/rate limit, session fixation/rotation, logout/invalidation, OAuth state/nonce/PKCE/exact redirect URI, recent reauthentication, CSRF, cookie 속성, 관리자 MFA/TOTP 경계, secret/log masking을 검증한다. 경제 endpoint는 idempotency/replay, 동시 요청, reward duplication, multi-account/collusion/market manipulation, 정밀도, append-only 원장 대사, DB least privilege를 추가 검증한다. upload/UGC는 실제 디코딩 타입/매직바이트, 크기·해상도, 격리 저장, delivery authorization, metadata 개인정보, moderation/report/block, 악성 링크/피싱을 점검한다. CRITICAL/HIGH 보안 테스트 실패는 배포차단이다.

### 25.4 SEO 백엔드 계약

SEO는 문구뿐 아니라 backend/read-model 영역이다. canonical URL 생성은 서버 authoritative이고 결정적이어야 한다. 동적 sitemap은 public/indexable canonical URL과 authoritative `lastModified`만 포함하고 protocol 한계 전에 분할한다. 계정/관리자/지갑/거래/복구/보안/private holdings는 sitemap에서 제외하고 인증과 필요 시 `noindex`/`X-Robots-Tag`를 적용한다. robots.txt만 개인정보 보호수단으로 사용하지 않는다. slug 변경은 명시적 301/308 redirect map으로 관리한다. 공개 콘텐츠 핵심 의미는 SSR/ISR HTML에서 검색로봇이 읽을 수 있어야 하며 filter/sort/search/query variant는 canonical 또는 noindex로 thin duplicate 생성을 막는다. Breadcrumb JSON-LD는 실제 보이는 breadcrumb와 canonical URL을 일치시킨다. 이미지 alt·크기·최적화와 private filename/EXIF 유출 방지를 포함한다. 다국어 공개 페이지는 canonical/hreflang을 일관되게 관리한다. Google Search Console/Naver Search Advisor의 crawl/index/canonical/sitemap 오류를 수집하고 organic visit → signup → activation → D7/D30 → revenue까지 연결한다. 대표 공개 템플릿의 Core Web Vitals 목표는 LCP 2.5초 이하, INP 200ms 미만, CLS 0.1 이하를 기준으로 한다.

### 25.5 수익화·사업성 계약

유료기능은 gross revenue 직감만으로 승인하지 않는다. 각 구독, 일회성/비소모성/소모성 상품, sponsorship, 광고 surface, B2B2C 기능은 가격/테스트 범위와 근거, attach/conversion/repeat/renewal 가설, refund/cancellation/churn, 플랫폼/결제 수수료·세금·환불비·infra/storage/CDN/notification/LLM 비용, 콘텐츠/CS/moderation/fraud 비용, gross margin/contribution margin, CAC/LTV/LTV:CAC/payback, 낙관/기준/보수 민감도, D1/D7/D30 영향, 신뢰/법규 위험, `SCALE/ITERATE/HOLD/KILL` 기준을 가진다. 실측이 없는 값은 가설/테스트 기준으로 표기한다. 자동갱신의 주요 조건은 결제 전 명확히 표시하고 명시적 동의를 받아야 하며 해지를 방해하는 retention tactic은 금지한다. 광고는 `광고매출 - 광고 유발 이탈/세션감소/CS부담` 순기여로 평가한다. 보안/QA/백업/SEO/관리도구는 사고·부정사용·환불·CS 비용 절감 및 retained customer/organic value로 사업가치를 평가한다.

### 25.6 상점·카탈로그 계약

모든 SKU는 canonical item ID/이름/카테고리/설명/대상/가치제안, WLD/실결제 구분, consumable/non-consumable/subscription 분류, 서버 authoritative 가격과 테스트 범위, 할인/번들/쿠폰, 재고/판매기간/구매제한/중복구매, 계정귀속/선물, 환불/복구/해지/갱신, grant/inventory 반영과 idempotency, economy sink/source와 P2W 판정, retention/revenue 가설, KPI/fraud 통제, API/DB/admin lifecycle, QA를 기록한다. fake scarcity, resetting countdown, 숨은 개인별 가격, wealth/profit/casino prestige 기본화, 경쟁우위 유료판매는 제외한다.

### 25.7 우선순위와 배포순서

우선순위는 `P0 데이터손실/보안/인증/권한/자산중복/경제악용/DB무결성/승격증거` → `P1 주요 사용자 오류·핵심흐름 완성도` → `P1 결제/상점/수익화 계약` → `P1 SEO backend/공개유입` → `P2 리텐션/성장` → `P2 접근성/반응형` → `P3 장기확장` 순이다. 모든 항목은 상태, 근거, 완료조건, QA gate, 의존성, rollback, 사업효과 가설을 가진다.

### 25.8 현재 런타임·QA 현실

운영 공개 상태 페이지는 최신 기록 기준 웹, 경제 API, 원장 DB를 정상으로 표시한다. 공개 홈/상태/가이드는 접근 가능했으나 인증 사용자 흐름은 이번 문서-only 회차에서 독립 실행하지 않았다. 시작 `main` SHA의 GitHub status/workflow 조회에서는 visible check를 확인하지 못했으므로 CI/테스트서버 통과를 주장하지 않는다. Runtime verification은 부분 가능으로 기록한다.

### 25.9 외부 근거 적용판정

직접채택: Google canonical/Core Web Vitals/Breadcrumb, Naver 검색로봇/sitemap/canonical/robots, OWASP API BOLA/Broken Authentication 및 OWASP Top 10:2025/ASVS 검증기준, FTC 2026 구독 집행을 소비자보호 신호로, Apple 구독/결제복구 문서를 플랫폼 수익·갱신 참고로 사용한다. 특정 플랫폼의 수익배분율이나 복구기간은 실제 해당 플랫폼/결제모델을 채택하기 전 Moneyverse의 확정값으로 사용하지 않는다.

### 25.10 변경 기록 — v2026.09.15.103

- Living Project Plan에 개발/QA/SEO backend/보안/수익성 요구를 통합했다.
- 공개 가이드의 무제한 작업 보상 문구와 실제 일일 quota 구현의 불일치를 P0 계약 드리프트로 승격했다.
- fail-closed 승격 증거와 `verification unavailable` 의미를 명문화했다.
- 모든 기능 backlog에 UX/API/DB/보안/운영/분석/수익성/QA/rollback 상세 계약을 요구한다.
- 이번 기획 변경은 런타임/코드/DB/인프라를 수정하지 않는다.

## 26. 통합 릴리스 거버넌스·기능 근거 감사 — v2026.09.15.104

이 절은 규범적이며, 실제 근거에 기반한 구현상태, 구체적인 릴리스 차단조건, SEO 경로계약, 보안 위협통제, 사업성 및 QA 수용조건을 추가한다. 이 기획 회차 자체는 런타임 배포 권한을 부여하지 않는다.

### 26.1 릴리스 차단 이슈 등록부

#### QA-104-01 — P0 — OPEN — 직업 작업 quota 안내가 서버 권위 동작과 계속 충돌

- **최초 기록:** 2026-09-15 v103. **최근 재현:** 2026-09-15 운영 익명 `/guide`.
- **실제 증거:** 운영 가이드는 여전히 직업 작업을 일일 횟수 제한 없이 반복하며 매번 전액 WLD/EXP를 받는다고 명시하지만, 현행 서버/DB 정책은 작업별 `daily_limit`, `taken_today`, 정확한 한도까지 허용, 한도 초과 거부, 사용자/작업 단위 동시성 보호를 사용한다.
- **영향:** 가이드를 보고 작업을 선택하는 신규·복귀 사용자, CS, 모바일 클라이언트, 가이드에서 파생되는 SEO snippet, 경제 기대와 신뢰.
- **확정 원인:** 구현 회귀가 아니라 공개 문구가 권위 quota 계약 변경을 따라가지 못한 specification/content drift.
- **수정대상:** 프론트 가이드 본문/구조화 메타데이터, 모바일/app 가이드 문구, FAQ/help, 무제한 보상으로 보일 수 있는 endpoint/schema 예시, 분석 이벤트 라벨. DB 경제계약은 이 수정으로 바꾸지 않는다.
- **요구 UX:** 작업별 한도/쿨다운이 존재하면 표시하고, `takenToday`, 남은 보상가능 횟수 또는 같은 의미의 평문을 제공한다. quota 후 플레이 자체가 가능하다면 `플레이 가능`과 `전액 보상 가능`을 명확히 분리한다.
- **마이그레이션:** 문구 동기화에는 없음. 이미 적용된 migration은 수정하지 않는다. 향후 경제정책을 바꾸려면 새 migration/정책 버전을 사용한다.
- **롤백:** 검증된 정확한 이전 문구로 content-only 되돌림. 오래된 문구에 맞추기 위해 무제한 보상을 재도입하는 방식은 금지한다.
- **테스트:** 금지된 무제한 전액보상 문구를 잡는 정적 회귀; 실DB 0/부분/정확한 최대/+1 거부; 동시 double-submit; 직업/작업 격리; 서울 날짜 리셋 경계; retry/idempotency; 웹/모바일 response parity; 작업선택→receipt→남은 quota 표시 authenticated E2E.
- **테스트서버 수용:** 정확한 test SHA가 수정된 가이드와 동일 SHA의 isolated PostgreSQL quota matrix를 모두 통과해야 한다.
- **운영승격:** 위 조건 전까지 BLOCK. 배포 후 quota rejection, suspicious duplicate reward, CS 문의, 작업 완료전환, D1/D7을 관측한다.
- **사업효과 가설:** 잘못된 기대와 CS/경제 인플레이션을 낮추되 의미 있는 작업 activation은 유지한다.

#### REL-104-02 — P0 — OPEN — 자동 Production-ready 게이트가 Living Plan의 요구증거보다 적게 검증함

- **최초 기록:** 2026-09-15 v104. **근거:** `.github/workflows/deploy.yml`과 본 문서 19/25절 대조.
- **현재 자동화:** 격리 테스트에서 정확한 release SHA를 기다리고, public shop catalog가 비어 있지 않은지, 루트에 `X-Robots-Tag: noindex`가 있는지를 검증한 뒤 운영 이미지를 만들고 `production-ready` deployment signal을 발행한다.
- **공백:** 규범 문서는 migration parity/checksum, 중요 authenticated 사용자흐름 QA, DB/경제 무결성 증거, rollback 준비까지 요구하지만 현 isolated-test job은 `production-ready` 전 이를 직접 증명하지 않는다. CI가 별도 CI PostgreSQL에서 migration/test를 수행하는 것은 유효하지만 test DB의 운영호환 migration parity나 authenticated test flow 통과의 증거와 동일하지 않다.
- **구체적 수정설계:** `production-ready` 발행 전 fail-closed `release-evidence` 단계 추가. (1) frontend/backend exact SHA, (2) test DB migration version/checksum parity, (3) backend DB connectivity와 least-privilege app role smoke, (4) synthetic 계정 session bootstrap/login/logout, (5) profile/wallet 대표 read와 비파괴 flow, (6) reward 코드 변경 시 job quota/idempotency/concurrency smoke, (7) economy migration 시 ledger/reconciliation health, (8) rollback 대상 SHA/image/manifest 존재, (9) test 광고/index 비활성화를 machine-readable evidence로 남긴다.
- **비밀/테스트계정:** synthetic credential/token은 environment secret에 두고 로그 출력 금지. 테스트 신원이나 증거가 없으면 `BLOCKED`이며 skip-pass 처리하지 않는다.
- **마이그레이션:** 배포 게이트 강화 자체에는 없음. evidence read-model이 스키마를 요구하면 새 migration+최소권한 read 계약으로 추가한다.
- **롤백:** 증거 실패 시 `production-ready`를 발행하지 않고 기존 운영 SHA를 유지한다. 이미 잘못 승격됐다면 마지막 known-good immutable SHA로 되돌리고 경제 데이터는 과거 원장 수정 대신 보정 거래를 쓴다.
- **QA/관측:** 테스트 환경에서 전제조건을 하나씩 의도적으로 깨 gate fail을 증명한다. exact-SHA timeout, migration mismatch, auth smoke, reconciliation, rollback artifact 부재를 알림화한다.
- **사업효과 가설:** 사고/환불/CS/부정사용 비용을 줄인다. 금액은 관측자료가 생기기 전 확정하지 않고 `사고확률×영향 + 다운타임/CS/환불/부정손실 절감`으로 산정한다.

#### REL-104-03 — P1 — TODO — branch protection이 required status check를 강제하지 않음

- **근거:** `main`은 protected지만 GitHub branch metadata의 required-status-check enforcement가 off이고 check/context 목록이 비어 있다. CI/test-candidate workflow와 exact-head를 확인하는 auto-integrator는 존재하지만 repository protection 자체가 모든 runtime-code main 변경이 검사를 통과했음을 보장하지 않는다.
- **위험:** maintainer/automation의 다른 경로로 runtime code가 검사 전 main에 들어갈 수 있다. 별도의 Production 승격게이트가 있어 즉시 운영침해와 동일하지는 않지만 `main = releasable` 신뢰를 약화시킨다.
- **수정설계:** runtime-code 경로는 PR 또는 승인된 자동통합 경로와 성공 CI/check context를 요구하는 ruleset/branch protection을 둔다. force-push/branch deletion을 금지한다. 현재 docs-only direct-main 정책은 가능한 가장 좁은 path/actor exception으로만 유지하고, 그 예외가 `backend/`, `frontend/`, `packages/database/`, 배포 manifest, 보안 script를 변경할 수 없게 한다.
- **QA:** sandbox/repo test에서 failing runtime-code PR과 direct runtime-code push가 모두 차단되는지 확인한다. 검증된 자동통합은 계속 동작해야 하며 docs-only 자동화가 runtime bypass 권한을 얻지 않는지 확인한다.
- **사업효과:** 비검증 main churn, 사고확률, 재QA 낭비 감소. 직접 매출로 계산하지 않는다.

### 26.2 근거 기반 전체 기능 구현상태 및 계약

상태는 근거 범위로 제한한다. `IMPLEMENTED`는 해당 slice의 현행 code/runtime 근거가 있다는 뜻이며 전체 기능군 완성을 의미하지 않는다. `PARTIAL`은 일부 구현이 있으나 필수 흐름이 미감사/미완성임을 뜻한다. `UNVERIFIED`는 기획이 있더라도 이번 회차에 code/runtime 근거가 충분하지 않다는 뜻이다. `REDESIGN_REQUIRED`는 검증된 구현이 규범적 불변조건과 충돌하는 경우다.

| 기능군 | 현재 상태/근거 | 권위·UX/API/DB 계약 | 보안·악용·개인정보 | SEO·성장·사업성 | QA 게이트 |
| --- | --- | --- | --- | --- | --- |
| 회원가입/로그인/OAuth/로그아웃/세션 | `IMPLEMENTED/PARTIAL`: Nest auth controller/module과 local-email+Discord/Google bootstrap, 앱 API coverage 문서 존재 | identity linking, consent, session 발급/회전/폐기는 서버 권위. UI는 loading/provider error/consent required/session expired/offline을 구분하고 client state만으로 로그인 판정 금지. 연결수단 삭제/계정삭제는 구현된 recent reauth 적용 | credential stuffing rate limit, state/nonce/PKCE/exact redirect URI, fixation 방지 session rotation, CSRF, secure cookie, logout invalidation, auth secret 로그/URL 금지 | 로그인 페이지 noindex. KPI는 form submit이 아니라 verified session→meaningful activation. 비용은 provider/CS/fraud per activated D30 | DTO/guard, state replay/mismatch, fixation, cross-account linking, logout invalidation, mobile handoff one-time, provider sandbox 가능범위 |
| 계정/프로필/보안센터 | `PARTIAL`: account controller와 admin security control 근거, 회원용 전체 parity는 미가정 | profile/linked method/session은 서버 권위. active-session 조회/다른 세션 종료 제공. 민감 변경 recent reauth, admin은 더 강한 role/TOTP | session/account ID BOLA negative test, 고위험 변경 알림에서 secret 제외, security audit, privacy-minimal default | private/auth+noindex. 사업가치는 ATO·지원비 감소와 신뢰; takeover signal/support ticket 측정 | other-user session denial, reauth expiry, terminate others, recovery, 접근성/mobile parity |
| 인벤토리/컬렉션/marketplace workbench | `PARTIAL`: 최근 inventory/marketplace slice 존재, 실 player-to-player settlement 완성으로 보지 않음 | ownership/provenance DB 권위. empty/loading/error/offline에서 holdings 조작 금지. 향후 거래는 escrow/cancel/expire/settle/fee/reversal 정의 | BOLA, serial/ownership leakage, 다계정 wash trade/collusion, duplicate grant/replay 방지 | acquire→use→curate→reuse. WLD 소비는 경제 sink이며 실매출 아님 | ownership concurrency, duplicate entitlement, transfer denial, recovery, private URL leakage, wash trade 시나리오 |
| 상점/catalog | `IMPLEMENTED/PARTIAL`: release smoke가 public catalog를 실제 사용하며 WLD store 존재. 실결제는 별도 scope | effective price/eligibility/limit/sale window/entitlement 서버 권위. 가격/화폐/소유/중복/마감/receipt를 명확히 하고 timeout retry 멱등 | client 가격 신뢰 금지, replay/duplicate grant, fake scarcity/hidden personalized pricing/P2W 금지 | 실질적 공개 editorial catalog만 index. purchase history private. WLD spend를 revenue로 회계 금지 | price tamper, 시간경계, duplicate click, 부족잔액, concurrent purchase, entitlement repair/cache invalidation |
| 실결제 장바구니/결제/구독/광고제거 | `UNVERIFIED`: WLD shop으로 존재 추정 금지 | 구현 전 provider, receipt/webhook signature, tax/refund, entitlement source, renewal/cancel/recovery/idempotency 확정. 결제 전 반복조건 명확히 | receipt forgery/webhook replay/order BOLA/payment data minimization/refund abuse/chargeback | checkout/order noindex. net revenue는 fee/tax/refund/support/fraud/infra 차감. SCALE/ITERATE/HOLD/KILL 사전 정의 | sandbox, duplicate/out-of-order webhook, cancel/refund/regrant, billing recovery, cancellation E2E, 법률 gate |
| 작업/퀘스트/직업/레벨/보상 | `PARTIAL + P0 DRIFT`: authoritative quota slice 존재, public guide stale | catalog/min duration/cooldown/daily limit/reward/EXP/receipt DB·서버 권위. playable과 reward-eligible 구분 | bot/macro, multi-account, replay, concurrent duplicate, clock abuse. append-only receipt/reconciliation | guide는 계약수정 후 확장. KPI TTFV/first verified job/D1/D7/fraud-adjusted reward inflation | QA-104-01 matrix를 릴리스 차단으로 적용 |
| 사업 | `UNVERIFIED/PARTIAL`: plan 존재, 이번 회차 complete settlement 미입증 | inventory/demand/cost/fee/tax/management를 명시하고 무위험 고정복리 금지. 모든 가치이동 ledger/idempotency | multi-account demand farming, circular purchase, replay/admin manipulation/precision | 교육 public page 가능, private P&L noindex. nominal WLD profit 아닌 retention+sink/source 건전성 | 실DB settlement/reconciliation/concurrency+abuse simulation |
| 은행/대출 | `UNVERIFIED/PARTIAL`: public guide 개념 존재, 전체 code/QA 미입증 | eligibility/source-of-funds/interest schedule/repayment/arrears/recovery 서버 권위, game-only 명확화 | loan mint, double repayment, clock, BOLA, loss-chasing 금지; 실제 예금안전/수익보장 암시 금지 | finance-like public content는 game/simulation label, private debt/balance noindex | accrual 경계, idempotent repayment, concurrent payment, restart/recovery, ledger reconciliation |
| 가상주식/watchlist/portfolio/alert/compare | `PARTIAL`: detail hub/watchlist/comparison/alert slice 구현 문서 근거 | public market read-model과 member holding 분리. settlement 서버 권위. URL에는 public symbol만, private holding/session 금지 | holding BOLA, manipulation/collusion, duplicate settlement, alert phishing/spam, precision | `/stocks/[symbol]`은 public-safe substantial content일 때 index. portfolio/watchlist/alert private/noindex | other-user holdings, symbol validation, large integer, cooldown, idempotent settlement, manipulation |
| 카지노/확률형 | `PARTIAL/high-risk`: runtime/public guide 근거 있으나 전체 release evidence 고위험 | 서버 RNG/outcome, 공개 probability/payout/limit, atomic settlement, 동일 idempotency result 재사용 | bot/replay/RNG tamper/limit bypass/multi-account/loss chasing/youth risk, cash redemption 금지 | gameplay/history noindex, win 중심 acquisition 금지. 별도 실결제 법률모델 없으면 revenue 0 | distribution sanity, replay receipt, limit/max loss/concurrency/ledger/legal gate |
| 커뮤니티/post/comment/report/block | `PARTIAL`: public/community surface 존재, moderation 전체 parity는 추가감사 | authorship/edit/delete/moderation 서버 권위; deleted/locked/report/block state 명확화 | spam/bot/harassment/impersonation/doxxing/link/XSS/BOLA/mod abuse | board index는 품질시 index, 개별 UGC는 moderation 정책 전 noindex 가능. 미검토 detail 광고 금지 | stored XSS/link, other-user edit/delete, report spam, block semantics, audit, deletion/index removal |
| 친구/클럽/referral | `UNVERIFIED/PARTIAL` | invite lifecycle, role/member/leave/kick/ban, privacy, referral attribution/reward maturity 명시 | invite spam, fake account, referral fraud, collusion, private club leakage, impersonation | public club은 explicit visibility만, private membership URL/search 금지 | referral ring, invite replay, role escalation, privacy/block |
| 알림/email/push/Discord | `PARTIAL` | event source/preference/cooldown/dedupe/delivery/deep-link 서버 권위. 알림에 민감 balance/debt/security state 제외 | phishing imitation/webhook abuse/spam/secret leakage, canonical-domain deep link, opt-out | noindex. incremental healthy return - optout/spam/support/privacy cost | dedupe/cooldown, stale link, revoked session, opt-out, provider failure, retry/outbox |
| 검색 | `UNVERIFIED` | public-safe read model, private search auth, query parsing/pagination/empty/timeout | injection, expensive-query DoS, private enumeration, search-log PII | 검색결과 기본 noindex, curated stable landing만 예외 | auth, special chars, pagination, rate/complexity, relevance regression |
| 업로드/gallery/file | `PARTIAL/spec-level` | decoded type/magic byte, size/dimension, random name, isolated storage, authorized delivery, EXIF strip | polyglot/malware/path traversal/bomb/SSRF/BOLA/metadata leakage | private media noindex, public media는 permission/moderation 후 safe alt/dimension | malformed/polyglot, oversize, unauthorized read, metadata strip, storage recovery |
| 공개콘텐츠/home/guide/status | `IMPLEMENTED`: 운영 익명 접근 확인 | public read model은 정직하게 fail, status measurement age 표시, guide는 server contract와 일치 | 내부 secret/topology 과노출 금지, XSS/phishing 방지 | canonical/indexable. `/guide` SEO 확장은 QA-104-01 종료 전 HOLD | HTTP/status/canonical/meta/structured data/accessibility/CWV/content-contract |
| App API/mobile gateway | `PARTIAL/COVERAGE DOCUMENTED` | versioned `/app-api/v1`, wrapper key/shape 안정, one-time handoff. breaking은 호환/버전업 | replay/BOLA/rate/CORS/PII log | API noindex, mobile activation/retention/support 측정 | contract snapshot, old client, one-time handoff, auth expiry/error parity |
| 관리자/audit | `PARTIAL/IMPLEMENTED controls`: AdminSessionGuard/Reauth/TOTP/DB actor | read와 risky write 분리; target/current/proposed/impact/reason/idempotency/audit/step-up | escalation/session theft/CSRF/BOLA/mass action/audit tampering. 단일 superadmin 잔여위험 | noindex/auth. 사고/operator error/CS 비용 절감 | lower-role denial, expired reauth/TOTP, impact preview, audit integrity, compensation |
| 백업/복구 | `UNVERIFIED EVIDENCE` | RPO/RTO, encrypted backup, restore target/checksum/drill/app+ledger reconciliation | key theft, plaintext snapshot, over-retention, wrong-env restore, destructive op | 비공개. catastrophic loss/downtime 회피가 가치 | isolated restore drill+checksum+migration parity+ledger reconciliation. destructive migration 차단 |
| 분석/실험 | `PARTIAL/SPECIFIED` | pseudonymous subject, analytics session≠auth secret, schema/version/retention/assignment | PII/secret leakage, re-identification, experiment manipulation, sensitive profiling | safe campaign/content ID만 cohort 연결 | schema, consent/retention deletion, deterministic assignment, secret scan |
| 광고 | `IMPLEMENTED/PARTIAL`: reviewed public placement 운영 노출 확인 | approved substantial public surface만, test 강제 off, CTA 위장/가림 금지 | invalid traffic/click encouragement/youth/privacy tracking/sponsor confusion | thin page를 광고 때문에 index하지 않음. net ad = revenue-churn/session/support/privacy cost | route allowlist, test off, CLS/CWV, ad exit, policy, invalid traffic |
| SEO backend | `PARTIAL`: 정책 및 test root noindex smoke 존재, 전체 read-model/dashboard는 미입증 | deterministic canonical, public SEO read-model, sitemap shard, redirect map, JSON-LD serializer, authoritative updatedAt, crawler observation | private route leakage/cache poisoning/Host canonical injection/PII sitemap·JSON-LD | organic→signup→activation→D7/D30→revenue, organic CAC 절감 | host injection, sitemap privacy, redirect loop, SSR, GSC/Naver, CWV |
| 장애/status 운영 | `PARTIAL`: status page 존재, release evidence 미완성 | public-safe status와 internal telemetry 분리; incident start/update/resolve/owner/severity/impact/rollback | topology 과노출/fake status/admin abuse/alert fatigue | status는 trust infra. MTTR/support 절감 | stale-status, dependency outage, rollback drill, postmortem |

### 26.3 SEO 구현 매트릭스 및 SEO 백엔드 backlog

SEO는 로그인하지 않은 사용자에게도 독립적인 가치를 주는 콘텐츠만 확장한다. Google 공식 최신 가이드는 redirect·sitemap·`rel=canonical`을 canonical 신호로 다루며 절대 명령으로 보지 않는다. Naver 최신 가이드는 정확하고 고유한 title/description, 사용자에게 도움되는 콘텐츠, crawl 가능한 HTML/resource/link, sitemap/RSS 제출과 색인품질 모니터링을 강조한다.

- **`/`** — `PUBLIC_INDEXABLE`; canonical `/`; 브랜드/제품목적 intent; 고유 title/H1/meta, 사실일 때만 Organization/WebSite JSON-LD, OG/Twitter, hero image dimension, 실질적 guide로 내부링크.
- **`/guide`** — QA-104-01 종료 전 `PUBLIC_INDEXABLE_BUT_HOLD_EXPANSION`. 수정 후 초보/game-system intent를 대상으로 하고 실제 투자수익 키워드 유입을 노리지 않는다. `lastModified`는 의미 있는 편집 시에만 갱신한다.
- **`/status`** — 실제 서비스상태 정보로 유지되는 한 public canonical 가능. DB credential/private hostname/stack trace/user state 금지. 검색유입보다 운영신뢰가 목적.
- **public news/season/collection/world guide** — 독창적이고 실질적이며 관리되는 경우 index. 안정 slug, breadcrumb, 작성/검토/업데이트 metadata, image alt/dimension.
- **`/stocks/[symbol]`** — public-safe stock/company/world read-model만 index. member holding/watch/order/alert/portfolio는 익명 HTML/JSON-LD/shared cache에 포함하지 않는다. sitemap `lastModified`를 매 price tick마다 바꾸지 않는다.
- **community index** — moderation된 실질 discovery value가 있을 때 index. 개별 UGC detail은 문서화된 품질/검토 기준 전 기본 noindex 가능; 삭제콘텐츠는 404/410+sitemap 제거.
- **search/filter/sort/pagination/query** — 의도적으로 큐레이션된 stable landing이 아니면 noindex/canonical. query parameter로 doorway page를 만들지 않는다.
- **login/signup/account/security/recovery/wallet/transfer/private business/bank/loan/portfolio/watchlist/alert/checkout/order/subscription/admin/moderation** — `AUTH_REQUIRED` 또는 `PUBLIC_NOINDEX`, sitemap 제외. robots.txt를 보안으로 사용하지 않는다.
- **test origin** — 전역 `X-Robots-Tag:noindex`, sitemap/indexing off. 현재 root smoke를 대표 public path까지 확장해 route-level 누락을 막는다.

필수 SEO backend 개발영역: safe public field만 갖는 `SeoMetadataReadModel`; Host header가 아니라 config public origin에 고정된 canonical builder; URL/byte limit을 지키는 sitemap index/shard generator; robots generator; schema allowlist 기반 structured-data serializer; loop/conflict 검증 redirect map; public image metadata service; crawler log classification; GSC/Naver ownership/config 상태; crawl/index/canonical/sitemap 오류수집; SEO operator dashboard/read API. Public SEO HTML cache key는 locale/content version을 포함하되 auth/session identity를 포함하지 않고 HTML/meta/sitemap/redirect invalidation을 일관되게 유지한다.

### 26.4 보안 위협 등록부 — v104 추가

| ID | 심각도 | 공격/전제/영향 | 예방통제 | 탐지/로그/알림 | 테스트/배포차단 | 잔여위험 |
| --- | --- | --- | --- | --- | --- | --- |
| SEC-104-01 | HIGH | BOLA/IDOR로 다른 사용자 object ID 치환해 holdings/session/order/report 조회·변경 | 모든 object read/write actor-scoped service/DB authz, client owner ID 불신 | route/object type 단위 authz denial, payload 비기록 | other-user negative test 필수, 실패시 차단 | 신규 object path의 누락 |
| SEC-104-02 | HIGH | credential stuffing/fixation/stolen session ATO | rate/abuse, auth/privilege session rotate, recent reauth, CSRF/cookie, provider link uniqueness | auth failure velocity/session rotation/high-risk audit | fixation/logout/reauth/OAuth state/nonce/PKCE, 실패차단 | 분산 저속공격/제공자 침해 |
| SEC-104-03 | HIGH | replay/concurrent economy request로 중복 WLD | idempotency+unique, DB transaction/lock, append-only ledger/reconciliation | duplicate/retry/concurrency/reconciliation alert | parallel/replay/ledger test, unexplained mismatch 차단 | 개별적으로 정상인 collusion |
| SEC-104-04 | HIGH | migration/auth/rollback 증거 없이 release | REL-104-02 release-evidence+immutable SHA+분리 test DB | SHA별 deployment evidence, missing/timeout alert | 각 gate 의도파손 시험, production-ready 미발행 | CI/GitHub 장애시 안전한 block |
| SEC-104-05 | MEDIUM | workflow action tag 이동/공급망 | 중요 action commit SHA pin, Dependabot/review, dependency audit/SBOM/provenance | update review/audit | workflow lint pin policy | 신뢰 upstream 자체침해 |
| SEC-104-06 | HIGH | upload/UGC polyglot/XSS/link/EXIF | decoded type, isolated storage, metadata strip, CSP/encoding, moderation | rejection/moderation metric | polyglot/XSS/link/unauth delivery | 새로운 social-engineering payload |
| SEC-104-07 | HIGH | admin/session으로 경제변조 | AdminSessionGuard+reauth+TOTP+DB actor+least privilege+preview+append-only audit | 고위험 action alert | role/reauth/TOTP/CSRF/mass/DB privilege | 단일 superadmin compromise |
| SEC-104-08 | MEDIUM/HIGH | analytics/ad/SEO에 private economy/security state 유출 | field allowlist/minimization/retention, token/balance/debt/security URL·JSON-LD 금지 | schema validator/outbound sampling/privacy complaint | payload+sitemap/JSON-LD scan, HIGH leak 차단 | 외부 processor 행위 |

기술통제 검증 기준은 OWASP ASVS 5.0.0을 사용하고, object authorization은 OWASP API Security API1:2023 BOLA를 직접 적용한다. 체크리스트 존재만으로 보안 준수 완료를 주장하지 않는다.

### 26.5 수익성·비용효율 모델

WLD-only sink는 실화폐 매출로 계산하지 않는다. **게임경제 활동**과 **인식 가능한 실제 매출**을 분리한다.

- **보안/QA/릴리스 거버넌스:** 사고 빈도/심각도, 운영 전 잡힌 실패, downtime, refund, fraud loss, support hours, restore/rollback time을 측정한다. 기본식은 `회피 기대비용 = 사고확률 변화×예상영향 + 다운타임/환불/지원/부정손실 절감`; 관측 전 임의 금액을 넣지 않는다.
- **SEO/content:** `organic CAC = 콘텐츠+SEO+도구 비용 / incremental organic D30 retained users`; organic visit→signup→activation→D7/D30→실 net revenue/retained value로 본다. URL 증가만 있고 D30이 늘지 않거나 crawl/index 품질이 악화되면 템플릿 확장 KILL/HOLD.
- **광고:** `net ad contribution = 광고매출 - ad-induced churn/session LTV 손실 - 광고 infra/privacy/support/fraud 비용`. D7/D30/CWV guardrail 안에서만 SCALE.
- **WLD 상점:** sink health, 실제 사용/전시, healthy repeat engagement, CS/fraud, concentration을 본다. WLD volume을 ARPU/real revenue로 부르지 않는다.
- **향후 실결제/구독:** displayed price, tax, processor/platform fee, refund/chargeback, content, entitlement/CS/moderation/fraud/infra, net revenue, contribution margin, attach/renewal/churn, CAC/LTV/payback의 낙관/기준/보수 표를 구현 전 작성한다. FTC 2026 집행 사례를 소비자보호 guardrail로 참고해 반복결제 주요조건 사전고지, 명시동의, 쉬운 해지를 릴리스 조건으로 둔다.
- **알림/커뮤니티/운영:** incremental retained user/session에서 provider/moderation/support/fraud 비용을 뺀 간접가치로 평가하며 open/post 숫자만 매출로 계산하지 않는다.

모든 실험은 최소 관찰기간/표본 충족조건을 정의한다. 작은 cohort에서는 되돌릴 수 있는 실험과 불확실성 표기를 유지하고 업계 benchmark를 Moneyverse 실측처럼 쓰지 않는다.

### 26.6 개발 backlog 및 수용 순서

1. **P0 / QA-104-01 / Frontend+Docs → API/DB QA → Web/Mobile E2E:** 무제한 전액보상 문구 제거, quota 정확표시, exact-SHA isolated DB matrix, 운영 smoke.
2. **P0 / REL-104-02 / DevOps+Backend+DB+QA:** migration parity/checksum, authenticated synthetic smoke, economy/reconciliation, rollback artifact를 검증하는 release-evidence를 `production-ready` 전 추가.
3. **P1 / REL-104-03 / Repository governance:** runtime-code required check/PR 강제, docs-only 자동화는 좁은 예외.
4. **P1 / Security:** 모든 object-ID endpoint inventory+BOLA negative test, auth/session fixation/rotation/logout/reauth, workflow action pinning 정책.
5. **P1 / SEO:** public SEO read-model/canonical/sitemap shard/redirect/serializer/GSC-Naver ingestion/privacy scan. QA-104-01 전 `/guide` acquisition 확장 HOLD.
6. **P1 / Backup:** destructive DB 변경 전 restore proof, RPO/RTO, migration parity, ledger reconciliation.
7. **P1/P2 / Monetization:** WLD economy와 revenue 분리, ad net contribution 계측, payment/subscription은 provider/legal/unit economics/receipt-webhook 계약 승인 전 구현 시작 금지.
8. **P2 / UX/접근성/성장:** P0/P1 이후 representative mobile/tablet/desktop, keyboard/focus/label/contrast/reduced motion, comeback/D1/D7/D30 검증.

실제 런타임 구현은 별도 흐름 `새 브랜치 → CI/static/unit/integration/실DB → immutable candidate → isolated exact-SHA → backend/API/DB/auth/user-flow/security QA → main 통합 → exact-main-SHA test gate → production-ready → GitOps 운영 → 운영 smoke/관측 → 필요시 rollback`을 따른다. 이 기획 자동화는 런타임 코드를 배포하지 않는다.

### 26.7 현재 런타임·QA 증거 스냅샷

- 시작/중간 `main`: `3bfa41ce6c251b707254c09f7c3504d1e5245d28`; 문서 반영 전 동시 변경 없음.
- 운영 public home, `/guide`, `/status` 접근 가능. status는 최신 snapshot에서 web/economy API/ledger DB 정상으로 표시했지만 authenticated QA 증거는 아니다.
- `/guide`에서 QA-104-01을 재현해 P0 OPEN 유지.
- 저장소 CI는 clean lint/typecheck/build, PostgreSQL migration/test, secret/control-byte guard, production dependency audit를 수행하고 candidate는 immutable SHA tag+SBOM/provenance+test ads/index off를 사용한다.
- Production release workflow는 exact test SHA, non-empty public catalog, root noindex를 검증한다. 더 넓은 Living Plan 증거와의 차이는 REL-104-02로 등록했다.
- GitHub branch metadata상 main은 protected지만 required status check enforcement가 off/empty. 시작 SHA legacy combined status는 `pending`이지만 status entry 0개였고 조회 가능한 PR-triggered workflow run도 0개였다. CI 성공을 주장하지 않으며 해당 증거는 partial/unavailable로 기록한다.

### 26.8 외부 레퍼런스 적용 — 2026-09-15 조회

- **Google Search Central canonical/crawling 최신 공식 가이드 — 직접채택:** canonical builder, redirect, sitemap, `rel=canonical`을 일관된 signal로 사용하며 절대명령으로 오인하지 않는다. 의미 있는 content update에 `lastModified`를 연결하고 핵심 의미를 crawl 가능한 HTML에 둔다.
- **Naver Search Advisor 최신 SEO/index/sitemap 가이드 — 직접채택:** 정확하고 고유한 title/description, 사용자에게 도움되는 콘텐츠, crawl 가능한 resource/link, sitemap/feed 제출, index quality 관측을 적용한다. thin query page 양산이 아니라 사용자/콘텐츠 품질 개선을 목표로 한다.
- **OWASP ASVS 5.0.0(2025-05-30 공개) — 검증 기준으로 직접채택.**
- **OWASP API Security API1:2023 BOLA 및 인증 guidance — 직접채택:** 모든 object에 서버 권한검증과 negative test, session/auth failure 통제를 요구한다.
- **FTC 2026 Shutterstock·Genesis Tech·Negative Option 관련 집행/검토 — 참고+직접 guardrail:** 향후 실제 반복결제가 생기면 주요조건 사전표시, 명시동의, 쉬운 해지를 요구한다. 특정 미국 규칙이 모든 Moneyverse 거래에 자동 적용된다고 단정하지 않는다.
- **플랫폼별 수수료/복구율 — 보류:** 실제 payment/app-store provider가 선택되고 당시 공식 계약을 검증하기 전 Moneyverse 확정 unit-economics 값으로 쓰지 않는다.

### 26.9 변경 기록 — v2026.09.15.104

- 직업 quota 공개문구 drift를 운영에서 다시 재현해 P0 OPEN을 유지했다.
- P0 release automation evidence 공백과 P1 branch required-check 공백을 재현/수정/QA/rollback 조건과 함께 추가했다.
- 인증, 경제, 상거래, 소셜, 앱 API, 관리자, 백업, 분석, 광고, SEO, 장애운영까지 근거기반 구현상태 표를 추가하고 증거가 부족한 영역은 완료로 추정하지 않고 UNVERIFIED로 명시했다.
- public route SEO/index matrix와 SEO backend 구체 컴포넌트를 추가했다.
- BOLA, 인증, 경제 replay, 릴리스, 공급망, 업로드, 관리자, 개인정보/분석을 포함한 보안 위협등록부를 추가했다.
- WLD sink와 실매출을 분리하고 retained value/contribution cost 기반 SCALE/HOLD/KILL 사업성 모델을 추가했다.
- 이번 문서 변경은 런타임 코드, DB, API, 인프라, branch 설정, 보안 구현을 변경하지 않는다.
