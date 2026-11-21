# 전체 페이지·전체 기능·Nov18 디자인 재검증

## before work
사용자는 앞선5화면 수정에 한정하지 말고 전체 UI가11월18일 디자인인지와 모든 기능을 검사하도록 재지시했다. 최신 origin/main dfade03ea9b555f58beabd0dfaf4a7d9a27817c9에서 miniPC 독립 /home/debian/mv-all-functions-nov18-qa-20261121, audit/all-functions-nov18-20261121로 시작한다. 기존 shared main과 다른 작업 파일은 변경하지 않는다. 원본180개 개념 PNG·최신 디자인 명세·기획서·코드와 운영 실제 상태를 분리한다.

## in progress
- [ ] 현재 main/실제 runtime·favicon·기획서·원본 PNG 기준 확정
- [ ] 전체 canonical/alias/dynamic route와 실제 컨트롤·API·fixture 원장 구성
- [ ] 공개·회원·관리자 PC/mobile/5언어 실제 렌더 및 행동 검사
- [ ] 버튼/탭/검색/입력/계산/메뉴·키보드·일관성·기능 차단 상세 기록
- [ ] 변경 기능은 격리Test/실제DB 증거와 분리; source tests·CI 검증
- [ ] 신규 결함·재현·우선순위·각 기능의 PASS/FAIL/BLOCKED/NOT_RUN을 문서 및 GitHub에 통합

운영 금융·계정 삭제·관리자 보안 설정을 임의 fixture로 변경하지 않는다. 실제 송금/매매 등은 기존 권한·출시 hold를 존중해 격리Test 증거가 없으면 BLOCKED다. 표시만·HTTP200·disabled를 전체 정상으로 세지 않는다. 일부 공개기능의 실제 외부 결제/금융 또는 영구 삭제가 필요한 최종 행위는 대신 실행하지 않는다. 운영 코드나 보안 hold를 이 감사에서 변경하지 않는다.

## finished
진행 중. 최신 전체 결과와 검사 한계를 최종 기록한다.
