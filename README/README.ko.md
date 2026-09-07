# 월덕 머니버스 — 한국어 가이드

[← 메인 README](../README.md) · [변경 기록](../docs/changelog/CHANGELOG.ko.md) · [문서 목록](../docs/INDEX.md) · [운영](https://easy-scraping.com) · [테스트](https://test.easy-scraping.com)

## 월덕 머니버스란?

월덕 머니버스는 커뮤니티용 **가상 경제 서비스**입니다. Next.js, NestJS, PostgreSQL을 기반으로 직업/작업, 퀘스트, 성장, 지갑, 상점, 가상 주식/사업체, 은행, 가상 카지노 미니게임을 하나의 반응형 웹 UI에서 제공합니다.

WLD와 주식/게임/보상은 모두 서비스 내부 가상 데이터이며 실제 돈·증권·예금·도박 상품이 아닙니다.

## 주요 기능

- **직업/작업:** 8개 직업, 직업별 숙련도 EXP, 반복 업무 보상.
- **퀘스트/성장:** 일일 사건, 초반 가이드, 장기 성장 목표.
- **지갑/원장:** WLD 잔액, 거래 기록, 송금.
- **상점/인벤토리:** DB에서 결정되는 실제 가격/재고 규칙.
- **가상 주식:** 가격/캔들/포트폴리오 흐름.
- **가상 사업체:** 소유/운영형 장기 경제 콘텐츠.
- **은행:** 예금, 이자, 신용등급 기반 대출, 가상 채권.
- **가상 카지노:** 서버 판정 결과, 공개된 확률/배당, 자기 한도/자가 제외.
- **관리자 도구:** 관리자 전용 경제 read model 및 운영 제어 함수.

## 시스템 구조

```mermaid
flowchart LR
  U[브라우저] --> E[Cloudflare + nginx]
  E --> F[Next.js]
  F --> A[NestJS 내부 API]
  A --> D[PostgreSQL SECURITY DEFINER 함수]
  D --> T[(원장 / 게임 / 회원 테이블)]
```

핵심 경제 쓰기는 TypeScript에서 임의로 테이블을 UPDATE하는 방식이 아니라 PostgreSQL 함수에서 사용자/권한/정책/멱등성/원장 정합성을 확인한 뒤 원자적으로 수행합니다.

## WLD 정밀도 원칙

WLD는 API에서 **정수 문자열**로 전달합니다. 큰 잔액·가격·순자산을 JavaScript `Number`로 바꾸면 정밀도가 깨질 수 있으므로 문자열과 `BigInt`를 사용합니다.

## 현재 카지노 기준

- 공개 핵심 게임 기준 RTP 95%.
- 1회 10~200 WLD.
- 플랫폼 하루 총 베팅 2,000 WLD.
- 플랫폼 하루 실손실 1,000 WLD.
- 사용자 자기 한도/자가 제외는 더 엄격하게 설정 가능.

자세한 내용: [카지노 기능 문서](../docs/features/casino.md)

## 현재 배포 기준

- Node.js 24.
- PostgreSQL 17.11.
- nginx 1.30.4.
- Test/Production은 Git commit 고정 GHCR 이미지를 사용.
- `main` push는 CI를 실행하지만 Production 자동 배포는 하지 않음.
- 공식 Deploy workflow에서 Test → Production 순서로 배포.

## 개발 기본 명령

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
```

DB 테스트는 반드시 별도의 격리 PostgreSQL에서 실행해야 합니다. Production DB를 테스트 대상으로 사용하면 안 됩니다.

## 운영상 중요한 원칙

1. 실제 서버 상태가 문서보다 우선입니다.
2. 적용된 migration은 수정하지 않고 새 migration을 추가합니다.
3. Production DB/볼륨/회원 데이터/원장 기록은 일반 배포에서 삭제하지 않습니다.
4. 배포 전 백업은 생성 여부뿐 아니라 복호화/덤프/사진 archive 읽기까지 검증합니다.
5. 브라우저에는 내부 API token이나 DB credential을 노출하지 않습니다.
6. 재시도로 가치가 중복될 수 있는 쓰기는 멱등키를 유지합니다.

## 추가 문서

- [시스템 개요](../docs/architecture/system-overview.md)
- [요청 흐름](../docs/architecture/request-flow.md)
- [DB 보안 경계](../docs/architecture/database-security.md)
- [Production 배포](../docs/operations/production-deployment.md)
- [백업/복구](../docs/operations/backup-and-recovery.md)
- [9/7 Gameplay/UX 작업 기록](../docs/worklog/2026-09-07-gameplay-ux-release.md)
