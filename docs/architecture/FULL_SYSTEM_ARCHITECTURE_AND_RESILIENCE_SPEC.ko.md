# 🌐 Woldeok Moneyverse 종합 기능 및 프론트엔드 무결성 점검 아키텍처 (Full System Architecture & Resilience Spec)

> 본 문서는 Moneyverse 국가 금융 시스템의 3대 핵심 기관(중앙 국고, 국가조폐국, 국가중앙은행)과 5대 금고 환원 체계, 국민연금(NPS), 2FA 관리자 보안, 카지노 피구세 격리 및 프론트엔드 다중 뷰포트(320px ~ 1440px+) 레이아웃 무결성 점검 결과를 종합 집대성한 정본 아키텍처 명세서입니다.

---

## 🏛️ 1. 국가 3대 금융 기관 및 국고 자금 순환 아키텍처
- 조폐국(MINT) 통화발행 정책 주문 승인 -> 중앙 국고(VAULT_MAIN) 직행 충전.
- 중앙 국고 5대 금고(Main, Welfare, Infra, Emergency, Burn) 40/30/20/10 세수 분배.
- 카지노 10만 WLD 이상 베팅 시 1% 피구세 복지금고(VAULT_WELFARE) 실시간 원천징수 직행 분개.
- 국민연금 1시간 정기 자동 지급 스케줄러(pension.hourly_payout_sweep).
- 국고 관리자 임금 복식부기 실지급(30% 법정 안전 비축금 자동 보호).

---

## 📱 2. 프론트엔드 다중 뷰포트 레이아웃 무결성 점검 (Multi-Viewport Resilience Audit)
- 320px 극소 모바일: overflow-x: clip !important 및 다이얼로그 max-w-[calc(100vw-2rem)] max-h-[90dvh] 보장 (PASS)
- 390px 표준 스마트폰: pb-safe, 모바일 하단 내비게이션 간섭 제로 (PASS)
- 768px 태블릿: 2열 그리드 및 툴바 flex-wrap 버튼 랩핑 (PASS)
- 1100px 랩탑: 테이블 전용 overflow-x-auto 및 min-w-0 플렉스 수축 방어 (PASS)
- 1440px+ 와이드: max-w-[1440px] mx-auto 중앙 정렬 (PASS)
