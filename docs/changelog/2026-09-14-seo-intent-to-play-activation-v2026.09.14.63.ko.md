# 2026-09-14 — SEO 검색의도→플레이 활성화 v2026.09.14.63

## 요약
Google/Naver/공개 콘텐츠 유입자의 acquisition→activation 연결 공백을 다루는 문서-only 소비자 성장 명세를 추가했다.

가장 큰 공백은 “콘텐츠에서 답을 얻은 사용자가 왜 바로 이탈하지 않고 Moneyverse 안의 첫 의미 행동으로 이어지는가”였다.

선택한 funnel:
`검색/공유 의도 → 독립적으로 유용한 답 → contextual preview → authored choice → contextual signup → meaningful activation → D1 → D7 → D30`.

## 주요 결정
- 인증 전에 검색의도를 먼저 충분히 충족한다.
- 전체 경제 기능 grid 대신 진입의도에 맞는 preview 하나만 보여준다.
- 가입/인증 뒤에도 사용자가 들어온 정확한 맥락을 보존한다.
- 로그인, 지갑 열기, 광고 클릭, 일반 page view는 activation으로 계산하지 않는다.
- organic cohort를 intent별로 나누고 activation, D7/D30, LTV까지 본다.
- 개인계정/자산/보안 페이지는 공개 검색 acquisition 대상에서 제외한다.
- keyword variant 대량생성보다 적은 수의 깊은 페이지를 우선한다.
- `답 → preview → 첫 선택` 구간은 interruptive monetization으로 끊지 않는다.

## 실험
answer-first vs auth-first, contextual vs generic signup CTA, one preview vs feature grid, 깊은 original page vs scaled template, value-before-ad vs early-ad 실험을 추가했다.

## 연구
Google people-first/UGC guidance, 2026-08-28 site reputation policy update, Naver Search Advisor 품질/스팸 가이드, Discord 2026-08-20 discovery→gameplay 방향 및 Discord Official 신뢰 신호를 직접 반영했다. FTC 2026 subscription enforcement는 수익화 guardrail로 유지하고 Spotify editorial discovery는 참고만 했다.

## 보안/신뢰
High: public/private leakage, SEO/UGC spam 및 악성링크, 공식 콘텐츠 사칭/phishing/ATO, fake-signup/referral manipulation. Medium: tracking/privacy 과수집. 보안 코드는 수정하지 않았다.

## Runtime audit
Runtime 접근 가능. 홈은 여러 기능과 광고가 전면에 있고 월간 소식은 준비 중이며 공지 페이지는 비어 있다. `/guide`는 내용은 많지만 금융/경제 기능 중심이고 quick start도 로그인/지갑부터 시작해 intent-specific pre-auth preview는 확인되지 않았다.

## 파일
- `docs/planning/SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.md`
- `docs/planning/SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.ko.md`
- v2026.09.14.63 영/한 changelog 및 worklog.

런타임, DB, API, 인증, migration, 인프라, 배포 변경 없음.