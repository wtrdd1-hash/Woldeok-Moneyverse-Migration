# 월덕 머니버스 전 도메인 API 공식 마스터 명세서 (API Catalog Master Specification)

> **버전**: v2026.09.26.460  
> **상태**: Production Authoritative API Specification (100% 실연동 검증 완료)  
> **기준일**: 2026-09-26  
> **기반 인프라**: NestJS 10.x REST API BFF / Next.js 16.3.4 BFF Proxy (`/app-api/v1/*`)  
> **컴플라이언스**: 사행성/도박성 카지노 API 완전 폐기 및 100% 공정 가상경제 게이미피케이션 확립

---

## 🏛️ 1. 아키텍처 및 보안 공통 규격

1. **기본 베이스 URL**:
   - 내부 백엔드: `http://127.0.0.1:3001/api/v1`
   - 프론트엔드 BFF Proxy: `/app-api/v1/*` 또는 `/api/v1/*`
2. **인증 및 세션 관리 (Session Invariants)**:
   - 모든 회원 전용 엔드포인트는 `HttpOnly; SameSite=Lax; Secure` 세션 쿠키(`session_id`)를 통해 인증됩니다.
   - 변조 방지를 위해 `SessionGuard`, `AuthenticatedGuard`, `ConsentGuard`, `CsrfGuard`가 체인으로 적용됩니다.
3. **멱등성 보장 (Idempotency Key)**:
   - 송금, 주문, 아이템 구매 등 모든 금융/원장 변경 요청은 헤더(`X-Idempotency-Key`) 또는 바디(`idempotencyKey`)에 UUID v4를 필수로 포함하여 중복 인출 및 네트워크 재시도 오류를 100% 방지합니다.
4. **글로벌 응답 코드**:
   - `200 OK` / `201 Created`: 성공
   - `400 Bad Request`: 요청 유효성 검증 실패 (DTO 필드 오류)
   - `401 Unauthorized`: 비로그인 또는 만료된 세션
   - `403 Forbidden`: 권한 부족 또는 약관 미동의 (Step-Up 동의 필요)
   - `409 Conflict`: 멱등키 충돌, 잔액 부족, 일일 캡 초과
   - `429 Too Many Requests`: 초당/분당 요청 제한(Rate Limit) 초과

---

## 📋 2. 14대 핵심 도메인별 API 엔드포인트 명세

### 1. 인증 및 세션 (Authentication & Sessions)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 멱등성 |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/auth/bootstrap` | 시스템 기본 설정 및 초기 부트스트랩 정보 조회 | ❌ | ❌ |
| `POST` | `/auth/local/register` | 이메일/비밀번호 로컬 계정 신규 생성 | ❌ | ✅ |
| `POST` | `/auth/local/login` | 로컬 로그인 및 세션 쿠키 발급 | ❌ | ❌ |
| `POST` | `/auth/logout` | 현재 세션 안전 무효화 및 로그아웃 | ✅ | ❌ |
| `POST` | `/auth/signout-all` | 해당 회원의 전체 기기 세션 원격 일괄 강제 종료 | ✅ | ❌ |
| `GET` | `/auth/session` | 현재 접속 세션 유효성 및 권한 레벨 검증 | ✅ | ❌ |
| `PUT` | `/auth/consent` | 서비스 이용약관 및 개인정보처리방침 Step-Up 동의 | ✅ | ✅ |
| `GET` | `/auth/discord/authorize` | Discord OAuth2 소셜 로그인 연동 진입 | ❌ | ❌ |
| `GET` | `/auth/discord/callback` | Discord OAuth2 인증 콜백 및 세션 생성 | ❌ | ❌ |

