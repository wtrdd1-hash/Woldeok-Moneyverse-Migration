# 사용자 선택 디자인 확정 — 네이비·보라 PC·모바일 통일 UI v2026.11.23.3

> **사용자 선택 디자인 기준 (OWNER SELECTED) — 2026-11-23.** 사용자 지시에 따라 **월덕 머니버스 전체 웹의 시각 디자인 기준은 v2026.11.23.3 네이비·보라색 통일 UI**로 지정한다. 11월 18일의 경로·기획을 유지하되 범용 카드 복사, 직업 진입 누락, 화면별 청록/녹색 테마를 시정하는 방향이다. **선택된 시각 기준**이라는 의미이지 180개 세부 화면 검수, 원본 PNG 교체, 실제 사이트 배포가 완료됐다는 뜻은 아니다.

영문 정본: [English](OWNER_SELECTED_UNIFIED_DESIGN_v2026.11.23.3.md)
전체 화면 목록: [한국어](ALL_180_UNIFIED_UI_REGISTER_v2026.11.23.3.ko.md) · [English](ALL_180_UNIFIED_UI_REGISTER_v2026.11.23.3.md)
시정 이슈 [#3374](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3374) · 디자인 초안 PR [#3376](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3376)

## 공식 선택한 디자인 원칙

- 바탕 네이비 `#0C1020`, 카드 `#151D32`, 브랜드 보라 `#9C83FF`, 보조 파랑 `#64B7FF`, 본문 `#E9F1FF`, 설명 `#A8BCD8`.
- W 로고, PC 좌측 메뉴, 모바일 하단 내비게이션, 검색, **직업/커리어 진입**, 전 화면 단일 문의/채팅, 언어 선택을 통일한다.
- 직업 선택·업무 수락/완료·보상/자격·승급, 은행 입출금·적금·카드, 지갑 송금/받기/영수증, 주식·사업·부동산·퀘스트·상점·커뮤니티·관리자 권한별 업무는 **기능에 맞는 상세 UI**로 구성한다. 페이지 제목만 달라지는 범용 대시보드 반복 금지.
- 기본 언어 영어, 두 번째 한국어와 일본어·중국어 간체·베트남어 지원. 현재 한국어 시안은 5개 언어 QA 결과가 아니다.
- 이미지의 WLD·원화 금액, 캐릭터, 등락, 성공/실패 상태는 모두 **디자인 예시**로 표시하며 실제 서버 거래·개인 데이터·운영 성공 증거가 아니다.

## 이미지 링크: 기존 GitHub 원본과 새로운 선택 시안을 구분

### 11월 18일 기존 GitHub 원본 (역사적 참고, **새 선택 디자인 이미지 아님**)
- [기존 홈 home.png](all-pages-v2026.11.18.12/previews/home.png)
- [기존 직업 work.png](all-pages-v2026.11.18.12/previews/work.png)
- [기존 은행 bank.png](all-pages-v2026.11.18.12/previews/bank.png)
- [기존 지갑 wallet.png](all-pages-v2026.11.18.12/previews/wallet.png)
- [기존 퀘스트 quests.png](all-pages-v2026.11.18.12/previews/quests.png)
- [기존 상점 shop.png](all-pages-v2026.11.18.12/previews/shop.png)
- [기존 직업 관리자 admin-work.png](all-pages-v2026.11.18.12/previews/admin-work.png)
- [기존 180개 이미지 전체 목차](all-pages-v2026.11.18.12/README.md)

### 이번에 사용자가 선택한 새 통일 시안 (생성 완료, **GitHub PNG 업로드 미완료**)
이미지 패키지 파일명: `moneyverse-unified-ui-v2026.11.23.3.zip` (180개 PC·모바일 복합 시안, 경로목록, 전체 미리보기 9장, 주요 PC·모바일 별도 이미지). 대화에 전달된 압축파일이며 현재 GitHub에 영구 호스팅된 이미지 링크는 **없다**. GitHub 원본 PNG URL을 새 디자인 링크라고 잘못 안내하지 않는다.

시정 완료 조건: 신버전 폴더에 실제 PNG 업로드 → 파일 SHA256/경로별 링크 검증 → 기능별 버튼/상태/언어/모바일/접근성 검수 → 문서/이미지 PR 검토 → Spring MVC + Thymeleaf 구현·Test·QA → 별도 운영 승격.

## 현재 상태
| 내용 | 판정 |
|---|---|
| 사용자가 선택한 통일 시각 디자인 기준 | **OWNER SELECTED** |
| 180개 화면 목록과 원칙의 GitHub 문서화 | **브랜치 반영** |
| 180개 PC·모바일 새 시안 생성 | **대화 ZIP 생성** |
| 새 시안 PNG 180개의 GitHub 업로드 | **미완료** |
| 세부 기능/상태별 화면 요소 수용 | **미완료** |
| 실제 Spring 웹 적용·Test·운영 | **미실시** |

`PROJECT_PLAN` → `INTEGRATED_PLANNING_MASTER` → 채택 상세 기획서의 권위를 유지한다. 11월 18일 원본 PNG는 역사 기록으로 보존하고 GitHub 이미지를 교체했다고 허위 기록하지 않는다.
