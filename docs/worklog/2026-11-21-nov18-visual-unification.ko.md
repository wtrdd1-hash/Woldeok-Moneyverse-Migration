# Nov18 전체 프론트엔드 시각 통일

## before work
사용자는 감사 결과의 디자인 혼재를 먼저 해결해 전체 프론트엔드를11월18일 네이비·보라 디자인으로 맞추라고 명시했다. 기존 승인 디자인·PC우선 반응형·현재 favicon 로고·관리자 포함·기능/실제API 유지·질문 없이 진행 지시는 유지된다. 기준 main fc7e2a0943356c32903eeb8f62c9c509eb5d357e. 미니PC 독립 /home/debian/mv-nov18-visual-unification-20261121, fix/nov18-visual-unification-20261121. 로컬 app worktree 도구는 Windows용이므로 승인된 원격호스트에서 git worktree를 사용했다. shared main·기존 운영 환경을 수정하지 않는다.

## in progress
- [x] 최신 main fetch 및 격리 작업 공간/기준 검사: Node332 pass/0fail/0skip (DOM/정적 계약, DB 아님)
- [ ] 실제 HTML 제공 경로·구형 본문/행동·공통셸 결합 방식 확정 및 계획 기록
- [ ] 단일 Nov18 공통셸/토큰/로고/반응형·모바일16px 간격 회귀 RED→GREEN
- [ ] 구형 사용자·관리자 화면에도 동일한 셸/표·카드·입력·오류 상태 적용; 실제 폼/핸들러 보존
- [ ] 경로별 PC/mobile·5언어·검색/필터/계산/메뉴·실제API 표시 및 실패 상태 검증
- [ ] 독립 명세/품질 검토, main 통합·정확SHA Test 및 허용된 UI 범위 운영 승격/롤백 확인

현재 root cause: public native26는공통Thymeleaf, prototype5는별도HTML, legacy37는Spring이제공하는Next캡처/구형markup으로구성. Nginx는개별asset/archive/source별라우팅을유지한다. 단순main소스변경만으로운영전체가바뀌지않는다. 최종Spring전환명세와현재디자인우선요청을함께준수하며, 기존업무본문/상태/폼/영수증흐름을없애고동일한안내화면으로치환하는방식은사용하지않는다.

Ruling: 기존의반복질문중단/구현·운영승격승인에따라새디자인선택질문을반복하지않고확정Nov18명세를구현한다. 공통시각통일과실제기능수용은별도로증명한다. API/DB/원장/관리자보안hold를디자인수정명목으로완화하지않는다.

## finished
진행 중. 테스트/검토/Test/운영 증거가 생긴 범위만 완료로 기록한다.
