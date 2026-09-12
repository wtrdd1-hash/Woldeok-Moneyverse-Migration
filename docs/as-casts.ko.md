# 남아 있는 `as` 캐스트

[English](as-casts.md) | **한국어** | [문서 색인](INDEX.ko.md)

실제 타입 좁히기를 우선합니다. 불가피하게 남아 있는 캐스트는 이를 정당화하는 불변조건과 그 불변조건을 계속 검증하는 테스트를 이 문서에 기록합니다.

| 위치 | 캐스트 | 불변조건 | 검증 |
| --- | --- | --- | --- |
| `backend/src/server-timeouts.ts` | `server as SweepTunableServer` | `connectionsCheckingInterval`은 Node가 각 연결 스윕마다 읽고 실행 중인 서버에서도 쓸 수 있지만 `@types/node`는 이를 `Server` 속성이 아니라 `http.createServer` 옵션으로만 선언합니다. 생성 후 값을 지정해도 실제 동작합니다. Node v26.5.0에서 간격을 50ms, `headersTimeout`을 700ms로 설정하면 끝나지 않는 헤더 블록이 기본 30초 스윕까지 남지 않고 약 700ms 후 차단됩니다. | `backend/src/server-timeouts.test.ts`의 "cuts off a client that never finishes its header block" 테스트가 실제 소켓을 사용하며 스윕이 이 설정을 따르지 않으면 실패합니다. |
