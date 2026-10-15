# F675-03 — WLD 거래 기록 및 영수증 상세 기획

> v2026.10.15.680 | PLANNING / 운영 BLOCKED
> [English](F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.md)

## 1. 사용자의 목표 및 기존 화면 재사용

목적은 회원이 내 WLD 변동의 이유, 발생 시각, 확정 여부, 활동 지갑과 가상 은행의 개별 변화 및 문의에 사용할 참조번호를 이해하도록 돕는 것이다. WLD는 비현금화 게임 자산이므로 실제 은행 영수증이나 현금 지급 증명으로 소개하지 않는다. 이미 존재하는 `/wallet`, `/wallet/activity`, `PostingStrip`, CSV 내보내기를 확장한다. 별도의 경쟁하는 원장이나 잔액변경 프로그램을 만들지 않는다.

**기획 상태:** PLANNING. 기존 v523/v542 경제 권한 및 v530 UI 수용 차단은 그대로다. 운영 WLD 이동, DB 변경, 실사용 계정 조회는 하지 않았다.

## 2. 소스 확인 문제 W680-01~08

| ID | 코드 증거 | 상세 요구사항 |
|---|---|---|
| W680-01 | 지갑 홈에서 최근 거래 5개를 보여주며 기존 활동 목록으로 이동 가능 | 홈의 각 거래에 영수증 연결 |
| W680-02 | `/wallet/activity` 화면의 실제 데이터는 최근 최대 50개, 커서 없음 | 최근 50건 표기를 먼저 정확히 하고 전체 이력 페이지네이션 검토 |
| W680-03 | `recentTransactionsForUser`는 USER_CASH+USER_BANK의 순합계를 표시 | 내부 은행 이동은 합계 0이어도 cash와 bank는 각각 증감함 |
| W680-04 | `wallet.service.ts`는 WldAmount 문자열과 기본 유형 라벨 '경제 활동' 사용 | 정수 정밀도 유지하고 모르는 이유는 UNCLASSIFIED |
| W680-05 | 브라우저 CSV는 현재 로딩된 항목만 내보냄 | 내보내는 범위를 밝히고 수식 삽입 방어 |
| W680-06 | 지갑 API는 인증된 세션 기준 거래를 읽고 쓰기 작업에서 거래ID를 반환 | 영수증도 세션 소유자만 읽도록 제한 |
| W680-07 | v523/v542와 이전 금액·권한 감사는 DB 및 경제 P0 검증 미완료 | 신규 공개 전 복식 원장·공급량·실DB 권한 검증 |
| W680-08 | PostingStrip의 양쪽 설명은 실제 모든 원장 계정의 완전한 분개가 아님 | 사용자용 표시와 권위 있는 분개 근거 구분 |

## 3. 사용자 인터뷰로 검증할 8개 과제

새 회원: 첫 직업 WLD 지급을 확인하고 싶다. 은행 이용자: 활동 지갑에서 은행으로 옮긴 WLD가 사라진 것인지 알고 싶다. 가상주식 이용자: 주문 예치금과 실제 체결·환급을 구분하고 싶다. 송금인: 네트워크 타임아웃 뒤 중복 송금을 피하고 싶다. 수금인: 타인 계정 정보가 보이지 않기를 원한다. 큰 자산 보유자: 38자리 금액까지 정확히 검증하고 싶다. 모바일/접근성 사용자: 금액과 거래번호를 잘림 없이 읽고 복사하고 싶다. 관리자·지원: 원본 거래는 보존하면서 문의/정정 이력을 안전하게 추적하고 싶다.

**유저 실측 없음:** 본 단계에서 인터뷰·설문·사용성 테스트를 실시하지 않았다. 사전 동의를 받은 과제별 소규모 탐색 연구(가능하면 각 구별되는 과제군에 3~5명)를 권고한다. 성공기준은 단순 조회수가 아니라 변동 이유·다음 안전 행동을 이해하는지다.

## 4. 화면 UX 및 거래 의미

