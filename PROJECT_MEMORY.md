# Woldeok Moneyverse - Project Memory & Master Release Tracker

## 🌟 Production Release Overview
- **Current Production Symlink**: `/srv/moneyverse-data/releases/production-current -> /srv/moneyverse-data/releases/prod-v455`
- **Current Test Symlink**: `/srv/moneyverse-data/releases/test-current -> /srv/moneyverse-data/releases/test-v455`
- **Git Commit HEAD**: `bb34b1e9` (`main`)
- **Active PostgreSQL Sessions**: **1,376 Active Sessions Preserved (Zero Loss)**

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

## 🎯 10대 글로벌 레퍼런스 기반 도파민 & 수익화 BM 고도화 (v456)

### 1. 도입 및 실서비스 배포 패키지
1. **Polymarket형 실시간 경제 예측 시장 (`/prediction`)**:
   - 상장 기업 주가 돌파, 중앙은행 기준금리, AI 정책 결정에 대한 전략적 Yes/No 바이너리 지분 매매.
   - 체결 시 거래 수수료 2% 가상 경제 펀드로 자동 소각.
2. **Robinhood형 Canvas 2D 럭키 주식 스크래치 복권 (`ScratchCardModal`)**:
   - 주요 금융/업무 액션 시 지급되는 인터랙티브 복권으로 0.1~10.0주 즉시 지급.
3. **Steam형 활동 보물상자 & 해독 키 & P2P 경매장 연동**:
   - 활동 드롭 상자 개봉 BM 및 경매 대금 5% 소각 메커니즘.

### 2. 프로덕션 검증 지표
| 라우트 및 기능 | HTTP 상태 | 동작 검증 |
| :--- | :--- | :--- |
| `https://easy-scraping.com/` | 200 OK | 홈 대시보드 정상 |
| `https://easy-scraping.com/prediction` | 200 OK | 예측 마켓 오더북 및 거래 정상 |
| `https://easy-scraping.com/stocks` | 200 OK | 주식 거래소 및 차트 정상 |
| `https://easy-scraping.com/casino` | 200 OK | 럭키존 게임 정상 |
| `https://easy-scraping.com/admin` | 200 OK | 관리자 마스터 콘솔 정상 |
| `https://easy-scraping.com/api/notifications/unread-count` | 200 OK | 알림 BFF 엔드포인트 정상 |
| **활성 DB 세션 수** | **1,377 세션** | **무손실 100% 보존** |

### 3. 전체 테스트 스위트 검증 결과
- **Frontend Vitest**: **128개 파일 / 833개 테스트 전수 100% PASS**
- **Next.js 16.3.4 Production Build**: **33개 정적/동적 라우트 전체 정상 빌드**
