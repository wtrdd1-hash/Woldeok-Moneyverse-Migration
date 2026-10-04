# Moneyverse 생애경제·사용자 경제세계 통합 명세

> 버전: v2026.10.04.526
> 상태: 권위 기획 후보 / 문서 전용
> 기준일: 2026-10-04
> 영어 원본: [LIFE_ECONOMY_USER_WORLD_SPEC.md](LIFE_ECONOMY_USER_WORLD_SPEC.md)
> 상위 권위: [PROJECT_PLAN.ko.md](PROJECT_PLAN.ko.md)
> 연동 권위: 중앙은행·조폐국·중앙국고·Economy Core, AI Economy Controller, Economy Simulation Tuning, Season System, Global Growth Execution, Treasury Recirculation
> 런타임 주장: 없음. 본 회차는 기획/문서만 변경한다.

## 0. 제품 핵심 정의

Moneyverse를 서로 떨어진 미니게임 모음이 아니라 **한 사용자가 하나의 가상 경제 인생을 지속적으로 살아가는 경제세계**로 재정의한다.

핵심 순환은 다음과 같다.

`일한다 → 월급/사업소득을 받는다 → 생활비·세금을 낸다 → 저축·대출·투자를 선택한다 → 기술을 키운다 → 회사에 취업하거나 사업을 만든다 → 경기와 정책 변화에 대응한다 → 순자산과 회복력을 높인다 → 더 많은 선택지를 연다`.

목표는 단순히 WLD를 많이 모으는 게임이 아니다. **경제적 선택, 성장, 회복, 사회적 협력, 학습, 재방문성**을 동시에 만드는 것이 목표다.

WLD는 끝까지 Moneyverse 내부의 비현금성·비환전성 게임/시뮬레이션 값으로 유지한다.

## 1. 절대 경계

1. WLD와 모든 점수·등급·자산은 서비스 내부 가상값이다.
2. 현금 환전, 외부 거래, 고정 실물가치, 현금 수익 보장, 실물 투자수익, 유료 베팅을 허용하지 않는다.
3. 세금·송금·예금·대출·사업대금·도시예산·일반 거래는 기존 WLD를 이동시킬 뿐 총통화량을 바꾸지 않는다.
4. 총 WLD를 바꾸는 권한은 기존 v523의 중앙은행 승인 + 조폐국 canonical 발행/폐기 경로만 가진다.
5. 은행·대출·신용점수·보험·채권·포트폴리오·급여·세금 UI는 반드시 **Moneyverse 시뮬레이션 기능**임을 알린다.
6. 한국에서는 게임 결과물의 현금성 환전·재매입·환전알선을 차단한다.
7. 번역 제공 여부와 법적 제공 가능 여부를 분리한다.
8. 광고는 기존 권위에 따라 지갑·대출·거래·보안 등 민감행동면에 배치하지 않는다.

## 2. 사용자 생애경제 상태

모든 사용자는 버전이 있는 `LifeEconomyProfile`을 가진다.

포함 항목:
- 생애 단계와 가상 거주 도시;
- 직업·회사·직급·직업기술;
- 기본급·성과급·사업소득;
- 주거비·생활비·재량소비;
- 세금·보조금·공공지출 수혜;
- 예금·저축목표·대출;
- Moneyverse 내부 신용점수·등급;
- 위험보호형 보험 시뮬레이션;
- 게임 내부 투자 포트폴리오;
- 사업체 소유·지분·직원 역할;
- 현금성 순자산·총순자산·현금흐름;
- 재무회복력;
- 커리어북·업적·시즌기록;
- 공개 프로필 개인정보 설정.

핵심 성장지표는 자산 하나가 아니라 아래 벡터다.

`순자산 / 잉여현금흐름 / 재무회복력 / 신용건전성 / 기술자본 / 사업건전성 / 경제평판 / 커리어성장`.

## 3. 기능 1 — 개인 경제 인생 시뮬레이터 [P0]

### 시작 경험
초기 사용자는 기대가치가 비슷하지만 성격이 다른 시작경로를 선택한다.
- 안정형 직장인
- 성장형 견습/신입
- 프리랜서/크리에이터
- 소상공인 준비형
- 공공서비스 직군

첫 5분 안에 반드시 한 번의 완전한 경제순환을 경험해야 한다.

