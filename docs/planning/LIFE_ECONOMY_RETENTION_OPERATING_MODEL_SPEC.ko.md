# Moneyverse 장기 리텐션 제품 운영모델 상세 명세

> 버전: v2026.10.04.528
> 상태: 권위 기획 후보 / 문서 전용
> 기준일: 2026-10-04
> 영문 원본: [LIFE_ECONOMY_RETENTION_OPERATING_MODEL_SPEC.md](LIFE_ECONOMY_RETENTION_OPERATING_MODEL_SPEC.md)
> 상위 명세: [LIFE_ECONOMY_USER_WORLD_SPEC.ko.md](LIFE_ECONOMY_USER_WORLD_SPEC.ko.md), [LIFE_ECONOMY_RETENTION_CONTINUITY_SPEC.ko.md](LIFE_ECONOMY_RETENTION_CONTINUITY_SPEC.ko.md)
> 런타임 주장: 없음

## 0. 목적

v528은 v527의 장기 리텐션 원칙을 실제 구현 가능한 운영모델로 내린다.

정의 범위:
- 정확한 사용자 생애주기 상태
- 해금 조건
- 홈 화면 정보구조
- 목표/기회 추천 규칙
- 경제성장 속도
- 미접속 보호
- 복귀 알고리즘
- 직업·사업·도시·소셜·시즌 성장
- 콘텐츠 운영주기
- 알림 정책
- 관리자 LiveOps
- 실험/분석
- DB/API
- 접근성·개인정보·국내/해외 차이

목표는 접속횟수 극대화가 아니라 **사용자가 다시 왔을 때 항상 이해할 수 있고, 진행 중인 의미있는 일이 있으며, 이전 선택이 현재에 연결되고, 다음 성장경로가 보이는 것**이다.

## 1. 사용자 생애주기 상태머신

기본:
`NEW → ACTIVATED → EXPLORING → ESTABLISHED → CONNECTED → INVESTED → VETERAN`

휴면 분기:
`활성상태 → AT_RISK → DORMANT → RETURNING → REACTIVATED → 기존/조정 활성상태`

### NEW
조건:
- 계정은 생성됨
- 첫 인생루프 미완료

종료:
- 시작경로 선택
- 첫 경제사이클 완료
- 첫 목표 수락/생성

### ACTIVATED
첫 세션~약 D3.

필수:
- 커리어북 기록 1개
- 첫 현금흐름 요약
- 다음 목표 1개
- 미래기회 preview 1개

### EXPLORING
대략 D2~D14.

필수 경험:
- 직업/저축/기술/도시/사업/공공 중 2개 이상
- 지연결과 선택 1개
- 경제뉴스/세계변화 1개
- 선택형 소셜노출 1회

### ESTABLISHED
대략 D7~D45.

신호:
- 반복 직업/사업패턴
- 개인 경제전략
- 주간명세 열람
- 중기목표 진행

### CONNECTED
의미있는 social edge 또는 도시/공공기여 경로 형성.

솔로 사용자는 CONNECTED 없이 ESTABLISHED → INVESTED 가능.

### INVESTED
- 30일 이상 목표
- 충분한 커리어북
- 사업/전문화/도시기여 등 장기경로

### VETERAN
계정 나이만으로 부여하지 않음.

조건 후보:
- 여러 시즌
- 마스터리/기여
- 장기 경제기록
- legacy 경로

## 2. 생애경제 홈 IA

홈은 기능목록이 아니다.

순서:

### A. 복귀요약
의미있는 변화 있을 때만.
- 바뀐 것
- 이유
- 행동 필요 여부

### B. 오늘
최대 3카드:
1. 처리 필요
2. 가장 좋은 다음 성장행동
3. 새 기회

### C. 목표 스택
- 오늘
- 주간
- 시즌
- 장기

각 1개 대표목표.

### D. 경제 스냅샷
- 유동 WLD
- 잉여현금흐름
- 다음 의무
- 회복력
- 신용건전성
- 직업/사업상태

### E. 세계
- 중요뉴스 1개
- 도시상태
- 시즌상태

### F. 사회/공공
- 파트너
- 공공사업
- 라이벌/멘토

카드당 주요 CTA는 1개.

## 3. Quick Session

30초~2분.

흐름:
1. 복귀요약
2. 결과확인
3. 저마찰 행동 하나
4. 목표진행 확인
5. 다음 상태를 알고 종료

Quick에서 복잡한 대출·사업설정·포트폴리오 변경은 하지 않는다.

