# 로컬 개발

[English](local-development.md) | **한국어** | [문서 색인](../INDEX.ko.md)

## 런타임 기준
현재 저장소/런타임 기준은 Node 24, pnpm 10, PostgreSQL 17.x 및 `pnpm-workspace.yaml`에 정의된 워크스페이스 패키지입니다. 저장소에 선언된 Node 엔진을 우회하지 않습니다. `engines.node`가 Node 24를 요구하면 Node 20 호스트의 설치 실패는 의도된 동작일 수 있습니다.

## 워크스페이스 구조

```text
frontend/            Next.js App Router
backend/             NestJS API
packages/contract/   공용 계약 / 라우트 맵
packages/database/   데이터베이스 초기화 + 마이그레이션
```

## 설치

```bash
corepack enable
pnpm install --frozen-lockfile
```

## 핵심 검사

```bash
pnpm lint
pnpm typecheck
pnpm build
```

백엔드/데이터베이스 테스트는 테스트 실행기용으로 구성된 격리 PostgreSQL 데이터베이스가 필요합니다. 파괴적 테스트나 마이그레이션 테스트를 Production에 연결하지 않습니다.

## 보안 검사
저장소에는 커밋된 비밀정보, 원시 제어 바이트, 금지된 Prisma 스키마 변경 패턴을 거부하는 스크립트가 있습니다. 중요한 변경을 푸시하기 전에 CI와 같은 검사를 실행합니다.

## 개발 경계
로컬 개발에서는 프레임워크 테스트/개발 용도로 내부 API 토큰 가드를 완화할 수 있습니다. 이를 근거로 Production API가 공개되어야 한다고 판단하면 안 됩니다.

## 금액 타입 규칙
WLD 값은 기준 정수 문자열로 처리합니다. 정확한 연산이 필요한 경우에만 `BigInt`로 변환하고 JavaScript `Number`를 통해 정규화하지 않습니다.
