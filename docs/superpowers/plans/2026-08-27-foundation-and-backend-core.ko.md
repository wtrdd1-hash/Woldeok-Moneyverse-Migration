# 기반·데이터베이스·백엔드 코어 — 구현 계획 한국어판

[English](2026-08-27-foundation-and-backend-core.md) | **한국어** | [문서 색인](../../INDEX.ko.md)

> **문서 성격:** 2026-08-27 재구축 초기 단계에서 사용한 역사적 구현 계획입니다. 실제 개발 전에 현재 `main`의 기획서·아키텍처·마이그레이션·런타임 기준을 다시 확인해야 합니다. 원문의 코드 블록, 명령, 파일 경로는 실행 식별자가 바뀌지 않도록 그대로 사용합니다.

## 목표

pnpm 워크스페이스를 세우고 기존 데이터베이스 계층을 동작 변경 없이 이전하며, 이후 도메인 모듈을 얹을 수 있도록 NestJS 핵심 기반을 구축하는 계획입니다. 핵심 범위는 설정, PostgreSQL pool, 세션, CSRF, 권한 guard, `problem+json` 오류, 요청 제한, OpenAPI입니다.

## 기본 아키텍처

- 애플리케이션: `frontend/`, `backend/`
- 공용 패키지: `packages/contract`, `packages/database`
- 모든 중요한 DB 쓰기는 PostgreSQL `SECURITY DEFINER` 함수를 통해 수행
- 애플리케이션 역할은 금액/감사 테이블에 임의 직접 DML 권한을 갖지 않음
- NestJS는 내부 API이며 공개 진입점은 Next.js가 담당

원문 작성 당시 기술 기준은 Node 20+, pnpm 10, TypeScript 5.9, NestJS 11, Vitest 3, `pg` 8, `zod` 4, ESLint 9, Prettier 3, PostgreSQL 17이었습니다. **현재 런타임 기준과 다를 수 있으므로 최신 운영 문서를 우선합니다.**

## 전역 제약

1. 사용자에게 보이는 제품 문구는 한국어 원문 의미를 임의로 변경하지 않습니다.
2. 금액은 JavaScript `number`가 아니라 문자열/정확한 정수 표현을 사용합니다. DB의 `bigint`/`numeric(38,0)` 값은 `pg`에서 문자열로 받고 계산이 필요한 경우 `BigInt()`를 사용합니다.
3. 상태 변경 라우트는 예외 없이 CSRF 보호를 적용합니다.
4. 스키마 기준은 번호가 있는 SQL 마이그레이션이며 `prisma migrate`로 스키마를 소유하지 않습니다.
5. 테스트 더블은 필요한 계약만 표현하며 타입 오류를 숨기기 위해 의미 없는 stub을 추가하지 않습니다.
6. 건너뛴 테스트를 통과한 테스트로 보고하지 않습니다. DB URL이 없어서 DB 기반 테스트가 skip되면 반드시 그렇게 기록합니다.
7. 당시 개발 장비는 RAM 3.6GB/4 threads 제약이 있어 테스트 worker를 2개로 제한했습니다. 현재 장비 상태가 다르면 최신 환경 기준을 사용합니다.
8. 제어문자 정규식이 포함된 파일을 수정할 때는 텍스트 표시가 아니라 실제 바이트를 검사합니다.
9. 커밋·PR 메타데이터는 저장소 표준을 따르고 자동 생성 도구 홍보성 trailer를 넣지 않습니다.

---

## 작업 1 — 워크스페이스 골격과 도구

원문 `Task 1: Workspace skeleton and tooling`에 해당합니다.

### 목적
- 루트 `package.json`, `pnpm-workspace.yaml`, 공용 TypeScript 설정, ESLint/Prettier/editor 설정 생성
- `frontend`, `backend`, `packages/*`, `services/*`를 pnpm workspace로 구성
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` 공통 명령 확립
- GitHub Actions CI에 PostgreSQL 17 서비스를 두어 실제 DB 기반 검증 수행

### 중요 결정
- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` 같은 엄격한 TS 설정 유지
- NestJS decorator metadata 때문에 backend에서는 `consistent-type-imports` 자동 수정이 런타임 DI를 깨뜨릴 수 있으므로 예외를 둠
- 당시 저사양 개발 장비의 메모리 압박 때문에 워크스페이스 작업을 순차 실행
- CI에서 마이그레이션 적용과 DB 테스트를 수행하고 Prisma 스키마 변경 금지 guard를 검증

