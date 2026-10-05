# v2026.10.05.528 — 전체 UI 재검토

[English canonical](2026-10-05-full-ui-recheck-v2026.10.05.528.md)

## 범위
현재 권한문서와 실제 런타임 식별값을 기준으로 수행한 문서/증거 전용 전체 UI 재검토.

## 결과
- 최신 main: 138페이지, 관리자 25, 동적 24.
- Production/Test는 각각 112/122페이지의 이전 후보라 최신 main exact 후보 승인 증거가 없음.
- P0: 현재 Test/main 기본 fallback locale이 영어지만 권한문서는 한국어 제품/공개 fallback을 요구함.
- P1: 전역 온보딩 패널이 `sm` 미만 340px 고정폭이라 320px에서 잘릴 수 있음.
- P1: 공통 interaction primitive와 여러 전역/화면 컨트롤에 44px 미만 hit target 존재.
- P1: EN/JA/ZH 명시 locale에서도 전역 skip-link 문구가 한국어로 남음.
- P1: 모바일 내비게이션 구현과 App Spec/Design System의 현재 내비게이션 모델이 충돌함.
- P2: 부분 공개 HTTP 스모크에서 Production `/newspaper`, Test `/shop` 본문 전송 타임아웃 확인.

## 런타임/릴리스
소스 수정, Test 배포, Production 배포, DB 변경, 마이그레이션, 승격은 수행하지 않았다. 수정 및 exact-SHA 전체 라우트 브라우저 QA 전까지 릴리스 승인은 BLOCKED다.