**/wallet 홈:** 잔액(활동 현금, 가상은행, 합계) 및 기존 주요 버튼을 유지하고, 최근 5개의 서버확정 거래에서 '영수증 보기'를 제공한다. 영수증 카드로 첫 화면의 잔액·주요 기능을 밀어내지 않는다.

**/wallet/activity:** 현재 API가 제공하는 최근 최대 50건을 전건인 것처럼 부르지 않는다. 향후 기간/입출·내부이동/유형/포켓 필터, `(created_at, transaction_id)` 순의 커서 페이징 및 실측된 범위·추가 페이지를 도입한다. 아직 서버에서 구현되지 않은 전체 거래 건수/최초날짜는 표시하지 않는다.

**/wallet/activity/[transactionId] 후보:** 로그인과 거래 소유자 권한 확인 후 (1) CONFIRMED/PROCESSING/REJECTED/OUTCOME_UNKNOWN/REVERSED_BY_NEW_TRANSACTION, (2) 사실 기반 사유, (3) cashDelta/bankDelta/netWalletDelta 개별 정수 문자열, (4) 발생/원장 시각 및 복사 가능한 거래번호, (5) 관련 보상·주문·정산 링크(서버가 검증한 것만), (6) 돌아가기/문의용 거래번호 복사를 보여준다. 타인 거래 존재 여부, 숨겨진 계정 잔액, 내부 SQL, 관리자 식별자는 노출하지 않는다.

**거래 사유 사전:** REWARD_DAILY, REWARD_WORK, TRANSFER_SENT, TRANSFER_RECEIVED, BANK_DEPOSIT, BANK_WITHDRAWAL, BANK_INTEREST, STOCK_ESCROW, STOCK_SETTLEMENT, STOCK_REFUND, MARKETPLACE_PURCHASE, BUSINESS_SETTLEMENT, TREASURY_PAYMENT, TAX_OR_FEE, LOAN_ISSUED, LOAN_REPAID, CORRECTION, MINT, RETIRE, OTHER_VERIFIED, UNCLASSIFIED. 원장 타입과 도메인 근거가 없으면 세금·보상·수수료를 임의로 추측하지 않고 UNCLASSIFIED라고 표시한다.

**예시 (실제 이용자 데이터 아님):** 2,500 WLD를 활동 지갑에서 가상 은행으로 옮겼으면 '활동 -2,500 / 은행 +2,500 / 내 총 WLD 변화 0'으로 설명한다. 이 0은 거래가 없었다는 뜻도 아니고 신규 WLD 발행도 아니다. 실제 원장 debit/credit 방향과 수학적 부호는 골든픽스처로 확인한 뒤 구현한다.

## 5. API·원장 안전 계약

기존 `GET /api/v1/wallet?recent=50` 하위 호환. 새로운 후보 `GET /api/v1/wallet/activity?limit=20&cursor&from&to&type&pocket`는 1~50건 제한·안정된 커서/관측시간/세션 소유자 확인. `GET /api/v1/wallet/activity/:transactionId`는 본인의 세부 영수증만. 결과불명 확인용 읽기 전용 status API는 실제 비동기 거래의 존재와 멱등키 관계를 증명한 경우에만 허용. 기간별 전체 CSV 다운로드는 서버 자원/쿼터·최대건수·감사/개인정보·수식주입 위험을 검증한 후 별도 공개한다.

예시 응답: receiptVersion=1, currency=WLD, reasonCode=BANK_DEPOSIT, state=CONFIRMED, cashDelta='-2500', bankDelta='2500', netWalletDelta='0', occurredAt 및 거래ID. 샘플을 실제 거래 증명으로 사용하는 것은 금지한다.

