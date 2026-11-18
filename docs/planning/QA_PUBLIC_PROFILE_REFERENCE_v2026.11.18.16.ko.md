# QA 참고자료 조사 — QA실무노트 (@qaonetop) 공개 프로필·릴스

> 버전 v2026.11.18.16 · [영어 정본](QA_PUBLIC_PROFILE_REFERENCE_v2026.11.18.16.md) · 참고자료 조사. 원본 영상 전체 대본 또는 실제 QA 결과 아님.
> 2026-11-18 KST 조회. Instagram 공개 프로필과 비로그인 공개 임베드의 **게시물 설명**을 확인. 당시 전체 게시물 표시는 74개였지만, **실제로 설명을 확인한 릴스는 아래 6개뿐**이다. 나머지 전체 게시물·음성·영상 프레임·스토리는 확인하지 않았다.

## 프로필과 출처
- [QA실무노트 (@qaonetop)](https://www.instagram.com/qaonetop/): 본인 프로필 소개에 소프트웨어 QA 정보 제공, 임베디드/웹/앱 QA 경험, 실무 경험 공유라고 표시.
- 같은 영문 표기를 쓰는 해외 QAonTOP 기업과 동일 주체라고 주장하지 않는다.
- 교육 게시물은 참고자료이지 ISTQB, 머니버스 통합 기획, 보안·금융 원장 승격 조건을 대체하는 근거가 아니다.

## 추가로 검증한 게시물 6개

| 릴스 | 설명에 확인된 정보 | 머니버스 적용 제안(원문이 아님) |
|---|---|---|
| [Df25MnXybqW](https://www.instagram.com/reel/Df25MnXybqW/) | 요구분석부터 종료판단까지 QA 12단계 | 12단계별 증빙·미실행/차단·승격 판정 연결 |
| [Df1gBVOR55n](https://www.instagram.com/reel/Df1gBVOR55n/) | '테스트 종류 12가지' 제목만 확인, 종류 전체는 미제공 | 자체 QA 12개 검증 묶음 작성. 제작자 원문 종류로 오인 금지 |
| [Df05BgtRMpe](https://www.instagram.com/reel/Df05BgtRMpe/) | 결함 유형·경계값·동등 분할·결정 테이블·상태 전이·테스트 피라미드·회귀·V모델·커버리지·페어와이즈·결함 생명주기·위험 기반 12개 | 로그인·원장·오류/복구/재시도 TC 설계 |
| [Df0byjESMAd](https://www.instagram.com/reel/Df0byjESMAd/) | 단위 테스트는 작은 기능, 통합 테스트는 연동 및 요청부터 DB, E2E는 사용자 전체 흐름 | Spring+실제 DB 계약·전체 회원/관리자 화면을 별도 실증. HTTP 200만으로 인증 금지 |
| [DfyqzZRunoC](https://www.instagram.com/reel/DfyqzZRunoC/) | QA 협업의 PO·PM·서비스 기획·디자인·프론트·백엔드·QA·DevOps·운영 9개 직무 | 요구사항·결함·API 인계·릴리스 승인·롤백 책임 담당자 분리 |
| [Dfx9roYRhcV](https://www.instagram.com/reel/Dfx9roYRhcV/) | 앱의 스플래시·온보딩·권한 요청·로그인 유도·빈 화면·오류·점검·강제 업데이트·완료 화면 | Android 실제 구현 상태에 한해 빈 상태/오류/권한/복구 중심 UI 테스트 |

## 한계와 활용 원칙
1. 실제 확인된 것은 공개 **게시물 설명**이다. 영상 내부 강의·슬라이드 전체를 검증한 것으로 확대하지 않는다.
2. 게시물 수 74개는 해당 시점 페이지에 표시된 값이다. 74개 전체를 학습했다고 주장하지 않는다.
3. 새 자료는 확인 당시 날짜/직접 링크/내용 확인 수준을 남긴 후 기획에 반영한다. 비공개 자료·세션/쿠키/개인정보 수집 금지.
4. Spring 전환 시 기존 Next.js 라우트 개수 대신 후보 서버의 실제 화면과 Android 진입점을 인벤토리로 삼는다.

## 관련 명세
- 이전 [v2026.11.18.15 QA 방법론 PR #3269](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3269): 12단계·12개 개념·머니버스 자체 분류.
- [v2026.11.18.16 예약 시맨틱 QA 운영 명세](../operations/QA_SCHEDULED_SEMANTIC_RUNBOOK_v2026.11.18.16.ko.md): 읽기 전용 소수의 자동 검증만 다룸. 전체 관리자/금융/Android 기능 QA를 대체하지 않음.