`업무 완료 → 급여 → 생활비/세금 → 저축 또는 투자 선택 → 일일 결산`.

### 홈 대시보드
- 보유 현금
- 다음 급여일
- 예정 청구
- 예상 세금
- 대출 상환
- 저축목표
- 비상자금
- 현재 직업/사업 기회
- 오늘 할 일

### 주기적 사건
완전 랜덤 손실이 아니라 선택 가능한 경제 사건을 제공한다.
- 수리비/돌발비용
- 근무시간 감소
- 승진기회
- 교육비 부담
- 이직제안
- 타도시 취업제안
- 사업수요 급증/감소

### 재무회복력
실제 금융 신용점수 복제가 아니라 Moneyverse 고유 점수다.

구성요소:
- 비상자금으로 버틸 수 있는 기간
- 고정비 충당률
- 부채상환부담
- 소득다변화
- 저축 지속성
- 충격 흡수능력
- 목표달성률
- 연체/불필요 패널티 빈도

점수는 반드시 구성요인을 설명하고 실제 금융건전성을 의미하지 않는다고 표시한다.

## 4. 기능 2 — AI 개인 경제 비서 [P0/P1]

AI 개인비서는 **읽기·분석·설명·추천 계층**이다.

가능:
- 소비/현금흐름 요약
- 예정지출/상환 알림
- 여러 선택안 비교
- 유동성·부채·집중위험 설명
- Moneyverse 정책/경제뉴스 영향 설명
- 목표 추천

불가능:
- WLD 직접 송금
- 대출 직접 실행
- 자산 자동매매
- 급여/배당 변경
- 사용자 대신 투표
- 세율 변경
- 중앙은행/국고 명령
- 개인별 비공개 가격조작

실행 흐름:
`관찰 → 근거 설명 → 추천 → 가상 결과 비교 → 사용자 확인 → 규칙엔진 검증 → Economy Core 실행`.

모든 중요 추천에는:
- 근거 데이터;
- 전제;
- 불확실성;
- 예상 장점;
- 단점/위험;
- 아무것도 하지 않는 선택;
을 보여준다.

LLM 텍스트나 외부 콘텐츠는 권한을 부여할 수 없으며, 툴 권한은 allowlist·schema·최소권한으로 제한한다.

## 5. 기능 3 — 직업·회사 시스템 [P0]

### 직업 객체
- 직업군
- 요구기술
- 급여범위
- 업무량/활동비용
- 직업품질
- 승진단계
- 성과·학습지표
- 해고/사업위험
- 지역 보정
- 경기민감도

### 기술·이직
공통 전이가능 기술 + 직종 고유 숙련을 나눈다.

사용자는 교육비와 시간을 사용해 기술을 올리고 인접 직군으로 이동할 수 있다.

이직은 항상 상위호환이 아니라:
- 급여
- 안정성
- 성장성
- 교육기회
- 도시비용
사이의 선택으로 설계한다.

### NPC 회사
초기 경제의 일자리 공급과 신규 사용자 정착을 담당한다.

### 사용자 회사
조건을 충족하면:
- 창업
- 직원 채용
- 급여 지급
- 생산/서비스
- 재고
- 판매
- 세금·수수료
- 이익유보
- 배당
- 파산
을 경험한다.

회사는 장부 숫자만으로 WLD를 만들 수 없다. 급여·배당은 실제 회사 잔액에서 나가야 한다.

## 6. 기능 4 — Moneyverse 신용등급·대출 [P0/P1]

### 신용점수
실제 신용평가사의 점수를 복제하지 않는다. 혼동 방지를 위해 0~1000 Moneyverse 고유점수를 권장한다.

입력:
- 상환이력
- 부채상환부담
- 신용한도 사용률
- 계정/상환기록 길이
- 소득 안정성
- 유동성 비상자금
- 연체 이후 회복
- 확인된 부정사용 위험

금지 입력:
- 실제 민감 개인정보
- 보호특성
- 광고 클릭/시청
- SNS 인기
- 시뮬레이션 위험과 무관한 기기가격 등 대리변수

### 설명가능성
사용자는:
- 점수가 오른 이유
- 떨어진 이유
- 회복 가능한 방법
- 예상 회복기간
을 볼 수 있어야 한다.

한 번의 연체가 영구 낙인이 되지 않도록 영향이 점차 감소한다.

