# 2026-10-07 SEO 소셜 바이럴 공유 바, X(트위터) 자동 백링크 봇 및 국고 정상화 (v118)

[English canonical](2026-10-07-seo-social-share-and-twitter-bot-v118.md) | **한국어**

- **작성일**: 2026-10-07
- **릴리스 태그**: `v118` (운영 배포: `prod-v529`)
- **도메인**: SEO & 소셜 바이럴 성장, 트래픽 유입 자동화, 가상 국고 재정 건전성 거버넌스

---

## 1. 개요 및 배경

검색 엔진(구글, 네이버 등)의 색인 반영 및 랭킹 점수 향상을 가속화하고 자연스러운 외부 백링크(Backlink) 유입을 극대화하기 위해 다음 3대 핵심 시스템을 구축 및 프로덕션에 배포하였습니다:

1. **원클릭 소셜 바이럴 공유 툴바 (`SocialShareToolbar`)**:
   - 12종 계산기 및 350+ 롱테일 프리셋, 뉴스 상세, 가상 주식 상세, 진단서 화면에 카카오톡, X(Twitter), 페이스북, 클립보드 원클릭 공유 인터페이스 탑재.
   - 모바일 하단 플로팅 및 웹 반응형 레이아웃 대응.
2. **X(Twitter) 자동 트윗 백링크 봇 (`TwitterPublisherService`)**:
   - Twitter API v2 (OAuth 1.0a User Context HMAC-SHA1) 기반 일일 시황, 주요 금융 팁, 서비스 링크를 자동 포스팅하는 백엔드 데몬 구축.
   - 관리자 SEO 콘솔(`/admin/seo`)에서 실시간 트윗 발송 테스트 및 수동 발행 지원.
3. **국고(VAULT_MAIN) 자금 정상화 (현금 85% : 주식 15%)**:
   - 국부펀드(ASWF) 주식에 과도하게 편중(주식 75% : 현금 25%)되었던 국고 자산 중 7,877만 WLD를 실시간 시장가로 매도 회수하여 현금 1억 1,080만 WLD (84.7%) : 주식 2,000만 WLD (15.3%)의 안전 비율로 전격 정상화.
   - 관리자 국고 관제 화면(`/admin/treasury`)에 즉시 매도 회수 액션 및 안전 비축금 경고 배지 탑재.

---

## 2. 세부 구현 아키텍처

### 2.1 소셜 바이럴 공유 툴바 (`frontend/src/components/common/SocialShareToolbar.tsx`)
- **지원 채널**:
  - 카카오톡 (`Kakao.Share.sendDefault` 피드 템플릿 연동)
  - X / Twitter (`https://twitter.com/intent/tweet` 인텐트 URL)
  - Facebook (`https://www.facebook.com/sharer/sharer.php`)
  - 클립보드 URL 복사 (`navigator.clipboard.writeText` 및 토스트 알림)
- **적용 화면**:
  - 금융/세무 계산기 12종 및 350+ 프리셋 (`/tools/*`)
  - 증여세/복리/대출/적금 등 진단 결과 카드
  - 가상 주식 종목 상세 (`/stocks/[symbol]`)
  - 언론사 뉴스 기사 (`/news/[id]`)

### 2.2 X(Twitter) 자동 트윗 봇 (`backend/src/modules/seo/twitter-publisher.service.ts`)
- **인증 프로토콜**: OAuth 1.0a HMAC-SHA1 서명 생성기 내장 (`generateAuthHeader`).
- **엔드포인트**: `POST https://api.twitter.com/2/tweets` (JSON Body: `{ text: "..." }`).
- **자동 발행 스케줄러**:
  - 평일 오전 9시: 오늘의 가상 증시 오프닝 브리핑 및 인기 종목 링크.
  - 평일 오후 6시: 가상 증시 마감 시황 및 복리 계산기 추천 링크.
- **관리자 수동 제어 API**:
  - `POST /api/v1/admin/seo/twitter/test-tweet` (슈퍼 관리자 권한 검증).

### 2.3 국고 85% 현금 정상화 회수 로직 (`backend/src/modules/treasury/treasury.service.ts`)
- **정상화 공식**:
  - 총 자산 = 현금 잔액 + 주식 평가액
  - 목표 주식 비중 = 최대 15% (목표 주식 평가액 = 총 자산 * 0.15)
  - 초과분 = 현재 주식 평가액 - 목표 주식 평가액 (양수일 경우 전액 시장가 매도 후 국고 현금 금고로 입금)
- **회수 실측 결과**:
  - 회수 전: 현금 3,203만 WLD (24.3%) / 주식 9,877만 WLD (75.7%)
  - 회수액: 7,877만 WLD 주식 매도
  - 회수 후: 현금 1억 1,080만 WLD (84.7%) / 주식 2,000만 WLD (15.3%)

---

## 3. 프로덕션 검증 및 배포 결과

- **빌드 및 린트**: 프론트엔드 Next.js 16 및 백엔드 NestJS 전수 정상 빌드 완료.
- **배포 릴리스**: `prod-v529` 무중단 심볼릭 링크 스위칭 완료.
- **세션 보존**: Active PostgreSQL 회원 세션 100% 무손실 보존.
- **라이브 검증**:
  - `https://easy-scraping.com/tools/compound-interest-calculator`: 소셜 공유 바 정상 노출 및 링크 복사/트위터 공유 확인.
  - `https://easy-scraping.com/admin/treasury`: 국고 현금 1억 1,080만 WLD (84.7%) 정상 유지 및 회수 버튼 정상 작동 확인.
  - `https://easy-scraping.com/admin/seo`: GSC 실시간 연동 및 트위터 발송 제어 카드 정상 구동 확인.
