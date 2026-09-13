# 작업기록 — 리텐션 안전형 수익화 성장 v2026.09.13.44

기준일: 2026-09-13
범위: 소비자 성장 기획만 수행
배포: 문서-only. Test/Production 배포 불필요
영문 기준 작업기록: `docs/worklog/2026-09-13-retention-safe-monetization-growth-v2026.09.13.44.md`

## 작업 전 확인

- 시작 시점 `main`: `8c1ffc1c801f43a6fa6061fcd61bca164e68d445`.
- Living Project Plan `docs/planning/PROJECT_PLAN.md`.
- `PRODUCT_GROWTH_PLAN.md`.
- `MONETIZATION_COMPLIANCE_SEO_SPEC.md`.
- `PUBLIC_CONSUMER_NARRATIVE_GROWTH_SPEC.md`.
- 관련 리텐션/콘텐츠/브랜드 성장 명세와 광고·개인정보 경계.
- 최근 v2026.09.13.42 공개 콘텐츠 광고 기본 활성화 변경.
- 실제 공개 홈과 운영 소식.
- 최신 광고·동의·신뢰·구독 레퍼런스.

이번 회차에서는 런타임 코드, DB, API, 인증, 인프라 구현 상세를 확장하지 않았다.

## 가장 큰 공백

검토된 공개 콘텐츠 광고가 운영 기본 활성화됐지만, 소비자 성장 관점에서 “광고가 가능한 경로”와 “지금 수익화해도 첫 가치와 리텐션을 해치지 않는 순간”을 구분하는 기준이 부족했다.

이번 기준은 다음과 같다.

**먼저 관심을 얻고 → 핵심 가치를 전달하고 → 다음 의미 행동을 보존하고 → 그 경로 주변에서 수익화하고 → 수익을 리텐션·신뢰와 함께 판단한다.**

기술적으로 정상인 광고 운영이 activation/retention 회귀가 되는 것을 막기 위한 성장 계약이다.

## Runtime Product Reality Audit

- 공개 홈: 접근 가능. Moneyverse 설명, game-only 고지, 신규사용자/시작 경로가 존재한다.
- 공개 운영 소식: 접근 가능. 아직 공개 공지가 없다.
- 텍스트 retrieval만으로는 지역·동의·fill 상태에 따른 광고의 실제 시각 렌더링 여부를 확정할 수 없어 표시/미표시를 단정하지 않았다.
- 소비자 관점 결론: 홈은 가치 전달 후 검토 광고를 수용할 수 있는 자체 가치가 있지만, empty 운영 소식은 광고 중심 목적지가 되어서는 안 된다.

## 작성 문서

- `docs/planning/RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.md`
- `docs/planning/RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.ko.md`
- 영/한 changelog
- 영/한 worklog

4단계 소비자 수익화 상태, 첫 가치 우선 배치, empty/loading/error 정책, 리텐션 민감형 광고량, 구독 제안 시점, 개인정보/동의 경계, KPI·코호트·실험·보안/악용 guardrail을 정의했다.

## 중간 main 재확인과 동시작업

필수 중간 저장소 확인 중 다른 작업 흐름이 `User App API Coverage Audit v2026.09.13.43`을 커밋하기 시작한 것을 확인했다. 동시 변경에는 `9712b7d717fe5ac28ffcded9846ec574e72d4708` 및 이어진 영/한 changelog/worklog가 포함됐다.

이번 성장 초안도 처음에는 v2026.09.13.43을 사용했으므로 순서형 버전 충돌을 남기지 않기 위해 **v2026.09.13.44**로 정정했다. `main`의 동시 변경은 덮어쓰거나 강제 갱신하지 않고 보존했다.

동시 API 감사 결과는 현재 저장소 상태로 존중하되, 이번 성장 자동화에서 개발 구현 상세를 새로 확장하는 근거로 사용하지 않았다.

## Research note

### 직접 채택

1. Deloitte + Google AdMob — 2025-06-10 — 업계 연구/공식 파트너 발표.
   - 시사점: 방해성 광고는 신뢰와 리텐션을 훼손할 수 있으며 광고 품질은 단기 수익만으로 평가하면 안 된다.
   - 채택: 리텐션 우선 수익화 원칙과 실험 guardrail. 외부 조사 수치는 Moneyverse 예측값으로 사용하지 않음.
2. Google AdSense Program Policies — 2026 현재 공식 퍼블리셔 정책.
   - 시사점: 광고가 내비게이션처럼 보이거나 오해성 상호작용을 만들면 안 된다.
   - 채택: 배치 분리 및 accidental-click guardrail.
3. Google AdSense Privacy & messaging — 2026-09-11 공식 업데이트.
   - 시사점: 관련 지역의 CMP 메시지 coverage/optimization 운영이 변경됐다.
   - 채택: 동의 운영 재검토 트리거로만 활용. Moneyverse 자체 privacy 기준을 약화하는 근거로 사용하지 않음.