### 대출
초기 대출은 기존 v523대로 **사전재원형**이다. 새 돈을 만들지 않는다.

기본식:
`게임대출금리 = 정책기준 + 자금조달스프레드 + 위험스프레드 + 상품스프레드 - 관계할인`.

실제 금융 APR이 아니라 내부 시뮬레이션 공식이다.

최종 대출승인은 LLM이 결정하지 않는다.

## 7. 기능 5 — 은행 경쟁 시스템 [P1]

초기에는 5개 유형의 가상은행을 권장한다.
- 저수수료 생활은행
- 고금리 디지털 저축은행
- 중소사업 특화은행
- 담보·안정형 은행
- 지역/커뮤니티 은행

경쟁항목:
- 예금금리
- 사전재원 대출금리
- 수수료
- 가입조건
- 등급혜택
- 고객서비스
- 사업자 지원

정책금리, 은행자금수요, 신용위험, 경쟁상태에 따라 bounded formula로 금리가 움직인다.

현 v523에서는 예금이 신용창조 권한을 만들지 않는다. 부분지급준비식 통화창조는 별도 승인 전 금지한다.

사용자 은행 창업은 P2 이후 별도 연구로 분리한다.

## 8. 기능 6 — Moneyverse 경제 뉴스 [P0/P1]

뉴스 소재:
- 중앙은행 금리결정
- 국고 예산
- 도시 공공사업
- 기업 실적
- 채용/감원
- 생활비/물가지수
- 신용여건
- 경기변화
- 시즌 경제충격

생성 흐름:
`이벤트 원장 → 사실 데이터 생성 → 템플릿/LLM 문장화 → 사실검증 → 게시`.

AI가 존재하지 않는:
- 정책결정
- 기업실적
- 가격변동
- 경기상태
를 만들어내면 안 된다.

모든 중요 기사에는 원본 이벤트 ID를 연결한다.

개인화 피드는 noindex. 검색용 공개페이지는 개인정보 없이 독립적 정보가치가 있는 설명·통계 페이지에 한한다.

## 9. 기능 7 — 경기순환·경제위기 Live Event [P1]

경제세계 상태:
- 성장기
- 성숙성장
- 둔화
- 침체
- 회복
- 인플레이션 충격
- 디플레이션 위험
- 공급충격

상태전환은 순수 랜덤이 아니라:
- 통화유통
- 소비
- 기업수익
- 고용
- 물가
- 대출조건
- 국고상태
를 활용한 규칙·확률모델로 결정한다.

영향:
- 일자리
- 급여상승률
- 매출
- 금리
- 생활비
- 파산위험
- 국고지원
- 인기 직업

경제위기 때문에 신규 사용자가 영구적으로 진행불능이 되면 안 된다. 회복경로를 반드시 제공한다.

## 10. 기능 8 — 지역·도시 경제 [P1/P2]

도시별 지표:
- 임금지수
- 주거비지수
- 제한된 세율/수수료 보정
- 핵심산업
- 채용구조
- 물류비/투입비
- 인프라 점수
- 공공서비스
- 지역예산
- 인구/활동압력

이사 전에:
- 예상 급여
- 예상 주거비
- 세금
- 일자리
- 사업환경
- 이사비
를 비교한다.

한 도시가 모든 지표에서 영구 우위가 되면 안 된다.

한국/미국/일본 실제 제도를 그대로 복제하기보다 **경제특성을 참고한 가상도시**로 만든다.

가상 거주지역과 실제 법적 관할·언어설정은 분리한다.

## 11. 기능 9 — 사용자 사업·상점 [P0/P1]

순환:
`자본 → 원재료/서비스투입 → 생산 → 판매 → 급여/세금/수수료 → 영업이익 → 재투자/배당`.

초기 업종:
- 소매
- 제작/제조
- 음식/서비스 추상화
- 물류
- 미디어/콘텐츠
- 전문서비스
- 지역 인프라 계약업

사업 대시보드:
- 매출
- 원가
- 매출총이익률
- 급여
- 임대·물류비
- 세금
- 영업이익
- 현금 runway
- 재고회전
- 고객집중도

악용방지:
- 가장매매
- 순환거래
- 자기거래
- 담합가격
- 다계정 보조금 파밍
을 탐지한다.

## 12. 기능 10 — 공공사업 투표·참여예산 [P1]

