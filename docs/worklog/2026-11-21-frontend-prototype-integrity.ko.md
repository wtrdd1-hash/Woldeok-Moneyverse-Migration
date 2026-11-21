# 시안 화면 CSS·금액·실패 상태 복구

## before work
사용자의 진행 지시에 따라 Nov18 승인 디자인과 전체 감사 FE-AUDIT-02/03/04부터 고친다. 기존 clean isolated miniPC worktree를 재사용하고 origin/main52a18d59cb에서 fix/frontend-prototype-integrity-20261121 전용 branch를 시작했다. Superpowers systematic-debugging/worktree/TDD/verification을 적용한다. 기존 디자인 승인과 반복 질문 없이 진행하라는 지시가 유지된다. 새 디자인이나 금융 쓰기 권한을 추가하지 않는 bounded repair다.

## in progress
- [ ] root5화면 CSS 닫힘 누락과 시안 잔류/Number 변환 재현, alias5도 함께 검증
- [ ] 실패하는 실제 inline 실행/HTML/CSS 검사 후 최소 수정
- [ ] 금액 큰 정수·0·잘못된 응답/오프라인·401·재조회 실패·시장 입력 검증
- [ ] source 검증과 독립 리뷰, 최신 main CI/격리 Test 검증
- [ ] 운영 적용 가능 여부·정확한 범위와 남은 기능 결함 기록

## finished
진행 중. 이 작업은5개 시안 화면의 표시 무결성 복구이며 구매/매매/보상/게시 기능 전체 구현으로 보고하지 않는다. 앱/API/DB/잔액·원장 권한 변경 없음. 실제 운영 적용은 검증된 source와 Test 수용·롤백 조건이 확보된 뒤에만 진행한다.
