# 제품 기획 작업기록 — v2026.09.12.21

기준일: 2026-09-12

## 목표

임의 참여 한도를 다시 만들지 않으면서 커뮤니티·클럽 참여와 WDX 시장 무결성 사이의 기획 공백을 닫는다.

## 저장소 검토

최신 Living Project Plan, Product Growth Plan, Detailed Product Design Spec, Season System Spec, Default Limit Policy, Economy Sinks Spec과 열린 Clubs & Cooperative Economy v2026.09.12.20 기획 브랜치를 검토했다. 종목 태그 커뮤니티 방향은 존재했지만 신고·모더레이션·거래공모 탐지를 하나로 연결하는 구현급 계약은 부족했다.

## 외부 조사

- Discord Community Guidelines 및 플랫폼 조작/AutoMod 자료: 단계형 제재, 신고, anti-spam, anti-raid 패턴.
- TradingView 신고기능 및 2026 Paper Trading 대회의 별도 경쟁계정·시스템 보호 패턴.
- FINRA의 소셜미디어 기반 pump-and-dump 안내.
- SEC의 2025년 소셜미디어/그룹채팅/투자클럽 사기 관련 집행자료.

## 주요 결정

- 정상 게시·댓글은 기본 unlimited이며 보안/플랫폼 무결성 burst 제한만 예외로 둔다.
- 신고는 신호일 뿐 자동 계정정지·종목정지 투표가 아니다.
- 커뮤니티 제재와 시장 무결성 제한은 별도 capability state로 관리한다.
- 반응·팔로워·조회·감성·신고 수는 WDX 가격엔진의 직접 입력으로 사용하지 않는다.
- 순환상대방, 게시·거래 공모, 가짜 유동성, 참여조작 링, 악의적 집단 신고처럼 설명 가능한 신호를 사용한다.
- 이미 정산된 원장 이력은 수정하지 않고 필요 시 보상거래를 사용한다.
- WLD로 모더레이션 우대나 이의제기 가속을 구매할 수 없다.

## 파일

- `docs/planning/COMMUNITY_MARKET_INTEGRITY_SPEC.md`
- `docs/planning/COMMUNITY_MARKET_INTEGRITY_SPEC.ko.md`
- 대응 changelog/worklog
- 문서 INDEX

## 검증

문서-only 작업이다. 런타임 코드, 스키마, migration, deployment는 변경하지 않았다. 실제 구현은 별도 개발 브랜치와 Test 검증이 필요하다.