## 4. Normal Session

5~15분.

일반:
- 오늘 경제 확인
- 직업/사업 행동
- 기술/목표 진행
- 기회 하나 처리
- 사회/세계 하나 확인

## 5. Deep Session

20분+.

- 사업최적화
- 이사계획
- 타임머신
- 다중목표
- 회사거버넌스
- 시즌전략
- 상세명세서

사용자가 모드를 선택할 수 있다.

## 6. 단계적 해금

### 첫 세션
- 오늘
- 돈
- 직업
- 목표
- 커리어북

### 첫 경제사이클 완료
- 기술
- 저축목표

### 첫 주간리뷰 또는 의미있는 세션 3회
- 신용건전성 preview
- 도시 preview
- 오늘의 선택

### 안정성 gate 후
- 대출 시뮬레이션
- 투자기초
- 사업 preview

### 사업 해금 조건 예시
- 의미있는 세션 3+
- 안정소득 또는 창업 스타터경로
- 튜토리얼
- 악용검사

실제시간 기다림 자체를 해금조건으로 사용하지 않는다.

### 소셜
개인경제를 이해한 뒤 노출.

## 7. 시작 인생경로

### 안정 직장인
- 예측 가능한 월급
- 낮은 변동성
- 느린 기술가속

### 견습/성장
- 초기급여 낮음
- 기술성장 빠름
- 승진기회 많음

### 프리랜서/크리에이터
- 변동소득
- 유연성
- 예산관리 중요

### 소상공인/창업
- 사업 조기노출
- 높은 현금흐름 변동
- 초기 안전망

### 공공/커뮤니티
- 중간소득
- 도시/공공 조기노출
- 기여평판

장기 기대기회는 유사하게 설계하고 언제든 pivot 가능.

## 8. 첫 세션 정확한 흐름

1. "어떻게 시작하고 싶나요?"
2. 첫 수입
3. 첫 생활비/세금
4. 첫 선택
5. 잔액/목표/커리어북 피드백
6. 미래 해금 preview
7. 실제 다음 상태 제시

튜토리얼 첫 결과는 안정적으로 설계한다.

## 9. 목표 객체

필드:
- goal_id
- category
- horizon
- target_metric
- starting_value
- target_value
- progress_function
- expected_effort
- prerequisites
- optionality
- reward_family
- recovery_behavior
- expiration
- personalization_reason
- analytics_id

숨은 완료조건 금지.

## 10. 목표 분류

- 안정
- 성장
- 탐험
- 회복
- 사회
- Legacy

## 11. 목표 추천 점수

권고식:
`GoalScore = 0.30 관련성 + 0.20 실현가능성 + 0.15 신규성 + 0.15 사용자선호 + 0.10 회복가치 + 0.10 다양성 - 패널티`

패널티:
- 최근 거절
- 사용자경로 충돌
- 같은 카테고리 과다
- 위험부채
- 과도한 세션요구

AI가 후보를 제안해도 최종 적격성은 규칙엔진.

## 12. 목표 슬롯

기본:
- 일간 1
- 주간 1
- 시즌 1
- 장기 최대 2

사용자 Pin 가능.
Pin 목표는 모델이 교체하지 않는다.

## 13. 기회 객체

- type
- eligibility
- duration
- upside
- downside
- city/world dependency
- expiration
- source
- novelty
- relevance
- explanation

## 14. 기회 추천

`OpportunityScore = Eligibility × (0.30 관련성 + 0.20 기대효용 + 0.15 다양성 + 0.15 신규성 + 0.10 시기 + 0.10 선호)`

Hard filter:
- 관할
- 연령/플랫폼
- 악용
- 감당가능성
- 선행기능

CTR 단독 최적화 금지.

## 15. 경제 페이싱

### 일
- 작은 업무결과
- 생활비
- 소규모 주문
- 짧은 교육

### 주
- 급여/사업결산
- 신용요인
- 도시프로젝트

### 시즌
- 거시테마
- 산업변화
- 큰 기회

### 장기
- 전문화
- 회사역사
- 도시영향
- 멘토평판

## 16. 시뮬레이션 시간

실시간과 경제기간을 분리.

Test에서는 가속 가능.
경제일/주간/시즌 경계를 결정론적으로 관리.

실제 주기값은 구현 전 경제시뮬레이션으로 확정.

## 17. 미접속 보호 매트릭스

### 24시간 미만
정상.

