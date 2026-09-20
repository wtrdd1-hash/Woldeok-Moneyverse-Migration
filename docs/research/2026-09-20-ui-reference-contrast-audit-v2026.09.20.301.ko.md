# UI 레퍼런스 Corpus 및 색상 대비 감사 — v2026.09.20.301

날짜: 2026-09-20  
브랜치: `feat/frontend-contrast-v2026.09.20.301`  
기준: `0b973824d85379119813f9b9f53cd7cdd4ddeb93`

## 목적

프론트엔드 전면 재구축에서 사용할 시각 레퍼런스와 색상 접근성 기준을 고정합니다. “1만 개 이상 레퍼런스”는 모든 화면을 하나씩 수동 검토했다고 주장하는 방식이 아니라, 1만 건 이상 공개 UI corpus를 구조·밀도·계층·패턴 근거로 사용하는 방식으로 적용합니다.

## 레퍼런스 corpus

- SeeClick 웹 데이터: 270k 웹페이지 screenshot crawl과 별도 10,000-image subset. https://github.com/njucckevin/SeeClick/blob/main/readme_data.md
- WebUI: 통합 WebUI/Rico benchmark 기준 6개 viewport의 웹 screenshot 41,970개. https://zenodo.org/records/19195885
- RICO: 9.3k Android 앱에서 66k+ 고유 UI screen과 3M+ UI element. https://www.interactionmining.org/archive/rico
- Enrico: RICO 10k random sample을 수동 큐레이션하고 login/form/list/modal/profile/settings 등 주제로 분류. https://github.com/luileito/enrico

대규모 corpus는 레이아웃 반복 패턴, 정보 밀도, 계층, 컴포넌트 구조를 비교하는 근거로 사용하며 브랜드나 임의 색상을 복제하지 않습니다.

## 접근성 권위 기준

- WCAG 2.2 SC 1.4.3: 일반 텍스트 최소 4.5:1, 큰 텍스트 3:1. https://www.w3.org/TR/WCAG22/
- GOV.UK Design System: 기능별 colour role을 사용하고 WCAG AA 대비를 명시적으로 만족. https://design-system.service.gov.uk/styles/colour/
- Atlassian Design System: 색은 semantic design token으로 적용하고 bold background에는 inverse token 사용. https://atlassian.design/foundations/color
- Material 접근성: 밝은 surface에는 어두운 text, 어두운 surface에는 밝은 text를 사용하며 small text 4.5:1 권장. https://m1.material.io/usability/accessibility.html

## 확인된 결함

1. v297에서 `:root`와 `.dark`가 동일한 semantic palette를 사용했지만 Tailwind `dark:` variant는 계속 활성화되어 밝은 surface와 다크용 utility가 섞일 수 있었습니다.
2. 라이트 3차 text token `#747c86`은 페이지 배경 3.77:1, white card 4.23:1로 일반 텍스트 4.5:1에 미달했습니다.
3. header/footer/table/skeleton 일부가 하드코딩 밝은 색이라 dark mode에서도 밝게 남았습니다.
4. 홈 상태 panel은 light semantic card로 바뀐 뒤에도 inverse white text를 유지했습니다.
5. 상점·작업·사업체·인벤토리·관리자 여러 화면에 light surface 위 300/400 accent text가 남아 있었습니다.
6. 사용자 point color가 밝은 primary background를 만들면서 primary text는 white로 유지될 수 있었습니다.

## 수정 후 대비 최저치

Light palette:

- 기본 text / page: 15.58:1
- 보조 text / page: 6.73:1
- 3차 text / page: 4.90:1
- accent text / page: 6.00:1
- primary button text / primary: 6.48:1

Dark palette:

- 기본 text / page: 17.32:1
- 보조 text / page: 11.49:1
- 3차 text / page: 8.67:1
- accent text / card: 6.14:1
- primary button text / primary: 7.34:1

## 구현 규칙

일반 제품 UI는 semantic foreground/background token을 사용합니다. inverse text는 명시적으로 고정된 dark presentation surface에서만 사용합니다. 상태 색상은 의미를 보조하지만 색만으로 상태를 전달하지 않습니다. 새 일반 크기 text 조합은 병합 전 4.5:1 이상을 증명해야 합니다.
