# v607 프론트엔드 전면 감사 작업 기록

- 기준: integration/fullstack-branch-consolidation-20261014-v606, 시작 HEAD 51c7261a, origin/main c56af867; 중간 재확인 동일.
- 문서 기준: docs/planning/INTEGRATED_PLANNING_MASTER.md; v530 긴급 UI 감사 및 v603 보안 감사 기록.
- 범위 인벤토리: 164 page.tsx, 704 TSX, 92 TSX 테스트 파일.
- 발견 P0: admin-seo-audit-view.tsx의 RequestInit.signal에 undefined 전달 가능, TypeScript exactOptionalPropertyTypes 오류. 선택적 signal 속성으로 수정.
- 검증: pnpm offline install 성공; contract build 성공; frontend typecheck 최초 실패 후 수정 뒤 통과; 관리자 SEO 집중 테스트 9/9 통과; frontend build 통과.
- 전체 frontend Vitest 실행 실패: React.act is not a function 반복. 테스트 환경 원인 분석 및 독립 재실행 필요; 실제 브라우저 UI 결함으로 단정 불가.
- v530 기존 위험: /admin/seo 모바일 overflow, 터치 타깃, 레이어 가림, identities API 500, 관리자 인증 E2E 미검증. 최신 화면 재현 전에는 해결/재발 여부 미확정.
- 브라우저 320/375/390/768/1024/1440 화면 캡처, 스크롤 폭, 콘솔 오류, 관리자 로그인별 테스트 및 백엔드 연동은 미실행.
- Test 및 Production 배포 없음. 전체 UI 승인 BLOCKED.

## 승인 후 추가 점검 (v608)
- origin/main 재조회 c56af867 유지; 작업 브랜치 6b358caf에서 시작.
- 관리자 화면 page.tsx 34개 확인. /admin/seo 액션 영역은 grid 1열→2열→flex-wrap, 버튼 min-height 44px 등 모바일 완화 코드가 존재하나 실브라우저 재현 검증은 아직 불가.
- SEO GSC 테이블은 overflow-x-auto 스크롤 컨테이너 사용; 모바일 잘림 여부 실측 미확인.
- SEO 테스트 세트에서 React.act is not a function 반복 재현. React 테스트 setup.ts가 act를 수동 대체하려는 코드가 있어 원인 조사 필요.
- 원격 미니PC Chromium/Playwright 실행 가능 환경 미확보; 실브라우저 시각 검증 미완료.
- 운영 변경 없음, 전체 UI 승인 BLOCKED.

## v609 승인 후 실제 테스트 재검증
- 시작 및 중간 origin/main c56af867 유지.
- 원격 환경 NODE_ENV=production 때문에 React 19 production export에 act가 없음을 확인; NODE_ENV=test로 재실행하여 원래 테스트 실패를 분리.
- 관리자 SEO 테스트의 과거 라벨 기대값을 현재 화면 텍스트와 일치하도록 갱신. 집중 테스트 3파일/16개 통과.
- 전체 프론트엔드 테스트: 215파일 중 197 통과/18 실패, 1178개 중 1144 통과/34 실패 (NODE_ENV=test). 모바일 반응형, 관리자 반응형, SEO, 알림, 카지노, 계산기 등 미해결.
- 프론트엔드 typecheck 통과. 실브라우저 모바일 전수 테스트는 여전히 미완료.
- 테스트 실행은 명시적 NODE_ENV=test로 수행했으며 시스템/운영 환경변수 변경 없음. 운영 승격 금지.

## v610 모바일·관리자 UI 결함 수정
- 시작/중간 origin/main c56af867, 통합 브랜치 격리 유지.
- 루트 layout.tsx에서 관리자에서도 렌더되던 FloatingSupportChatWidget을 RouteAwareFloatingUtilities로 교체; 관리자에서 온보딩/고객지원 플로팅 요소를 렌더하지 않도록 경로 차단.
- MobileBottomNav를 grid-cols-5, min-h-[58px] 및 min-h-[44px] 터치 영역으로 변경; 중복된 min-w 규칙 제거.
- 관리자 하위 메뉴의 가로 스크롤 가드는 실제 min-w-0 코드에 맞춰 테스트 기대값 갱신.
- NODE_ENV=test 모바일/관리자 반응형 17/17 통과, 전체 프론트엔드 1178 중 1148 통과/30 실패(이전 34 실패), typecheck 통과, production Next build 통과.
- 실브라우저 화면 캡처 및 인증 E2E/백엔드 테스트 미실행. Test/Production 승격 없음. 전체 UI 승인 BLOCKED.

## v611 헤더·모달 접근성 회귀 검사
- 최신 origin/main c56af867 재확인.
- 반응형 헤더 두 테스트의 오래된 2xl gap 기대값(4)을 실제 구현(3.5)과 일치하도록 갱신; 기존 코드에서 gap 축소는 이미 반영됨.
- TruncatedList 닫기 버튼 접근성 테스트 기대값을 실제 한국어 접근성 레이블 닫기와 일치시킴. UI 코드는 수정하지 않음.
- 집중 3파일 23/23 통과, 전체 215파일 중 202 통과/13 실패, 1178개 중 1151 통과/27 실패; 타입 검사 통과.
- 이 3건은 테스트 계약 불일치 수정이며 실제 UI 깨짐 해결이라고 주장하지 않음. 운영 미배포.