### 2. 계정 관리 및 개인정보 (Account & Security Center)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 멱등성 |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/account` | 회원 프로필 정보, 닉네임, 생성일 및 종합 자산 요약 | ✅ | ❌ |
| `PUT` | `/account/password` | 계정 비밀번호 안전 변경 (기존 비밀번호 검증) | ✅ | ✅ |
| `GET` | `/account/security/sessions` | 현재 로그인된 활성 기기/IP/세션 목록 조회 | ✅ | ❌ |
| `DELETE` | `/account/security/sessions/:id` | 특정 활성 기기 세션 선택적 원격 무효화 | ✅ | ❌ |
| `GET` | `/account/identities` | 연동된 외부 소셜(Discord 등) 계정 식별자 목록 | ✅ | ❌ |
| `DELETE` | `/account` | 회원 탈퇴 및 개인정보/세션 즉각 소거 | ✅ | ✅ |
| `GET` | `/privacy/data-export` | GDPR/개인정보보호법 기반 내 활동 데이터 JSON 내보내기 | ✅ | ❌ |

### 3. 지갑 및 자산 원장 (Wallet & Ledger)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 멱등성 |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/wallet/balance` | 실시간 지갑 보유 WLD 잔액 및 락업 수량 조회 | ✅ | ❌ |
| `POST` | `/wallet/transfer` | 다른 회원에게 WLD 안전 멱등 송금 (수수료 0 WLD) | ✅ | ✅ |
| `GET` | `/wallet/transactions` | 24시간 자산 변동, 송수신, 정산 원장 타임라인 | ✅ | ❌ |
| `GET` | `/activity/stream` | 실시간 글로벌 경제 이벤트 및 거래 피드 스트림 | ❌ | ❌ |

### 4. 가상 중앙은행 및 채권 (Virtual Banking & Treasury Bonds)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 멱등성 |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/bank/summary` | 중앙은행 예치 WLD 잔액, 복리 이자율, 누적 미지급 이자 | ✅ | ❌ |
| `POST` | `/bank/deposit` | 지갑 WLD를 은행 복리 예금 계좌로 예치 | ✅ | ✅ |
| `POST` | `/bank/withdraw` | 은행 예치 원금 및 이자를 지갑으로 인출 | ✅ | ✅ |
| `POST` | `/bank/claim-interest` | 매일 자정 복리로 계산된 누적 이자 즉시 수령 | ✅ | ✅ |
| `GET` | `/bank/bonds` | 7일/30일/90일 가상 국채 카탈로그 및 확정 만기 수익률 | ✅ | ❌ |
| `POST` | `/bank/bonds/purchase` | 가상 국채 매수 (확정 APR 만기 원리금 보장) | ✅ | ✅ |
| `POST` | `/bank/bonds/redeem` | 만기 도래 가상 국채 원금 및 확정 이자 정산 | ✅ | ✅ |
| `GET` | `/bank/pockets` | 다중 세이빙 포켓 목록 및 목표 달성률 현황 | ✅ | ❌ |
| `POST` | `/bank/pockets` | 테마별 신규 저축 포켓 생성 | ✅ | ✅ |

### 5. 직업 및 일일 커리어 (Work & Career Mastery)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 멱등성 |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/work/status` | 현재 직업, 숙련도 레벨(EXP), 일일 잔여 업무 캡 조회 | ✅ | ❌ |
| `GET` | `/work/careers` | 5대 전문 직업(개발자, 트레이더, 광부, 요리사, 보안관) 명세 | ✅ | ❌ |
| `POST` | `/work/change-career` | 다른 전문 직업으로 전직 | ✅ | ✅ |
| `POST` | `/work/tasks/complete` | 직업 업무 완수 및 숙련도 비례 WLD 보상 즉시 수령 | ✅ | ✅ |
| `GET` | `/game-clock` | 10분 일일/70분 주간 가상 경제 시계 상태 조회 | ❌ | ❌ |

