# 시안 화면 CSS·금액·실패 상태 복구

## before work
사용자의 진행 지시에 따라 Nov18 승인 디자인과 전체 감사 FE-AUDIT-02/03/04부터 고친다. 기존 clean isolated miniPC worktree를 재사용하고 origin/main52a18d59cb에서 fix/frontend-prototype-integrity-20261121 전용 branch를 시작했다. Superpowers systematic-debugging/worktree/TDD/verification을 적용한다. 기존 디자인 승인과 반복 질문 없이 진행하라는 지시가 유지된다. 새 디자인이나 금융 쓰기 권한을 추가하지 않는 bounded repair다.

## in progress
- [x] root5화면 CSS 닫힘 누락과 시안 잔류/Number 변환 재현, alias5도 함께 검증
- [x] 실패하는 실제 inline 실행/HTML/CSS 검사 후 최소 수정
- [x] 금액 큰 정수·0·잘못된 응답/오프라인·401·재조회 실패·시장 입력 검증
- [x] source 검증과 독립 리뷰, 최신 main CI/격리 Test 검증
- [x] 운영 적용 가능 여부·정확한 범위와 남은 기능 결함 기록

## finished
본 단계의 source·Test·운영 적용 및 기록 완료. 이 작업은5개 시안 화면의 표시 무결성 복구이며 구매/매매/보상/게시 기능 전체 구현으로 보고하지 않는다. 앱/API/DB/잔액·원장 권한 변경 없음. 실제 운영 적용은 검증된 source와 Test 수용·롤백 조건이 확보된 뒤에만 진행한다.

## 진행1 — RED 및 작업 폴더 복구
기존 native91/0실패/0skip. 신규170검사에서140실패/30통과로 큰 정수 반올림·실패 시 샘플 잔류·누락 시가를0%로 표시하는 오류를 재현했다. 재사용 worktree와 local task branch가 외부에서 제거돼 ENOENT를 확인했으며, 원격에 보존된73d5 계획에서 이번 task 전용 .worktrees/frontend-prototype-integrity-20261121를 복구했다. shared main의 타 작업 수정은 건드리지 않았다. 테스트를 그대로 복구해 같은170/140실패 결과를 재확인했다. 구현은 아직 쓰지 않았고 운영 변경도 없다.

## 진행2 — GREEN 및 독립 리뷰 보완
원본10개(root5+alias5)에 CSS 닫힘, 정수 문자열 그룹화, 합성 그래프 제거와 초기/오류 em dash, 검증된 시가만 반영하는 BigInt 유리수 평균 반올림을 구현했다.170검사 모두 GREEN. 독립 리뷰의 두 언어 엔진 불일치를40검사 RED→GREEN으로 수정해 실제 document locale을 우선했다. 세션 조회 후 wallet signedIn:false/401의 최신 로그아웃 증거를 놓치는20실패도 재현 후 수정했으며, 일반 wallet500은 확인된 회원 표시를 보존한다. 전체 native335/0실패/0skip 통과. 첫 Spring test/bootJar SUCCESS(605/0실패/0error/0skip); 최종 source의 변경된 resource를 반영해 재실행 예정. 별도 Test와 실제 렌더 검증 없이는 운영 완료라고 하지 않는다.

## 진행3 — 소스 main 통합 / 운영 준비
PR3338이 main8ba9139b2fcd577253ee83a24040091be218d64b로 통합됐다. branch CI44889225161의 classify/policy/spring-web-check/runtime-check 네 job이 모두 SUCCESS이며 후보 workflow의 추가 verify도 통과했다. 최종 local native335 및 Spring605는0실패/0skip, bootJar SUCCESS다. 실제 운영 /shop 재관찰은 hero block/padding0/grid block/합성 curve 존재로 수정 전 RED를 확인했다. 새 main CI44890241945의 exact-source 결과를 기다려 그 artifact로만 격리 Test를 준비한다. 운영5개 경로는 아직 변경 전이다.

독립 source 리뷰의 언어·로그아웃 상태2건을 재현하고 수정했다. 운영 제안 리뷰의 Important2(상위 Debian 소유 release 경로의 교체 가능성, invalid nginx 설정을 다시 파싱하며 복구가 막히는 문제)도 수정했다. 별도 /var/lib/moneyverse-frontend-integrity-20261121 root 소유 parent와0700 task stage를 사용하고, 복구는 이미 아는 파일 hash·디렉터리 항목을 검사한 뒤 원상복원한다. 실패 주입 RED→GREEN 포함 실제 격리 Nginx·CAS/CI거부·route 중복 검사5개 모두 PASS, reviewer도 독립 재실행5PASS/0FAIL을 확인했다. 별도 보호된 preview의 실제 PC/mobile URI·candidate hash를 수용 증거에 묶는다.

Ruling: source PR 통합 뒤의 배포·검증 증거는 docs/frontend-prototype-integrity-release-20261121 branch에서 기록하여 application source SHA와 문서 commit을 혼동하지 않는다. 재사용 작업 폴더가 이전에 외부 정리된 사실 때문에 main 및 타 작업을 건드리지 않고 이 task 전용 폴더를 유지한다.

## finished — 운영 수용 및 남은 범위
main8ba의 CI44890241945 네 job SUCCESS, source-bound JAR7ba6312b.../HTML10=Git bytes를 검증했다. 보호Test75/운영10 실제 UI 관찰의 해당 integrity 계약은 실패0이며 지갑/시장 읽기 모두 available였다. 공개 HTTPS source/header/CSS/script5개 일치, 기존14경계 unchanged, 외부Test403 유지. 운영 aliases5개만 변경했고 기존 native26/API/DB/worker/세션 authority는 유지했다.

첫preview403은 owned inverse로 복구 후 generation 준비조건을 보완해 통과했다. 독립 ops5PASS 이후 readiness1을 더해 최종6PASS. 언어 메뉴 초기화 전 자동화2회 실패는 조회 완료 뒤 재검사했고 초기 즉시 클릭은 미수용으로 별도 기록했다. 문서 worktree가 다시 외부에서 사라져 원격15b checkpoint에서 off-repo /home/debian/mv-prototype-integrity-docs-20261121로 복구했다. shared main의 implementation_plan.md 수정은 건드리지 않았다.

[실제 수용·실패·롤백·미해결 상세](../releases/2026-11-21-prototype-integrity-production.ko.md). 전체 기능 완료가 아니며 FE-AUDIT-01 및 다른 관리자/언어/위젯/접근성/동적/금융 게이트는 OPEN이다. FE-AUDIT-02/03/04는 이번5개 canonical 화면의 검증된 범위만 수정됐으며 다른 기존 화면까지 해결됐다고 하지 않는다. source PR3338과 별도 docs 최종 PR의 main 통합 여부를 확인하고 이 task의 포함된 branch만 정리한다.
