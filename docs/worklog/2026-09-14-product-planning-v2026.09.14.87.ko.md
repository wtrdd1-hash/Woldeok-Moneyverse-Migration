# 작업 기록 — 브랜드 약속·발견 포지셔닝 성장 v2026.09.14.87

## 시작 상태
- 작업 시작 `main`: `610c89d3deac535ace3246b428f9312761e3a6cf`.
- 현재 Living Project Plan과 Product Growth Plan을 다시 읽었다.
- 최신 healthy-session/retention 성장 명세와 현재 runtime/product baseline을 다시 확인했다.
- 최근 `main`의 주식 alert deep-link 변경과 Node 이미지 dependency bump도 확인했으며 이번 문서 전용 변경과 충돌하지 않았다.

## 공백 선택
최근 기획은 signup continuity, first-week complexity, mastery, comeback, social continuity, healthy session end를 상세히 다룬다. 이번에는 첫 방문 포지셔닝을 가장 큰 미충족 성장 공백으로 선택했다. 공개 제품은 여러 시스템을 정직하게 보여주지만 신규 방문자는 wallet/game/exchange/shop/quest/community/sponsor를 보기 전에 하나의 기억나는 이유를 만들기 어렵다.

## 결정
Moneyverse를 소비자에게 우선 `사용자 행동이 성장·수집·이야기·공동 기록으로 남는 지속형 커뮤니티 세계`로 설명하고, 가상경제는 전체 제품 정체성이 아니라 game mechanic으로 위치시킨다.

채택 funnel:
`적합한 발견 → 명확한 약속 하나 → 증거/샘플 하나 → authored interest → contextual signup → meaningful activation → D1 promise kept → D7 coherent identity → D30 durable history/share`.

## 조사
- Roblox, 2026-06-15 discovery optimization: 단기 click proxy보다 장기 retention signal 중시.
- Discord, 2026-08-20 game discovery/social play: contextual discovery와 실제 gameplay/social downstream action 연결.
- Google Search Central people-first: 명확한 primary purpose, substantial/original content, satisfying outcome.
- Google Discover core update, 2026-02-05: sensational/clickbait 축소, original/timely/in-depth 확대.
- Naver Search Advisor 2026 현재 guidance: 메인 title의 명확한 brand/site nature와 유용·공신력 콘텐츠 품질.
- FTC endorsement guidance: truthful/non-misleading endorsement와 material connection disclosure.

## Runtime Product Reality Audit
`https://easy-scraping.com/` 공개 홈을 검증했다.
관찰:
- WLD/보상의 game-only 고지가 반복됨;
- title/category가 Discord 커뮤니티 가상경제와 게임 보상으로 표현됨;
- 첫 visible shortcut은 지갑, 미니게임 5종, 거래소, 상점, 퀘스트, 로비;
- sponsored placement가 여러 개 존재;
- 이후 hero에서 `우리가 함께 만드는 작고 단단한 경제`, Discord 연결 커뮤니티 가상경제라고 설명;
- 가입 전 preview 문구는 존재하지만 broad feature inventory 전에 하나의 authored-interest path가 우세하지 않음.

결론: brand/category clarity는 검증 가능한 성장 가설이며 현재 미검증이다. runtime 구현은 수정하지 않았다.

## 보안·개인정보·악용 검토
기록:
- HIGH 실제 금융서비스 오인/사칭;
- HIGH acquisition link/creator phishing·ATO;
- HIGH public artifact/SEO private-state leakage;
- HIGH referral/creator/bot acquisition abuse;
- MEDIUM acquisition analytics 과수집.

최소 기획 조건은 canonical brand/domain, game-only 금융 경계, 민감상태 private-by-default, public-safe sharing, raw signup/share WLD/WDX 보상 금지, purpose-limited analytics, finance-adjacent campaign/deep link/public personalized page의 별도 QA·법률검토 유지다.

## 추가 파일
- `docs/planning/BRAND_PROMISE_DISCOVERY_POSITIONING_GROWTH_SPEC.md`
- `docs/planning/BRAND_PROMISE_DISCOVERY_POSITIONING_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-brand-promise-discovery-positioning-v2026.09.14.87.md`
- `docs/changelog/2026-09-14-brand-promise-discovery-positioning-v2026.09.14.87.ko.md`
- 본 작업 기록과 영문 대응본.

## 범위 및 검증
- 문서 전용.
- 런타임·DB·API·인증·migration·scheduler·인프라·보안 코드 변경 없음.
- 문서 작성 전 중간 `main` 재확인에서도 `610c89d3deac535ace3246b428f9312761e3a6cf` 유지.
- ref 갱신 직전 최종 `main`을 다시 확인하며 non-fast-forward 갱신은 금지한다.
