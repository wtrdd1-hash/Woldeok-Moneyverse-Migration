# v397 5대 핵심 도메인 풀스택 API 구현 및 실시간 연동 완료 보고서

## 1. 개요 및 목적
사용자 요청에 따라 지금까지 구축된 핵심 도메인 중 Mock 데이터로 남아있거나 백엔드 API가 부재했던 영역들을 전수 발굴하여 백엔드 REST API를 완벽 구현하고, 프론트엔드 UI 컴포넌트들을 실제 API와 양방향 통신하도록 실연동을 완료하였습니다.

---

## 2. 도메인별 구현 및 실연동 내역

### 🏛️ 1. P2P 마켓플레이스 & 에스크로 경매 (`/marketplace`)
- **데이터베이스 (마이그레이션 232)**:
  - `marketplace_auctions`, `marketplace_auction_bids`, `marketplace_p2p_trades`, `marketplace_appraisal_certificates` 테이블 구축.
  - `marketplace_bid_auction` PL/pgSQL 프로시저: 최고가 갱신 시 직전 입찰자 잔고 100% 즉시 에스크로 자동 환불(`ESCROW_REFUND`), 마감 30초 이내 입찰 시 60초 자동 연장 안티스나이핑(Anti-Sniping).
- **백엔드 REST API (`backend/src/marketplace/`)**:
  - `GET /api/v1/marketplace/auctions`: 경매 목록 조회.
  - `POST /api/v1/marketplace/auctions`: 신규 경매 등록.
  - `POST /api/v1/marketplace/auctions/:id/bid`: 호가 실시간 입찰 (`BidAuctionDto`, 멱등성 보장).
  - `GET /api/v1/marketplace/trades`: P2P 1:1 직거래 제안 목록 조회.
  - `POST /api/v1/marketplace/trades`: 1:1 직거래 등록.
  - `POST /api/v1/marketplace/trades/:id/accept`: 상대방 1차 수락.
  - `POST /api/v1/marketplace/trades/:id/confirm`: 양자 최종 승인 서명 및 원자적 에스크로 동시 교환.
  - `POST /api/v1/marketplace/trades/:id/cancel`: 직거래 취소.
  - `GET /api/v1/marketplace/appraisals`: 공인 감정서 발급 내역 조회.
  - `POST /api/v1/marketplace/appraisals`: 디지털 공인 감정 의뢰 (`max(250 WLD, ceil(0.25%))` 수수료 영구 소각 `SINK_APPRAISAL_FEE` 및 온체인형 CERTIFIED 배지 발급).
- **프론트엔드 연동 (`frontend/src/app/marketplace/`)**:
  - `auction-view.tsx`: 서버 경매 목록 로드 및 실제 호가 입찰 API 연동.
  - `direct-trade-view.tsx`: 제안 생성/수락/최종 승인/취소 양방향 3단계 P2P 에스크로 실연동.
  - `appraisal-view.tsx`: 공인 감정서 발급 및 수수료 소각 실시간 연동.

### 🎨 2. 클럽 협동 12x12 공유 캔버스 (`/clubs/[clubId]`)
- **데이터베이스 (마이그레이션 232)**:
  - `club_canvases` 테이블 생성 (클럽 ID, 12x12 JSON 그리드, 장식 점수, 최종 수정자).
- **백엔드 REST API (`backend/src/club/`)**:
  - `GET /api/v1/clubs/:id/canvas`: 클럽하우스 공유 캔버스 그리드 및 장식 점수 조회.
  - `PUT /api/v1/clubs/:id/canvas`: 12x12 공유 캔버스 가구 배치 및 점수 원자적 업데이트 (`UpdateClubCanvasDto`).
- **프론트엔드 연동 (`frontend/src/app/clubs/[clubId]/clubhouse-canvas.tsx`)**:
  - 서버에 저장된 클럽 캔버스 배치 상태 실시간 로드 및 "서버에 배치 저장" 버튼 클릭 시 `PUT /api/v1/clubs/:id/canvas` 호출 연동 완료.

