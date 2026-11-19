# 🏛️ Woldeok Moneyverse — Spring Boot 3.3.5 Single Runtime Architecture (Node.js 100% Deprecated)

**최종 확정 일자:** 2026-11-19  
**런타임 표준:** Java 21 OpenJDK, Spring Boot 3.3.5 Enterprise Single Fat JAR  
**운영 호스트:** Debian 13 (Proxmox VM, IP: 127.0.0.1:4550)  
**소켓 게이트웨이:** Netty-SocketIO 2.0.12 (Port: 9092)  
**데이터베이스:** PostgreSQL 16 (Port: 5433)

---

## 1. 아키텍처 원칙 (Core Invariants)

1. **Node.js 런타임 및 Next.js Node 서버 완전 배제**:
   - 운영 서버 내 모든 구형 Next.js 프론트엔드 서비스(`moneyverse-release-*-frontend.service` 등)는 전수 비활성화(`systemctl disable`)되었으며 프로세스가 0건으로 배제됨.
   - 모든 웹 정적 리소스 및 SSR 라우팅은 Spring Boot 3.3.5(`SpaWebMvcConfig.java` 및 컨트롤러 레이어)에서 직접 서빙함.

2. **단일 Fat JAR 통합 운영**:
   - 포트 `4550`: Spring MVC 웹 라우팅, 180개 REST API 엔드포인트, Swagger OpenAPI 3.0.
   - 포트 `9092`: Netty-SocketIO 기반 실시간 호가/시세(`market:ticks`), 관리자 관제(`admin:metrics`), 실시간 채팅 및 경매 웹소켓.
   - 백그라운드 데몬: Discord4J 3.3.3 디스코드 봇 및 Lavaplayer 24시간 음성 채널 상주 봇.

3. **실시간 원장 데이터 직접 바인딩**:
   - Mock 데이터 및 하드코딩 텍스트를 전면 배제하고, 실제 PostgreSQL 복식부기 불변 원장(`accounts`, `account_balances`, `ledger_postings`)을 조회하여 사용자 자산 및 시세를 실시간 렌더링함.
   - `WalletController.java`의 `/api/wallet/summary` 엔드포인트를 통해 세션 쿠키 기반으로 로그인 상태 및 실제 잔액(`395,728 WLD`)을 프론트엔드에 실시간 제공.

---

## 2. 실시간 Socket.IO 스트리밍 규격

- **게이트웨이 URL**: `https://easy-scraping.com/socket.io/` (Nginx 프록시 ➡️ `127.0.0.1:9092`)
- **전송 프로토콜**: WebSocket 및 Polling 자동 업그레이드 (EIO=4)
- **주요 이벤트**:
  - `market:ticks`: 2초 주기로 10대 상장사 전체 시세 틱 브로드캐스트 (`StockMarketSocketStreamer.java`)
  - `stock:quote`: 개별 종목 룸(`stock:{symbol}`) 대상 시세 변경 전송
  - `orderbook:update`: 개별 호가창 룸(`orderbook:{symbol}`) 10단 호가 스트리밍
  - `online`: 실시간 접속자 수 브로드캐스트
