# 작업기록 — My Moneyverse 정체성 홈 성장 v2026.09.13.32

기준일: 2026-09-13
변경 유형: 문서-only 소비자 성장 기획
브랜치/PR: 없음. 현재 정책에 따라 최신 `main` 직접 반영
런타임 코드/DB/API/인프라: 변경 없음

## 시작 저장소 상태

- 기획 시작 직전 최신 `main` 재확인.
- 이번 버전 시작 기준 최신 커밋: `4eaaedda15fe0805f9f4c7c76c566f648217c88d` (`v2026.09.13.31` 한국어 worklog).
- `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md` 및 관련 성장/보안/수익화 문서를 재확인.
- 열린 PR #256은 draft 통합 후보이며 현재 `main`을 대체하지 않는다. 이번 문서 회차에서 병합·수정하지 않음.

## 공백 선정

이전 회차에서 이미 다음을 구체화했다.
- 가입 전 activation;
- D1~D30 복귀 사다리;
- retention→viral 루프;
- 브랜드/콘텐츠 엔진;
- content→habit 루프;
- 장기 열망/정체성.

남은 공백은 많은 기능과 열망을 사용자가 복귀할 때 **간단한 관계로 압축**하는 것이었다.

선택한 공백: `My Moneyverse` — 정체성 신호 2~3개, 활성 스레드 하나, 역사 증거 하나, 다음 챕터 하나.

## Runtime Product Reality Audit

이번 회차에서 `https://easy-scraping.com`이 다시 접근 가능함을 확인해 runtime verification을 실제로 수행했다.

비파괴적으로 확인한 공개 경로:
- `/` 홈
- `/guide`
- `/stocks`
- `/shop` 접근 시도
- `/announcements`
- `/privacy`
- `/work`
- `/quests`
- `/bank` 비로그인 리다이렉트/로그인 화면
- `/businesses`
- `/casino`

핵심 결과:
1. 홈은 game-only 고지, 로그인 CTA, 신규 사용자/신뢰 링크가 좋다.
2. 홈은 장기 개인정체성/역사보다 기능 설명이 더 강하다.
3. 시작 가이드는 복리, 배당, 시세차익, 패시브소득, 저평가 우량주, 대표 자본가 등 금융·자산증식 언어가 과도하다.
4. 첫 개인 스레드를 만들기 전에 복잡한 시스템을 너무 많이 소개한다.
5. 주식/작업/퀘스트/사업 공개 화면 일부는 익명 렌더링에서 `불러오는 중` 중심이다.
6. 운영 소식은 아직 게시물이 없어 계획한 정기 공개 콘텐츠 복귀루프가 실제로는 작동하지 않는다.
7. 럭키존은 가상재화·확률 고지는 유용하지만 `대박`, `짜릿한 역전` 같은 고흥분 문구가 존재한다.
8. `/bank` 비로그인 접근은 로그인 화면으로 안전하게 유도되며 Discord/Google 비밀번호가 서비스에 전달되지 않는다는 설명이 있다.
9. 개인정보처리방침은 광고 허용 공개면을 제한하고 경제잔액·거래·취향을 광고 타기팅에 쓰지 않는다고 명시한다. 신규 성장기획도 이 경계를 보존해야 한다.

상태변경 런타임 검증은 수행하지 않았다.

## 최신 외부 조사

조사일: 2026-09-13.

검토 자료:
- Discord Profile Widgets FAQ — 2026-09-08 업데이트.
- Discord Profile Privacy Setting — 2026-07-08 업데이트.
- Discord Activity Sharing FAQ — 2026-07-07 업데이트.
- Spotify Investor Day 2026 — 2026-05-21.
- Google Search Central February 2026 Discover Core Update — 2026-02-05.
- Google Search Central people-first content guidance.

채택 판단:
- 사용자가 직접 고르고 배치하는 모듈형 정체성 표현을 직접 채택;
- 개인화 프로필/역사에 공개범위 제어와 private-first 원칙 직접 채택;
- 활동공유 제어는 방향성 참고로만 사용;
- Spotify 사례는 참여/리텐션 뒤 수익화를 최적화한다는 방향성 근거로만 사용;
- Google의 깊이·원본성·비선정적 콘텐츠 원칙을 공개 아카이브/정체성 SEO에 직접 적용.

## 추가 파일

- `docs/planning/MY_MONEYVERSE_IDENTITY_HOME_GROWTH_SPEC.md`
- `docs/planning/MY_MONEYVERSE_IDENTITY_HOME_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-13-my-moneyverse-identity-home-growth-v2026.09.13.32.md`
- `docs/changelog/2026-09-13-my-moneyverse-identity-home-growth-v2026.09.13.32.ko.md`
- `docs/worklog/2026-09-13-my-moneyverse-identity-home-growth-v2026.09.13.32.md`
- `docs/worklog/2026-09-13-my-moneyverse-identity-home-growth-v2026.09.13.32.ko.md`

## 소비자 기획 결과

정의한 내용:
- `My Moneyverse` 관계 모델;
- 사용자 성숙도별 홈 정보계층;
- 정체성 신호 안전원칙;
- 방문→다중시즌 퍼널;
- 정체성/이어가기 KPI;
- 실험후보 5개;
- SEO·바이럴·수익화 경계;
- 별도 구현/콘텐츠 QA가 필요한 실제 런타임 문구·서사 gap.

## 보안·개인정보 검토

High:
- 개인화 역사/공개 프로필 정보누출;
- 정체성 추론 과잉;
- 개인화 복귀/공유면을 이용한 피싱·사칭.

Medium:
- 명예/referral 조작.

개발 아키텍처를 새로 확장하지 않고 최소조건만 기록:
- 기본 비공개;
- public-safe 필드만 사용;
- 정체성 제안 수정/거절 가능;
- 민감특성 추론 금지;
- secret-bearing 공유 URL 금지;
- raw view/share/signup에 큰 경제보상 금지;
- 공개 개인화 화면/행동기반 광고 전 별도 개발·보안·개인정보 QA.

## 배포/테스트 상태

문서-only이므로 이번 변경 자체의 테스트 서버 배포는 불필요.

Runtime verification: **공개 비파괴 소비자 Audit 가능**. 로그인 뒤 개인화 기능에는 변경을 하지 않았으며 상태변경 테스트도 하지 않았다.

## 다음 우선순위

별도 구현/콘텐츠 QA 흐름에서 실제 Home, Getting Started, Lucky Zone, 공개 stock/business preview, 첫 정기 World Brief의 **소비자 문구·정보계층 정합화**를 진행하는 것.