중앙국고/도시는 **이미 확보된 WLD** 중 일부를 시민참여예산으로 책정한다.

후보:
- 교통·물류
- 직업교육
- 실업지원
- 도시행사
- 중소사업 지원
- 공공편의시설

규칙:
- 사전재원 범위만 사용
- 투표가 조폐명령을 만들 수 없음
- 제안 적격성/이해충돌 사전검토
- 비용과 예상효과 공개
- Sybil 방지
- 투표결과 공개
- 집행단계 추적
- 법/보안/경제불변식 위반 시에만 운영자 거부 가능, 이유 공개

인기투표만으로 끝내지 않고 결과평가까지 연결한다.

## 13. 기능 11 — 경제 업적·커리어북 [P0]

기록 예:
- 첫 월급
- 첫 세금
- 첫 비상자금
- 첫 대출완납
- 첫 승진
- 첫 월 흑자
- 첫 회사
- 첫 직원
- 경기침체 생존
- 연체 후 신용회복
- 첫 이사
- 공공사업 참여
- 시즌 주요기록

절대부자만 보상하지 않는다. **개선·회복·지속성·참여**를 업적의 중심으로 둔다.

## 14. 기능 12 — 경제 시즌 [P1]

기존 Season System을 재사용한다.

6~8주 단위:
- 시즌 거시경제 테마
- 개인목표
- 사업목표
- 사회목표
- 선택형 경쟁리그
- 프로필/배지/역사기록 보상
- 후발주자 catch-up

시즌이 끝나도:
- 본자산
- 부채
- 회사소유
- 신용기록
- 커리어기록
을 초기화하지 않는다.

초기화는 시즌 랭크와 시즌 전용 진척만 한다.

## 15. 기능 13 — 친구 공동사업 [P1/P2]

2~5명 공동사업.

필수:
- 출자원장
- 지분
- 역할/권한
- 급여
- 배당
- 지출승인한도
- 대표변경
- 장기미접속자 처리
- 지분매각/탈퇴
- 분쟁감사기록

고액행동은 다중승인.

CEO 한 명이 회사돈 전액을 가져갈 수 없게 한다.

## 16. 기능 14 — 경제 라이벌·공정 리그 [P1]

비슷한 성장단계끼리 매칭한다.

시즌별 지표:
- 순자산 증가율
- 저축 지속률
- 사업마진 개선
- 재무회복력 개선
- 기술성장
- 부채감소
- 공공기여

절대자산순위는 기본랭킹에서 제외한다.

담합·가장거래·부계정·의도적 자산이전은 무효처리한다.

## 17. 기능 15 — 30초~2분 초단기 경제 콘텐츠 [P0]

오늘 화면:
1. 경제 브리핑
2. 예정 청구/상환
3. 업무·사업 결과
4. AI 추천 한 가지
5. 오늘의 경제 선택
6. 사업 긴급알림
7. 시즌/투표 진행

짧게 접속해도 가치가 있어야 하지만, 하루에 여러 번 접속하지 않으면 손해보는 강박구조는 만들지 않는다.

가짜 카운트다운과 과도한 FOMO를 금지한다.

## 18. 기능 16 — 오늘의 경제 선택 [P0]

예:
- 교육을 받을까 현금을 보유할까
- 고연봉+고해고위험 직장을 갈까
- 고정/변동 게임대출을 고를까
- 월세 유지 vs 이사
- 재고할인 vs 보유
- 도시지원사업 선택

결과 범위와 불확실성을 사전에 보여준다.

다음날 결과는 저장된 규칙과 경제상태에서 계산한다. 사용자의 선택 이후 불리하게 결과를 조작하지 않는다.

도박기능이 아니라 **교육·온보딩·리텐션 기능**이다.

## 19. 기능 17 — 경제 타임머신·샌드박스 [P0/P1]

실계정에 반영하지 않는 counterfactual simulator.

시나리오:
- 30/90/365일 저축 확대
- 대출 조기상환
- 투자비중 조정
- 도시 이동
- 이직
- 직원 채용
- 판매가격 변경
- 실직/인플레이션/금리상승 스트레스

결과:
- baseline
- scenario
- delta
- assumptions
- uncertainty
- risk flags

