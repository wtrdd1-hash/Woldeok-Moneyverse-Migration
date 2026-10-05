# SEO locale·사용자 획득 긴급 작업기록 — v2026.10.05.534

상태: 진행 중
시작일: 2026-10-05
기준 main: 5c497639a919a5adf1ef648eba07f08bf7cd45a7
브랜치: fix/seo-locale-conversion-v534

## 시작 기록
- 변경 전 AGENTS.md, PROJECT_MEMORY.md, 통합 implementation_plan.md, v527 SEO 수요 조사/명세, 최신 main을 다시 확인했다.
- 운영 증거: 루트 URL이 지역·쿠키에 따라 다른 언어 메타데이터/본문을 렌더링하면서 고정 locale canonical/hreflang을 광고할 수 있다.
- 소스 증거: DEFAULT_LOCALE이 en이며 proxy가 GeoIP/Accept-Language로 언어를 정하고 URL 이동 없이 detected cookie를 설정한다.
- 전환 증거: 홈에 회원가입을 직접 유도하는 핵심 CTA가 없고 계정 관련 동선이 로그인 중심으로 간접적이다.
- 외부 검색 증거: 일반 Moneyverse 브랜드 검색은 동명 서비스 경쟁이 강하므로 Woldeok 고유 브랜드와 고의도 금융도구 검색군을 분리 강화해야 한다.

## v534 수정 범위
1. 기본 locale을 한국어로 복구한다.
2. locale URL을 안정화한다. 루트는 한국어로 고정하고 신규 비한국어 지역 감지 방문자는 /en, /ja, /zh 명시 URL로 이동시킨다. 사용자가 직접 선택한 언어는 보존한다.
3. 안정 locale 라우팅과 한국어 기본값 회귀 테스트를 추가한다.
4. 검색도구 답변을 가입으로 가리지 않으면서 홈에 명확한 시작/가입 CTA를 추가한다.
5. SEO/단위/type/build 검증 후 테스트 호스트를 확인하고 성공 증거가 있을 때만 운영 승격한다.

## 중간 기록
- 작업 중 origin/main 재확인: 5c497639a919a5adf1ef648eba07f08bf7cd45a7로 변경 없음.
- 한국어 DEFAULT_LOCALE 및 루트→명시 locale URL 안정화 리다이렉트를 구현했다.
- 명시 locale prefix가 같은 요청의 rewrite 서버 컴포넌트에도 전달되도록 보강했다.
- 홈 획득 CTA 2개를 추가했다: 무료 회원가입, 가입 없이 도구 먼저 체험.
- locale 집중 회귀 테스트 10/10 통과.
- git diff --check 이상 없음. frontend typecheck/build gate는 mv-task로 실행 중이다.

## 최종 로컬 검증 기록
- locale 집중 테스트: 10/10 통과.
- 루트 workspace typecheck: contract, database, backend, frontend 모두 통과.
- frontend production build: 통과; 해당 정적 페이지 559개 생성 완료.
- 최초 build 시도는 worktree 밖 node_modules symlink 때문에 무효였고, 링크 제거 후 정상 worktree 설치/빌드가 통과했다.
- v534에는 DB migration이 없다.
- 다음 릴리스 단계: 브랜치를 push하고 Build Test Candidate가 exact SHA를 격리 Test에 검증/배포하도록 한 뒤 Test backend/frontend 및 SEO 동작을 확인하고 기존 무중단 운영 승격 gate를 따른다.
