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
