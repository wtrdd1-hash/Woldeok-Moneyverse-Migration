# Spring PC·모바일 전체 반응형 UI — 5개 언어 자동/수동 전환 v2026.11.19.39.1

**상태: 실제 Spring 네이티브 코드·H2 HTTP·격리 Chromium 언어 선택기 QA PASS / 전체 운영 승격 보류**

[English 정본](SPRING_RESPONSIVE_FIVE_LOCALE_UI_v2026.11.19.39.1.md) · [한국어 QA](../qa/2026-11-19-spring-five-locale-browser-v39.ko.md) / [EN](../qa/2026-11-19-spring-five-locale-browser-v39.md).

## 사용자 승인 범위와 이번 코드 작업의 실제 범위

사용자는 **PC·모바일 전체 페이지를 승인 디자인 이미지대로 Java Spring Boot 프론트엔드에서 반응형으로 새로 구축**하고, 자동 언어 감지·수동 선택·운영 승격까지 승인했다. 이는 최종 목표다. **이번 v39는 실제 Spring 공통 언어 선택기 구현 단위이며 전체 180개 화면 구현 또는 운영 완료가 아니다.**

충돌 방지를 위한 병렬 작업:
1. [Spring 반응형 핵심 8개 화면 PR #3296](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3296): 홈·지갑·투자·퀘스트·상점·게시판·문의·계정(정적 엔트리 9개), 5개 언어 번역 키 87개, 독립 Chrome 39/39 PASS 및 모의 A/B계정 4/4 PASS. **실제 회원 로그인·원장/운영 QA가 아니며** 주식 `/stocks` Java 라우트와 신규 `/invest` 구분 필요.
2. 본 v39는 [Spring 관리자·Thymeleaf 디자인 PR #3295](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3295) 위에 스택으로 구성해 **진짜 Java 서버 관리자 페이지와 계산기·도구 허브·상태 Thymeleaf 화면에 공통 5언어 선택기**를 구현한다. PR #3296이 소유한 홈/지갑 등 정적 파일은 일절 덮어쓰지 않는다.

**실제 사이트 지원 언어:** `en` English, `ko` 한국어, `ja` 日本語, `zh` 简体中文, `vi` Tiếng Việt. 출처는 기존 `frontend/src/lib/locale.ts` 및 `components/language-switcher.tsx`. 예전 Next의 한국어 기본 fallback과 달리 최신 기획은 영어 글로벌 기본·한국어 두 번째 언어이며 자동 모드에서는 브라우저 선호를 감지한다.

## 언어 동작·우선순위

| 설정 | 실제 작동 | 저장/예외 |
| --- | --- | --- |
| 자동(Auto) | 브라우저 `navigator.languages` 순서의 첫 지원 언어를 자동 결정, 없으면 영어. 현재 Java 서버 화면 본문에 선택 언어를 전달하도록 `?lang=...&mv_auto=1` 적용 | 미확정 국적을 임의 추측하지 않음. `wdmv_detected_locale` 힌트 |
| 영어·한국어·일본어·중국어 간체·베트남어 수동 | 선택한 언어가 우선. URL `?lang` 명시 선택은 해당 페이지에서 우선하며 기존 검색·페이지 번호·해시 유지 | 기존 사이트와 같은 `wdmv_locale` 쿠키(SameSite=Lax) 및 `wdmv_locale_preference` localStorage에 동시 저장 |
| 자동으로 복귀 | 수동 쿠키 삭제 및 통합 설정을 `auto`로 변경한 뒤 브라우저 언어 재검출 | 다른 회원 페이지 이동 후 수동 선택이 살아나는 오류 방지 |
| 저장소 차단·JS 비활성 | 쿠키/URL 또는 HTML 기본 `details/summary`에서 5개 언어 클릭 가능 | JS 비활성의 자동 링크는 실제 브라우저 감지를 수행하지 못하므로 영어 fallback이라고 표시 |
| JA/ZH/VI를 Spring 기존 관리자/계산기에서 선택 | 선택 UI·언어별 안내는 제공되지만 **현재 Java 본문은 영어 대체 표시** | 번역이 끝난 것처럼 사용자를 속이지 않으며, 금액·원장 명칭 임의 자동번역 금지 |
| 핵심 8개 회원 화면 | PR #3296의 기존 87키·5개 언어 선택기 재사용 | 두 구현은 동일한 저장 키를 사용해 상태를 공유 |

## PC·태블릿·모바일 UI 구현 규격

- PC 1440px·태블릿 768px: 헤더의 🌐 언어 버튼, 6개 옵션(Auto+5개 언어)이 있는 드롭다운. 현재 선택은 EN/KO/JA/ZH/VI로 표시.
- 320·390px 모바일: 메뉴를 뷰포트 위쪽 안전영역에 고정하고 높이 제한. 44px 이상 터치 영역, 하단 56px 문의 동그라미·고정 내비와 겹치지 않게 설계. 긴 언어명·글자는 스크롤, 가로 넘침 금지.
- 키보드 Escape 닫기, 포커스 표시, 화면 낭독용 접근 가능한 버튼·언어 태그, 모션 축소 선호 지원.
- 실제 돈/주식·WLD 단위/환율은 언어 선택으로 바뀌지 않으며, 서버 인증·CSRF·원장 영수증만 진실의 원천.
- 관리자 Java CSP는 기존 `default-src 'none'` 아래 **자사 스크립트만 `script-src 'self'`** 허용(인라인·외부 JS 금지). 기존 로그인/승인자·실데이터·503 보존.

## 실제 소스 파일과 검증

소스: `spring-backend/src/main/resources/static/mv-spring/v39/locale-core.mjs`, `language-picker.mjs`, `language-picker.css`; 실제 Spring `mv28/layout.html`, `mv29/status.html`, `mv30/hub.html`, 관리자 Java 공통 HTML·CSP 수정. Java/Node/격리 Playwright 테스트 코드도 포함.

**최종 현재 소스 기준:** Node 로케일 단위 7 PASS, Java `clean test bootJar` **262/262 PASS / 실패0 / 건너뜀0**, 별도 H2 랜덤포트 실제 Spring HTTP 5 PASS, **격리 로컬 테스트 픽스처 Chromium 브라우저 10 PASS**(320/390/768/1440, KO 수동 유지, JA/ZH/VI, Auto, Esc, 문의 버튼 비겹침 및 API 무호출). JAR SHA256 `2f876f422d7b7ba97277a8b29634913857ec9b65dc36d0368b864dd2ebae7b0b`. *브라우저 10건은 실제 로그인·금융 데이터가 없는 합성 UI 픽스처 시험이지 운영 E2E가 아니다.*

**남은 운영 필수 조건:** PR #3295·#3296과 최신 보안·Spring 원본 통합, 기존 180개 전체 페이지 실제 Java 구현·JA/ZH/VI 번역 완결, 정상 사용자/관리자 세션과 실제 금융·퀘스트·채팅 영수증 및 음성 QA, 공식 Test 서버 정확 SHA·Chrome 320~1440 화면 대조, Nginx 무중단·롤백 검증. 미검증이면 **운영 승격 HOLD**, 별도 사용자 승인 재질문 대신 문서에 차단 이유 기록.

[180개 화면 이미지↔Spring 구현 검증 행렬](../qa/SPRING_DESIGN_ROUTE_MATRIX_v2026.11.19.38.1.md). 기획은 작업 중에도 최신 GitHub main/Gemini 변경과 재대조한다.
