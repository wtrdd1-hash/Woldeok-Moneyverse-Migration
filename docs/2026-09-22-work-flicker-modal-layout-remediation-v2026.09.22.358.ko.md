# 직업 업무(Work) 0.5초 주기 깜빡임 루프 제거 및 업무 완수 모달 레이아웃 쇄신 (v2026.09.22.358)

- **문서 버전**: `v2026.09.22.358`
- **배포 릴리스 경로**: `/srv/moneyverse-data/releases/prod-11fdec7-v358`
- **Exact Git SHA**: `11fdec7fbb00ead5709b6e52069f89f1f6fb4440` (단축: `11fdec7`)
- **대상 엔드포인트**: `https://easy-scraping.com/work` 및 `https://test.easy-scraping.com/work`

---

## 1. 개요 및 해결 과제

1. **0.5초 주기 화면 깜빡임 및 버스트 RSC 네트워크 폭풍 결함**:
   - `/work` 진입 시 브라우저 탭 파비콘이 무한 회전하며 0.5초마다 화면이 깜빡이고 사용자가 아무런 조작도 할 수 없던 결함 해결.
   - 원인 분석: `frontend/src/app/work/page.tsx`에 선언된 `<LiveRefresh everyMs={10_000} />`가 10초마다 `router.refresh()`를 지속 발화시켰으며, 백그라운드 RSC 갱신 과정에서 페이지 내의 8개 내비게이션 링크에 대한 사전 프리페치(Prefetch) 요청들이 0.5초 간격으로 동시 다발 발화되어 크롬 렌더링 스레드를 잠식함.
2. **업무 완수 모달 뷰포트 상단 클리핑 결함 (사진 2)**:
   - "업무 시작하고 보상 받기" 클릭 시 모달 카드의 상단 80%가 브라우저 화면 바깥(음수 좌표)으로 밀려 올라가 오직 하단 "닫기" 버튼만 보이던 결함 해결.
   - 원인 분석: 커스텀 Flexbox 오버레이의 `items-center justify-center` 조합이 뷰포트보다 큰 콘텐츠를 음수 Y 좌표 공간으로 강제 분배함.
3. **업무 완수 모달 30px 미세 슬릿 찌그러짐 및 스크롤바 결함 (사진 3)**:
   - 모달 카드 내에서 정작 중요한 WLD 및 숙련도 EXP 보상 박스와 제출 버튼이 30px 높이의 좁은 틈새(slit)로 축소되어 찌그러지고 우측에 윈도우 스크롤바 화살표가 생기던 치명적 레이아웃 결함 해결.
   - 원인 분석: Flexbox 컨테이너 내 `max-h-[90dvh]`와 `CardContent`의 `flex-1 overflow-y-auto`가 최소 높이 제약 결여로 브라우저에 의해 극단적으로 축소 압축됨.
4. **직업 업무 카드 불필요 윈도우 스크롤바 화살표 (사진 1)**:
   - 윈도우 OS 크롬 브라우저에서 태스크 카드 내부에 불필요한 세로 스크롤바가 표시되던 현상 해결.

---

## 2. 세부 구현 및 변경 내역

### 1) `frontend/src/app/work/page.tsx`
- `<LiveRefresh everyMs={10_000} />` 및 해당 컴포넌트 임포트 전면 제거.
- 지속적 RSC 리프레시 폭풍 및 프리페치 루프를 원천 차단하여 부드럽고 안정적인 페이지 구동 보장.

### 2) `frontend/src/app/work/work-forms.tsx`
- **Radix UI `Dialog` 기반 모달 전면 교체**:
  - 기존 커스텀 flexbox 오버레이를 제거하고 프로젝트 표준 `@/components/ui/dialog` (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`)로 재구축.
  - 뷰포트 정중앙 배치(`fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]`)로 상단 클리핑 결함 영구 박멸.
  - `max-w-md w-[calc(100vw-2rem)] p-5 sm:p-6 sm:rounded-2xl max-h-[85vh] overflow-y-auto` 규격으로 보상 박스, 48px 터치 제출 버튼, 축하 피드백 카드가 찌그러짐 없이 완벽하게 표시됨.
- **중복 리프레시 및 스크롤 제거**:
  - `state.status === 'ok'` 발생 시 불필요하게 `router.refresh()`를 이중 호출하던 `useEffect` 제거 (`completeTaskV2Action`이 이미 `revalidatePath('/work')` 수행).
  - 윈도우 전체 스크롤을 튀게 만들던 `scrollIntoView()` 제거.
- **사이클 상태 및 독립 식별자**:
  - 매 열림마다 고유 UUID `requestKey`와 `cycle` 카운터를 부여하여 중복 제출 방지 및 폼 상태 완벽 격리.

### 3) `frontend/src/app/work/career-tasks-board.tsx`
- 태스크 카드 `Card` 클래스에 `overflow-hidden`을 추가하여 윈도우 크롬 네이티브 스크롤바 발생 방지.

### 4) `frontend/src/app/work/work-form-regression.test.ts`
- Node 파일 시스템 환경 지시자 `// @vitest-environment node` 추가 및 단위 테스트 정합성 보장.

---

## 3. 검증 결과

1. **단위 테스트 통과 실측**:
   - `vitest run "src/app/work/"`: 4개 테스트 파일, 41개 테스트 케이스 100% PASS.
2. **Turbopack Next.js 빌드**:
   - 3.5초 내 컴파일 완료, 26개 정적/동적 라우트 생성 완료.
3. **무중단 승격 프로모션 (`/home/debian/stage_v358.sh`)**:
   - 런타임 신원 일치 검증: `https://test.easy-scraping.com` 및 `https://easy-scraping.com` 모두 `11fdec7...`로 100% 일치.
   - 전체 엔드포인트 HTTP 200 OK 응답 확인 (`/work`, `/stocks`, `/casino`, `/admin` 등).
   - **PostgreSQL 968개 활성 사용자 세션 100% 무손실 보존 실측 확인**.