### 공개 SEO 유틸리티
- 복리 계산기
- 대출 상환 계산기
- 인플레이션 구매력 계산기
- 급여/예산 시뮬레이터
- 사업마진 계산기

검색유입용 페이지는 반드시 실제 계산기능·원본 설명·투명한 공식·현지화·품질게이트를 갖춘다.

키워드 수만 늘리기 위한 얇은 페이지 대량생성을 금지한다.

## 20. 기능 18 — 공개 경제 프로필 [P1]

기본값은 비공개. 사용자 opt-in만 허용한다.

공개 가능:
- 직업 archetype
- 도시
- 업적 수
- 회사 수
- 리그 티어
- 자산 percentile 범위
- 선택배지
- 재무회복/신용 coarse tier

공개 금지:
- 정확한 잔액
- 정확한 부채
- 거래내역
- 민감행동
- 비공개 회사·직원정보

공개 ID는 철회가능해야 하고 검색색인 여부도 별도로 제어한다.

## 21. 일·주·월 경제 루프

### 매일
- 직업/사업 결과
- 생활비/예정지출
- 브리핑
- 오늘의 선택
- 짧은 성장행동

### 매주
- 급여/사업결산
- 신용 업데이트
- 라이벌 상태
- 공공사업/시즌 상태
- AI 비서 리뷰

### 월/시즌
- 세금·재정 정산
- 순자산·재무회복 보고서
- 회사 재무제표
- 도시/거시경제 업데이트
- 시즌 마일스톤

테스트에서는 실제 30일을 기다리지 않도록 시뮬레이션 시간을 설정할 수 있어야 한다.

## 22. 데이터 모델

제안 테이블:
- `life_economy_profiles`
- `life_economy_snapshots`
- `employment_contracts`
- `job_postings`
- `skill_profiles`
- `companies`
- `company_members`
- `company_financial_snapshots`
- `bank_products`
- `bank_rate_snapshots`
- `credit_profiles`
- `credit_factor_events`
- `funded_loan_accounts`
- `loan_payment_schedules`
- `living_cost_obligations`
- `city_economies`
- `city_metric_snapshots`
- `economic_world_states`
- `economic_event_instances`
- `economic_news_items`
- `public_project_proposals`
- `public_project_votes`
- `public_project_execution`
- `career_book_entries`
- `economic_achievements`
- `daily_economic_choices`
- `daily_choice_results`
- `counterfactual_scenarios`
- `public_economic_profiles`
- `ai_personal_advice_records`

모든 경제 write는 canonical ledger transaction ID를 참조한다. 파생테이블은 통화의 원장이 될 수 없다.

## 23. API 경계

예시:
- `GET /life-economy/summary`
- `GET /life-economy/cashflow`
- `GET /jobs`
- `POST /jobs/:id/apply`
- `GET /companies/:id`
- `GET /banks/products`
- `GET /credit/profile`
- `POST /loans/:productId/simulate`
- `POST /loans/:productId/apply`
- `GET /economy/news`
- `GET /cities`
- `POST /cities/:id/move-preview`
- `GET /public-projects`
- `POST /public-projects/:id/vote`
- `GET /career-book`
- `GET /daily-choice`
- `POST /daily-choice/:id/answer`
- `POST /time-machine/simulate`
- `GET/PUT /public-economic-profile`
- `POST /ai/personal-economy/advice`

상태변경 API는 인증·권한·idempotency·불변식검증·감사·canonical settlement를 거친다.

## 24. AI 권한표

### 자동 가능
- 요약
- 내부 사실분류
- 고정사실 기반 설명
- 추천안 작성
- 뉴스 문장 초안
- 승인된 일일선택 템플릿 선택

### 사용자 확인 필수
- 송금
- 구매
- 투자
- 사업지출
- 대출
- 이사
- 이직
- 공공투표

### AI에 위임 금지
- 발행/폐기
- 통화정책 승인
- 국고예산 승인
- 최종 신용승인
- 원장 우회
- 보안/권한 우회
- 법적 관할 판정

## 25. 악용방지·공정성

필수 탐지:
- 가장매매·순환거래
- 대출 돌려막기형 조작
- 다계정 급여·보조금 파밍
- 투표 Sybil
- 리그 담합
- 허위 급여
- 중복/재실행 결제
- 시장조작

사용자 제재는 설명·이의제기 경로를 가진다.