### 1~3일
- 정상 소규모 누적
- 부채폭증 금지
- 짧은 recap

### 4~14일
- 비필수 음의 누적 상한
- 사업생산 완화
- 보호 grace
- 시즌 catch-up

### 15~30일
- inactive protection
- 미접속만으로 사업 강제청산 금지
- 복귀계획

### 30일+
- 비필수 반복위험 freeze/cap
- 카테고리 요약
- resume/restructure 선택

## 18. 회복 상태머신

`DETECTED → EXPLAINED → OPTIONS_PRESENTED → USER_SELECTED → IN_PROGRESS → RECOVERED | REVISED`

발동:
- 지속 적자
- 높은 부채부담
- 낮은 runway
- 장기실업
- 반복 목표실패

가능하면 회복전략 2개 이상.

## 19. Softlock 진단

내부 전용:
- 유동성
- 의무비용
- 소득신뢰도
- 부채
- 취업가능성
- 사업 runway
- 공공지원 접근

사용자 낙인점수로 표시하지 않는다.

## 20. No-Ruin Rule

다음 상태가 존재하면 P0 설계결함:
- 수입경로 없음
- 감당가능 행동 없음
- 피할 수 없는 부채증가
- 이사/교육/지원 불가

## 21. 직업 사다리

직업마다:
- 입문
- 중간 2~4
- 전문화
- 리더십/독립

예시 물류:
Courier → Route Operator → Logistics Specialist → Fleet Coordinator → Supply Chain Manager → Logistics Founder.

승진요건:
- 기술
- 성과
- 선택자격
- 급여
- 위험/업무량

## 22. 기술 시스템

XP:
- 업무
- 교육
- 멘토
- 프로젝트

반복 저가치 파밍은 diminishing return.

기술은 숫자보다 선택지 해금을 중심으로.

## 23. 직업 품질

직업카드:
- 급여
- 안정성
- 학습
- 유연성
- 업무량
- 도시비용

높은 급여가 항상 최적은 아니다.

## 24. 사업 성장

`IDEA → STARTER → STABLE → GROWTH → MULTI_LOCATION → SPECIALIZED → LEGACY`

각 단계:
- 상품깊이
- 채용
- 공급계약
- 도시확장
- 파트너
- 고급분석

잔액 하나로 해금하지 않는다.

## 25. 사업건전성

구성:
- 잉여현금흐름
- 마진
- runway
- 수요안정성
- 재고회전
- 급여커버
- 고객집중

추천에 사용하되 비공개 처벌점수로 쓰지 않는다.

## 26. 회사 주간리뷰

- 매출
- 비용
- 마진
- 베스트 상품
- 최대위험
- 직원
- 다음 실험 1개

## 27. 경제뉴스 개인화

우선:
1. 내 소득/의무 직접영향
2. 직업/사업/도시
3. 시즌/세계
4. 일반

사실은 바꾸지 않는다.

## 28. 뉴스 영향 카드

예:
"기준금리 변경"
- 내 예금
- 내 사전재원 대출
- 내 사업
- 아무것도 안하기

## 29. 오늘의 경제선택 스키마

- 상황
- 선택
- 즉시효과
- 지연규칙
- 불확실성
- 적격성
- 학습포인트
- 반복방지 태그

도박형 숨은 랜덤 금지.

## 30. 난이도

초기: 명확한 trade-off.
중기: 2~3 지표.
고급: 거시/사업 불확실성.

중요 손실은 숨기지 않는다.

## 31. 커리어북 분류

- 최초
- 승진
- 회복
- 사업
- 이사
- 시즌
- 공공기여
- 소셜
- 중요결정

기본 영구기록.

## 32. AI 서사

구조화 사실로만:
"Harbor City로 이사 후 물류전문가가 되고 배송회사를 창업했습니다."

AI narrative 비활성 가능.

## 33. 시즌 템플릿

필수:
- 경제테마
- 시작세계상태
- 기간
- 개인목표
- 사업목표
- 공동목표
- 신규변화
- catch-up
- 영구기록
- 종료스토리

## 34. 시즌 예시: 인플레이션

- 생활비 상승
- 일부 원가상승
- 정책논쟁
- 현금흐름 유지
- 공급처 다양화
- 공공지원 투표

강제 자산손실 없음.

## 35. 시즌 예시: 고용호황

- 채용 증가
- 임금경쟁
- 기술부족
- 이직/승진/채용

## 36. 시즌 예시: 공급충격

- 특정 투입재 부족
- 물류기회
- 재고전략
- 도시협력