원문의 YAML/JSON/명령 블록은 실행 가능한 예시이므로 파일명과 명령어는 영어 원문을 그대로 참고합니다.

---

## 작업 2 — 금액 타입을 포함한 공용 계약 패키지

원문 `Task 2: Shared contract package with the money type`에 해당합니다.

### 목적
- `@moneyverse/contract` 공용 패키지를 만들고 frontend/backend가 같은 API 계약을 사용하도록 합니다.
- WLD 금액을 일반 JavaScript 숫자가 아니라 브랜드된 문자열 타입으로 표현합니다.
- 라우트, 요청/응답 DTO, 공용 타입의 중복 정의를 줄입니다.

### 원칙
- 금액을 `Number()`로 정규화하지 않습니다.
- JSON 경계에서도 정확한 정수 문자열을 유지합니다.
- 공용 타입은 런타임 경제 규칙을 우회하는 별도 계산 계층이 되지 않습니다.

---

## 작업 3 — 데이터베이스 패키지와 마이그레이션의 정확한 이전

원문 `Task 3: Database package — migrations ported byte-for-byte`에 해당합니다.

### 목적
- 기존 SQL 마이그레이션을 의미 변경 없이 `packages/database`로 옮깁니다.
- 번호 순서, 함수 권한, `SECURITY DEFINER`, 원장/감사 불변조건을 보존합니다.
- CI에서 빈 PostgreSQL에 전체 마이그레이션을 순서대로 적용합니다.

### 안전 규칙
- 적용된 마이그레이션 내용을 편의상 다시 쓰지 않습니다.
- 경제/감사 테이블의 직접 DML 권한을 넓히지 않습니다.
- 마이그레이션 검증 실패를 CI에서 숨기지 않습니다.
- 새 DB 설치와 업그레이드 경로를 함께 검증합니다.

현재 저장소는 이후 많은 마이그레이션과 체크섬 규칙이 추가되었으므로 실제 작업은 최신 [데이터베이스 마이그레이션 문서](../../operations/database-migrations.ko.md)를 우선합니다.

---

## 작업 4 — 검증된 설정을 갖춘 백엔드 골격

원문 `Task 4: Backend scaffold with validated configuration`에 해당합니다.

### 목적
- NestJS 애플리케이션 골격 구축
- 환경변수를 시작 시점에 검증하고 잘못된 설정에서는 fail-closed
- 내부 API와 공개 웹 출처의 역할을 분리
- 테스트에서 설정을 명시적으로 주입할 수 있게 구성

### 보안 기준
- 내부 API 비밀값을 브라우저로 보내지 않습니다.
- Production에서 필요한 비밀값이 없으면 조용히 약한 모드로 내려가지 않습니다.
- URL/환경/DB 연결값을 구조적으로 검증합니다.

---

## 작업 5 — 데이터베이스 접근 계층

원문 `Task 5: Database access layer`에 해당합니다.

### 목적
- `pg` pool을 NestJS에 연결하고 서비스가 제한된 DB 역할을 사용하도록 합니다.
- 애플리케이션 코드에서 보호 테이블 직접 변경을 피하고 DB 함수를 호출합니다.
- 트랜잭션과 오류 전달을 일관되게 처리합니다.

### 핵심 경계
- 원장/잔액/감사와 같은 중요한 상태는 DB가 최종 권한을 가집니다.
- 필요한 읽기 기능도 광범위한 테이블 권한보다 제한된 읽기 함수 모델을 선호합니다.
- 금액 결과는 문자열로 유지합니다.

---

## 작업 6 — 세션 암호화와 세션 저장소

원문 `Task 6: Session cryptography and repository`에 해당합니다.

### 목적
- 기존 세션 계약을 유지하면서 안전한 암호화/서명과 세션 저장소를 NestJS로 옮깁니다.
- 세션 생성·조회·회전·만료·삭제가 DB 정책과 일치하도록 합니다.

