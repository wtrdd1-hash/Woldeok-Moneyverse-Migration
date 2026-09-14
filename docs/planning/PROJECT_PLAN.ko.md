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

기능군별 상세표, SEO 경로 매트릭스, 보안 위협등록부, 수익성 모델, 개발수용순서는 v104에서 확정된 내용을 그대로 유지한다. 인증/세션, 계정/보안센터, 인벤토리/컬렉션, WLD 상점, 실결제/구독, 작업/직업/보상, 사업, 은행/대출, 가상주식/포트폴리오/알림/비교, 카지노/확률형, 커뮤니티, 친구/클럽/referral, 알림, 검색, 업로드, 공개콘텐츠, App API, 관리자/audit, 백업/복구, 분석/실험, 광고, SEO backend, 장애/status는 각각 서버 권위·권한·오류상태·DB 트랜잭션·보안/악용·SEO/index·KPI·사업성·QA/rollback을 가져야 한다. 본 v106은 그 계약을 약화시키지 않는다.

### 26.3 SEO 구현 매트릭스 및 SEO 백엔드 backlog

공개 `/`, `/guide`, `/status`, public news/season/collection/world guide, public-safe `/stocks/[symbol]`, moderation된 community index만 조건부 index 대상이다. 검색/filter/sort/query variant와 login/signup/account/security/recovery/wallet/transfer/private business/bank/loan/portfolio/watchlist/alert/checkout/order/subscription/admin/moderation은 noindex 또는 인증, sitemap 제외가 기본이다. 테스트 origin은 전역 noindex/ads-off를 유지한다.

SEO backend는 safe public field만 갖는 `SeoMetadataReadModel`, config public origin 기반 canonical builder, sitemap index/shard generator, robots generator, allowlist structured-data serializer, redirect map, public image metadata service, crawler classification, GSC/Naver 상태수집, crawl/index/canonical/sitemap 오류리포트, 운영 read dashboard/API를 개발영역으로 유지한다. Public cache에는 auth/session identity를 넣지 않는다.

### 26.4 보안·수익성·배포 계약 유지

OWASP ASVS 5.0.0과 API1 BOLA negative test, 인증 fixation/rotation/logout/reauth, 경제 idempotency/concurrency/reconciliation, upload/UGC 격리, admin reauth/TOTP/DB actor, analytics/ad/SEO 개인정보 allowlist, 공급망 검증을 유지한다. WLD-only sink는 실매출로 계산하지 않고 광고는 순기여, SEO는 organic D30 retained user 기준, 결제/구독은 provider/legal/unit economics/receipt-webhook 계약 승인 전 구현하지 않는다. 실제 런타임 구현은 `새 브랜치 → CI → immutable candidate → isolated exact-SHA → backend/API/DB/auth/user-flow/security QA → main → exact-main-SHA gate → Production → smoke/rollback`을 따른다.

## 27. 인증 개인정보 처리 정합성·로컬인증 릴리스 감사 — v2026.09.15.105

### 27.1 AUTH-105-01 — P0 OPEN / PUBLIC ROLLOUT HOLD

현재 `main`에는 local-email register/verify/login과 Argon2id/email-hash/token-hash 저장경로가 있지만 공개 web login/guide/privacy는 OAuth 중심이다. 개인정보처리방침/동의/version/retention/deletion/SMTP 처리사실과 exact-SHA QA가 실제 구현을 설명하기 전 신규 local registration을 새로 마케팅하거나 일반 공개하지 않는다. OAuth/local identity는 email 유사성만으로 자동 병합하지 않는다.

### 27.2 AUTH-105-02 — P1 TODO

`verify-email`은 one-time bearer token을 사용하는 cross-browser/no-cookie 성공 계약인데 canonical app-auth guide는 과거 prelogin cookie/CSRF 의존 설명이 남아 있다. 영·한 가이드/endpoint/schema/example을 controller와 동기화하고 same/cross-browser, invalid/expired/reused token, session rotation, old-client compatibility를 검증한다.

### 27.3 local-auth 보안·개인정보·SEO·사업성·QA 계약

