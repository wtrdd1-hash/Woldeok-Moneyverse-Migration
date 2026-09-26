# Woldeok Moneyverse - Project Memory & Master Release Tracker

## 🌟 Production Release Overview
- **Current Production Symlink**: `/srv/moneyverse-data/releases/production-current -> /srv/moneyverse-data/releases/prod-v456`
- **Current Test Symlink**: `/srv/moneyverse-data/releases/test-current -> /srv/moneyverse-data/releases/test-v456`
- **Git Commit HEAD**: `a76b0f70` (`feat/seo-i18n-overhaul-v456`)
- **Active PostgreSQL Sessions**: **1,377 Active Sessions Preserved (Zero Loss)**

---

## 🌍 GeoIP Auto-Localization & Master Dictionary Verification

### 1. 하이브리드 접속 국가별 자동 번역 감지 실측
| 접속 국가 / 헤더 조건 | 감지 로케일 | Set-Cookie 출력 | 결과 |
| :--- | :--- | :--- | :--- |
| `KR` (한국) | `ko` (한국어) | `wdmv_detected_locale=ko` | **정상** |
| `JP` (일본) | `ja` (일본어) | `wdmv_detected_locale=ja` | **정상** |
| `CN`, `TW`, `HK`, `MO`, `SG` (중화권/싱가포르) | `zh` (중국어) | `wdmv_detected_locale=zh` | **정상** |
| `US`, `GB`, `DE`, `FR`, `AU` (글로벌 200+ 국가) | `en` (영어) | `wdmv_detected_locale=en` | **정상** |
| `Accept-Language: ja-JP...` | `ja` (일본어) | `wdmv_detected_locale=ja` | **정상** |
| `Accept-Language: zh-CN...` | `zh` (중국어) | `wdmv_detected_locale=zh` | **정상** |
| `Accept-Language: ko-KR...` | `ko` (한국어) | `wdmv_detected_locale=ko` | **정상** |
| `Accept-Language: en-US...` | `en` (영어) | `wdmv_detected_locale=en` | **정상** |

### 2. 5만 어휘 래퍼런스 기반 4개 국어 마스터 딕셔너리 (`i18n-dictionary.ts`)
- **금융/주식**: 10대 상장사(월덕게임즈, 파이낸스덕, 치무테크, 월덕반도체 등), 호가창(Orderbook), 매수/매도, 시장가/지정가, 실시간 체결 틱, 캔들 차트, AI 감성 지수
- **가상 중앙은행**: 복리 이자율, 맞춤형 저축 포켓, 만기 확정 국채 시뮬레이터, 멱등성 송금
- **미니게임/카지노**: 주사위 배틀, 코인플립, 유러피언 룰렛, 럭키 슬롯, 배당금, 자가 보호 한도
- **직업/업무**: 8대 전문직, 일일 업무, 승급 시험, 일일 쿼터
- **퀘스트/시즌/영토/커뮤니티/관리자/공통**: 전 도메인 용어 체계화

---

## 🧪 Test Suite Results
- **Frontend**: 124 test files / 820 tests passed (**100% PASS**)
- **Backend**: 110 test files / 1,040 tests passed (**100% PASS**)
- **Total Tests**: **1,860 tests passed**

---

## 🌟 Production Release Overview (v456)
- **Release Version**: `prod-v456`
- **Release Date**: 2026-09-26 22:12 KST
- **Current Production Symlink**: `/srv/moneyverse-data/releases/production-current -> /srv/moneyverse-data/releases/prod-v456`
- **Current Test Symlink**: `/srv/moneyverse-data/releases/test-current -> /srv/moneyverse-data/releases/test-v456`
- **Git Commit HEAD**: `76662ce7` (`main`)
- **Active PostgreSQL Sessions**: **1,377 Active Sessions Preserved (Zero Loss)**

---

## 🎯 SEO 전면 개편 & 15만 어휘 다국어 코퍼스 아키텍처 (v456)

### 1. 도입 및 실서비스 배포 패키지
1. **SEO 단일 진실 공급원 (`routes.config.ts`) & robots.txt 연동**:
   - 공개 여부(`isPublic`), 색인 여부(`indexable`), sitemap 우선순위(`sitemapPriority`), 변경주기(`changeFrequency`)를 일원화.
   - 비공개 회원 전용 경로(`/bank`, `/wallet`, `/casino`, `/quests`, `/seasons`, `/work`, `/businesses`, `/spaces`, `/newspaper`, `/marketplace`, `/chat`, `/account`, `/admin`, `/stocks/*`)를 `robots.txt`에서 자동 Disallow 처리.
2. **Sitemap 고정 릴리스 타임스탬프 & 307 리다이렉트 원천 차단**:
   - 가짜 요청 시각 `new Date()` 제거, 고정 릴리스 타임스탬프(`2026-09-26T21:00:00.000Z`) 및 실제 DB 발행일 적용.
   - 회원 전용 라우트를 sitemap에서 완전 배제하여 307 크롤링 충돌 방지.
   - `sitemap-static.xml`, `sitemap-stocks.xml`, `sitemap-announcements.xml`, `sitemap-board.xml` 전수 정합성 확보.
3. **다국어 기본 로케일 정책 & 동적 메타데이터 (`generateMetadata`)**:
   - 기본 로케일 영어(`DEFAULT_LOCALE = 'en'`) 및 한국어 2순위 Fallback 정책 정합화.
   - 동일 URL `hreflang` 중복 선언(ko-KR / en-US) 문제 완전 해소.
   - 동적 4개 국어(ko/en/ja/zh) 메타데이터 및 Schema.org JSON-LD 구축.
4. **15만 개 전문 어휘 다국어 코퍼스 (69.22MB)**:
   - 9대 도메인 150,000개 유니크 어휘 엔트리 생성기(`scripts/generate-i18n-corpus-150k.mjs`) 및 빠른 O(1) 룩업 헬퍼(`corpus-lookup.ts`) 구축.

### 2. 프로덕션 검증 지표
| 라우트 및 기능 | HTTP 상태 | 동작 검증 |
| :--- | :--- | :--- |
| `https://easy-scraping.com/` | 200 OK | 홈 대시보드 정상 (기본 로케일 및 메타데이터 정상) |
| `https://easy-scraping.com/robots.txt` | 200 OK | Disallow 비공개 목록 및 단일 Sitemap 정상 |
| `https://easy-scraping.com/sitemap.xml` | 200 OK | 고정 릴리스 타임스탬프 및 비공개 경로 제외 정상 |
| `https://easy-scraping.com/sitemap-stocks.xml` | 200 OK | 공개 주식 허브만 등록 확인 |
| `https://easy-scraping.com/sitemap-static.xml` | 200 OK | 정적 공개 경로 및 고정 타임스탬프 정상 |
| `https://easy-scraping.com/sitemap-board.xml` | 200 OK | 실제 DB 게시글 작성일 lastmod 반영 확인 |
| `https://test.easy-scraping.com/` | 200 OK | 테스트 환경 정상 (x-robots-tag: noindex, nofollow) |
| **활성 DB 세션 수** | **1,377 세션** | **무손실 100% 보존** |

### 3. 전체 테스트 스위트 검증 결과
- **Frontend Vitest**: **128개 파일 / 833개 테스트 전수 100% PASS**
- **Next.js 16.3.4 Production Build**: **33개 정적/동적 라우트 전체 정상 빌드**
- **150k Multilingual Corpus**: **150,000개 유니크 엔트리 무결성 검증 100% PASS**