**불변식:** 각 거래의 차변 총합은 대변 총합과 일치해야 하며 전체 WLD 공급량은 승인된 Mint/Retire만 변경한다. 같은 거래의 `netWalletDelta = cashDelta + bankDelta`를 검증한다. 최근 50건만 더해 현재 잔액과 같아야 한다고 주장하지 않는다. 시작잔액·전체 같은 범위의 원장·동일 스냅샷이 없으면 부분 기록임을 표시한다. 숫자는 WldAmount 정수 문자열/BigInt로 보존한다. 보정은 원본 수정이 아닌 **새로 승인된 보정 분개**로 연결한다.

## 6. 권한·복구·접근성

기존 앱 역할의 광범위 테이블 SELECT/UPDATE, PUBLIC EXECUTE, 직접 잔액변경 위험을 별도 실제 DB 검증으로 해결하기 전에는 사용자 상세 영수증을 공개하지 않는다. 조회는 신뢰된 Nest 인증 세션에 귀속시키고 클라이언트가 넘기는 임의 userId를 권한으로 사용하지 않는다. 필요한 경우 제한된 읽기 전용 SECURITY DEFINER 함수를 설계하되 최소권한 소유자/신뢰 search_path/pg_temp 후순위/스키마 명시, 동일 트랜잭션의 PUBLIC EXECUTE 회수 및 허가대상 역할 지정이 필요하다. RLS 소유자와 권한 우회 예외는 독립적인 부정 테스트를 요구한다.

타인 거래ID, 계정 병합/탈퇴, 쿠키/세션 변경, 브라우저 캐시 혼합, 모바일 앱/관리자 역할, 유효하지 않은 UUID, CSV 다운로드, DB 함수 직접 실행을 모두 확인한다. 개인 데이터는 private/no-store, noindex/nofollow, 적절한 속도 제한으로 보호한다. 원장 정정은 과거 분개 삭제가 아닌 독립된 보정거래이며 지원 도구가 실제 없는데 환불 완료를 약속하지 않는다.

| 화면 상황 | 한국어 | English |
|---|---|---|
| 확정 | 원장에 기록된 거래입니다. | Recorded in your ledger. |
| 내부 이동 | 활동 지갑에서 은행으로 이동했으며 총 WLD는 그대로입니다. | Moved from cash to your virtual bank; total WLD is unchanged. |
| 결과 불명 | 아직 결과를 확인할 수 없습니다. 재신청 전에 거래내역을 확인하세요. | We can't confirm the result yet. Check activity before retrying. |
| 사유 불명 | 이 거래의 정확한 사유를 확인하지 못했습니다. 거래번호를 보관해 주세요. | We cannot yet explain this entry. Keep the reference number. |
| 일부 기록 | 현재 최근 최대 50건만 표시합니다. | Only the latest 50 records are shown. |
| 기록 없음 | 아직 기록된 활동이 없습니다. | No activity recorded yet. |
| 조회 오류 | 원장을 불러오지 못했습니다. 이전 잔액을 최신으로 표시하지 않습니다. | Activity is unavailable. We won't show an old balance as current. |
| 보정 | 원래 기록을 보존하고 별도의 보정 거래를 연결합니다. | The original remains and a separate correction is linked. |

색깔만으로 증감 표현 금지. 명시적 +/- 부호, 포커스/스크린리더 상태, 모바일 320·360·375·390·430px, 200/400% 확대, 전체 참조번호 복사, 긴 한영 문구 및 큰 숫자를 테스트한다. WCAG 3.3.4에 따라 중요한 전송은 제출 **전** 수취인·금액 검토 및 수정 기회를 제공해야 하고 사후 영수증으로 이를 대신할 수 없다.

## 7. D0~D7 실행과 수용

