# 파비콘 로고 및 운영 프론트엔드 재점검

## Before work
- 사용자 요청: 실제 운영 프론트엔드를 확인하고 현재 파비콘 이미지를 로고로 사용한다. 별도 11월 17일 디자인 원본도 찾는다.
- 최신 origin/main 2a172ce199bbc4dfe123b0672fcb5fb548dea09e에서 미니PC의 기존 격리 worktree에 전용 브랜치를 생성했다. 공유 checkout 및 다른 작업은 변경하지 않는다.
- Superpowers systematic-debugging, writing-plans, executing-plans, TDD, verification-before-completion을 적용한다.
- 운영 브라우저 홈: 로고 2곳은 이미지가 아닌 SPAN W이며 명시적 favicon link가 없다. 실제 /favicon.ico와 /assets/mv39/favicon.ico는 동일한 11,781바이트, SHA256 9ce0a8f10cafff52d1d2f7aa451b3e9162944162f61258842e13aa8546f98e78이다. 저장소 파일과도 일치한다.

## In progress
- [x] GitHub PR 및 main 디자인 이력, 미니PC 작업 폴더, 연결된 디자인 대화, 사용자 로컬 이미지 목록을 조사했다.
- [x] 공식 왕관·월계수 W 아이콘과 실제 파비콘의 출처를 확인했다.
- [ ] 실제 파비콘을 공통 로고/탭 아이콘으로 연결한다.
- [ ] 회귀 테스트 RED→GREEN 및 관련 전체 검사, 독립 리뷰를 기록한다.
- [ ] 실제 PC·모바일 메뉴/언어/버튼/데이터 로딩을 검사하고 오류 및 미검증 범위를 기록한다.
- [ ] 정확한 소스의 Test와 운영 전환 상태를 기록한다.

### 디자인 원본 검색 결과
- PR3247은 11월 17일 게임형 앱 기획 문서이며 원본 픽셀 이미지가 아니다.
- 보관된 reference-approved-home.jpg 및 180 PNG는 11월 18일 개념 와이어프레임이다. 사용자가 말한 별도 11월 17일 원본이라고 판정하지 않는다.
- 기존 UI_IMAGE_IMPLEMENTATION_HANDOFF 및 LIVE_HOME_APPROVED_UI_GAP 문서도 대화 생성 이미지와 복구 PNG 일치를 미검증으로 명시한다.
- 연결된 ‘사이트 새 디자인 요청’·‘UI 이미지 전달 확인’ 대화는 조회 결과에 생성 이미지 대신 참조만 반환했다. 브라우저는 비로그인 상태이며 앱 화면 접근 승인이 시간 내 완료되지 않아 원본 이미지는 확보하지 못했다.
- 별도 11월 17일 원본 일치 판정은 OPEN이다. 원본을 확보하기 전 임의 디자인을 그 원본이라고 보고하지 않는다.

## Finished
아직 종료하지 않았다. 운영 변경 없음.
