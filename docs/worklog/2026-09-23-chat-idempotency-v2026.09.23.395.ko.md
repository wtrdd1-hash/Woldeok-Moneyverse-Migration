# 개발 B 작업 기록 — v2026.09.23.395

## 범위

열린 business, stock 기획, frontend 검색 작업과 겹치지 않는 채팅 메시지 제출의 P1 API 명령 재시도 안전성을 선택했습니다.

## 확인 사항

`SendMessageDto.idempotencyKey`가 선택 사항이었고 누락 시 controller가 새 UUID를 생성했습니다. 따라서 응답이 불명확한 타임아웃 뒤 호출자가 같은 요청을 재시도하면 service가 멱등성 키를 지원하더라도 별도 메시지 명령으로 처리될 수 있었습니다.

## 변경

전송 계약에서 호출자 소유 UUID를 필수화하고 `ChatService.sendMessage`에 그대로 전달합니다. 기존 웹 action은 이미 `idempotencyKey()`를 전송하므로 frontend 계약 변경은 필요하지 않습니다.

## 안전성

DB migration, 권한, ledger, 인증, session 의미는 변경하지 않았습니다. 키 누락 또는 잘못된 UUID는 DTO 검증에서 거부됩니다.

## 검증 상태

집중 계약 테스트를 추가했습니다. repository required CI와 exact-SHA 검증이 최종 기준이며 모든 gate가 green이 아니면 Production 승격하지 않습니다.
