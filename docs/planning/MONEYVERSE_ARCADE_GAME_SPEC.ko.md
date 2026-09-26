# 월덕 머니버스 — 아케이드·회사 게임 통합 명세

> 버전: v2026.09.26.444
> 상태: PLANNED
> 영문 기준: `MONEYVERSE_ARCADE_GAME_SPEC.md`

## 핵심
Moneyverse Arcade는 카지노 대체 화면이 아니라 상시 핵심 게임 계층이다. `20~180초 플레이 -> 콤보 -> FEVER -> 결과 -> 개인기록/숙련/수집 -> 자유 종료/재도전`을 기본으로 한다. 가입 직후 WLD·재고·회사·직업이 0이어도 Starter Arcade를 플레이할 수 있다.

## 세계관 회사 16개
Monevia Mart(유통), Velocart Logistics(배송), Ironveil Works(제조), Nexora Systems(소프트웨어/AI), Savorin Kitchen(외식), Moventra Transit(교통), Portalis Trade(항만/무역), Arclume Studio(건설/디자인), Voltide Energy(에너지), Verdara Farm(농업), Chronova Media(미디어), CarePulse Clinic(가상 운영게임·의료판단 없음), Astriva Hotels(숙박), Circlora Works(재활용), Orbitalis Freight(우주물류), Velmora Atelier(제작/패션)를 작업명으로 둔다. 공개 전 상표/도메인 검증이 필수다.

## 초반 10개
Quick Tap Fever, Parcel Sort, Order Match, Tile Fit, Bug Tap, Circuit Link, Cargo Stack, Harvest Beat, Queue Control, Mini Shop. 첫 세션은 `Quick Tap -> 첫 PERFECT -> 확정보상 -> Mini Shop -> 첫 FEVER -> 회사선택 -> 회사 입문미션 -> 첫 코스메틱/칭호`로 구성한다.

## 본게임 20개
Moneyverse Rush, Store Rush, Kitchen Rush, Delivery Dash, Factory Fever, Market Panic(가상 재고/수요 게임), Merge Workshop, Skyline Stack, Grid Balance, Newsroom Rush, Incident Commander, Port Stack, Rhythm Shift, Pattern Forge, Chain Reaction Lab, Ghost Sprint, Daily Remix, Weekly Boss, City Project, Season Expedition.

## 재미 규칙
PERFECT/GREAT, 콤보 배수, FEVER, 개인 최고기록 차이, 즉시 결과, 확정 해금 연출, 수집세트 완성, 회사공간 성장, 빌드/루트 선택으로 반복 재미를 만든다. 난도가 올라가서 긴장감이 생기며 재산 손실 때문에 긴장하게 만들지 않는다.

금지: loss chasing, 도박 near-miss 연출, 가짜 카운트다운/읽지않음, 강제 무한플레이, 유료 stake 보호 재도전, 구매형 점수배율/FEVER확률/Boss데미지, 유료 랜덤보상, 하루 빠졌다고 영구진척 초기화.

## 성장·경제
`가입 -> Starter Arcade -> 회사선택 -> 수습 숙련 -> 회사별 게임 -> 전문기믹 -> 회사간 계약 -> Weekly Boss -> City Project -> Season Expedition`.

주 성장값은 숙련, 회사평판, 도감, 개인기록, 코스메틱/칭호, 월드 프로젝트 이력이다. WLD는 보조 보상이다. 중요한 보상은 시작 전 공개하고 서버가 점수/완료/멱등/원장을 검증한다. 반복 파밍은 임의 플레이 차단보다 diminishing issuance와 abuse 방어로 제어한다.

## 국가 규제 경계
`ARCADE_SKILL`과 `CASINO`를 별도 feature code로 둔다. 한국 카지노가 BLOCK이어도 Arcade는 별도 정책으로 제공할 수 있지만 게임 등급/채널 검토를 생략한다는 뜻은 아니다. 호주 대응을 위해 simulated gambling/paid chance를 Arcade에서 제외하고, 영국은 현금·거래가능 가치 전환을 막으며, 독일/EU는 도박유사·구매압박을 피한다. 일본 초기 Arcade에는 유료 랜덤아이템을 넣지 않는다. 미국도 가치물을 거는 wager loop를 만들지 않고 Casino는 주별 별도 gate를 유지한다. 미검토 국가는 자동 허용하지 않는다.

## 완료조건
0 WLD 신규유저 플레이, stake/chance/prize 경제루프 없음, 유료랜덤 없음, 환전 없음, 중요보상 사전공개, 서버권위/멱등/원장대사, 접근성, 결석 안전, 국가/등급 증거, anti-replay, 영향 사용자·관리자 화면 5회 완전 반응형 QA를 모두 통과해야 한다.