- register/login은 prelogin+CSRF, verify-email은 short-lived single-use bearer token 권위다.
- token URL은 noindex/sitemap 제외, no-referrer, token 교환 전 광고·제3자 analytics 금지, query 로그 마스킹, 성공 후 clean token-free URL로 이동한다.
- register/login/verify는 각각 rate/abuse budget과 429를 가지며 숫자 threshold는 실제 config review에서 확정한다.
- product analytics는 pseudonymous coarse funnel만 허용하고 email/hash/password/verifier/token/cookie/CSRF/OAuth code는 제외한다.
- 사업가치는 incremental D30 retained value에서 SMTP/compute/DB/CS/fraud/privacy/security 비용을 차감하며 직접매출로 계산하지 않는다.
- GA 전 policy/consent, register retry/SMTP, cross-browser verification, replay/expiry/scanner, credential stuffing, session/logout, OAuth collision, raw-secret scan, deletion/cleanup, mobile docs, noindex/token, reversible new-signup rollback을 exact-SHA isolated test에서 통과한다.
- `QA-104-01`, `REL-104-02`는 P0 OPEN, `REL-104-03`은 P1 TODO로 계속 유지한다.

## 28. 독립 백업·복구 증거 및 데이터손실 방지 감사 — v2026.09.15.106

이 절은 v104/v105의 기능·보안·SEO·수익성·배포 계약을 약화시키지 않고 데이터손실/DB 무결성 우선순위를 강화한다. 이번 회차에서 가장 큰 신규 공백은 독립 재해복구 백업과 최근 성공한 전체 restore가 현재 증명되지 않는다는 점이다.

### 28.1 BAK-106-01 — P0 — OPEN / 파괴적 변경 차단

- **최초 근거:** 2026-09-09 생성되어 2026-09-15 재확인 시에도 OPEN인 GitHub issue #139. 당시 점검에서 지정 별도 백업 SSD `/mnt/backup`(`/dev/sda1`)이 read-only였고, 별도매체 최신 파일은 2026-09-07이었으며 Kubernetes 전환 후 해당 매체의 최신 자동백업은 관찰되지 않았다. 응급 PostgreSQL custom-format dump는 SHA-256과 `pg_restore -l`을 통과했지만 동일 시스템 디스크에 있어 독립 재해복구로 인정하지 않는다.
- **저장소 교차근거:** recovery DB worklog도 `moneyverse_recovery`가 빠른 논리복구/검사용이며 암호화 별도매체 백업을 대체하지 않는다고 명시한다. `docs/operations/backup-and-recovery.md`의 운영변경 전 암호화 DB/사진 백업 문구는 목표 운영계약이지 현재 독립복구 가능성을 증명하는 evidence 자체는 아니다.
- **영향:** PostgreSQL identity/session/economy 데이터, append-only 원장/파생잔액, inventory/entitlement, policy/audit, 필수 object/photo, 서비스 연속성, 분쟁/CS 증거가 host/storage 손실에서 복구되지 않을 수 있다.
- **원인 분류:** Kubernetes 이전 이후 legacy/host backup 경로가 바뀌었고, 마지막 직접 점검에서 지정 독립매체가 비정상이었으며, 현재 저장소 증거만으로 독립 backup + full restore drill 성공을 기계적으로 증명할 수 없는 운영복구 evidence gap이다.
- **즉시 규칙:** 최신 독립 복구경로가 검증되기 전 파괴적 또는 schema/data-changing Production 작업은 fail-closed로 차단한다. 문서-only 변경은 영향받지 않는다. 비파괴 runtime release를 별도 위험등급으로 허용하려면 명시 승인된 정책이 있어야 하며 DB 변경을 묵시적으로 예외처리하지 않는다.
- **migration:** 백업 evidence 자체에는 제품 migration이 필요하지 않다. evidence read-model이 새 schema를 요구하면 새 번호 migration과 least-privilege read 계약으로 추가한다.
- **rollback:** 앱은 last-known-good immutable application/GitOps 버전으로 되돌린다. 경제 데이터 수정은 가능한 경우 forward repair/보정거래를 사용하고, 운영 data restore는 승인된 restore scope로만 수행한다. 과거 ledger를 지우거나 수정해 rollback을 흉내내지 않는다.

### 28.2 RPO/RTO와 복구데이터 분류

- **RPO**(허용 가능한 복구시점 데이터손실)와 **RTO**(서비스 복구시간)를 명시적 승인 목표로 정의한다. 숫자는 서비스의 ledger/account/content 손실허용도, 복구비용, 운영역량을 근거로 결정하며 기획 자동화가 임의 숫자를 만들지 않는다.
- RPO는 단순 backup file 생성시각이 아니라 실제 restore 가능한 최신 시점으로 측정한다. RTO는 전체 recovery drill의 실제 경과시간으로 측정한다.
- 최소 복구대상: (1) 권위 PostgreSQL identity/economy/ledger/audit, (2) schema/migration/version manifest/checksum, (3) inventory/entitlement/content metadata, (4) 필요한 object/photo, (5) 해당 backup을 해석할 application/GitOps version. secret/key recovery는 별도 암호화 control plane으로 관리하고 backup 옆 plaintext secret에 의존하지 않는다.
- 같은 host/storage/failure domain 또는 같은 online credential에 의존하는 recovery DB/read replica/local dump는 **복구 편의수단**이지 독립 DR backup으로 계산하지 않는다.

