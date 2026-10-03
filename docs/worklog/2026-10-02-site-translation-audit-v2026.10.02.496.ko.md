# v2026.10.02.496 — 사이트 번역 기능 감사 작업기록

**상태:** 감사 완료 / 수정 미구현
**브랜치:** `audit/translation-v2026.10.02.496`
**시작·중간 origin/main:** `a36c63f4cfa35702499b461f7cc00dfd9ae25d36`
**운영 애플리케이션 SHA:** `7080738e656aca099d5c871278d178d69a984fcc`

## 시작 기록
문서 거버넌스, 권위 프로젝트 기획서, 통합 기획 마스터, 현지화 정책, 최신 main을 먼저 확인한 뒤 사이트 번역 경로를 감사했다.

## 확인 결과
- 현재 main은 `DEFAULT_LOCALE='ko'`이며 영문 1순위·한국어 2순위 권위 기준과 불일치한다.
- 현재 main 지원 언어는 `ko/en/ja/zh` 4개지만 권위 P0/P1 계획은 `en/ko/ja/de/fr/es/pt-BR`이다.
- GeoIP가 언어 선택에 관여해 `locale != jurisdiction` 원칙과 충돌한다.
- `TranslatedText`는 영/한 2분기만 지원해 일본어·중국어 선택 시 해당 표면이 한국어로 되돌아간다.
- 마스터 번역 사전이 2개 존재하지만 하나는 런타임 import 0건, 다른 하나는 비테스트 소비자 1곳뿐이다.
- 프론트 소스 523개 파일에 하드코딩 한국어가 있고 55개 파일이 `isEn` 2분기 방식을 사용한다.
- 운영 /en, /ja, /zh는 200이지만 현지화 페이지에 한국어 제목/본문이 남는다.
- 운영 /fr, /de, /es, /pt-BR은 404다.
- 운영 sitemap은 en/ja/zh locale 경로만 광고하고 계획 언어는 누락돼 있다.

## 검증
locale/dictionary/language-switcher/search-indexing 표적 테스트는 13/13 통과했다. 다만 테스트 자체가 한국어 기본·4개 locale 동작을 정답으로 고정해 권위 기획 충족 증거는 아니다.

이번 감사에서는 애플리케이션 코드, DB, Test 런타임, Production 런타임을 변경하지 않았다.