### 6. 가상 주식 거래소 (Virtual Stock Exchange)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 멱등성 |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/stocks` | 10대 상장 가상 주식 실시간 시세, 거래량, 감성 지표 요약 | ❌ | ❌ |
| `GET` | `/stocks/:symbol` | 특정 종목 10-Depth 호가창, 체결 틱, 캔들 차트 데이터 | ❌ | ❌ |
| `POST` | `/stocks/orders` | 가상 주식 지정가/시장가 매수·매도 주문 접수 | ✅ | ✅ |
| `GET` | `/stocks/portfolio` | 내 보유 주식 포트폴리오, 손익률, 평가액 조회 | ✅ | ❌ |
| `GET` | `/stocks/alerts` | 주가 목표가 도달 알림 규칙 목록 조회 | ✅ | ❌ |
| `POST` | `/stocks/alerts` | 신규 주가 목표가 감시 알림 등록 | ✅ | ✅ |
| `DELETE` | `/stocks/alerts/:id` | 등록된 주가 알림 규칙 삭제 | ✅ | ❌ |
| `GET` | `/newspaper/daily` | AI Council 실시간 발행 시장 뉴스 및 감성 지수 | ❌ | ❌ |

### 7. 사업체 및 상업 운영 (Businesses & Commercial Units)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 멱등성 |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/businesses` | 인수 가능한 사업체 카탈로그 및 내 보유 사업체 목록 | ✅ | ❌ |
| `POST` | `/businesses/acquire` | 신규 상업 사업체 인수 및 설립 | ✅ | ✅ |
| `POST` | `/businesses/:id/settle` | 사업체 일일 누적 매출금 원터치 일괄 정산/수령 | ✅ | ✅ |
| `POST` | `/businesses/:id/boost` | 사업체 생산성 부스트 라이선스 적용 | ✅ | ✅ |

### 8. P2P 마켓플레이스 및 제작 (Marketplace & Crafting)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 멱등성 |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/marketplace/listings` | 유저 등록 P2P 아이템 및 아티팩트 매물 목록 조회 | ❌ | ❌ |
| `POST` | `/marketplace/listings` | 내 아티팩트/아이템을 P2P 마켓에 판매 등록 | ✅ | ✅ |
| `POST` | `/marketplace/listings/:id/buy` | 매물 즉시 구매 (구매자 수령, 2% 거래세 국고 소각) | ✅ | ✅ |
| `POST` | `/marketplace/listings/:id/cancel` | 판매 등록한 매물 취소 및 인벤토리 회수 | ✅ | ✅ |
| `GET` | `/crafting/recipes` | 전체 제작대 아티팩트 합성 레시피 목록 | ✅ | ❌ |
| `POST` | `/crafting/craft` | 원자재 소각을 통한 상위 도구/아티팩트 멱등 제작 | ✅ | ✅ |

### 9. 상점 및 도파민 보상 (Shop & Engagement)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 멱등성 |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/shop/items` | 공식 아이템 상점 카탈로그 및 테마 스킨 목록 | ❌ | ❌ |
| `POST` | `/shop/purchases` | 상점 아이템 구매 및 인벤토리 지급 | ✅ | ✅ |
| `GET` | `/inventory` | 내 보유 인벤토리 아이템 및 장착 상태 조회 | ✅ | ❌ |
| `POST` | `/early-game/starter-pack` | 신규 가입자 1회 한정 스타터팩 무료 수령 | ✅ | ✅ |
| `POST` | `/engagement/dopamine/claim` | 황금 오리 광클 피버 / 포춘쿠키 보상 정산 | ✅ | ✅ |

### 10. 성장 및 시즌 패스 (Progression & Seasons)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 멱등성 |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/progression/summary` | 플레이어 신용 등급, 누적 업적, 명예 칭호 현황 | ✅ | ❌ |
| `POST` | `/progression/prestige` | 프레스티지(환생) 자산 100% 소각 및 영구 배수 부스터 해금 | ✅ | ✅ |
| `GET` | `/season/current` | 현재 활성 시즌 패스 레벨 및 마일스톤 달성도 | ✅ | ❌ |
| `POST` | `/season/claim-reward` | 시즌 패스 레벨업 보상 수령 | ✅ | ✅ |