일반 사용자 경제를 악용자 때문에 일괄 악화시키지 않는다.

## 26. KPI

핵심:
- 첫 생애경제 순환 완료자의 D1/D7/D30
- 주간 의미있는 경제결정 수
- 양의 잉여현금흐름 사용자 비율
- cohort별 재무회복력 개선
- 직업/기술 성장
- 사업 7/30/90 시뮬레이션 생존율
- 정상 대출 상환율
- 기능다양성
- 공동사업 retention lift
- 공공사업 참여율
- 공개 계산기 → 가입전환
- 공유카드 → 유효가입

가드레일:
- 신규 사용자 파산/softlock
- 부의집중 가속
- 불만/지원요청
- 오탐제재
- AI 추천거절률
- 대출 직후 급연체
- 과도한 접속강박 지표
- SEO thin-page 실패

## 27. 출시 단계

### Phase A — P0 생애기반
개인 프로필, 급여·생활비, 기본 직업, 커리어북, 오늘의 선택, 초단기 홈, 타임머신 v1.

### Phase B — 금융
신용프로필, 사전재원 대출, 2~3개 가상은행, 읽기/추천 전용 개인 AI.

### Phase C — 생산경제
사용자 회사·상점, 급여, 재무제표, 경제뉴스.

### Phase D — 경제세계
도시, 경기순환, 경제위기, 공공사업, 공정리그, 시즌연동.

### Phase E — 소셜·글로벌
공동사업, 공개경제프로필, 공유카드, SEO 계산기, 다국어 도시/은행.

모든 단계는:
`신규 브랜치 → 격리 Test → 백엔드/DB/API/UI 검증 → 전체 라우트 QA → 무중단 Production 승격`.

v526 문서작성만으로 구현 완료를 주장하지 않는다.

## 28. 국내/해외 별도 기획

### 국내
- 제품/public fallback은 한국어.
- WLD 환전·현금화를 금지.
- 가상 은행·신용·대출을 실제 금융상품처럼 표시하지 않는다.
- 우연성이 경제가치와 결합하는 기능은 별도 게임물/법률 검토.
- 공개프로필 기본 비공개.
- 금융교육형 공개도구에도 Moneyverse 시뮬레이션 표시.

### 해외
- 국가별 법률·콘텐츠·UX 준비 후 locale 단위 출시.
- IP 강제전환 금지, 별도 URL + hreflang.
- 실제 각국 세법/대출제도를 정확히 재현한다고 주장하지 않는다.
- 관할별 feature flag 적용.
- 내부 신용점수를 실제 bureau score로 표현하지 않는다.
- 실제 보험예금·실제 투자 등 오해 가능한 표현은 법적으로 사실인 경우 외 금지.

## 29. UX·접근성

- 모든 점수·금리는 "왜?"를 설명한다.
- 색상만으로 위험/성공 구분 금지.
- 모바일에서는 현금흐름·부채·사업건전성을 카드로 제공.
- 키보드·스크린리더·visible focus.
- 차트는 텍스트 요약 제공.
- 초보자는 오늘 할 일 중심, 고급사용자는 원장·상세재무 제공.
- 저신용·부채·사업실패에 수치심을 주는 표현 금지.
- 회복경로를 항상 노출한다.

## 30. 참고 근거

### 금융역량·재무회복
1. CFPB Financial Well-Being Scale — https://www.consumerfinance.gov/data-research/research-reports/financial-well-being-scale/
2. CFPB Financial well-being resources — https://www.consumerfinance.gov/consumer-tools/educator-tools/financial-well-being-resources/
3. World Bank Financial Capability — https://responsiblefinance.worldbank.org/en/responsible-finance/financial-capability

### 은행·신용·통화전달
4. BIS New forms of money and monetary-policy transmission (2026) — https://www.bis.org/speeches/20260622-new-forms-money-and-transmission-monetary-policy
5. BIS Digitalisation of banking and deposit pricing (2026) — https://www.bis.org/publications/working-paper-1357-digitalisation-banking-and-social-media-implications-deposit-pricing
6. BIS How central banks influence interest rates — https://www.bis.org/speeches/20151002-how-central-banks-influence-interest-rates
7. IMF Financial Structure, Bank Lending Rates and Monetary Transmission — https://www.imf.org/en/publications/wp/issues/2016/12/30/financial-structure-bank-lending-rates-and-the-transmission-mechanism-of-monetary-policy-1081
8. myFICO Payment History — https://www.myfico.com/credit-education/credit-scores/payment-history
9. myFICO New Credit — https://www.myfico.com/credit-education/credit-scores/new-credit