## 37. Social Edge 상태

`DISCOVERED → INVITED → ACTIVE → STABLE → DORMANT | ENDED`

유형:
- 친구
- 멘토
- 공동소유
- 도시협력
- 라이벌

## 38. 소셜 안전

- mute
- block
- partnership leave
- profile hide
- recommendation off

정확한 금융정보 공유는 명시동의.

## 39. 멘토매칭

- 기술경로
- 시간대
- 언어
- 멘토링 선호
- 평판
- 안전상태

부만으로 매칭 금지.

## 40. 공동사업 업무

비동기:
- 조달
- 가격
- 생산
- 마케팅 추상화
- 재무리뷰

한 명 offline이어도 진행.

## 41. 라이벌 매칭

- lifecycle
- 기능경로
- 최근성과

절대자산 고착 방지 위해 비교지표 순환.

## 42. 공공사업 상태

`PROPOSED → ELIGIBILITY_REVIEW → VOTING → FUNDED → EXECUTING → COMPLETE → OUTCOME_REVIEW`

중요전환만 알림.

## 43. 도시 성장

- 인프라
- 산업다양성
- 고용
- affordability
- 공공만족 proxy

경제활동·공공사업 결과이며 조폐와 분리.

## 44. 베테랑

- 고급 시나리오
- 멘토 인증
- 회사 archive
- 도시자문
- 역사테마
- 비P2W 수집

규칙우회 없음.

## 45. Prestige Sink

가능:
- 사무실/주거 꾸미기
- 역사 명판
- 회사 브랜딩
- 프로필
- 제한된 도시기념

금지:
- 신용우대 구매
- 대출승인 우대
- 시장정보 우위
- 투표권 우대

## 46. 재참여 결정엔진

입력:
- 동의/선호
- 휴면기간
- 목표
- 소셜
- 실제 신규기회
- 시즌/세계변화

출력:
- 메시지 없음
- Inbox
- Digest
- Push

기본은 적게 보냄.

## 47. 알림 적격성

비거래 알림:
- opt-in
- 아직 유효
- quiet hour 준수
- 같은 주제 최근 전송 없음
- 이미 처리 안함
- 빈도상한

## 48. 좋은/나쁜 알림

좋음:
"물류 교육이 완료되어 Tier 2 채용이 열렸습니다."

나쁨:
"지금 안 오면 놓칩니다!"

좋음:
"투표한 도시 프로젝트가 재원확보 단계에 진입했습니다."

나쁨:
실제 긴급이 아닌데 "긴급".

Apple의 알림지침처럼 시의성·높은 가치·정확한 긴급성·중복방지를 제품계약으로 채택.

## 49. 알림 빈도 기본안

관측 전 가설:
- 거래/보안: 필요시
- 사용자 리마인더: 요청대로
- 소셜/기회: 합계 주 3회 이하
- digest: opt-in 하루 1회 이하
- 시즌: 중요한 전환만

상향은 별도 검토.

## 50. 콘텐츠 구성 예산

초기안:
- 성장 30%
- 세계/경제 20%
- 소셜/공공 20%
- prestige 15%
- 실험/튜토리얼 15%

고정규칙 아님.

## 51. 반복 방지

같은:
- Daily Choice
- 직업스토리
- 기회유형
- 알림주제

쿨다운.

## 52. 콘텐츠 템플릿

- 목적
- 대상
- 조건
- 기간
- 경제효과
- 보상분류
- 번역
- 악용
- 접근성
- 분석
- 롤백
- 종료일

## 53. LiveOps 캘린더

권고:
- 월: 주간명세/목표
- 화/수: 기회/콘텐츠 회전
- 목: 사회/공공
- 금/주말: 선택형 이벤트
- 시즌 마일스톤: 사전일정

매일 필수 이벤트 금지.

## 54. 관리자 리텐션 센터

- lifecycle
- cohort
- 목표
- breadth/frequency
- social edge
- 알림/opt-out
- dormant/reactivation
- softlock/recovery
- season
- fatigue

## 55. Lifecycle Dashboard

각 상태:
- 인원
- 전환율
- 중앙전환시간
- 이탈지점

## 56. Event Retention

anchor:
- 첫 월급
- 첫 목표
- 첫 승진
- 첫 사업흑자
- 첫 소셜
- 첫 공공투표
- 첫 타임머신
- 첫 AI 추천

각 D1/D7/D30.

## 57. Feature Breadth/Frequency