### 참고/규정 guardrail

4. FTC Native Advertising guide — 공식 가이드.
   - 시사점: 네이티브 광고의 상업적 성격은 명확하고 눈에 띄며 콘텐츠 가까이 표시되어야 한다.
5. FTC Shutterstock settlement — 2026-05 공식 집행.
   - 시사점: 반복 구독 핵심조건의 명확한 고지, 명시적·충분한 동의, 단순한 해지가 필요하다.

## Funnel/KPI 변경

수익화 공개 콘텐츠 퍼널:

`qualified visit → useful understanding → contextual continuation → activation → D7/D30 → retention-adjusted contribution`

추가/강화한 코호트:
- 신규 vs 재방문 비회원;
- 유입 채널;
- activation 후 첫 7일 vs 기존 유지 사용자;
- 모바일 vs 데스크톱;
- 콘텐츠 축;
- 동의/개인화 상태;
- 광고 대상 무료 사용자 vs 광고제거 구독자.

ARPU/ARPDAU/eCPM/fill/viewability/CTR/구독전환과 함께 activation, time-to-first-value, 콘텐츠 완료, D7/D30, Core Web Vitals, accidental-click, 불만, privacy complaint, 지원비용, fraud-adjusted acquisition을 함께 본다.

## 실험 backlog

1. 가치 전달 후 광고 vs 조기 광고.
2. empty page 광고 억제 vs 광고 가능한 empty surface 노출.
3. 검토 광고 1개 vs 더 높은 공개 콘텐츠 광고밀도.
4. 반복가치 이후 광고제거 구독 제안 vs 조기 제안.
5. contextual/non-personalized 기준선 vs 검토된 personalization — privacy/legal 준비 후에만 실행.

CTR/eCPM만 높은 실험은 승리로 보지 않는다.

## 보안·개인정보·악용 검토

### High — 오클릭/기만 내비게이션
사용자 영향: 원치 않는 광고 클릭, Moneyverse 행동과 혼동, 신뢰 저하.
최소조건: 강한 시각 분리, 고정 공간, 민감 CTA 인접 금지, 모바일 visual QA, accidental-click 모니터링.
실제 배치 변경 시 별도 개발/QA 필요: 예.

### High — 민감 맥락 광고 유출
사용자 영향: 비공개 경제/보안 맥락의 광고·분석 전달 또는 민감 행동 주변 광고 노출.
최소조건: 현재 차단면 유지, 광고 payload에 비공개 경제/보안 필드 금지.
라우팅/동의 변경 시 별도 runtime/security QA 필요: 예.

### High — 동의/프로파일링 과잉
사용자 영향: 과도한 행동 프로파일링, 민감특성 추론, 미성년자/지역 정책 위험.
최소조건: contextual 기본, 최소수집, 이해 가능한 선택, 연령/지역 검토, 민감추론 타기팅 금지.
맞춤광고 확대 전 legal/privacy review: 필요.

### Medium — 수익화/추천 사기
노출·클릭·raw 가입 대신 retained·fraud-adjusted acquisition을 성공 기준으로 사용한다.

## SEO / 바이럴 / 수익 영향

- 광고 인벤토리 확대를 위해 저품질/얇은 SEO 페이지를 만들지 않는다.
- 공유 산출물은 광고보다 자체 사용자 가치를 먼저 가져야 한다.
- 수익화 성공은 activation, D7/D30, 신뢰, 페이지 성능을 훼손하지 않는 contribution margin으로 평가한다.
- 광고제거 구독은 비-P2W이며 의도적으로 불편해진 무료 UX를 피하기 위한 강요 수단이 아니다.

## 법규/제품 주의

WLD/WDX는 계속 virtual/simulated/game-only다. 맞춤광고, 아동 대상/13세 미만 인지 운영, 추적 확대, 민감 프로파일링은 별도 legal/privacy review가 필요하다. 실결제 구독/상품 조건은 출시 시점 한국·미국 규정을 다시 확인한다.

## 검증/배포

- 문서-only 기획 변경.
- 런타임 코드/DB/API/인프라 수정 없음.
- 이번 변경 자체는 Test 배포 불필요.
- 홈/운영 소식에 대한 실제 공개 소비자 검증은 가능했다.
- 향후 실제 광고 배치, consent, analytics, 구독 변경은 별도 개발/QA/배포 절차가 필요하다.

## 다음 우선순위

현재 비어 있는 공개 운영 소식을 작고 반복 가능한 **주간 복귀 제품**으로 만들고, 추가 광고 인벤토리 확대 전 `세계 변화 → 맥락형 이어가기 → D7`이 유기적 복귀 행동을 만드는지 검증한다.