### 고용·기술·기업
10. ILO Employment and Social Trends 2026 — https://www.ilo.org/publications/flagship-reports/employment-and-social-trends-2026
11. ILO Job quality dimensions — https://www.ilo.org/resource/news/job-quality-concern-all-workers-0
12. OECD Occupational mobility, skills and training needs — https://www.oecd.org/en/publications/occupational-mobility-skills-and-training-needs_30a12738-en.html
13. OECD SMEs and entrepreneurship — https://www.oecd.org/en/topics/smes-and-entrepreneurship.html
14. OECD Business Dynamics and Productivity — https://www.oecd.org/en/publications/business-dynamics-and-productivity_9789264269231-en.html
15. World Bank Jobs — https://www.worldbank.org/ext/en/jobs
16. World Bank Entrepreneurship trends 2026 — https://blogs.worldbank.org/en/psd/a-global-snapshot-of-entrepreneurship-trends

### 도시·참여예산
17. OECD Regions and Cities at a Glance — https://www.oecd.org/en/publications/oecd-regions-and-cities-at-a-glance-2022_14108660-en.html
18. OECD What Works for Inclusive Growth in Cities (2026) — https://www.oecd.org/en/publications/2026/06/what-works-for-inclusive-growth-in-cities_aee775c0.html
19. World Bank Building Productive Cities (2026) — https://data360.worldbank.org/en/atlas/urban-development/
20. OECD Guidelines for Citizen Participation — https://www.oecd.org/en/publications/2022/09/oecd-guidelines-for-citizen-participation-processes_63b34541.html
21. Participedia Participatory Budgeting cases — https://participedia.net/search?layout=list&query=Participatory+Budgeting&selectedCategory=case

### 리텐션·진행
22. GameAnalytics Retention — https://docs.gameanalytics.com/products-and-features/analytics-iq/engagement-tools/retention/
23. GameAnalytics Progression Events — https://docs.gameanalytics.com/events-metrics-and-filtering/event-types/progression-events/
24. GameAnalytics Metrics — https://docs.gameanalytics.com/events-metrics-and-filtering/metrics/

### AI 거버넌스·보안
25. NIST AI RMF Core — https://airc.nist.gov/airmf-resources/airmf/5-sec-core/
26. NIST AI RMF FAQ — https://www.nist.gov/itl/ai-risk-management-framework/ai-risk-management-framework-faqs
27. OECD.AI trustworthy AI — https://oecd.ai/en/one-ai-working-group-implementing-trustworthy-ai
28. OWASP GenAI Excessive Agency — https://genai.owasp.org/llmrisk/llm062025-excessive-agency/

### 글로벌 SEO
29. Google multilingual/multi-regional sites — https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
30. Google hreflang/localized versions — https://developers.google.com/search/docs/specialty/international/localized-versions
31. Google generative-AI content guidance — https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
32. Google spam/scaled content policy — https://developers.google.com/search/docs/essentials/spam-policies

### 국내 법적 경계 확인자료
33. 게임산업진흥에 관한 법률 제32조 — https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1032690633
34. 게임산업진흥에 관한 법률 제2조 — https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1028311545
35. 가상자산 이용자 보호 등에 관한 법률 제2조 — https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1024562465
36. 전자금융거래법 제2조 — https://law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1024558603

위 자료는 제품 설계·안전경계의 근거이며 개별 구현의 법적 적합성을 확정하는 법률자문을 대신하지 않는다.

## 31. 기획 완료 기준

v526는 다음을 만족해야 한다.
- 승인된 18개 기능 전부의 범위와 우선순위 정의;
- v523 통화·재정 불변식 유지;
- AI 권한·승인경계 정의;
- 데이터/API/KPI/악용방지 정의;
- 국내/해외 별도 기획;
- P0/P1/P2 단계 정의;
- 영문 원본과 한국어 동기화;
- PROJECT_PLAN 및 통합마스터 채택;
- 시작/중간/종료 기록 및 내부/GitHub 업데이트 내역;
- 구현·Test·Production 완료를 허위 주장하지 않음.
