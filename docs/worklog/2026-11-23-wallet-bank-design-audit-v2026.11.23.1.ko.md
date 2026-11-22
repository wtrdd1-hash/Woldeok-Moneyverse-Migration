# 지갑·은행 예금 입출금 디자인 및 실행 상태 감사

버전: v2026.11.23.1  
날짜: 2026-11-23 KST  
범위: **읽기 전용** 디자인/코드/실제 HTTP 점검. 원장 쓰기·배포 없음  
기준 main: `9876c09888ec84034eec183cf1309c85df3d7447` (기록 전 재확인)  
작업자: ChatGPT (독립 문서 브랜치, Gemini 작업 공간 미수정)

## 작업 단계별 기록

- **시작:** 통합 기획 마스터·11월18일 승인 디자인 우선권·디자인 갤러리 README·은행 명세·11월21일 QA·main 상태 확인. 지갑/은행/저축 포켓만 범위를 정하고 실제 잔액 변경 금지.
- **중간:** 승인 디자인 PNG 경로, Spring 정적/Thymeleaf 화면, 별도 Next 폼, Spring 은행·지갑 컨트롤러와 서비스 코드, 운영 익명 GET을 비교. 기록 직전 `origin/main` SHA 재확인.
- **종료:** 아래 차이 및 수용 기준을 기록. 입출금 POST/실회원 QA/코드·DB 수정/Test·운영 배포 **미실행**. 확인 범위는 소스 검사와 익명 HTTP 조회로 제한.

## 결론: 시안 존재 ≠ 실제 기능 완료

| 항목 | 확인 결과 |
|---|---|
| 11월18일 시안 | `docs/design/all-pages-v2026.11.18.12/previews/wallet.png`, `bank.png`, `bank-savings-pot.png` 3개 존재. README에 **기획 전용·합성 데이터** 명시 |
| Spring 지갑 | `spring-backend/src/main/resources/static/wallet.html`, `templates/mv43/wallet.html`, `assets/mv43/wallet.js`: 현금/은행 잔액, 송금, 거래내역 화면은 있으나 **예금 입금·출금 직접 실행 폼 미확인** |
| 현재 `/bank` 운영 공개화면 | 2026-11-23 익명 GET 200. 보통예금·정기적금 소개 카드, 통장 개설 링크 및 시뮬레이터. **실행 가능한 입출금 폼 없음** |
| 별도 Next.js 소스 | `frontend/src/app/bank/bank-forms.tsx`의 `DepositWithdrawCard` 및 `actions.ts`의 입금/출금 서버 액션 존재. **현재 Spring 운영 연결 증거 아님** |
| `/bank/savings-pot` | 시안 및 정적 페이지 존재, 실제 포켓 입출금 정상 여부는 검증 안 됨 |
| `/wallet` | 비로그인 GET 302 로그인 리다이렉트. 인증된 실거래 검증 안 됨 |
| Spring 은행 API | GET `/standing`, POST `/deposit`, POST `/withdraw` 존재. API 존재만으로 원장 정상 처리 주장 불가 |
| 은행 조회 인증 경계 | 익명 `/api/v1/bank/standing` GET 200 관찰. 본인확인·응답 개인정보 노출 여부 보안 점검 필요. 회원 값은 기록하지 않음 |

## 코드상 중대 결함 — 운영 쓰기 악용은 시험하지 않음

**P0 사용자 식별:** `BankController`가 검증된 서버 세션 대신 사용자 입력 `X-User-Id`를 사용하고 고정 기본 식별자를 가진다. 실제 익명 은행 조회 200이 관찰됨. 전체 경계 확인 전 인증 완료로 표시 금지.

**P0 자금 보존:** `BankService.deposit`는 은행 잔액 업데이트에 대응되는 지갑 현금 차감/복식부기 전표가 없다. `withdraw`는 예금만 `GREATEST(잔액-출금액,0)`로 줄이고 지갑 현금으로 반환하지 않는다. 부족 자금 거부·원장 정합성 보장 없음.

**P0 허위 성공:** DB 작업 예외를 무시한 후 `success: true`와 새 거래 ID를 반환할 수 있다. 조회도 샘플 잔액/이율로 대체 가능. 이것은 실제 성공이나 실자산 표시 근거가 아니다.

**P1 UI 연결:** 11월18일 디자인의 지갑/은행/저축 포켓 콘셉트가 존재하고 Next 입출금 폼 소스도 있으나 운영 Spring 은행 페이지는 소개 카드 중심이다. 지갑에서 바로 예금/출금 실행, 완료 영수증 및 잔액 재조회까지 한 흐름으로 통합됐다는 근거 없음.

11월21일 QA의 `/bank` 차단 기록은 당시 기록이다. 11월23일 익명 GET 200은 새로운 관측값일 뿐, 인증 회원의 정상 금융 거래를 입증하지 않는다.

## 수정·검증 우선순위 (이번 작업은 확인만)

1. 입출금 활성화 전 **세션/계정 소유권·CSRF·멱등키** 강제. 호출자 지정 ID 신뢰 금지.
2. 현금↔예금 이동을 PostgreSQL 승인 복식부기 함수로 원자적 분개. 잔액부족·DB 실패면 실패 응답, 정밀 WLD 정수 및 재시도 영수증 검증.
3. 11월18일 네이비·보라 반응형 디자인으로 지갑 빠른동작에 **예금 입금/현금 출금** 추가, 계좌·잔액·이자 정책 출처·처리중/오류/성공·거래내역 연결. 실구현 전 금리·보호금 표시를 실제 확정값처럼 광고 금지.
4. 별도 Test의 인증된 시험계정 2개로 입출금·부족잔액·중복·동시성·타인 접근·원장 상쇄·실제 API·320px/390px/PC·영어 기본/한국어 및 다른 지원 언어 회귀 QA.
5. 수정 코드 별도 브랜치/PR, 실제 Test 백엔드·프론트·원장 검증, 무중단 운영 승격 게이트 충족 후 배포. 본 감사로 운영 승격 승인·완료 주장 금지.

## 참고 문서

- `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`
- `docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md`
- `docs/planning/BANKING_FINANCIAL_SERVICES_SPEC.ko.md`
- `docs/qa/2026-11-21-all-functions-nov18-audit.ko.md`
- `docs/qa/2026-11-21-live-frontend-after.ko.md`