breadth = 기간 내 의미있는 기능군 수.
frequency = 중복클릭 제거 의미행동.

한 기능 반복파밍을 깊은 engagement로 간주하지 않는다.

## 58. Session Health

Quick/Normal/Deep 분포.
긴 세션만 좋은 것으로 보지 않는다.

## 59. Fatigue

신호:
- 목표반복거절
- 알림 mute
- 기회무시
- 과밀후 종료
- breadth 감소
- 퀘스트반복

대응:
- 밀도감소
- 콘텐츠순환
- 단순모드

## 60. 개인화 메모리

저장:
- 선호경로
- 거절목표유형
- 세션모드
- 위험선호
- 알림선호

민감 실제특성 추론 금지.

## 61. AI 추천 스키마

- recommendation
- reason_codes
- evidence
- benefit
- downside
- alternative
- confidence
- action_type
- requires_confirmation

## 62. Next Best Action

AI 전 규칙적격성 확인.
AI 장애 시 규칙기반 fallback 필수.

## 63. 개인화 조작 금지

취약성을 이용해:
- 지출증가
- 손실회피
- 알림압박
- 위험대출
금지.

## 64. FTUE 측정

- 시작선택 시간
- 첫 수입
- 첫 비용
- 첫 선택
- 첫 목표
- 첫 세션완료
- 혼란/뒤로가기

## 65. 온보딩 이탈

중간종료:
- 상태보존
- 정확한 단계 재개
- 초기화 없음
- 튜토리얼보상 중복 없음

## 66. 복귀요약 알고리즘

우선:
1. 물질적 변화
2. 새 선택지
3. 완료 pending
4. 목표
5. 소셜/공공

기본 최대 5개.

## 67. Backlog Compression

50개 사건을 카드 50개로 보여주지 않는다.
카테고리 그룹/합계/드릴다운.

## 68. 주간명세서

- 시작상태
- 수입
- 비용
- 세금/이전
- 부채
- 저축/투자
- 사업
- 순변화
- 변화 이유
- 다음주

## 69. 비교기준

기본은 내 지난주/내 목표.
percentile은 선택형 coarse 비교.

## 70. 공정성

초기유저/베테랑/대형 social network가 영구불패가 되지 않게:
- 상대지표
- 리그
- prestige cap

## 71. 경제 이벤트 영향예산

이벤트마다:
- median FCF
- P10/P90
- 신규 affordability
- 사업실패
- 부채
- 총 WLD
최대효과 기록.

고위험은 시뮬레이션 필수.

## 72. 위기회복예산

- 영향 cohort
- 최소 회복경로
- 공공지원을 포함한 옵션
- 종료조건

## 73. 실험 레지스트리

- ID
- 가설
- owner
- cohort
- allocation
- 기간
- KPI
- guardrail
- 통계
- stop
- rollback
- decision

## 74. 안전한 실험

가능:
- Today 카드순서
- 목표설명
- digest 시간
- 기회카드 수
- 주간리뷰 시각화

고위험 검토:
- 보상량
- 부채 grace
- 사업실패규칙
- 알림빈도

금지:
- opt-out 숨김
- 가짜희소성
- 안전고지 약화

## 75. Cohort 판단

전체 D7 상승만으로 성공판정 금지.
softlock/알림거부/locale 악화/고위험부채 함께 본다.

## 76. 데이터 신선도

Today의 중요경제데이터:
- freshness timestamp
- stale 표시
- 민감 write 전 재검증

## 77. Offline/Partial

백엔드 부분장애:
- cached summary
- 위험 write 차단
- 명시적 idempotent 설계 없이는 로컬 경제 write 큐 금지

## 78. 접근성

- heading
- screen reader
- 색상+텍스트
- reduced motion
- 200/400% reflow
- touch target
- 자동 carousel 금지

## 79. 현지화

콘텐츠:
- semantic key
- locale
- review
- fallback

법률/금융 중요문구 무검수 자동번역 금지.

## 80. 국내 특화

- 현금가치 프레이밍 금지
- 경제가치+우연성 FOMO 금지
- 카지노식 streak 금지
- 가상은행/신용/대출은 시뮬레이션 명시
- 실제 금융 긴급성처럼 알림하지 않음

## 81. 해외 특화

- locale별 시즌
- 현지 시간대/quiet hours
- 관할 feature flag
- 실제법률 정확성 주장 금지

## 82. SEO→계정 연속성

검색계산기:
`검색 → 결과 → 익명 scenario → 가입 → 명시적 import → 개인목표`

