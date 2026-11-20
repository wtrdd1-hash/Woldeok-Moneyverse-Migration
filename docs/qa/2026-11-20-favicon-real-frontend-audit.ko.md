# 11월18일 디자인·파비콘·실제 프론트엔드 점검

**상태: 진행 중. 실제 운영 브라우저와 origin HTTP를 확인했다. 전체 기능 정상 또는 전 페이지 완료로 판정하지 않는다.**

## 기준
- 사용자 최종 지시: 11월18일 디자인, 운영 파비콘을 로고로 사용, 관리자 포함 확인, 실제 백엔드 활용, 고정 샘플 정보 금지, 발견한 백엔드 문제 해결.
- NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md 및 전체 페이지 반응형 디자인이 기준이다. 별도11월17일 원본 탐색은 최종 사용자 지시로 대체됐다.
- 파비콘 실제 제공 /favicon.ico와 /assets/mv39/favicon.ico는11,781바이트/SHA256 9ce0a8f10cafff52d1d2f7aa451b3e9162944162f61258842e13aa8546f98e78로 저장소와 동일하다.

## 운영 브라우저에서 확인한 결함
| ID | 우선순위 | 경로·재현 | 실제 결과 | 수정·검증 상태 |
|---|---|---|---|---|
| FE-01 | P1 | 홈 PC 로고 및 모바일 drawer | 파비콘 대신 SPAN W. head icon link 없음 | 공통 IMG 및 icon link 소스 수정, focused RED→GREEN. 운영 반영 전 |
| FE-02 | P1 | 홈 Invest 클릭→/stocks | 12,580WLD/+2.41% 및 예시 그래프. 실제 상장 조회 화면이 아님 | 실제 API 소비 native 화면 후보 추가, Test/운영 검증 전 |
| FE-03 | P1 | /shop 직접 접속 및 홈 Shop 이동 | 12,580WLD/-0.36%와 설계용 예시 고지. 상품 조회 화면이 아님 | 실제 공개 카탈로그 연결 후보 추가, 구매 완료 검증 아님 |
| FE-04 | P1 | /board | 같은12,580WLD 설계용 예시. 실제 게시판 기능 대신 시안 | 실제 게시글 조회 후보 추가. 글 작성/수정 QA 아님 |
| FE-05 | P1 | /quests | 같은12,580WLD 설계용 예시 노출 | OPEN. 실제 퀘스트 계약·영수증 연결 필요 |
| FE-06 | P1 | EN 홈→/wallet,/support,/account | 각기 다른 셸과 한국어 화면. /account는 로그인 수단 확인 불가인데 일반 회원 표시 | OPEN. 언어·프로필 미확인 표시·레이아웃 일관성 조사 필요 |
| FE-07 | P1 | /admin 실제 접속 | 비로그인 상태에서 로그인 페이지로 이동 | 정상 인증 경계. 로그인된 관리자 UI/데이터/조작은 미검증 |
| FE-08 | P1 | 관리자 소스 템플릿 sidebar/drawer | 별도 SPAN W 2곳 | 파비콘 소스 수정 및 회귀 검사. 운영 관리자 반영/로그인 후 검증 필요 |
| FE-09 | P1 | 공개 홈 시세의 모든 종목 보기 | API10개 중 홈8개는 의도적 미리보기이나 도착 페이지는 시안 | 전체 상장 조회 후보로 연결. 홈 미리보기8개를 전체10개로 오인하지 않는다 |

## 실제 원천 HTTP 점검
- 공개 stocks200/stocks배열10, shop public-catalog200/items배열146, board200/ok:true/posts배열2. 점검 시점 값이며 화면에 고정하지 않는다.
- 익명 auth session200/signedIn:false, wallet summary200/signedIn:false. 회원 잔액 검증을 했다는 뜻이 아니다.
- 익명 관리자 HTML /admin,/admin/users,/admin/economy,/admin/support는302로그인 이동 및noindex. 관리자 API /api/v1/admin/me,/users,/stocks,/feature-switches는401/no-store.
- HTTP200이나 샘플 라벨을 기능 정상 증거로 사용하지 않는다. API와 렌더링, 기능별 성공·실패 상태를 별도 확인한다.