### 11. 커뮤니티 게시판 및 미디어 (Community & Media)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 멱등성 |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/board/posts` | 커뮤니티 자유게시판 글 목록 및 검색 | ❌ | ❌ |
| `POST` | `/board/posts` | 신규 게시글 작성 (XSS 방어 및 필터링) | ✅ | ✅ |
| `GET` | `/board/posts/:id` | 게시글 상세 본문 및 댓글 타임라인 조회 | ❌ | ❌ |
| `POST` | `/board/posts/:id/comments` | 댓글 및 대댓글 작성 | ✅ | ✅ |
| `POST` | `/content/photos/upload` | 프로필/게시판 이미지 안전 업로드 (매직바이트 검증) | ✅ | ✅ |

### 12. 1:1 비공개 쪽지 및 안전 제어 (Direct Messaging & Safety)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 멱등성 |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/chat/threads` | 내 1:1 대화방 목록 및 안읽은 쪽지 개수 | ✅ | ❌ |
| `GET` | `/chat/threads/:id/messages` | 특정 대화방 1:1 메시지 히스토리 조회 | ✅ | ❌ |
| `POST` | `/chat/threads/:id/messages` | 1:1 쪽지 전송 (한글 IME 조합 가드 적용) | ✅ | ✅ |
| `POST` | `/chat/block` | 악성 유저 1:1 쪽지 수신 차단/해제 | ✅ | ✅ |
| `POST` | `/safety/takedown/request` | 비회원/회원 긴급 권리침해·유해 콘텐츠 삭제 요청 접수 | ❌ | ✅ |

### 13. 클럽 및 개인 공간 (Clubs & Personal Spaces)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 멱등성 |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/club` | 협동조합/클럽 목록 및 주간 기여도 랭킹 | ✅ | ❌ |
| `POST` | `/club/create` | 10,000 WLD 소각을 통한 신규 클럽 창설 | ✅ | ✅ |
| `POST` | `/club/:id/join` | 클럽 가입 신청 및 탈퇴 | ✅ | ✅ |
| `GET` | `/space/my-space` | 개인 공간/오피스 꾸미기 테마 및 프로젝트 현황 | ✅ | ❌ |

### 14. 관리자 관제 타워 및 국고 (Admin Control Tower & Treasury)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 멱등성 |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/admin/economy/overview` | 전역 M0 통화량, 인플레이션/디플레이션, 국고 비축률 | ✅ (Admin) | ❌ |
| `GET` | `/admin/treasury/vaults` | 3대 시스템 금고(안정화, 정지환급, 소각) 잔액 | ✅ (Admin) | ❌ |
| `POST` | `/admin/treasury/inject` | 시스템 금고 자금 주입 (Step-Up 2단계 인증) | ✅ (Admin) | ✅ |
| `POST` | `/admin/stocks/:symbol/halt` | 주식 거래정지 및 보유자 매수원가 100% 자동 환급 | ✅ (Admin) | ✅ |
| `GET` | `/admin/audit/logs` | 전역 시스템 관리자 감사 원장(Audit Trail) 스트림 | ✅ (Admin) | ❌ |

---

## 🚫 3. 폐기 및 비활성화된 API (Decommissioned APIs)
- **카지노 7대 게임 엔드포인트 (`/api/v1/casino/*`) 전면 제거 완료**:
  - `POST /api/v1/casino/coin/plays` (폐기)
  - `POST /api/v1/casino/dice/plays` (폐기)
  - `POST /api/v1/casino/theme/plays` (폐기)
  - `PUT /api/v1/casino/self-limit` (폐기)
  - `GET /api/v1/casino/history` (폐기)
  - `GET /api/v1/casino/jackpot` (폐기)
- **사유**: 게임물 규제 및 금융 법령 컴플라이언스 준수, 도박성 배제 및 건전한 가상경제 시뮬레이터 전환.
