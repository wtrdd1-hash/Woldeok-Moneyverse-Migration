# 변경기록 — 리텐션 안전형 수익화 성장 v2026.09.13.44

기준일: 2026-09-13
변경 유형: 문서-only
런타임/Test 배포: 이번 문서 변경에는 불필요
영문 기준 명세: `docs/planning/RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.md`
영문 변경기록: `docs/changelog/2026-09-13-retention-safe-monetization-growth-v2026.09.13.44.md`

## 변경 이유

v2026.09.13.42에서 검토된 공개 콘텐츠 광고가 Production 기본 활성화로 전환됐다. 기존 성장 문서는 이미 사용자가 가치를 경험한 뒤 수익화를 연결하도록 했지만, “광고를 기술적으로 표시할 수 있음”과 “지금 광고를 보여주는 것이 장기 성장에 건강함”을 구분하는 단일 소비자 성장 계약이 부족했다.

실제 공개 서비스는 접근 가능하며 홈은 첫 방문 가치가 있지만 운영 소식은 아직 공개 콘텐츠가 없는 empty 상태다. 따라서 첫 가치 보호와 empty-page 수익화 경계가 현재 가장 큰 수익화/리텐션 공백으로 선정됐다.

## 변경 사항

- 가치 미전달 / 첫 가치 전달 / 이어가기 의도 / 민감·경제 행동의 4단계 소비자 수익화 상태를 추가했다.
- 기존 민감·경제 화면의 광고 금지 경계를 유지했다.
- 가치 우선 광고 배치 순서와 empty/loading/error 정책을 추가했다.
- 전역 광고 노출 목표 대신 코호트별 리텐션 민감형 광고량 평가를 정의했다.
- ARPU/ARPDAU/eCPM과 함께 `retention-adjusted contribution` 판단 프레임을 추가했다.
- 가치 전달 후 광고, empty page 광고 억제, 광고밀도, 구독 제안시점, 검토된 맞춤광고 실험을 추가했다.
- High 위험으로 오클릭/기만 내비게이션, 민감 맥락 광고 유출, 동의·프로파일링 과잉을 기록했고 Medium으로 광고/추천 사기를 기록했다.
- WLD/WDX는 계속 virtual/simulated/game-only이며 맞춤광고·미성년자·추적 확대는 별도 legal/privacy review 대상으로 유지했다.

## Runtime Product Reality Audit

- `https://easy-scraping.com/`: 접근 가능. 첫 방문 설명과 신규사용자 안내가 존재한다.
- `/announcements`: 접근 가능하나 공개 공지가 아직 없다.
- 텍스트 retrieval만으로는 동의·지역·fill 상태에 따른 시각 광고 렌더링 여부를 증명할 수 없으므로, 광고가 실제 표시됐다고/안 됐다고 단정하지 않고 공개면의 자체 가치 준비도를 평가했다.

## 최신 레퍼런스

직접 채택: Deloitte + Google AdMob(2025-06-10), 현재 Google AdSense Program Policies, Google AdSense Privacy & messaging(2026-09-11).

참고/규정 guardrail: FTC Native Advertising guidance, FTC Shutterstock settlement(2026-05).

## 버전 동시작업

초안은 v2026.09.13.43으로 시작했으나 필수 중간 `main` 재확인에서 동시 user-app API coverage 작업이 이미 v2026.09.13.43을 사용한 것을 확인했다. 따라서 이번 성장 변경은 완료 전에 **v2026.09.13.44**로 정정했다.

## 테스트/배포

문서-only 변경이므로 Test 배포는 필요하지 않다. 향후 실제 광고 배치, consent, 구독, analytics 런타임 변경은 별도 개발/QA/배포 경로를 거쳐야 한다.

## 다음 우선순위

현재 비어 있는 공개 운영 소식을 작은 주간 복귀 제품으로 만들고, 광고 인벤토리를 늘리기 전에 `세계 변화 → 맥락형 이어가기 → D7`을 검증한다.