## 소스 검증
- 파비콘 focused27건0실패. 신규 공개3경로/관리자 로고는4logicalRED 후38건0실패.
- 최신 전체 Spring546건0실패/0오류/0skip 및bootJar 성공. Gradle9→10 deprecation 및JDKnativeaccess 경고는 기존 빌드 경고이며 경고0건이라고 보고하지 않는다.
- 추가 기존 Node 검사18건 중13pass/5fail. 실패를 숨기거나 테스트를 완화하지 않았다.
- 실패명: grant review requires open backend admin security session and does not report fictitious payout; admin grants listing does not silently substitute successful mock approvals; citizen treasury claim never reports nonexistent wallet payout; grant application API does not claim acceptance from unsigned file writes; quant, warfare and derivatives must not falsely claim persistent executions.
- 앞4개는 기존 Next 지원금 코드의 로컬 파일 fallback/허위 성공 가능성이 포함되어 정밀 수정 대상이다. 마지막 테스트의 라벨 기대와 현재 기능 비활성화 구현 간 차이는 추가 분류가 필요하다. 해당Next파일과 테스트는 이번 native후보에서 변경하지 않았다. 금융/Next 경로 전환 승인 근거로 사용하지 않는다.

## 남은 검증
- [ ] 정확한 후보 Test에서320/390/1440·5개 언어·메뉴/키보드·입력/실패 동작
- [ ] 공개 기능 표시 행과 실제 API 응답 대조, 빈 데이터/장애에 가짜0·성공 없음
- [ ] 관리자 로그인 후 실제 원천·권한·재인증·메뉴 검증
- [ ] 미전환 경로의 디자인/언어/샘플 제거 및 백엔드 결함 수정
- [ ] 정확한main/CI/artifact·롤백·운영 확인

## 실제 관리자 로그인 후 추가 관찰
- 사용자 로그인 완료 후 운영 홈의 로그인 상태와 관리자 메뉴 진입을 직접 확인했다. 관리자35개 도구 경로를 실제로 열었다. 이것은35개 모든 버튼/금전성 변경이 성공했다는 뜻이 아니다.
- 관리자 홈의 검색 미일치0/35, 보안 분류6/35, 초기화35/35를 실제 조작했고 한국어 전환 및 영문 복귀도 확인했다. 시장 미리보기는7행이며 전체 시장10행과 구분된다.
- 390px로 고정한35경로에서 문서 가로 넘침은 발견하지 못했다. 초기319px 기본 창에서 일부320px 문서가1px 초과한 것은320px/390px 합격 여부와 분리했다. 내부 가로 스크롤 표/메뉴 자체를 문서 가로 넘침으로 오인하지 않는다.
- 관리자 하위 화면은 영문 단순 조회/기존 초록 Next 셸/신규 보라 홈 등 서로 다른 디자인을 사용한다. 전체11월18일 공통 셸 적용은OPEN이다.
- /admin/logs/system은 실제 브라우저에서 오류 참조3731540827의 로드 실패·자동 홈 이동 화면을 재현했다. 반면 같은 로그인 브라우저의 실제 /api/v1/admin/logs/system 응답은status:OK 및lines배열이다. 원시 로그·쿠키·CSRF·회원 정보를 문서에 복사하지 않았다.
- 호스트에 보관된 frontend-static/admin/logs/system.html 및 대응 index.html 모두 해당 오류 화면을 포함한다. 현재 오류 화면을 정상으로 제공하는 오래된 정적 캡처 경로가 확인됐다. 이를 원천 API의 실패라고 단정하지 않는다. 실제 native 로그 UI로 교체할 후속 대상이다.
- 연금/외환/예금보험/보안/전달 로그/회원 자금 흐름/콘텐츠/안전/API측정 화면에는 실패 안내로 보이는 문구가 탐지됐다. 각 문구의 원천 요청·현재 실패/설명문 여부를 별도 확정해야 하며 일괄 장애로 판정하지 않는다.

## 후보의 추가 제한
- /shop 후보는 원천146개 중 첫30개를 표시하는 기존 모듈을 사용한다. 전체 카탈로그 검색/구매/영수증 수용 검증 전 전체 상점 완료로 승격하지 않는다.
- /stocks 후보는 원천 시장10행과 회원 보유란을 구분한다. 주문·체결·차트·보유량의 인증 검증은 별도다.
- 실제320px 자동 브라우저 검사에서 공통 헤더3건의 로그인 버튼 밀림을 재현했으며 최소 CSS 수정을 진행했다. 최종 JAR 반복 검증 전PASS로 표시하지 않는다.