### 28.3 백업 구조·권한·보존

1. primary host/storage와 함께 실패하지 않는 off-host NAS/remote object storage/기타 독립 failure domain을 수리·선정한다.
2. 전송/저장 암호화를 적용하고 key는 접근권한을 분리한다. key recovery도 정기적으로 시험한다. key와 raw credential을 일반 로그·public status·같은 비보호 archive에 두지 않는다.
3. backup identity는 export에 필요한 최소 읽기권한만 가진다. restore credential과 Production app credential을 분리한다. recovery 환경은 Production webhook/SMTP/Discord/ad endpoint를 상속하지 않는다.
4. authoritative PostgreSQL, 필요한 object/photo, source env/DB identity, app/GitOps version, migration list/checksum, backup format/tool version, 생성시각, backup ID, encryption/checksum/manifest, retention class를 함께 기록한다.
5. 승인 RPO/RTO에 따라 logical dump, physical base backup, continuous archiving/PITR 또는 조합을 선택한다. `pg_dump`/`pg_restore` 구조검증은 full restore를 대체하지 않는다. PITR을 사용하면 compatible manifest/checksum 검증과 필요한 WAL segment/recovery target 가용성을 증명한다.
6. retention에는 최소/최대 보유, 삭제권한, 용량 임계치, 삭제/변조 보호를 둔다. immutable/object-lock 방식이 적합하면 실제로 삭제차단과 복구를 테스트한다.

### 28.4 필수 isolated restore drill

백업은 다음 전 과정을 통과해야만 `VERIFIED_RESTORABLE`로 본다.

1. Production traffic과 완전히 분리된 clean recovery target 준비;
2. backup ID 선택 후 source env/DB identity, timestamp, format/tool version, retention 상태 검증;
3. checksum/manifest 및 decrypt/key availability 확인;
4. 빈 isolated DB로 PostgreSQL 전체 restore. PITR이면 목표시점과 WAL gap 부재 증명;
5. application version과 migration version/checksum/schema parity 확인;
6. least-privilege recovery/test DB role로 앱을 연결해 Production endpoint 없이 health/read smoke;
7. DB integrity/referential check와 안전한 대표 count 검증, 원시 개인정보는 로그로 출력하지 않음;
8. ledger 차변/대변, derived balance, 필수 economy invariant 대사. 원인불명 mismatch면 drill 실패;
9. inventory/shop entitlement/provenance와 변경된 고위험 기능 정합성 대표검증;
10. object/photo 대표 sample을 안전한 metadata/hash 방식으로 복원확인;
11. notification/webhook/Discord/email/ads/index가 off 또는 비운영 sink인지 확인;
12. 실제 restore duration, recoverable point, evidence ID, operator/audit ID, 실패/재시도/잔여위험을 기록하고 RPO/RTO와 비교;
13. 임시 recovery copy는 retention/privacy 정책에 따라 폐기/보관하고 disposal을 감사기록.

checksum-only, `pg_restore -l`-only, recovery replica 존재, 파일 존재만으로는 successful DR drill로 인정하지 않는다.

### 28.5 릴리스 evidence 연계

`REL-104-02`의 `release-evidence`는 파괴적/schema-changing Production 후보에 대해 다음 backup evidence를 소비해야 한다: candidate SHA, backup ID, source stack/DB identity, 생성시각, 독립 failure-domain 분류, encryption/key availability, checksum/manifest, restore drill ID/time/result, 달성 RPO/RTO 상태, migration parity, ledger/derived-balance reconciliation, 관련 object sample, rollback application/GitOps target, operator/audit ID, evidence freshness/expiry.

누락·stale·corrupt·wrong-environment·wrong-key·reconciliation 실패·WAL gap·미검증 상태는 모두 `BLOCKED`이며 skip-pass가 없다. 승인 recovery policy가 요구하는 고위험 migration은 정기백업이 RPO 안에 있더라도 직전 fresh backup을 요구할 수 있다.

