# v2026.11.08.1936 — 국고·중앙은행·조폐국 상세 기능별 국제 공식 레퍼런스 조사표

**한국어 보조문서** | [영문 기준 원문](2026-11-08-sovereign-treasury-feature-reference-matrix-v1936.md)
**조사일:** 2026-11-08 KST. 각 기관의 **공식 문서·페이지**를 실제 검색하여 기획 기능과 연결하였다. 머니버스는 **가상 WLD 경제서비스**이지 한국의 실제 중앙은행·정부·금융기관이 아니다.
**선행조사:** [v1912 국고·통화권한 16종 자료](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/docs/treasury-sovereign-design-v1912-20261107/docs/research/2026-11-07-sovereign-treasury-reference-matrix-v1912.ko.md).

| ID | 기관별 공식 레퍼런스 | 핵심 설계 원리 | 머니버스 추가 기능 |
|---|---|---|---|
| R01 | [한국재정정보원 dBrain+ 개요](https://www.fis.kr/ko/major_biz/dbrain_oper/intro) | 예산 편성·수입·집행·회계·결산·성과를 통합 | TR-02~04,11 재정 생애주기 |
| R02 | [dBrain+ 주요 기능](https://fis.kr/ko/major_biz/dbrain_oper/main_func/basic) | 수입/지출·실시간 국고·자산·회계 연계 | TR-01 자금/예산 통합 조회 |
| R03 | [IMF 국고단일계정(TSA) 기술자료](https://www.imf.org/en/publications/tnm/issues/2016/12/31/treasury-single-account-an-essential-tool-for-government-cash-management-25188) | 분리계좌 통합·현금 통제 | TR-01 단일 실제 금고·하위 용도별 배분 |
| R04 | [IMF TSA 설계 논문](https://www.elibrary.imf.org/view/journals/001/2010/143/article-A001-en.xml) | 현금 통합과 지출 권한 분리 | TR-03 일일 유동성 예측 |
| R05 | [IMF 정부재정통계 GFSM 2014](https://www.imf.org/external/np/sta/gfsm/index.htm) | 세입·세출·자산·부채 분류 | TR-04 세입/세출 항목 분류·결산 |
| R06 | [IMF 재정투명성 강령](https://www.imf.org/en/topics/fiscal-policies/fiscal-transparency) | 재정 공개·위험·전망 | TR-11 국민 공개 국고 통계 |
| R07 | [PEFA 재정 성과 7개 기둥](https://www.pefa.org/resources/) | 예산 신뢰성·회계·감사 | TR-12 재정 운영 성과 점검 |
| R08 | [세계은행 BOOST 공개예산](https://www.worldbank.org/en/programs/boost-portal/about-boost) | 분류 가능한 세부 집행공개 | TR-11 프로젝트별 세출 조회 |
| R09 | [OECD 예산 거버넌스 권고](https://legalinstruments.oecd.org/public/doc/319/body-text.en.html) | 재정한도·중기계획·예산 규율 | TR-02 예산 상한/다년 계획 |
| R10 | [IMF PIMA 투자관리 평가](https://infrastructuregovern.imf.org/content/PIMA/Home/PimaTool/What-is-PIMA.html) | 기획→배분→시행 | TR-10 공공사업 관리 |
| R11 | [IMF PIMA 실무 핸드북](https://infrastructuregovern.imf.org/content/PIMA/Home/PimaTool/PIMA-Handbook/PIMAHandbook.html) | 문서 설계와 실제 효과 구분 | TR-10 사업 진행 증빙과 지표 |
| R12 | [한국은행 통화정책 기본원칙](https://www.bok.or.kr/eng/main/contents.do?menuNo=400001) | 기준금리·지급준비·대출·공개시장 | CB-01/02 정책 결정 |
| R13 | [한국은행 공개시장운영](https://www.bok.or.kr/eng/main/contents.do?menuNo=400499) | 증권거래를 통한 유동성 관리 | CB-03 채권매매/유동성 운영 |
| R14 | [한국은행 지급준비제도](https://www.bok.or.kr/eng/main/contents.do?menuNo=400029) | 은행 준비금 규율 | CB-04 은행 지급준비비율 |
| R15 | [한국은행 한은금융망](https://www.bok.or.kr/portal/main/contents.do?menuNo=200727) | 실시간 총액결제·완결성 | FI-02 지급 완료 판정 |
| R16 | [한국은행 지급결제 구조](https://www.bok.or.kr/eng/main/contents.do?menuNo=400045) | 증권대금동시결제(DvP) | FI-03 국채 현금동시결제 |
| R17 | [한국조폐공사 KOMSCO 소개](https://www.koreamint.com/etc/page.do?idx=2) | 발권 결정과 제조·공급 역할 분리 | MT-01/02 정책명령→조폐 실행 |
| R18 | [BIS CPMI·IOSCO PFMI](https://www.bis.org/committees/cpmi/pfmi/overview) | 결제완결성·리스크·복구·유지관리 | FI-01~08 원장·무결성 |
| R19 | [ISO 20022](https://www.iso20022.org/about-iso-20022) | 금융 메시지의 의미·형식 표준화 | FI-04 버전별 영수증/이벤트 |
| R20 | [미국 TreasuryDirect 국채 경매](https://treasurydirect.gov/auctions/how-auctions-work/) | 공고→입찰→낙찰→발행 | BD-01 국채 발행 사이클 |
| R21 | [미국 TreasuryDirect 채권 FAQ](https://www.treasurydirect.gov/help-center/marketable-faqs/) | 경쟁/비경쟁 입찰과 만기 조건 | BD-02 보유·이자·상환 |
| R22 | [미국 재무부 월간재정명세서](https://fiscal.treasury.gov/accounting/monthly-treasury-statement) | 세입·세출·흑자/적자 공개 | TR-11 월간 결산 |
| R23 | [세계은행 정부부채관리 DeMPA](https://www.worldbank.org/en/programs/debt-toolkit/dempa) | 국가부채 기록·리스크·현금예측 | BD-03 국채 위험 대시보드 |
| R24 | [IMF·세계은행 중기국채전략 MTDS](https://www.imf.org/en/capacity-development/training/icdtc/schedule/ol/2026/mtdsxol26-186) | 만기분산과 금리 시나리오 | BD-04 국채 만기벽/스트레스 |
| R25 | [노르웨이 국부펀드 NBIM 투자위임](https://www.nbim.no/en/about-us/about-the-fund/governance-structure/executive-board-documents/investment-mandate---government-pension-fund-global/) | 허용 종목·위험·투자 지침 | SW-01/02 국부펀드 투자한도 |
| R26 | [NBIM 전략](https://www.nbim.no/en/news-and-insights/strategy-for-the-fund-management/strategy-28/) | 장기분산·기준지수·리밸런싱 | SW-03 리밸런싱·편차 추적 |
| R27 | [NBIM 책임투자 정책](https://www.nbim.no/en/about-us/about-the-fund/governance-structure/policies/responsible-investment-management/) | 장기 위험·투명한 운용 | SW-04 국부펀드 성과 공개 |
| R28 | [한국 국민연금 기금운용본부](https://fund.nps.or.kr/eng/main.do) | 전략적 자산배분·중기계획 | NP-01/02 기금 수입·지출 전망 |
| R29 | [국민연금 기금 거버넌스](https://fund.nps.or.kr/eng/aboutus/govm/getOHFB0004M0.do) | 제도운영과 투자집행의 역할 구분 | NP-03 연금 지급부채 별도화 |
| R30 | [미국 FDIC 예금보험기금](https://www.fdic.gov/resources/deposit-insurance/deposit-insurance-fund) | 보험료 적립과 파산처리 재원 | DI-01/02 보험료·지급 |
| R31 | [미국 FDIC 보장제도](https://www.fdic.gov/resources/deposit-insurance/understanding-deposit-insurance) | 예금유형과 한도에 따른 보장 | DI-03 보호한도 조회 |
| R32 | [미국 재무부 Do Not Pay](https://fiscal.treasury.gov/payment-integrity/do-not-pay-dnp/about) | 지급 전 수급자·적격성 확인 | GR-02 지원금 중복/자격 검증 |
| R33 | [미국 Do Not Pay 프로세스](https://fiscal.treasury.gov/payment-integrity/do-not-pay-dnp/step-4-workflow-integration) | 사전심사·예외검토·정기 검증 | GR-04 이의신청/재검토 |
| R34 | [국제 공개조달 OCDS](https://standard.open-contracting.org/latest/en/) | 입찰·계약·집행 구조화 공개 | TR-10 공공사업 계약관리 |
| R35 | [BIS 디지털중앙은행화폐 설계](https://www.bis.org/publications/central-bank-digital-currencies-system-design) | 개인정보·사이버보안·상거래 구조 | CB-05 미래 CBDC 시뮬레이션 |
| R36 | [BIS Polaris 오프라인 CBDC](https://www.bis.org/publications/project-polaris-handbook-offline-payments-cbdc) | 이중지급·재전송·기기 위험 | CB-06 오프라인 연구 전용 |
| R37 | [세계은행 재정 위험관리](https://www.worldbank.org/en/programs/debt-toolkit/fiscal-risk) | 공기업 채무·보증·우발부채 | SO-03 공기업 위험관리 |
| R38 | [세계은행 금융부문 FSAP](https://www.worldbank.org/en/programs/financial-sector-assessment-program) | 은행 건전성·위기 시나리오 | BK-03 은행 스트레스테스트 |
| R39 | [IMF 2026 PIMA 성과 평가](https://www.imf.org/en/publications/tnm/issues/2026/08/05/internal-evaluation-of-public-investment-management-assessment-capacity-development-574916) | 실제 수행효과의 독립평가 | QA-04 분기별 운영 효과 검증 |

## 기관별 채택 권고

**국고·기획재정부:** 한국 dBrain+, IMF 국고단일계정·GFSM, PEFA, OECD 예산규율을 결합한다. 게임 내 재정의 출발점은 세금의 실제 수납·회계연도·예산배분이며, 세금과 통화발행은 별개다.

**중앙은행·조폐국:** 한국은행은 금리/지급준비/유동성/발행정책을, 한국조폐공사는 화폐 제작·공급을 분담한다. 게임에서는 중앙은행의 승인명령과 조폐국의 정확히 한 번 실행을 분리한다. 조폐국 MINT 계좌를 공기업의 배당 재원으로 사용해서는 안 된다.

**국채·국부펀드:** TreasuryDirect 입찰·만기·쿠폰, DeMPA 위험관리, NBIM 투자위임·리밸런싱을 채택하되 미실현 평가이익을 국고 현금잔액으로 합산하면 안 된다.

**연금·보험:** NPS 기금운용, FDIC 예금보험기금, 미국 부적정지급 사전검증을 참고한다. 연금 수급권·보험청구 채무와 실제 지급 가능한 WLD를 각각 관리한다.

**아키텍처:** BIS PFMI, ISO 20022 기반의 메시지 의미표준·결제완결성·중복방지·비상복구 원칙을 적용한다. Moneyverse는 실제 원화 CBDC나 법정화폐가 아니므로 관련 기능은 연구/가상 시뮬레이션으로 한정한다.

**적용상 주의:** 위 39개 레퍼런스는 구현 설계의 비교 자료이지, 외부 법규 자동 적용이나 인증 실적으로 표기하지 않는다. 기준연도별 공식 사이트 수치가 변경될 수 있어 국가별 실제 경제금액은 디자인의 기본 상수로 사용하지 않는다.
