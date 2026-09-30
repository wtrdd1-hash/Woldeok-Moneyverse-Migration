# 내부 업데이트 — v2026.09.30.487 광고 전용 수익화

날짜: 2026-09-30  
범위: 기획/문서 전용  
시작/중간 main: `85508db432cd525570e26bc1820b9e637a8140fa`

## 결정
- 현재 사업자등록 제약에서는 현금 수익화를 광고수익으로만 제한한다.
- 유료 구독/광고제거, 유료 코스메틱·디지털상품, 유료 WLD/WDX, 유료 확률형/카지노 가치, 사용자 유료 수수료, 후원/멤버십, 유료 API/B2B, 제휴/직접판매는 향후 권위 변경 전까지 BLOCKED다.
- `AD_ONLY_ADVERTISING_REVENUE_SPEC.md` / `.ko.md`를 추가했다.
- PROJECT_PLAN, 통합 기획 마스터, 수익화 명세, 대한민국 준수 감사, 문서 진입점에 v487 상위 대체 게이트를 반영했다.

## 월 광고수익 100만 원 모델
실측 Page RPM만 사용한다: `PV = 1,000,000 / PageRPM × 1,000`.

시나리오 입력:
- RPM 2,000원 -> 500,000 PV
- RPM 5,000원 -> 200,000 PV
- RPM 10,000원 -> 100,000 PV
- RPM 20,000원 -> 50,000 PV

어떤 RPM도 예측·보장하지 않는다.

## 성장/품질 게이트
- 대규모 pSEO 전 Search Console/index/canonical 진실성.
- audience-first 계산기·가이드와 실제 관련 내부링크.
- CWV/작업완료/오클릭 가드레일이 있는 Auto Ads/광고량/형식 실험.
- 자가클릭, 클릭유도, 보상형 광고조회, traffic exchange, 봇 impression, 저품질 유료트래픽 금지.
- 민감 route 광고 차단 유지.

런타임, AdSense 설정, Test, Production 변경 없음.
