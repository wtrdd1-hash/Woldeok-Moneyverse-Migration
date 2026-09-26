# Woldeok Moneyverse - Project Memory & Master Release Tracker

## 🌟 Production Release Overview
- **Current Production Symlink**: `/srv/moneyverse-data/releases/production-current -> /srv/moneyverse-data/releases/prod-v454`
- **Current Test Symlink**: `/srv/moneyverse-data/releases/test-current -> /srv/moneyverse-data/releases/test-v454`
- **Git Commit HEAD**: `5b7caf44` (`main`)
- **Active PostgreSQL Sessions**: **1,376 Active Sessions Preserved (Zero Loss)**

---

## 🔍 SEO & i18n Verification Results

### 1. SEO Architecture & Endpoints
| 엔드포인트 | 상태 코드 | 검증 내역 |
| :--- | :--- | :--- |
| `https://easy-scraping.com/robots.txt` | **HTTP 200** | `/admin`, `/developer`, `/account`, `/wallet`, `/status` 등 크롤러 보호 disallow 규칙 완비 |
| `https://easy-scraping.com/sitemap.xml` | **HTTP 200** | 정적/동적 사이트맵 인덱스 정상 서빙 |
| `https://easy-scraping.com/sitemap-stocks.xml` | **HTTP 200** | 상장 종목 10개 실시간 사이트맵 제공 |
| `https://easy-scraping.com/sitemap-announcements.xml` | **HTTP 200** | 공지사항 피드 사이트맵 정상 서빙 |
| `https://easy-scraping.com/sitemap-board.xml` | **HTTP 200** | 공개 게시판 게시글 사이트맵 제공 |
| `https://easy-scraping.com/opengraph-image` | **HTTP 200** | `image/png` 동적 OG 이미지 생성 및 캐싱 |
| **OpenGraph & Twitter Card** | **정상** | 1200x630 규격 OG 이미지 및 summary_large_image 완비 |
| **JSON-LD 구조화 데이터** | **정상** | WebSite, Organization, WebApplication Schema.org 마크업 |

### 2. Multi-Language (i18n) 4개 국어 지원
- **지원 언어**: 한국어(`ko`), 영어(`en`), 일본어(`ja`), 중국어(`zh`)
- **쿠키 기반 언어 감지**: `Cookie: wdmv_locale=ko/en/ja/zh`
- **HTML lang 속성 동기화**: `<html lang="ko">`, `<html lang="en">`, `<html lang="ja">`, `<html lang="zh">`
- **내비게이션 딕셔너리**: `ENGLISH_LABELS`, `JAPANESE_LABELS`, `CHINESE_LABELS` 4대 메가 카테고리(`금융·투자`, `경제·활동`, `플레이·시즌`, `커뮤니티`), 전체 서브메뉴, 모바일 드로어 전수 번역 지원

---

## 🧪 Test Suite Results
- **Frontend**: 123 test files / 816 tests passed (**100% PASS**)
- **Backend**: 110 test files / 1,040 tests passed (**100% PASS**)
- **Total Tests**: **1,856 tests passed**
