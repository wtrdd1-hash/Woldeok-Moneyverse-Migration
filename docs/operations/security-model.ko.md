# 보안 모델

<!-- CORE-AUTHORITY-V499 -->
## App/Site/Economy Core 상위 권위 — v2026.10.01.499 (2026-10-01)

- **상위 권위:** 이 maintained-document 블록은 아래의 충돌하는 과거 기획문구를 supersede한다. 과거 문구는 당시 의사결정 증거로 보존하되 현재 제품 권위가 아니다.
- **채널 경계:** 목표 canonical public contract는 **App Core** `/app-api/v2/**`, **Site Core** `/site-api/v1/**`다. **App API v1**은 측정된 retirement 전까지 compatibility/runtime 증거로 유지하며 이번 문서 회차는 목표 route가 Test/Production에 이미 구현됐다고 주장하지 않는다.
- **단일 경제권위:** App/Site BFF는 잔액·세금·은행·국고·시장·직업보상·통화정책 규칙을 독립 소유하지 않는다. 하나의 **Economy Core**만 경제 command/read 권위를 가지며 최종 WLD 변경은 append-only ledger와 검토된 PostgreSQL `SECURITY DEFINER` 함수를 거친다.
- **재정 보존:** 모든 `TAX_*`는 explicit reversal 제외 **100% TREASURY_MAIN**으로 들어간다. 세금을 burn/sink로 보내지 않는다. 국고 목적별 예산은 독립 spendable cash vault가 아니라 logical commitment/envelope다.
- **AI 경계:** 하나의 **Economy Policy Registry**와 policy executor만 수치정책 적용권한을 가진다. AI/model/work/stock module은 특정 low-risk key가 `BOUNDED_AUTO`로 등록된 경우를 제외하면 **proposal-only**다. **direct member balance write = 0 (prohibited)**, **direct absolute stock-price write = 0**, historical-ledger rewrite = 0이며 AI가 자기 limit을 넓힐 수 없다.
- **신원 경계:** 내부 **workload identity**와 user/admin/automation actor identity는 독립 검증한다. shared `INTERNAL_API_TOKEN` / `x-internal-token`은 legacy compatibility이며 최종 multi-core service-identity 설계가 아니다.
- **승격 사실성:** expand → shadow/observe → switch → reconcile → contract 순서로 이행한다. exact-SHA 증거 없이는 runtime/Test/Production 완료를 주장하지 않는다.

[English](security-model.md) | **한국어** | [문서 색인](../INDEX.ko.md)

이 문서는 주요 런타임 신뢰 경계를 요약합니다. 코드 리뷰나 인프라 정책을 대신하지 않습니다.

## 공개 경계
공개 브라우저는 nginx 엣지와 Next.js 프론트엔드에 접근합니다. NestJS API는 일반 공개 출처가 아니라 내부 서비스입니다.

## 내부 API 토큰 (legacy compatibility)
Production API 요청은 운영 상태 확인이나 서명된 웹훅처럼 의도적으로 예외 처리된 엔드포인트를 제외하면 서버 간 내부 토큰을 요구합니다. 이 토큰은 브라우저 자격 증명이 아니며 소스, README 스크린샷, 로그, 클라이언트 번들에 포함하면 안 됩니다.

## 세션과 CSRF
회원 세션은 동일 출처 HttpOnly 쿠키입니다. 상태 변경 브라우저 작업은 직접 교차 출처 API 호출이 아니라 서버 액션/API 흐름과 CSRF/세션 검증을 사용합니다.

## 데이터베이스 권한
런타임 애플리케이션 역할은 제한됩니다. 경제 쓰기는 행위자를 검사하는 데이터베이스 함수를 사용하며 직접 테이블 권한은 예외로 취급하고 감사합니다.

## 멱등성
네트워크 재시도로 가치가 중복될 수 있는 작업에는 멱등성이 필요합니다. 과제 완료, 송금, 카지노 플레이 등 쓰기 작업은 안정적인 재시도 식별자를 가져야 합니다.

## 컨테이너 강화
Production 프론트엔드/백엔드는 가능한 서비스에서 읽기 전용 루트 파일시스템, Linux capability 제거, `no-new-privileges` 등의 강화 옵션으로 배포합니다.

## HTTP 강화
엣지는 엄격한 Host 처리와 내부 전용 헬스 동작을 사용합니다. 공개 페이지에는 애플리케이션/엣지가 설정한 표준 브라우저 보안 헤더가 포함됩니다.

## 비밀정보
- `.env` 비밀정보를 커밋하지 않습니다.
- 접근 토큰을 문서에 붙여넣지 않습니다.
- 스크린샷에 비밀정보를 넣지 않습니다.
- 배포 자격 증명은 CI/호스트 비밀 저장소를 사용합니다.
- 운영 로그를 공유하기 전에 민감정보를 제거합니다.

## 운영 데이터
Production 회원 데이터, 원장 기록, 볼륨은 보호 자산입니다. 일반 정리 작업으로 삭제하지 않습니다. Docker 볼륨 정리는 별도의 명시적 승인이 필요합니다.
