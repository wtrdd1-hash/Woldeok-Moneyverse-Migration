# Woldeok Moneyverse — 한국어

Woldeok Moneyverse는 커뮤니티용 **가상 경제·성장 게임 플랫폼**입니다.

- Production: **https://easy-scraping.com**
- Test: **https://test.easy-scraping.com**
- 기술 스택: Next.js · NestJS · PostgreSQL · Docker Compose · nginx

> WLD, 가상 주식, 카지노, 직업 보상 등은 모두 서비스 내부의 가상 데이터입니다. 실제 화폐·증권·도박 상품이 아닙니다.

## 주요 기능

- **직업/업무**: 8개 전문 직업, 직업별 반복 업무, WLD + 숙련도 EXP, 레벨 성장
- **퀘스트/성장 단계**: 일일 사건, NPC/수집 목표, 장기 성장 단계
- **지갑/원장**: 모든 경제 거래를 추적 가능한 원장 기반으로 처리
- **상점/인벤토리/도감**: 서버가 가격·재고·할인을 최종 결정
- **가상 주식**: 시장 가격, 차트, 매수/매도, 경제 이벤트
- **사업체**: 사업체 보유와 가상 수익 구조
- **은행/신용**: 예금, 실제 정책 기반 금리, 신용등급별 대출, 국채
- **카지노 미니게임**: 동전/주사위 기반 서버 RNG와 테마 UI, 개인 베팅·손실 한도 및 자가 제외

## 게임 밸런스 원칙

카지노의 최종 판정과 배당은 브라우저가 아니라 서버/DB에서 결정합니다. 현재 기본 정책은 다음을 기준으로 합니다.

- 최소 베팅: 10 WLD
- 최대 베팅: 200 WLD
- 일일 총 베팅: 2,000 WLD
- 일일 실손실: 1,000 WLD
- 기본 RTP: 95%

개인은 플랫폼 한도보다 더 낮은 자기 한도를 설정할 수 있습니다. 자가 제외 잠금 중에는 플레이와 한도 변경이 함께 차단됩니다.

은행은 잔액 변경 시 이자 기준시각을 갱신하고, 1 WLD 미만의 이자를 억지로 지급하지 않습니다. 신규 대출은 DB의 신용등급 정책을 사용합니다.

## 보안 구조

```text
브라우저
  ↓
Cloudflare
  ↓
nginx edge
  ↓
Next.js
  ↓ 내부 토큰
NestJS
  ↓
PostgreSQL SECURITY DEFINER
  ↓
원장 / 회원 / 게임 데이터
```

핵심 원칙:

1. Production DB/volume/user data는 승인 없이 삭제하지 않습니다.
2. 앱 DB role은 원장·잔액·게임 핵심 테이블을 직접 수정하지 못합니다.
3. 경제 write는 검증된 DB 함수와 idempotency key를 사용합니다.
4. 비밀번호/API token/secret은 저장소 문서에 기록하지 않습니다.
5. 배포 전 migration checksum, 타입체크, 테스트, 빌드, 백업을 확인합니다.

## 반응형 UI

헤더/브랜드는 화면폭에 따라 CSS breakpoint의 `display:none`/`display:flex` 방식으로 표시 상태가 전환됩니다. DOM을 제거하지 않으므로 창 크기를 줄였다가 다시 늘리면 로고와 메뉴가 자동으로 다시 나타납니다.

## 개발

Node.js 24 이상과 pnpm 10을 사용합니다.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

DB schema의 source of truth는 `packages/database/migrations/`의 순서가 있는 SQL migration입니다. Prisma migration은 사용하지 않습니다.

## 배포

Test를 먼저 검증한 뒤 Production으로 승격합니다.

```text
CI/security checks
  → Docker build
  → Test migration/deploy
  → Test smoke test
  → Production encrypted backup
  → Production migration/deploy
  → public smoke + DB invariant checks
```

배포 스크립트는 commit-tagged 이미지를 사용하고, 문제 발생 시 이전 이미지/설정 기준점으로 롤백할 수 있도록 설계되어 있습니다.

## 저장소 구조

| 경로 | 설명 |
| --- | --- |
| `frontend/` | Next.js 사용자/관리자 UI |
| `backend/` | NestJS 내부 API |
| `packages/database/` | SQL migrations 및 DB 정책 |
| `packages/contract/` | 공용 route/type 계약 |
| `deploy/` | Compose/nginx/backup/roll 스크립트 |
| `ops/` | 운영 보조 도구 |

변경 전에는 `AGENTS.md`와 데이터 계층 설계 문서를 먼저 확인하십시오.