### 28.6 보안·개인정보 위협등록부 추가

| ID | 심각도 | 시나리오/영향 | 예방·탐지 통제 | QA/배포 규칙 | 잔여위험 |
| --- | --- | --- | --- | --- | --- |
| SEC-106-01 | HIGH | backup/key 탈취 또는 plaintext 원격복사로 계정/경제/audit 노출 | encryption, key separation, least-privilege backup identity, access audit, secret-free logs | 승인 key restore, 미승인 identity 거부, plaintext artifact scan; HIGH leak면 차단 | storage와 key control plane 동시침해 |
| SEC-106-02 | CRITICAL/HIGH | 잘못된 환경으로 restore하거나 recovery app이 Production credential/endpoint를 사용해 덮어쓰기/외부 side effect | source/target identity, isolated namespace/DB, separate credential, non-Production outbound, impact confirmation | wrong-target/Production credential negative test; Production write 가능성이 있으면 차단 | privileged operator compromise |
| SEC-106-03 | HIGH | ransomware/운영오류가 primary와 backup을 같은 failure domain에서 삭제/변조 | independent/off-host copy, retention/delete separation, 가능한 tamper-resistant control, deletion audit | primary host-loss simulation 후 독립 restore | 독립성이 약하면 provider/region 상관장애 |
| SEC-106-04 | HIGH | corrupt/poisoned backup 또는 PITR WAL gap으로 false confidence | checksum/manifest/tool-version, 주기 full restore, WAL coverage, ledger/data reconciliation | corrupt/wrong checksum/missing WAL은 fail-closed+alert | 앱 수준 latent corruption이 정상 backup에 복제될 수 있음 |
| SEC-106-05 | MEDIUM/HIGH | backup·restore copy가 승인기간을 넘어 개인정보/경제 shadow dataset화 | retention/deletion policy, access log, isolated lifecycle, disposal audit, log 최소화 | retention/disposal test와 recovery-copy inventory | 법적 hold/offline copy로 lifecycle 복잡성 증가 |

backup path/provider ID/checksum/key/restore endpoint/상세 topology는 private 운영정보다. public status, SEO read-model, sitemap, structured data, 일반 analytics에 노출하지 않는다.

### 28.7 SEO·상태페이지 경계

- backup/restore/recovery/admin endpoint는 `AUTH_REQUIRED`, browser 노출 시 `noindex`, sitemap 제외. robots.txt를 보안경계로 쓰지 않는다.
- public `/status`에 backup health를 표시한다면 진실한 public-safe category와 age/timestamp 정도만 허용한다. storage path, hostname, DB name, key, checksum, object ID, WAL location, 내부 장애구조는 금지한다.
- recovery/test origin은 전역 noindex, ads-off를 유지한다. 임시 restore stack의 데이터가 crawler에 노출되지 않아야 한다.
- operational endpoint의 access/error log에는 secret query, signed URL, recovery credential을 남기지 않는다.

### 28.8 사업성·비용효율

백업/복구의 **직접매출은 0**이다. 사업가치는 데이터손실·다운타임·환불·fraud·CS·사고대응의 기대비용 회피와 검증된 빠른 복구다.

직접비용은 backup storage/retention/egress, encryption/key management, restore drill compute/storage, monitoring, operator hours, independent-media 유지비를 측정한다. 회피/완화비용은 permanent data loss, downtime, refund/compensation, fraud/dispute 증거손실, CS, incident-response labor, 신뢰/retained-user 가치손실을 포함한다. 기본식은 `회피 기대비용 = 사고확률 변화 × 예상사고영향 + 다운타임/환불/지원/부정/복구비용 절감`이며 관측 전 금액은 가설로 표기한다.

KPI: backup 성공률/실패, backup freshness, independent-copy coverage, verified restore 성공률, 실제 RPO/RTO, drill failure class, recovery refresh, checksum/manifest failure, key unavailable, PITR 사용 시 WAL gap, storage headroom, drill/operator cost. 승인 RPO/RTO/restore SLO를 합리적 비용으로 충족하면 `SCALE`, backup은 있으나 restore evidence/비용/자동화가 약하면 `ITERATE`, 증거 부족이면 파괴적 release `HOLD`, 독립복구가 불가능하거나 secret/privacy 위험이 큰 경로는 `KILL`한다.

### 28.9 QA·모니터링·rollback 수용조건

`BAK-106-01` 종료 전 다음을 모두 증명한다.