| 단계 | 과제 | 검증 |
|---|---|---|
| D0 | 모든 지갑/주식/은행/국고 거래유형·스키마·소스SHA 조사 | 포켓/상대방/원장 부호 확인 |
| D1 | 별도 코드 브랜치에서 경제·DB 권한 P0 안전화 | 실제 DB 복식 균형/공급량/타인 접근차단 |
| D2 | 소유자 한정 read-only 상세 원장 함수/API | 38자리 정수, cash/bank 순변동과 실제 분개 일치 |
| D3 | 날짜/타입 커서 및 페이지네이션 | 같은 시각 중복/누락과 동시 갱신 검증 |
| D4 | 기존 지갑 화면 및 상세 영수증 UX | 권한/빈값/한국어·영어/모바일·접근성 |
| D5 | 멱등키 기반 결과불명 확인·보정 관계 | 서버 응답 유실 뒤 중복 WLD 없음, 원본 불변 |
| D6 | 범위가 분명한 CSV, 가능하면 서버 내보내기 | 수식주입/잘린 기록/금액반올림 금지 |
| D7 | CI, 동일 SHA 격리 Test, 관리자 포함 전체 UI 5회, 세션·롤백·원장 일치 | v530·v523/542/543 및 DB 위험 해결 전 운영 HOLD |

필수 픽스처: 은행 이동 순변화 0, 보상, 전송 송·수신, 주식 예치·체결·환급, 대출/상환, 국고/세금, 상점, 계정 통합, 보정과 원본, 타입 미등록, 38자리 금액, 동일 시각 거래 커서, 타인 UUID, 응답 유실 뒤 중복클릭, PUBLIC 함수 차단, CSV 수식 시작문자, 스크린리더·400% 확대.

수용 목표는 공개된 확정 영수증이 권위 있는 분개와 100% 일치, 정보유출/허위 완료/금액 정밀도 손실/거래 원본변조/GET으로 WLD 이동 **0건**이다. 미분류 항목을 숨기지 않고 정확히 표시한다. 이용자 실측·기능 배포·Test 합격은 이번 작업에서 확인되지 않았다.

## 8. 2026-10-15 공식·실무 레퍼런스 13개

| ID | 출처 | 적용 한계 |
|---|---|---|
| R680-01 | [GOV.UK 거래 완료 확인](https://design-system.service.gov.uk/patterns/confirmation-pages/) | 실제 완료 후 참조번호와 다음 행동 |
| R680-02 | [GOV.UK 오류 문구](https://design-system.service.gov.uk/components/error-message/) | 구체적인 복구 안내 |
| R680-03 | [CFPB 전자거래 명세 §1005.9](https://www.consumerfinance.gov/rules-policy/regulations/1005/9/) | 날짜·종류·금액의 UX **참고**, WLD 법률 아님 |
| R680-04 | [CFPB 오류 정정 §1005.11](https://www.consumerfinance.gov/rules-policy/regulations/1005/11/) | 분쟁 문의 UX 참고, WLD 권리 아님 |
| R680-05 | [W3C WCAG 2.2 3.3.4](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html) | 제출 전 중요 입력 검토 |
| R680-06 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | 상태·포커스·확대 |
| R680-07 | [OWASP API1 객체 권한](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/) | 회원간 타인 거래 조회 차단 |
| R680-08 | [OWASP API3 속성 권한](https://github.com/OWASP/API-Security/blob/master/editions/2023/en/0xa3-broken-object-property-level-authorization.md) | 상대방 개인정보 제한 |
| R680-09 | [PostgreSQL 17 CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html) | 함수 권한·안전한 SECURITY DEFINER |
| R680-10 | [PostgreSQL 17 RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) | 행권한과 소유자/고권한 예외 |
| R680-11 | [PostgreSQL 17 트랜잭션 격리](https://www.postgresql.org/docs/17/transaction-iso.html) | 동일 시점 잔액 정합성 |
| R680-12 | [Stripe idempotency](https://docs.stripe.com/api/idempotent_requests) | 응답 유실 중 중복 요청 방지 패턴 |
| R680-13 | [OWASP CSV injection](https://owasp.org/www-community/attacks/CSV_Injection) | 거래 라벨/다운로드 악성 수식 차단 |

이 레퍼런스는 기획 근거이지 법률 준수·운영 정상성·실제 사용자 만족도를 입증하지 않는다. **PLANNING 상태 유지**: 새 영수증 API/DB/화면은 이후 안전·Test 검증된 개발 브랜치에서 구현한다.
