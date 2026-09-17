# 월덕 머니버스 — 가상 카지노 게임 시스템 명세

> 버전: v2026.09.17.177
> 상태: 구현 지향형 기획 명세
> 기준일: 2026-09-17
> 영문 기준 문서: [CASINO_GAME_SYSTEM_SPEC.md](CASINO_GAME_SYSTEM_SPEC.md)
> 국제 정책: [INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.ko.md](INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.ko.md)

## 1. 국제 통합 계약

카지노는 선택형 확률 엔터테인먼트이며 수익화 채널이 아니다. 현금화, 외부 경품, 암호화폐, 상품권, 실물가치, 유료 entitlement 또는 양도 가능한 가치로 결과를 바꾸는 경로를 만들지 않는다.

`현금화 없음`만으로 전세계 허용을 추정하지 않는다. 국가/주/채널별 정책이 `ALLOW`일 때만 플레이를 허용하며 알 수 없는 관할은 차단한다.

현금 유료화와 카지노가 공존하기 전 전용 `CSP`(가칭) 또는 동등한 출처격리를 적용한다. CSP는 현금구매/양도/선물/마켓등록/환전/WLD-WDX 교환/광고지급이 불가능하다.

대한민국은 GRAC/등급, 카지노 19+ 정책, 스토어·법률 evidence 전까지 차단한다. 호주는 simulated gambling R18+ 분류증거가 없으면 차단한다. 미국은 주별 판정하며 Washington은 별도 승인 전 차단한다.

## 2. 기존 영문 수학·원장·API 계약

게임별 확률/RTP, 서버 RNG, 원자적 원장정산, 멱등성, 불변 영수증, 자기한도/자기배제, 관리자 kill switch, abuse 방어와 QA의 세부 필드는 영문 기준 문서를 따른다. 구현 시 한국어 UI는 영문과 동일한 확률·지급·한도 의미를 자연스럽게 번역하되 숫자/수학값은 서버 권위값에서 렌더링한다.

## 3. 피해 최소화

자동플레이, 터보, 패배 직후 반복, loss-chasing, near-miss 강조, 광고로 베팅재원 지급, 유료/VIP 한도상향, 결제여부에 따른 확률변경을 금지한다. 세션시간·누적손실·한도·자기배제를 항상 접근 가능하게 한다.

## 4. 출시 순서

`국가/주/채널 정책` → `등급/연령 evidence` → `CSP/유료출처 격리` → `Test exact-SHA` → `법률/제품 승인` → `Production feature flag`.

이번 회차는 문서 전용이며 런타임을 변경하지 않는다.
