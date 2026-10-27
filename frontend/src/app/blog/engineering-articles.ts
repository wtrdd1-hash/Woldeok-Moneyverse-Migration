export type EngineeringTopic = 'BIGINT_LEDGER' | 'ORDER_BOOK_STREAM';

const fence = String.fromCharCode(96).repeat(3);

/**
 * Reviewed engineering examples are intentionally independent of market snapshots.
 * Draft generation is not a publication approval or a claim of measured performance.
 */
const LEDGER = `## 1. 설계 목표와 경계: 돈의 표현과 원장의 무결성은 다른 문제

결제·가상경제·거래소 백엔드에서 먼저 정할 것은 돈을 어떤 단위로 저장하고, 언제 거래가 확정되며, 실패한 요청을 어떻게 재시도할지입니다. IEEE 754 이진 부동소수점은 십진 분수의 상당수를 정확히 표현하지 못합니다. 이는 JavaScript 버그가 아니라 숫자 표현의 성질이며, 정확한 화폐 금액과 근사치 계산을 혼동하면 장부의 대조 과정에서 문제가 됩니다.

다만 정수형만 사용해도 안전한 회계 시스템이 만들어지지는 않습니다. 정수 계산은 금액 표현 문제를 다루고, 복식부기·DB 트랜잭션·원자적 기록·멱등 요청은 서로 별개인 무결성 문제를 다룹니다. 특히 분산원장은 단순히 여러 테이블에 금액을 기록한다고 완성되는 분산합의 프로토콜이 아닙니다.

### 재현 환경

다음 예제는 JavaScript BigInt를 지원하는 Node.js 환경에서 실행할 수 있는 최소 예시입니다. 외부 라이브러리나 운영 DB 연결은 필요하지 않습니다. 화폐 단위는 교육 목적으로 '원'의 정수만 가정하며 소수 통화·세금·환율·수수료·반올림은 다루지 않습니다.

${fence}js
console.log(0.1 + 0.2 === 0.3); // false
console.log(0.1 + 0.2);         // 0.30000000000000004
console.log(100n + 200n);       // 300n
${fence}

이 예시는 부동소수점 표현 차이를 확인할 뿐, 실제 금융 서비스에서 특정 금액의 손실이 발생했다는 실측이 아닙니다. 고정된 입력과 출력으로 원인을 확인하고, 처리량이나 금액 불일치 총합을 임의로 만들지 않습니다.

## 2. JavaScript Number, BigInt, SQL numeric의 선택 기준

| 표현 방식 | 장점 | 제약 및 주요 위험 | 적합한 경우 |
| :--- | :--- | :--- | :--- |
| JavaScript Number | 널리 지원되고 과학적 계산에 적합 | 십진 분수는 근사 표현, 안전 정수 범위 제한 | 화폐 아닌 비율·화면 그래프의 근사 계산 |
| JavaScript BigInt | 정수 계산에 정확한 표현, 큰 정수 지원 | Number와 혼합 불가, JSON.stringify 기본 지원 없음 | 유효성 검사된 최소 화폐단위의 정수 처리 |
| PostgreSQL bigint | 고정 64비트 정수, SQL 연산과 인덱스 지원 | -2^63에서 2^63-1까지의 범위 제한 | DB에 저장할 범위가 확실한 원 단위 금액 |
| PostgreSQL numeric | 지정 정밀도의 정확한 십진 연산 | 데이터 크기와 연산 비용 고려 필요 | 소수 통화·정밀 수수료·금융 계약상 소수점 |

Node.js BigInt는 임의 정밀도 정수이지만 PostgreSQL bigint는 부호 있는 64비트 정수입니다. 애플리케이션에서는 유효한 정수라도 DB에 기록할 때 범위를 벗어날 수 있습니다. 따라서 입력의 단위·부호·상한을 확인하고 DB 타입과 API 직렬화 계약을 일치시켜야 합니다.

## 3. 입력 파싱: 실수 변환을 거치지 않는 최소 금액 모델

문자열에서 Number를 거쳐 BigInt로 변환하면 원래의 입력 정밀도를 잃을 수 있습니다. 아래는 정수 원 단위의 예제이며, 음수는 거래 방향으로 표현하고 입금 입력 금액은 양수만 받는 정책입니다.

${fence}ts
const MAX_DB_BIGINT = (1n << 63n) - 1n;

function parsePositiveWon(text: string): bigint {
  if (!/^[1-9][0-9]*$/.test(text)) throw new Error('invalid amount');
  const won = BigInt(text);
  if (won > MAX_DB_BIGINT) throw new Error('amount exceeds DB bigint');
  return won;
}

const debit = parsePositiveWon('1200');
const credit = parsePositiveWon('1200');
if (debit !== credit) throw new Error('unbalanced journal');
${fence}

정수 통화가 아닌 경우 단위(예: 최소 센트, 소수 자릿수)를 명시해야 합니다. 반올림은 입력 단계에서 명확히 선택하며, 통화 스케일이 다른 금액을 별도 변환 계약 없이 더해서는 안 됩니다. 외부 API는 BigInt를 그대로 JSON 직렬화할 수 없으므로 정규화된 십진 문자열을 쓰고 역직렬화 시 검증합니다.

## 4. 복식부기와 원자적 트랜잭션

분개 한 건이 하나의 계정만 변경하면 장부가 불균형해질 수 있습니다. 차변과 대변을 동일한 트랜잭션 안에서 기록하고, 분개별 합계가 일치하는지 확정 전에 검사해야 합니다. 아래 SQL은 설계를 설명하는 독립 샘플이며 실제 Moneyverse DB 마이그레이션이나 운영 테이블이 아닙니다.

${fence}sql
BEGIN;
-- 요청키의 UNIQUE 제약과 계정 행 잠금은 실제 스키마에 추가해야 한다.
INSERT INTO demo_journal_lines (journal_id, account_id, side, amount)
VALUES
  ('example-transfer', 'wallet-A', 'DEBIT', 1200),
  ('example-transfer', 'wallet-B', 'CREDIT', 1200);
-- 분개별 debit/credit 합계를 트랜잭션 내부에서 검증한 뒤에만 COMMIT.
-- 검증 실패 또는 계정 잔액 제한 위반이면 ROLLBACK.
COMMIT;
${fence}

이 SQL만으로는 완성된 서비스가 아닙니다. 운영 구현에서는 스키마 수준 제약, 원장 원자성, 잔액 음수 허용 정책, 권한 제한, 교착상태 방지와 재시도 전략이 별도로 필요합니다. 단일 트랜잭션의 원자성 또한 네트워크 분리나 다중 DB의 합의를 자동으로 보장하지 않습니다.

### 중복 요청과 경합

같은 송금 요청을 두 번 수신해도 한 번만 확정되도록 요청 식별자와 요청 본문 지문을 영속화해야 합니다. 이미 처리한 같은 키·같은 지문은 최초 확정 영수증을 돌려주고, 같은 키·다른 지문은 충돌로 거부합니다. 요청 결과가 불확실한 네트워크 타임아웃에서 새로운 키로 송금을 다시 시작하면 이중 처리 위험이 있습니다. 직렬화 수준, 잠금 순서, UNIQUE 경합 처리와 영수증 읽기를 함께 설계해야 합니다.

## 5. 실패 사례와 테스트 매트릭스

| 테스트 | 입력/상황 | 기대하는 불변식 |
| :--- | :--- | :--- |
| 파싱 | 빈 문자열, 소수 문자열, 음수 금액 | 입력 거절, 원장 미변경 |
| 타입 경계 | 64비트 bigint 최대값 초과 | DB 쓰기 전 거절 |
| 균형 검사 | 차변 1,200원 / 대변 1,199원 | 분개 확정 금지 |
| 장애 복구 | 두 계정 중 두 번째 기록 전에 실패 | 트랜잭션 전체 롤백 |
| 중복 요청 | 동일 idempotency key를 동시 전송 | 확정 영수증 하나만 유지 |
| 경쟁 요청 | 동일 계정의 동시 인출 | 잔액·직렬화 정책 위반 없음 |
| 감사·복구 | 백업 복원 후 전체 분개 재대조 | 승인된 합계·순서·영수증 검증 |

위 표는 구현 시 수행할 **검증 계획**이지 수행 완료된 테스트 결과가 아닙니다. 실제 통과 횟수·성능 수치는 테스트 로그와 코드 SHA를 확보한 뒤에만 게시해야 합니다.

## 6. 설계 선택의 한계와 운영 체크리스트

BigInt가 해결하는 것은 정수 금액의 표현 정확성이지 비즈니스 로직의 무결성 전체가 아닙니다. 마이그레이션 후 과거 Number 기반 금액을 일괄 변환하는 경우 원래의 부정확한 값을 복구할 수 없으므로 원본 거래 증거와 대조해야 합니다. API의 문자열 숫자를 검증하지 않으면 크거나 비정상적인 입력으로 서비스 거부가 발생할 수 있습니다.

설계 검토에서는 통화 스케일, 반올림, 타입 경계, 승인된 원장 함수 권한, 차변/대변 균형, 멱등 키 범위, 실패 복구, 감사 보존 기간과 운영 백업·복원 절차를 문서화합니다. 어떤 구현이라도 무조건적인 '0원 오차 보장' 또는 벤치마크 결과를 증빙 없이 내세워서는 안 됩니다.

## 7. 1차 기술 참고자료

- [MDN JavaScript BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) — Number와의 연산 차이, 직렬화, 정수 표현의 제약.
- [PostgreSQL Numeric Types](https://www.postgresql.org/docs/current/datatype-numeric.html) — bigint의 범위 및 numeric의 정확한 십진 연산.
- [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html) — 동시성 격리 정책 및 직렬화 오류 처리.
- [PostgreSQL Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html) — 계정 행 잠금, 데드락 위험과 잠금 순서.
- David Goldberg (1991), [What Every Computer Scientist Should Know About Floating-Point Arithmetic](https://doi.org/10.1145/103162.103163), ACM Computing Surveys — 부동소수점 정확성과 반올림 개념.

**편집 기록:** 이 글은 재현 가능한 설계 교육용 원고이며 Moneyverse 운영 환경에서 실제 벤치마크를 수행했다는 뜻이 아닙니다. 출판 전 문서/코드 버전과 근거 링크를 다시 검증해야 합니다.`;

