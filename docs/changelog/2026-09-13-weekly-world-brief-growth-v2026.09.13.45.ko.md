# 변경기록 — 주간 월드 브리프 성장 v2026.09.13.45

기준일: 2026-09-13
영문 기준 명세: `docs/planning/WEEKLY_WORLD_BRIEF_GROWTH_SPEC.md`
영문 변경기록: `docs/changelog/2026-09-13-weekly-world-brief-growth-v2026.09.13.45.md`

## 변경 이유

현재 가장 큰 소비자 성장 공백은 반복적으로 다시 방문할 공개 이유다. 실제 운영 홈과 `/announcements`는 접근 가능하지만 모두 검토된 공개 소식을 준비 중이라고 표시하므로, 기존에 기획된 콘텐츠 복귀 루프가 아직 실제 반복 콘텐츠 제품으로 확인되지 않는다.

## 변경사항

- Weekly World Brief를 일반 운영공지 피드가 아니라 1~3분 소비자 콘텐츠 제품으로 정의.
- `이번 주 한 문장 → 의미 있는 변화 약 3개 → 학습 하나 → 맥락형 행동 하나 → 따라잡기 한 줄`의 편집 구조 정의.
- 첫 방문 비회원, 신규 로그인, 기존 활성, 휴면 복귀, 장기/프레스티지 사용자별 이어가기 정의.
- 첫 30초·3분·첫 세션과 D1/D3/D7/D14/D30, 장기 아카이브/정체성에 연결.
- SEO를 `적합한 노출 → 이해 → 이어가기 → activation → D7/D30 → retention-adjusted contribution`으로 확장.
- 충분한 공개 콘텐츠만 색인 후보로 두고 얇은 recap, 비공개 경제/계정 페이지, 광고 인벤토리용 페이지는 제외.
- 의미 기반 공유와 공유 수신자의 가입 전 이해를 우선.
- 유용한 가치 이후 수익화 원칙을 유지하고 스폰서의 WDX 결과·대출조건·랭킹·모더레이션 영향 금지.
- KPI/코호트와 실험 5개 추가.
- 공개/비공개 누출, 피싱 사칭, 금융상품처럼 보이는 문구, referral farming, UGC 악용, analytics/ad 과수집 guardrail 추가.
- 기존 auth/session/RBAC/ledger/admin/privacy 경계 유지.

## 최신 조사 채택

- Spotify Newsroom, 2026-07-10: 예측 가능한 주간 discovery cadence와 사용자 제어.
- Discord, 2026-08-20: discovery/social context를 impression보다 downstream play/retention으로 평가.
- Google Search Central, 2026-06-03 발표 및 2026-08-31 전세계 적용 표기: 생성형 AI 검색 노출 리포트를 추가 discovery 진단으로 사용.
- Naver Search Advisor 2026 현재 가이드: 방문자 우선, 명확한 제목/설명, 공개/비공개 색인 구분, 저품질 대량생성·조작 트래픽 금지.
- Google 2026-08-28 Site Reputation Policy와 FTC native-ad/endorsement 원칙은 sponsor/editorial guardrail로 유지.

## 실제 서비스 확인

- 공개 홈 정상 접근.
- 홈에 `월간 소식` 및 운영 소식 링크 존재.
- 홈은 여전히 공개 운영 소식을 준비 중이라고 표시.
- `/announcements`는 접근 가능하지만 게시 공지 없음.
- 공개 시작 가이드는 내용은 충분하지만 기능/경제 중심이라, Weekly Brief는 더 가벼운 반복 세계/맥락 진입점으로 정의.

Runtime verification: 가능.

## 배포

문서-only. 런타임, DB, API, 인증, 인프라 수정 없음. 이번 문서 변경 자체는 Test/Production 배포 불필요.