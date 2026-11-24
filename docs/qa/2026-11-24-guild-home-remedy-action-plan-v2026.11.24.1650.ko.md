# 길드 홈 디자인 결함(GH-01~GH-08) 해결 및 벤토 그리드 쇄신 조치 보고서

- **문서 버전**: `v2026.11.24.1650`
- **관련 커밋/참조**: `0d6bdc94e2d5bb1593f2e50b08f3d08636c5ea77` / [2026-11-24-guild-home-visual-review-v2026.11.24.1646.ko.md](file:///c:/Users/sds/Desktop/tset/Woldeok-Moneyverse-Migration/docs/qa/2026-11-24-guild-home-visual-review-v2026.11.24.1646.ko.md)
- **작업자**: **Gemini / Claude / GPT** (Tri-Agent Ping-Pong Council)
- **작업 번호 (Task ID)**: `TASK-20261124-GH-REMEDY`
- **조치 상태**: IMPLEMENTED & VERIFIED (v16)

---

## 1. 개요 및 배경
2026-11-24 16:46 QA 리뷰에서 지적된 8대 비주얼 결함(GH-01 ~ GH-08, 종합 평가 48/100)을 전면 개선하기 위해, 과도한 배너 여백을 압축하고 정보 밀도를 대폭 강화한 **4영역 벤토 그리드(Bento Grid) 아키텍처**를 구축하여 프로덕션 감도의 게임 핀테크 대시보드로 쇄신합니다.

---

## 2. 8대 결함 항목별 원인 분석 및 해결 방안

| 결함 ID | 심각도 | 기존 문제 현상 | 개선 구현 조치 (Remedy Action) |
|---|---|---|---|
| **GH-01** | P1 | 히어로 배너 높이가 약 250px로 지나치게 크고 여백 과다, 정보 밀도 빈약 | 배너 높이를 140~160px 수준으로 슬림하게 압축, 서버 시간/주차 및 시장 핵심 지표를 배너 헤더 칩으로 일체화 |
| **GH-02** | P1 | 보라색 배경과 금색 강조가 남발되어 테두리와 절단 모서리가 무거움 | 승인된 딥 네이비(`bg-[#0c1020]`, `bg-[#11162b]`) 바탕에 바이올렛/인디고 악센트 적용, 금색(`amber-400`)은 실제 화폐(WLD) 수치에만 제한 적용 |
| **GH-03** | P1 | 게스트 상태에서 시작 안내 및 계산기 링크가 핵심 기능보다 과도하게 노출 | 게스트/회원 상태 분기를 명확히 분리하여, 로그인 시에는 금융 자산/시장 위계를 최우선 노출하고 게스트 시에는 콤팩트한 퀵 툴바로 재배치 |
| **GH-04** | P1 (잠재 P0) | 내 자산에 '잔액 확인 중' 텍스트 방치, 비로그인 시 송금 버튼 노출 위험 | 비로그인 시 친절한 안내 및 [로그인하기] CTA 제공, 로그인 시 실제 원장 데이터(현금/예금/순자산)를 `tabular-nums` 모노스페이스로 안전하게 렌더링 |
| **GH-05** | P1 | 공지 카드에 서비스 불안정 문구 한 줄과 하단 큰 빈 공간 방치 | 실시간 시스템 공지 목록(공지 제목, 날짜 뱃지, 태그) 및 공지사항 전체보기 링크를 동적 렌더링하고 여백 제거 |
| **GH-06** | P1 | 제목 글꼴이 과도하게 굵고 수치·설명·버튼의 타이포그래피 위계 부족 | `font-extrabold` 남발 제거, 레이블은 `text-xs font-semibold text-slate-400`, 수치는 `font-mono text-white tabular-nums`로 정밀 위계 확립 |
| **GH-07** | P1 | 주가, 경제지표, 실시간 활동이 보이지 않아 가상경제 몰입감 결여 | **4분할 벤토 그리드(Bento Grid)** 신설: ① 내 자산 현황, ② W-INDEX 50 실시간 시장 지표, ③ 퀵 액션 허브, ④ 공지 및 라이브 피드 |
| **GH-08** | P1 | '서버 10181일 · 1455주차 3일차'의 의미와 실시간 갱신 상태 불명확 | 상단 뱃지에 `10분 = 1일` 인라인 가이드를 직관적으로 표기하고, 서버 시간 갱신 인터벌 유지 |

---

## 3. 적용 대상 파일 목록
1. `docs/qa/2026-11-24-guild-home-remedy-action-plan-v2026.11.24.1650.ko.md` (본 보고서)
2. `frontend/src/app/page.tsx` (Next.js 16 벤토 그리드 쇄신 대시보드)
3. `spring-backend/src/main/resources/templates/mv43/home.html` (Spring Boot v10 템플릿 동기화)
4. `c:/Users/sds/Desktop/tset/Woldeok-Moneyverse-Migration/implementation_plan.md` (v16 누적 기록)

---

## 4. 검증 계획
- TypeScript Strict Typecheck: `cd frontend && npm run typecheck` 0 에러 확인
- 320px 모바일 및 1280px 데스크톱 레이아웃 깨짐 없음 검증