import는 sandbox이며 자동경제행동 없음.

## 83. Guest Return

privacy-preserving local/session 방법 가능.
은밀한 신원추적 금지.

## 84. 공개프로필 역할

역사/정체성/공유.
부 공개압박 금지.

## 85. 공유카드

가능:
- 마일스톤
- 시즌결과
- 커리어타이틀
- 회사기념
- 도시기여

잔액/부채 금지.

## 86. 콘텐츠 폐기

다음이면 retire:
- 저효용
- 혼란
- exploit
- 피로
- outdated

획득한 영구역사는 보존.

## 87. SLA 기획

향후 정의대상:
- Today
- 목표생성
- 알림큐
- recap
- 주간명세

정확한 수치는 운영측정 후.

## 88. 실패모드

P0:
- 중복경제보상
- 미접속 영구손실
- 회복경로 없음
- 숨은 부채
- AI 자동경제 write
- 알림설정 우회

P1:
- 반복목표
- 무관기회
- 나쁜 recap
- 과밀 UI

## 89. DB 추가

- `life_progression_states`
- `user_goal_slots`
- `goal_candidates`
- `opportunity_candidates`
- `return_recap_items`
- `user_content_exposures`
- `content_cooldowns`
- `economic_pending_states`
- `absence_protection_states`
- `recovery_plan_options`
- `social_edge_states`
- `season_user_progress`
- `retention_event_anchors`
- `notification_eligibility_decisions`
- `user_session_mode_preferences`

## 90. API

- `GET /life-economy/home`
- `GET /life-economy/today`
- `GET /life-economy/goal-stack`
- `POST /life-economy/goals/:id/pin`
- `POST /life-economy/goals/:id/dismiss`
- `GET /life-economy/opportunities`
- `GET /life-economy/return-recap`
- `GET /life-economy/weekly-statement`
- `GET /life-economy/pending`
- `GET /life-economy/recovery`
- `POST /life-economy/recovery/:optionId/select`
- `GET /social/economic-edges`
- `GET /seasons/current/progress`
- `GET/PUT /users/me/engagement-preferences`

## 91. 원장 경계

리텐션 서비스는 ledger 직접 write 금지.
도메인 API를 통해 요청.

## 92. 개인정보

금지:
- 불필요 메시지 내용
- 민감특성추론
- 외부신원 enrichment

최소 pseudonymous event.

## 93. 관리자 역할

- content_editor
- liveops_manager
- retention_analyst
- economy_reviewer
- notification_manager

어느 콘텐츠 role도 ledger 권한 없음.

## 94. 변경승인

고영향 LiveOps:
- preview
- 경제시뮬레이션
- 번역검수
- safety review
- audit reason
- rollback

## 95. 콘텐츠 Preview

- mobile
- desktop
- locale
- lifecycle cohort
- 경제상태
- 접근성

## 96. 콘텐츠 Simulation

게시 전:
- 적격 사용자수
- 경제효과
- 알림량
- 충돌/cooldown
- 번역완성

## 97. 수용 KPI

engagement lift만으로 승인 금지.

필수:
- retention/progression benefit
- softlock 비악화
- 알림 opt-out 비악화
- 경제불변식
- 접근성
- cohort harm 없음

## 98. North Star

개념:
`HealthyContinuity = 의미있는 재방문 × 목표진행품질 × 회복건전성 × 기능다양성`

운영식은 데이터 확보 후 calibration.

## 99. 근거

- Unity 2026 Game Development Report: LiveOps, 일일미션, achievement, leaderboard, content update.
- Unity 2025 Gaming Report.
- Self-Determination Theory/PENS.
- Person-Based Approach 연구: 선택, 단계적 목표, 유용한 feedback, autonomy-supportive communication.
- GameAnalytics retention/cohort/progression.
- Apple HIG Notifications: 동의·고가치·시의성·중복방지·긴급성 정확성.
- Android notification permission guidance.
- FTC dark pattern guidance.

## 100. 완료 기준

- lifecycle 진입/종료
- 홈 IA/세션모드
- 단계적 해금
- 시작경로
- 목표/기회 객체 및 추천
- 미접속/회복 알고리즘
- 직업/사업/시즌/소셜/베테랑
- 알림적격성/빈도
- LiveOps/admin/experiment
- DB/API
- 접근성/개인정보
- 국내/해외
- 권위/작업기록 동기화
- 런타임/Test/Production 허위주장 없음
