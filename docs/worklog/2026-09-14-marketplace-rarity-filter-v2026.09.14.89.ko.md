# 마켓플레이스 희귀도 필터 v2026.09.14.89

- 기준선: 현재 `main` `aea77def54ac4b839bb0299781253e9824ac8982`까지 재동기화된 앱 PR #306의 정확한 head `43e85c4001bf5bde0664a7e91308a21145618132`.
- 사용자 이점: 회원이 검색·카테고리·상태·정렬과 함께 서버 보유 아이템의 `rarity` 값을 기준으로 인벤토리를 좁혀 볼 수 있다.
- 범위: 프론트엔드만 변경하며 백엔드/API/DB/경제, 판매 등록·에스크로·정산·이전·제작 mutation은 추가하지 않는다.
- 동시 작업: 캘린더 PR #305와 Dependabot PR들을 확인했고 이번 marketplace 파일과 겹치지 않는다.
- 릴리스 게이트: 이 스택 변경은 exact SHA CI와 격리 Test 통과 전 `main`/Production에 올리지 않는다. GitOps 선언과 공개 Test 런타임 SHA가 다르면 fail-closed를 유지한다.