### 보안 원칙
- 세션 비밀정보를 로그에 노출하지 않습니다.
- 만료·폐기된 세션을 재사용하지 않습니다.
- 암호화 키/세션 키 변경이 회원 신원이나 데이터 소유권을 바꾸지 않도록 합니다.

---

## 작업 7 — 세션 쿠키 처리

원문 `Task 7: Session cookie handling`에 해당합니다.

### 목적
- HttpOnly 세션 쿠키 생성/파싱/삭제를 일관되게 처리합니다.
- Production 보안 속성과 로컬/테스트 동작을 명시적으로 구분합니다.

### 기본 원칙
- 브라우저 JavaScript가 세션 비밀값을 읽지 못하도록 합니다.
- 쿠키 범위를 필요 이상으로 넓히지 않습니다.
- 로그아웃/세션 폐기 시 서버 상태와 브라우저 쿠키가 함께 정리되게 합니다.

---

## 작업 8 — 요청 문맥과 권한 guard

원문 `Task 8: Request context and authorisation guards`에 해당합니다.

### 목적
- 각 요청에 회원/세션/관리자 문맥을 안전하게 연결합니다.
- 인증 여부와 역할 검사를 재사용 가능한 guard로 구성합니다.
- 권한 없는 요청이 서비스/DB 변경 로직까지 도달하지 않도록 합니다.

### 주의
HTTP 계층 guard만으로 경제 보안을 끝내지 않습니다. 민감한 DB 함수에서도 행위자/역할을 다시 검증합니다.

---

## 작업 9 — Problem+JSON 예외 필터

원문 `Task 9: Problem+JSON exception filter`에 해당합니다.

### 목적
- API 오류를 일관된 `application/problem+json` 형식으로 반환합니다.
- 검증 오류, 인증/권한 오류, 정책 거부, 내부 오류를 구분합니다.
- 내부 스택·비밀정보·DB 세부정보를 공개 응답에 노출하지 않습니다.

프론트엔드는 구조화된 오류를 이용해 재시도 가능 오류와 정책상 거부를 구분할 수 있어야 합니다.

---

## 작업 10 — 요청 제한 계층과 HTTP 서버 타임아웃

원문 `Task 10: Rate limiting tiers and HTTP server timeouts`에 해당합니다.

### 목적
- 라우트 위험도에 맞는 rate-limit 계층을 적용합니다.
- 느린 헤더/연결 고갈 공격에 대비해 서버 timeout을 명시합니다.
- 정상 사용자 요청을 무작정 차단하는 전역 하드캡이 아니라 보안/안정성 목적의 제한으로 사용합니다.

현재 timeout 관련 타입 우회와 검증 근거는 [`as-casts.ko.md`](../../as-casts.ko.md)도 참고합니다.

---

## 작업 11 — OpenAPI 문서

원문 `Task 11: OpenAPI document`에 해당합니다.

### 목적
- NestJS API 계약을 OpenAPI로 노출해 개발/테스트 클라이언트가 실제 요청/응답 형식을 확인할 수 있게 합니다.
- 인증/CSRF/내부 서버 헤더 경계를 문서화합니다.
- 운영 환경에서 내부 전용 문서가 무심코 공개되지 않게 합니다.

현재 모바일/외부 앱 연동은 [모바일 / 외부 앱 API](../../mobile-api.ko.md)를 우선합니다.

---

## 현재 문서와의 관계

이 계획은 초기 재구축 시점의 **실행 역사**입니다. 이후 프로젝트는 Node 24, 더 많은 SQL 마이그레이션, Kubernetes/Flux GitOps, Test→Production 승격, 추가 보안/경제 기능으로 발전했습니다. 따라서 현재 개발에서는 다음 문서를 우선합니다.

- [한국어 문서 색인](../../INDEX.ko.md)
- [상시 갱신 프로젝트 계획](../../planning/PROJECT_PLAN.ko.md)
- [시스템 개요](../../architecture/system-overview.ko.md)
- [데이터베이스 보안 경계](../../architecture/database-security.ko.md)
- [로컬 개발](../../operations/local-development.ko.md)
- [운영 배포](../../operations/production-deployment.ko.md)

영어 원문의 코드 블록과 체크박스는 역사적 구현 재현을 위한 세부 실행 자료이며, 현재 작업에 그대로 적용하기 전에 최신 코드와 문서를 다시 확인합니다.