const ORDER_BOOK = `## 1. 증상을 먼저 정의하기: 호가 데이터 수신과 화면 그리기는 별개

호가창이 끊기는 문제는 네트워크 수신 지연, 상태 업데이트 폭주, 레이아웃·페인트, GC 또는 모바일 하드웨어 조건 등 여러 병목에서 발생합니다. 'Canvas를 쓰면 항상 60fps'라는 성능 주장은 환경·데이터 크기·실측 로그 없이 검증할 수 없습니다. 개발자는 데이터가 들어오는 주기와 화면이 실제 갱신되는 주기를 분리해 진단해야 합니다.

## 2. 데이터 경로 설계

WebSocket 메시지 수신 → 데이터 형식 및 시퀀스 검증 → 최신 호가 상태 반영 → 화면 프레임당 최대 한 번 렌더링 → 사용자 입력 처리 순으로 경계를 나눕니다. 메시지 수가 많아도 모든 중간 상태를 그릴 필요는 없지만, 체결 내역이나 감사용 이벤트를 멋대로 삭제해서는 안 됩니다. 화면 표시용 최신 스냅샷과 내구성이 필요한 주문 이벤트는 분리해야 합니다.

### 데이터 구조와 일관성 검사

가격을 JS Number 부동소수점으로 합산하는 대신 서버가 정의한 가격 최소단위 정수 또는 명확한 십진 문자열을 수신합니다. 호가의 매수/매도 방향, 거래소 시퀀스 번호, 스냅샷 버전을 확인하고 순서가 역전되거나 메시지가 누락되면 단순히 다음 업데이트를 그리지 말고 새 스냅샷을 요청해야 합니다.

## 3. 렌더 요청을 합치는 예제

다음 코드는 UI 프레임 요청을 합치는 개념 예시이며 실제 운영 WebSocket 프로토콜, 화면 처리량 또는 종목 수를 대표하지 않습니다.

${fence}ts
type Quote = { sequence: number; bid: string; ask: string };
let latest: Quote | null = null;
let pendingFrame = false;

function receiveQuote(quote: Quote) {
  if (!Number.isSafeInteger(quote.sequence)) return;
  if (latest && quote.sequence <= latest.sequence) return;
  if (latest && quote.sequence !== latest.sequence + 1) {
    requestFreshSnapshot();
    return;
  }
  latest = quote;
  if (pendingFrame) return;
  pendingFrame = true;
  requestAnimationFrame(() => {
    pendingFrame = false;
    if (latest) drawQuote(latest);
  });
}
// Replace these stubs with production rendering and snapshot reconciliation.
function drawQuote(quote: Quote) { console.log(quote); }
function requestFreshSnapshot() { console.warn('request resync'); }
${fence}

requestAnimationFrame은 화면 재도색과 작업 시점을 맞춰 주지만 모든 기기에서 특정 fps를 보증하지 않습니다. 비활성 탭에서는 호출이 제한될 수 있고, 실제 네트워크 재접속 및 초기 스냅샷 동기화는 별도 상태 머신이 필요합니다.

## 4. Canvas, DOM, 가상화 리스트의 대안 비교

| 렌더러 | 적합한 상황 | 구현 부담 |
| :--- | :--- | :--- |
| DOM + React | 접근성 중심의 작은 호가 표·빈번하지 않은 변경 | 많은 행을 자주 갱신하면 레이아웃 비용 증가 가능 |
| 가상화 리스트 | 스크롤되는 긴 체결 내역 | 행 크기·키 안정성과 화면 판독기 전략 필요 |
| Canvas 2D | 많은 도형을 일괄 그리는 시각화 | 키보드·스크린리더와 텍스트 선택을 별도 구현 |
| OffscreenCanvas | 지원 환경에서 워커로 렌더 일부 위임 | 지원 범위·전송 비용·fallback 검증 필요 |

Canvas가 DOM보다 모든 상황에서 빠르다는 주장을 하지 않습니다. 데이터 세트·기기·브라우저별 작업량에 따라 구현을 선택하며 초기 선택 이전에 기준선 측정이 필요합니다.

## 5. 검증 가능한 성능 측정 프로토콜

측정하려는 지표는 수신-to-표시 지연의 중앙값과 p95, Long Task 수, 프레임 간격, 메모리 증가율, 오랜 사용 후 재연결 동작입니다. 벤치마크 보고서에는 기기·OS·브라우저 버전, 입력 메시지 재생 데이터와 SHA, 시간 동기화 방식, 웜업과 반복 횟수를 포함해야 합니다.

${fence}js
const started = performance.now();
renderSnapshot(snapshot);
const syncWorkMs = performance.now() - started;
console.log({ syncWorkMs }); // 동기 작업 시간: 실제 페인트 시간 아님
${fence}

이 측정은 동기 함수 실행 시간이지 실제 화면에 픽셀이 표시될 때까지의 지연을 측정하지 않습니다. 브라우저 Performance 패널의 프레임/페인트 타임라인 및 실제 입력 데이터와 함께 해석해야 합니다. 본문에 CPU 점유율이나 60fps 달성률을 표시하려면 재현 로그가 필요합니다.

## 6. 오류·접근성·모바일

시퀀스 누락과 재접속, 숨김 탭 복귀, 320px 화면, 200% 확대, 키보드 포커스, 고대비 모드, 움직임 줄이기 환경에서 동작을 따로 확인합니다. Canvas만 사용한다면 보조기술이 읽을 수 있는 호가 텍스트와 변경 상태 알림을 별도로 제공해야 합니다. 'Live' 배지는 실제 연결 신선도를 확인하는 상태 표시일 때만 노출합니다.

### 검증 시나리오

| 시나리오 | 예상 결과 |
| :--- | :--- |
| 같은 시퀀스 재전송 | 중복으로 순서가 바뀌지 않음 |
| 시퀀스 누락 | 새 스냅샷 복구, 오래된 데이터는 최신으로 오인하지 않음 |
| 탭 비활성화·복귀 | 정합성 확인 후 렌더 재개 |
| 소형 모바일·확대 | 수치 잘림·레이아웃 오버플로 없음 |
| 백그라운드 연결 종료 | 연결 상태를 사용자에게 정직하게 표시 |
| 천천히 도착하는 데이터 | 측정값과 예시값을 구분하여 노출 |

이 표는 실행할 QA 시나리오이며 실제 측정 결과나 최적화 성과를 주장하지 않습니다.

## 7. 1차 기술 참고자료

- [MDN requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) — 프레임 스케줄링과 비활성 탭 제약.
- [MDN OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) — 별도 렌더링 컨텍스트와 기능 지원 환경.
- [MDN WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) — 이벤트 기반 수신과 버퍼링 한계.
- [web.dev Rendering performance](https://web.dev/articles/rendering-performance) — 브라우저 렌더링 파이프라인과 성능 병목.
- [MDN Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API) — 측정 API 의미와 제한.

**편집 기록:** 이 원고는 기술 구조와 재현 방법을 설명하며 Moneyverse에서 특정 CPU 감소율·초당 갱신량을 실측했다고 주장하지 않습니다. 출판 전 대상 브라우저 및 링크 확인이 필요합니다.`;

export const ENGINEERING_ARTICLES: Record<EngineeringTopic, string> = {
  BIGINT_LEDGER: LEDGER,
  ORDER_BOOK_STREAM: ORDER_BOOK,
};
