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

### 진행 checkpoint
정적147개 PC/mobile 각각 재탐색, 별칭41개, 동적25패턴 실제 fixture 시도. 정적79개 오류/차단, 동적21개 오류+4개 홈 fallback,8패턴 fixture 미확보를 원장에 구분했다. 렌더68개 PC/mobile fullPage 재촬영 및 시각 개요 검토. 새26개5언어130건·모바일 메뉴26·지원 패널26, 구형 관리자dock23·구형 채팅12 탭 조작, 검색/필터/계산/지갑 정수 합계 확인을 기록했다. 무조건 전체PASS로 세지 않는다.

초기 전송은 민감정보 가능성 때문에 auto-review 차단. 회원 이름/잔액/UUID/본문/캡처를 제외한 허용 필드 메타데이터를 새로 만들고 UUID/email0개 검사를 거쳐 plaintext 문서 전송을 승인받았다. 개인정보 원본은 로컬 비공개다.

MiniPC fresh Node332 pass/0fail/0skip (VM/DOM/static, 실제DB 아님). 두 독립 source review: admin/CI 및 member 계약을 검토했고, alias표현·allowlist 주체·관찰UI송금hold와 canonicalAPI 구현 구분·검사수63+4·bounded history/disabled 기능 설명을 수정했다. 과거 application CI117skip과 exact-main releaseBLOCKED를 숨기지 않았다. source/API/fixture 원장180행과 별칭41행을 추가했다. origin/main 재fetch 동일dfade03e. 이번 checkpoint는 감사 증거만 포함한다.

## finished
문서 검증 및 GitHub 검사/검토 진행 중. 운영 코드/DB/서비스/보안 설정/배포 변경 없음. 전체 기능 양성·음성 QA는 오류·fixture·hold 때문에 미완료 상태이며 그 차단을 보고한다.