- 최신 backup과 독립 failure domain;
- encryption/key availability와 checksum/manifest;
- clean isolated target full restore;
- migration version/checksum parity와 least-privilege DB role;
- Production endpoint 없이 restored data 대상 app/backend smoke;
- ledger debit/credit 및 derived-balance reconciliation;
- inventory/entitlement, object/photo representative sample;
- stale/missing/corrupt backup, wrong key, storage-full, wrong-env, PITR 사용 시 WAL-gap fault injection과 fail-closed alert;
- last-known-good immutable app/GitOps rollback rehearsal;
- restore drill 실제시간과 승인 RPO/RTO 비교;
- secret-free alert와 temporary recovery data disposal.

알림은 stale/failed backup, checksum/manifest mismatch, decrypt/key failure, storage 부족, restore drill 실패, recovery refresh 실패, reconciliation 실패, PITR/WAL gap을 포함한다. alert storm은 dedupe하고 사용자/경제 payload가 아닌 safe evidence ID를 사용한다.

### 28.10 현재 증거 snapshot

- v106 문서작업 시작/중간 `main`은 `e1dce34cf3e7544d3bb3fe53a80caf992945a213`였고 v106 문서 commit 시작 전 외부 동시변경은 관찰되지 않았다.
- GitHub issue #139는 OPEN이며 마지막 직접근거인 read-only 지정 백업 SSD와 same-host emergency dump를 기록한다.
- 2026-09-12 recovery worklog는 `moneyverse_recovery`가 encrypted separate-media backup을 대체하지 않는다고 명시한다.
- 시작 SHA의 connected GitHub combined status는 individual status가 없고 사용 가능한 PR-triggered workflow lookup도 비어 있어 CI/test-server 성공을 주장하지 않는다.
- 이번 회차는 fresh Production `/status` 직접검증에 성공하지 못했고 과거 health snapshot을 현재 상태처럼 재사용하지 않았다. authorized remote device도 unavailable이므로 새 mount/Kubernetes/backup-job 점검을 주장하지 않는다.

### 28.11 외부 레퍼런스 적용 — 2026-09-15

- **PostgreSQL 최신 `pg_verifybackup` — 직접채택:** compatible physical backup에서 manifest/checksum 검증에 사용한다. PostgreSQL은 이것만으로 실제 복구 서버의 모든 동작을 보장할 수 없다고 명시하므로 full test restore는 계속 필수다.
- **PostgreSQL 최신 continuous archiving/PITR — PITR 선택 시 직접채택:** WAL availability/recovery target을 복구 evidence에 포함한다.
- **CISA StopRansomware — resilience 원칙 직접채택:** 가능한 경우 offline/independent + encrypted backup과 정기 availability/integrity DR test를 유지한다.
- **NIST SP 1339(2026-06-17) — 참고/운영원칙 채택:** backup을 change management, 정기 생성·시험·recovery exercise와 연결한다. Moneyverse를 OT system으로 정의한다는 의미는 아니다.
- v105의 OWASP/PIPC/Google/FTC 결정은 해당 범위에서 계속 유효하다.

### 28.12 우선순위·변경기록 — v2026.09.15.106

우선순위는 `BAK-106-01 P0 데이터손실 복구증거`를 최상단으로 올리고, 기존 P0 `AUTH-105-01`, `QA-104-01`, `REL-104-02`, 이어서 P1 `AUTH-105-02`, `REL-104-03`, BOLA/auth security matrix, SEO backend 및 남은 restore automation 순으로 관리한다. 데이터손실/DB무결성이 신규 기능·수익화보다 앞선다는 프로젝트 원칙을 적용한다.

- P0 `BAK-106-01` 독립 backup + full restore 증거 공백 추가.
- recovery convenience/read replica와 disaster-recovery backup을 명확히 분리.
- RPO/RTO governance, backup 권위/범위, independent failure-domain/encryption/key 통제, logical/physical/PITR 선택규칙, machine-readable release evidence 추가.
- migration/app/ledger/balance/inventory/entitlement/object 검증을 포함한 isolated restore drill 추가.
- backup 전용 보안·개인정보·SEO/status·사업성·QA·monitoring·rollback·fault-injection 계약 추가.
- `AUTH-105-01`, `QA-104-01`, `REL-104-02` P0 OPEN과 `AUTH-105-02`, `REL-104-03` P1 TODO 유지.
- v106 기획은 런타임 코드, DB 내용/schema, backup 장치, 인프라, secret, branch setting, 보안 구현을 직접 변경하지 않는다.
