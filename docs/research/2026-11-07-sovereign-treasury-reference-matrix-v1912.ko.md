# v2026.11.07.1912 — 국가 재정·중앙은행·조폐국 공식 자료 비교 연구

> 한국어 보조 문서 | [영문 원문](2026-11-07-sovereign-treasury-reference-matrix-v1912.md)
> 상태: RESEARCH / DESIGN INPUT, 구현·법률 자문이 아님.
> 조사 기준: 2026-11-07 KST. 각국 공공 제도는 참고 사례이며 머니버스 WLD에 국가 법령이나 공적 보증이 적용된다는 뜻이 아니다.

## 공식 자료와 적용 기획

| ID | 공식 참고자료 | 주요 업무 사실 | 머니버스 반영 방향 |
|---|---|---|---|
| R01 | [한국은행 — 국고증권·국고업무](https://www.bok.or.kr/portal/main/contents.do?menuNo=200014) | 수입·지출 결정과 국고금 출납 분리, 정부·한국은행 대사 | 예산 결정, 결제 요청, 실제 입금·출금 영수증 분리 |
| R02 | [한국재정정보원 — dBrain+](https://www.fis.kr/ko/major_biz/dbrain_oper/main_func) | 계획→예산→세입·세출→결산, 자산·성과 통합 | 예산 계층, 집행약정·결산·성과 대시보드 |
| R03 | [한국은행 — 한은금융망](https://www.bok.or.kr/portal/main/contents.do?menuNo=200727) | 실시간총액·혼합형 결제, 결제완결성, 일중 유동성 | 결제완결 시점·대기열·은행별 유동성·실패 격리 |
| R04 | [한국은행 — 발행과 제조의 차이](https://www.bok.or.kr/portal/bbs/P0000547/view.do?depth=200387&menuNo=200387&nttId=10085714&oldMenuNo=201150&programType=newsData&relate=Y) | 발행기관은 한국은행, 제조는 한국조폐공사 | 중앙은행 승인·조폐국 집행, 제조 이미지와 WLD 발행 구분 |
| R05 | [한국조폐공사법](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=&chrClsCd=010202&efYd=20240517&lsiSeq=251085&urlMode=lsInfoP) | 화폐 제조 및 보안 인쇄 업무 범위 | 조폐 명령·인증서·집행 전용 권한 |
| R06 | [한국은행 통화정책 수단](https://www.bok.or.kr/portal/main/contents.do?menuNo=201749) | 기준금리·공개시장·대출·지급준비 | 정책 시뮬레이션과 담보·유동성 모델, 무제한 발행 금지 |
| R07 | [IMF — 국고단일계좌(TSA)](https://www.imf.org/en/publications/wp/issues/2016/12/31/treasury-single-account-concept-design-and-implementation-issues-23927) | 국고 현금 단일화·중복 계좌 관리 방지 | 국고 통합 현금 보기·용도별 보조원장은 추가 통화량 아님 |
| R08 | [IMF — 정부재정통계 매뉴얼](https://www.imf.org/en/data/statistics/government-finance-statistics-manual/gfs) | 세입·지출·재원조달·자산·부채 별도 분류 | 국채 매각은 세수 아닌 부채 조달로 분류 |
| R09 | [IMF — 재정투명성 규범](https://www.imf.org/en/topics/fiscal-policies/fiscal-transparency) | 적시 재정 보고·예산·재정위험 공개 | 입금확정·집행약정·예측·미검증 금액을 분리 공시 |
| R10 | [BIS — 금융시장 인프라 원칙](https://www.bis.org/committees/cpmi/pfmi/overview) | 결제완결성·유동성·업무 연속성·운영 위험 | 원장 확정 시점·불변 영수증·대사·복구시험 |
| R11 | [BIS — CBDC 시스템 설계(2024)](https://www.bis.org/publications/central-bank-digital-currencies-system-design) | 프라이버시·사이버 보안·오프라인 결제 검토 | 장기 연구 항목으로만 활용, WLD를 법정 CBDC로 홍보 금지 |
| R12 | [BIS — 오프라인 CBDC 설계](https://www.bis.org/publications/project-polaris-handbook-offline-payments-cbdc) | 오프라인 결제의 위험한도·개인정보·보안 고려 | 이중사용 검증 전 오프라인 WLD 거래 금지 |
| R13 | [미국 연준 — 통화정책 도구](https://www.federalreserve.gov/monetarypolicy/policytools.htm) | 준비금 이자·공개시장·금융지원 수단 | 금리 시뮬레이션과 통화 발행을 별도 모델링 |
| R14 | [미국 재무부 — 국채 경매](https://treasurydirect.gov/auctions/) | 공고→입찰→배정→발행 및 유통시장 | 국채 모집·투자금 정산·만기·이자 지급을 실제 자금과 연동 |
| R15 | [노르웨이 중앙은행 — GPFG 국부펀드](https://www.norges-bank.no/en/topics/liquidity-and-markets/investment-management/) | 정부 위탁 자산 운용과 중앙은행 준비금 분리 | 평가수익·실현이익·국고 현금·위탁 운용 한도 분리 |
| R16 | [ISO 20022 — 금융 메시지 업무모형](https://www.iso20022.org/iso20022-repository/business-model) | 결제·지급·거래 정보의 표준 의미체계 | 거래 이벤트 ID·사유 코드·영수증·상태의 공통 규격 |

## 차이와 주의사항

- 한국의 국고는 공공 국가 자금이지만 머니버스 WLD는 게임 내 가상화폐다. 현실 정부 보증·예금자 보호·현금 환급을 약속해서는 안 된다.
- 한국은행의 발권과 조폐공사의 제조처럼 **정책 승인 / 집행**을 분리한다. 국고 잔고가 부족하다는 이유로 통화를 찍어내지 않는다.
- IMF 국고단일계좌(TSA)는 현금을 통합 관리하는 구조다. 미실현 주식 평가이익이나 국채·연금 약정을 당장 지출 가능한 현금으로 합산하지 않는다.
- 연준·한국은행의 기준금리 및 유동성정책은 단순한 유저 보상금 생성 기능과 다르다.
- 노르웨이 국부펀드의 운용 수익률은 실제 국고 계정에 현금 입금된 배당금과 구분한다.
- BIS/PFMI 설계 원칙을 참고하더라도 독립 준수 인증이나 장애복구 목표 달성을 주장하지 않는다.
- ISO 20022를 참고한 거래 정보 필드만으로 표준 인증을 주장하지 않는다.
- 이전 기획에 등장하는 2인 승인과 무증빙 국고 보충은 최신 사용자 지시와 금융 코어 불변식을 우선해 배제한다.

## 근거의 한계

기존 기준 문서: docs/planning/PROJECT_PLAN.md, INTEGRATED_PLANNING_MASTER.md, 중앙은행·조폐국·국고 v523 명세, 관리자 국고 명세, 국고코어 v1618.2, 금융무결성코어 v1701. main 기준 0b5b2b1 (2026-11-05). 미니PC의 개발 서비스 가동 확인은 공식 Test·운영 금융거래 검증이 아니다.

## 후속 검증 과제

1. 실제 국고 계정, 금고, 은행·연금·국부펀드 자산의 소유·중복 집계 관계를 확인한다.
2. 운영·테스트 정확한 실행 커밋과 복원 DB 대사 결과를 확보해 역사적 금액의 진실성을 확인한다.
3. 세금·공기업 배당·국채·연금·보험금의 재원과 영수증을 개별 검증한다.
4. 웹·안드로이드에서 미실행 기획 금액을 확정 지급으로 표시하지 않는지 확인한다.