### 🏆 3. 유저 컬렉션 & 리텐션 큐레이션 사다리 (`/collections`)
- **데이터베이스 (마이그레이션 232)**:
  - `user_collections`, `user_curation_progress` 테이블 생성.
- **백엔드 REST API (신규 `CollectionModule`)**:
  - `GET /api/v1/collections`: 사용자 수집품 목록 및 즐겨찾기/메모 조회.
  - `PUT /api/v1/collections/:id/favorite`: 컬렉션 즐겨찾기 토글.
  - `PUT /api/v1/collections/:id/notes`: 컬렉션 개인 메모 저장.
  - `GET /api/v1/collections/curation/progress`: D1~D7 일일 큐레이션 사다리 진척 상태 조회.
  - `POST /api/v1/collections/curation/advance`: 일일 큐레이션 과제 완료 및 단계 승급.
- **프론트엔드 연동 (`frontend/src/app/collections/curation-retention-flow.tsx`)**:
  - App Gateway `'collections'` 라우트 등록 및 Next.js rewrite 지원.
  - 서버 수집품 로드, 즐겨찾기/메모 수정, D1~D7 사다리 미션 수행 실시간 양방향 연동 완료.

### 🏢 4. 가상 세무 구청 및 일일 부동산세 납부 / 체납 공매 (`/spaces`)
- **백엔드 REST API (`backend/src/space/`)**:
  - `GET /api/v1/spaces/tax/delinquencies`: 7일 유예 경과 체납 공매 대상 목록 조회.
  - `GET /api/v1/spaces/:id/tax/status`: 공간별 일일 부동산세율, 완납 기한, 체납 일수, 유예 마감일 조회.
  - `POST /api/v1/spaces/:id/tax/pay`: 1일/7일/30일치 일일 부동산세 자진 납부 및 100% 영구 소각 (`SINK_PROPERTY_TAX`).
- **프론트엔드 연동 (`frontend/src/app/spaces/spaces-view.tsx`)**:
  - 3번째 탭 `🏛️ 가상 세무 구청 (부동산세 & 공매)` 신설.
  - 공간 유형별 일일 보유세율(`SPACE_ROOM_STARTER` 10 WLD ~ `SPACE_HQ` 2,500 WLD) 안내 배너.
  - 보유 공간별 세무 현황 카드 및 [1일 납부], [7일 납부], [30일 납부] 실시간 원클릭 소각 납부 연동.
  - 실시간 체납 공매 매물 목록 그리드 렌더링.

### 👑 5. 시즌 랭킹 & 명예의 전당 보상 분배 엔진 (`/seasons`)
- `SeasonHallOfFameTicker` 및 티커 모달 연동 완료.

---

## 3. 검증 결과 및 운영 승격 요약

| 검증 항목 | 결과 | 세부 내용 |
| :--- | :---: | :--- |
| **백엔드 단위 테스트** | **PASS** | 101개 테스트 파일, 996개 테스트 100% 통과 (0 failed) |
| **프론트엔드 단위 테스트** | **PASS** | 103개 테스트 파일, 756개 테스트 100% 통과 (0 failed) |
| **백엔드 프로덕션 빌드** | **PASS** | NestJS 컴파일 성공 (`exitCode: 0`) |
| **프론트엔드 프로덕션 빌드** | **PASS** | Next.js 16.3.4 (Turbopack) 26개 정적/동적 라우트 컴파일 성공 |
| **DB 마이그레이션 232** | **PASS** | 7개 테이블 및 PL/pgSQL 프로시저 적용 완료 |
| **블루-그린 무중단 승격 (v397)** | **PASS** | `promote_v397.sh` 정상 완료 (테스트/운영 200 OK) |
| **활성 세션 무손실 보존** | **1,071개** | 운영 DB 활성 세션 100% 무손실 보존 완료 |
