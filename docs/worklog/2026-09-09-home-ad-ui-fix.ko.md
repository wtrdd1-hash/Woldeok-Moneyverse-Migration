# 홈 광고 및 데스크톱 내비게이션 UI 수정 — 2026-09-09

## 제보된 문제

운영 데스크톱 화면에서 두 가지 UX 문제가 확인되었습니다.

- 충분히 넓은 화면인데도 한국어 헤더 메뉴가 음절 단위로 여러 줄에 걸쳐 표시되었습니다.
- Google이 광고를 채우지 못한 경우에도 AdSense 영역이 큰 빈 박스로 남아 푸터 앞 여백이 과도하고 화면이 고장 난 것처럼 보였습니다.

## 원인

- 데스크톱 헤더 링크에 줄바꿈 방지 규칙이 없었습니다. 로그인 상태에서 메뉴, 언어/테마, 계정, 지갑 액션이 함께 표시되면 메뉴 영역이 좁아져 한글 라벨이 줄바꿈될 수 있었습니다.
- 공개 광고 컴포넌트가 AdSense의 실제 `unfilled` 결과와 무관하게 최소 높이 140px 및 외부 여백과 플레이스홀더 UI를 항상 유지했습니다.
- 홈 데스크톱 섹션 간격도 80px로 커서 빈 광고 주변의 공백이 더 크게 보였습니다.

## 변경 내용

- 데스크톱 헤더 링크와 드롭다운 트리거에 `whitespace-nowrap`를 추가했습니다.
- 로그인 상태에서도 헤더가 더 안정적으로 맞도록 데스크톱 메뉴 간격을 소폭 줄였습니다.
- 홈 데스크톱 섹션 간격을 80px에서 56~64px 범위로 줄였습니다.
- 실제 Google `data-ad-status`에 반응할 수 있도록 광고 슬롯 UI를 클라이언트 AdSense 컴포넌트로 옮겼습니다.
- `data-ad-status`를 감시하는 `MutationObserver`와 최대 6초의 no-fill 타임아웃을 추가했습니다.
- Google이 `unfilled`를 반환하거나 초기화 오류가 발생하거나 제한 시간 안에 광고가 채워지지 않으면 광고 섹션 전체를 접습니다.
- Google 문서에 정의된 `unfill-optimized` 상태는 일반 빈 no-fill처럼 숨기지 않고 유지하도록 보완했습니다. `Fill empty in-page ads` 설정으로 AdSense가 최적화한 내용을 프론트가 임의로 제거하지 않기 위함입니다.
- 빈 점선 플레이스홀더를 제거했습니다. 실제 채움 또는 최적화된 광고 영역은 스폰서 표기와 최대 970px 반응형 폭을 유지합니다.
- 여러 광고 위치에서 동일 스크립트를 재사용하도록 AdSense 로더에 고정 `id`를 추가했습니다.

## 광고 설정 확인

현재 운영 HTML에는 설정된 publisher/slot이 출력되고 있고, `/ads.txt`에는 Google publisher 레코드가 있으며, CSP도 현재 구현에 필요한 AdSense script/frame/connect origin을 허용하고 있습니다. 따라서 이번 수정은 광고 ID를 임의로 바꾸거나 가짜 광고를 만드는 작업이 아닙니다. 실제 광고 fill 여부는 AdSense 계정·사이트 승인·인벤토리·방문자 환경에 따라 Google이 결정하며, no-fill인 경우에도 이제 UI가 빈 박스로 깨져 보이지 않게 처리합니다.

Google AdSense 공식 문서는 `data-ad-status="unfilled"`를 광고가 반환되지 않은 빈 유닛으로, `data-ad-status="unfill-optimized"`를 광고가 반환되지 않았지만 AdSense가 최적화한 상태로 구분합니다. 따라서 명시적인 일반 no-fill은 접되 최적화 상태는 AdSense가 유지할 수 있도록 처리합니다.

참고: https://support.google.com/adsense/answer/10762946

## 검증

- 후속 상태 처리 수정 전 Frontend TypeScript typecheck: 통과.
- 최종 PR HEAD 기준으로 저장소 전체 CI를 다시 통과해야 병합합니다.
- 최종 검증된 애플리케이션 커밋이 `main`에 반영된 후에만 Production rollout 및 공개 smoke 검증을 진행합니다.
