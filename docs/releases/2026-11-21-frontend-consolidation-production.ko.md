# Nov18 통합 프론트엔드 운영 수용·실행 정리

2026-11-21 15:55 KST. **공개5 + 관리자 조회10 + 회원3 + 인증 안내/로그인8 = 26개 canonical 화면의 표시·안전한 실패 상태를 운영 전환했다. 사이트 전체 기능 완료가 아니다.** source PR [3334](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3334), 애플리케이션 SHA `e45f57595415f132eedf36c13748564b93a1d918`, 공식 main CI [44873490927](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/44873490927), JAR SHA256 `e11ebcddba4ec70afe987a6a52ecf333f38292c983e27654bb4f93f9d0cab08a`. 문서 main이 이후 전진해도 애플리케이션 source SHA를 문서 commit으로 바꾸지 않는다.

## 현재 지원 상태

|구간|현재 수용|미수용/차단|
|---|---|---|
|공개5|홈·도구·계산기 허브·복리/평단 계산; 실제 session header|다른 전체 사용자78 오류/차단 경로는 별도|
|관리자10|기존9조회 + 실제4원천 API 관제, 공통 PC/모바일 Nov18 셸|나머지29정적 관리자와 모든 변경 기능 완료 아님|
|지갑|동일 cookie owner 확인, 실제 조회/거래내역, cash+bank=total 정확 검증|현재 CSRF proof 없음으로 송금 입력/실행 비활성|
|문의/쪽지|owner proof 뒤 공통 셸, 실패 시 전송 비활성|운영 API JSON에는 실제 rows가 있으나 UI owner/DTO 계약 미검증. 목록·전송 정상 아님|
|인증8|기존 순수 화면 합성; 가입·복구 등의 실제 hold 명시|실제 자격증명 로그인 제출·동의기록·메일 전달·삭제/복구 정상 아님|

운영 정적147경로 재검사: 회원108 중78 오류/차단, 관리자39 중 errors1 오류 안내. 동적33개는 fixture 필요로 미검증이다. before147 원장과 after147 원장을 모두 보존한다. [현재 경로/기능 결함 상세](../qa/2026-11-21-live-frontend-after.ko.md).

## 실제 검증
- local native95/95 + Spring605/605, 실패·skip0, bootJar SUCCESS. main CI classify/policy/spring-web-check/runtime-check 네 개 SUCCESS. DB-tag 제외 여부와 전체 다른 job의 skip를 이 수치에 섞지 않는다. 이번 frontend는 migration/DB/원장/잔액 변경 없음.
- Test26화면 × PC1440/mobile390 × en/ko/ja/zh/vi =260조합. 가로 넘침0, 실제 favicon 로고 로딩 오류0, 지갑 합계10조합 모두 일치. 실제 입력 복리1,210, 평단150/목표가165/수량20/원가3,000/수익300. 언어 전환 계산 draft·관리자 검색값 유지, FAQ 열기, 빈 검색 결과, 메뉴 Escape/focus 복귀·문의 안내창 열기/닫기.
- 같은 source/JAR의 Test를 실제 중지한 동안 운영26경로·로그인 세션·wallet 합계·admin4read를 재확인하고 Test를 복구했다. QA 화면만 운영으로 오인하지 않도록 실제 Nginx/config/listener/packaged source/process cwd/JAR inode/MainPID 전후 검증을 수행했다.
- 독립 소스 리뷰 Important1(빈 CSRF로 계정명까지 사라짐)을 초기/fresh 회귀2개 RED→GREEN 후 전체 suite 재실행했다. 독립 운영 리뷰 Important4(login method/body, preview 직접 권한, 숨은 local 소비자, current main)을 회귀 RED→GREEN. 운영14검사 + 격리 Nginx gateway51case PASS.
- source CI와 브라우저 실제 수용은 서로 대체하지 않는다. 실제 메시지/금융·구매·삭제 변경, 두 실계정 간 owner 전환·관리자 재인증/TOTP 동작은 미수용이다. 전체 금융·manual346·DR 등 기존 gate는 그대로 OPEN.

## 실행·자산 정리

신규 `moneyverse-frontend-consolidated-prod-v20261121.service`(4822) / `...-test-...`(4820), `frontend-presentation` mode. 두 unit만 신규 프론트엔드 구간을 제공하며, 나머지 기존 HTML/API·재무·worker authority는 별도 유지한다. gateway4821은 기존4550/4632의 fixed9GET만 cookie-only로 사용하고 bearer/internal/actor header·mutation은 전달하지 않는다. 공개 방문자가 예측가능 preview cookie만 만들어도 권한을 얻지 못하도록 named preview에도 관리자 auth_request를 적용했다. 기존 canonical login non-GET은4550에 method/body를 보존하고 새 auth 별칭의 mutation hold403도 유지한다.

검증된6JAR source에서 asset23경로/30개 bytes version을 root-owned archive로 보존했다. 역사 hash와 현재 hash, private admin 자산 권한, shared unknown-version legacy fallback, 오류의 immutable cache 방지를 실제 격리 Nginx와 운영으로 검사했다.

미참조·DB-free old Test5개와 의존성 이전 뒤 구버전 native6개 합계11개를 stop/부팅 비활성. 남은 구버전 Test 소비자로 확인된 로컬 QA Nginx2개는 production master와 구별된 config/hash/loopback listener/연결·pidfd로 한정해 종료했다. 그 중 하나의 pid file이 사라져 있어 파일에 의존한 signal은 하지 않았고, proc/config/listener 검증 뒤 PID-reuse 안전한 pidfd SIGQUIT를 사용했다. 운영 Nginx·MCP 서비스·API·DB·경제AI/worker는 중지하지 않았다. release/rollback artifacts를 삭제하지 않았다. 최종 native 정리 단계 MemAvailable1,073,720→1,272,492kB, SwapFree15,242,180→16,660,580kB.

실제 hidden 소비자 검사에는 effective active228unit, env/drop-in/referenced config/scripts, live proc argv/env, scheduled tasks, established socket460개 record가 포함됐다. dash-root mount는 systemctl `--`로 처리, 이미 별도 수집한 proc argv/env 외의 kernel virtual files는 deployment config로 읽지 않는다. 모든 가능한 미래 프로그램의 호출 부재를 증명한다는 뜻이 아니며 불명확한 서비스는 보존한다.

## 실패·거절·복구 기록
- 첫 proposal map_hash 초기화 순서 오류는 nginx-t에서 변경 전 거부. 정렬상 첫00-global include로 수정한 제안만 적용했다.
- 첫 Test apply는 기존403의 cache header를 바꿔 strict baseline이 거부했고 exact owned inverse로 전체 복구했다. 비-preview403를 원래대로 보존한 제안 재검증. 이어 nginx old worker가 source port를 잠시 점유해 변경 전 실패했으며, listener 해제를 실제 확인한 뒤 같은 고정 제안으로 재실행했다. 최종 Test/Production receipts가 수용 상태다.
- 초기 정리 실행은 자동 승인 검토가 미확인 중지 범위를 이유로 거절했고 변경되지 않았다. 읽기 전용 대상/의존성 증명, 명시적 --check/--apply, 확인된 QA 소비자 정리를 거친 뒤 검증된6개에만 적용했다. 리뷰 중 운영 login POST도 read-only 범위 거절로 실행하지 않았고 격리 Nginx method/body 재현으로 대체했다. 현재 자동 승인 거절로 남은 작업은 없다.
- 최종 stage `/srv/moneyverse-data/tasks/frontend-consolidation-20261121-e45f57595415-r4`의 before/config/CI/runtime/Test/Production/independence receipts 및 archive를 유지한다. 정리 script 최종 `retire-v3.py` digest `386b3015ad26c0001316516579503961636c87088a9726567083e9c8dcf1851c`. 실패한 이전 proposal/attempt는 역사 증거로 보존한다.

## 롤백 조건
고정 source/JAR와 기존5Prod/1Test JAR를 모두 보존했다. 정리 후 과거 Nginx로 되돌릴 때에는 그 설정이 참조하는 이전 DB-free unit을 **먼저** 원래 상태로 시작하고 listener/identity/digest를 검증한 뒤, staged 정확한 inverse config를 inventory/CAS/lock·nginx-t·기준선 검사와 함께 복원한다. DB/잔액/원장 rollback은 이 UI 절차가 아니다. 단순히 과거 config만 복구하면 disabled old port로502가 나므로 금지한다.

## 작업 판단과 비용
- Ruling: reuse clean existing isolated MiniPC worktree; do not create nested or mutate shared main. Prior explicit design/implementation/release authorization and no-questions instruction apply to this continuation.
- Ruling: native plan helpers live on local Windows while source work must stay MiniPC; maintain the same per-plan ignored ledger/brief/results manually on the authorized host.
- Task1 cleanup5PASS/HTTP14+fullnginxinventoryunchanged; staticcoverage4RED→GREEN. Actual source inventory generated; live metadata QA pending. Ruling: implement independent Task2 composition next while Task1 live coverage remains in progress; its only consumer is Task4 retirement decisions, not Task2 code.
- Task3 probes/auth4RED→GREEN; tool-account7RED→GREEN. Full native93/0fail/0skip and full Spring test/bootJar SUCCESS (see XML receipt). Ruling: import unchanged pure native auth8 to consolidate the existing renderer, without new identity issuance or hold changes; cost if wrong is authentication page regression, covered by real HTTP isolation and retained backend authority. Source review pending.
- Task1 complete: static147 actual signed-in document observations (user108/admin39); dynamic33 fixture-required, actions unaccepted. Task2 complete source and Task3 complete source: native95/Spring605 all zero failures/skips, bootJar SUCCESS; independent Important source fix verified. PR3334 merged to e45f57595415 currentmain with four exact CI jobs44873490927SUCCESS. Task4 ops review4Important fixed in one pass; auth/method+preview HTTP, currentmain advancement and nonliteral consumer tests RED→GREEN; full ops14tests/gateway51casePASS. Ruling: preserve legacy login mutations through named4550 and keep other auth alias mutation hold403; only verified presentation GET/HEAD use new runtime. Cost if wrong is login regression; actual isolated Nginx preserves body/method. Ruling: retirement uses effective active unit/env/drop-in/referenced file, live process env/argv, schedules and established-socket inspection; uncertainty fails closed rather than proving arbitrary future programs never call a port. Cost if wrong is a missed future consumer; rollout-independent retained artifacts and exact prior-state rollback remain required. No production traffic switched yet.
- Ruling: 오래된 QA Nginx2개는 실제 구버전 소비자로 확인해 config/hash/loopback/no-established-connection/prod-master 구별 후 정리 — 공유 MCP 자체는 유지 — 잘못 판정하면 로컬 QA가 중단되므로 동일 config로 재기동 가능한 상태와 운영 전후 기준선을 보존.
- Ruling: kernel proc/sys 가상 파일은 deployment config 탐색에서 제외하되 live proc argv/env는 별도 전부 수집 — EINVAL을 무시하고 실제 config를 건너뛰지 않음 — 놓친 가상 데이터 기반 미래 소비자 위험은 모든 임의 프로그램 부재를 증명할 수 없다는 운영 한계로 남긴다.

독립 리뷰의 제외 영역은 source/ops를 서로 대체하지 않고 각 별도 검증으로 처리했다. 실제 DB/금융·메시지 mutation·두 실계정/동적fixture/다른 legacy UI·외부 인프라 전체는 미수용/OPEN이다. reviewer가 독립 재실행하지 않은 전체 suite는 해당 local 로그와 공식 CI를 근거로만 기재했다. 신규 Minor 유예0.

## 실행 원장 보존

```text
# SDD ledger — plan: docs/superpowers/plans/2026-11-21-frontend-feature-coverage-consolidation.md
Pre-flight: Task1 inventory determines Task4 retirement; Task2 exact allowed routes feed Task3 owner pages/probes and Task4 routing; Task3 asset digests feed Task4 immutable archive. Retained financial/API authority is unchanged across all tasks.
Ruling: reuse clean existing isolated MiniPC worktree; do not create nested or mutate shared main. Prior explicit design/implementation/release authorization and no-questions instruction apply to this continuation.
Ruling: native plan helpers live on local Windows while source work must stay MiniPC; maintain the same per-plan ignored ledger/brief/results manually on the authorized host.
Task1 start BASE7c0506f941. Early retirement only five already-observed unreferenced DB-free Test renderers; no full/backend/job inference from names.
Task1 preflight safely rejected before changes: two old Test listeners report IPv4-mapped IPv6 loopback [::ffff:127.0.0.1]. Corrected address parsing with ipaddress; no non-loopback relaxation. All5ports4780/4790/4806/4812/4816 are absent from actual nginx include snapshot; exact modes/dependents remain checked.
Task1 early stop verifier RED: old Java unit stops with exit143 but systemd records failed because old unit lacks SuccessExitStatus143; exact prior active/enabled state restored. Root cause verified from systemd Result/ExecMainStatus and stop journal. Record intentional143 before clearing only that retired unit failure marker; do not reset unrelated/prior failures. New consolidated units must declare SuccessExitStatus143.
Task1 cleanup5PASS/HTTP14+fullnginxinventoryunchanged; staticcoverage4RED→GREEN. Actual source inventory generated; live metadata QA pending. Ruling: implement independent Task2 composition next while Task1 live coverage remains in progress; its only consumer is Task4 retirement decisions, not Task2 code.
Task2 composition6RED→GREEN; Task3member5RED→GREEN+languageheader1RED→GREEN. Focused51/0failure, nativeNode86/0failure. Corrected identity test to derive expectation from packaged build-info (CI verified SHA can legitimately return200; localunverified503), not fixed local state. Staticinventory tests moved to native-* pattern so authoritative native CI executes them automatically. No source deployment yet.

Task3 probes/auth4RED→GREEN; tool-account7RED→GREEN. Full native93/0fail/0skip and full Spring test/bootJar SUCCESS (see XML receipt). Ruling: import unchanged pure native auth8 to consolidate the existing renderer, without new identity issuance or hold changes; cost if wrong is authentication page regression, covered by real HTTP isolation and retained backend authority. Source review pending.

Final source review: Important1 CSRF-empty identity loss; initial/fresh proof2tests RED→GREEN, full native95/95; full Spring rerun pending. Declined ops/assets→Task4 review, liveDB/mutations→retained OPEN boundaries, browser/locales→Test acceptance, lexical coverage→not runtime success; prior suite results not independently rerun by reviewer, explicit local receipts remain evidence.

Task1 complete: static147 actual signed-in document observations (user108/admin39); dynamic33 fixture-required, actions unaccepted. Task2 complete source and Task3 complete source: native95/Spring605 all zero failures/skips, bootJar SUCCESS; independent Important source fix verified. PR3334 merged to e45f57595415 currentmain with four exact CI jobs44873490927SUCCESS. Task4 ops review4Important fixed in one pass; auth/method+preview HTTP, currentmain advancement and nonliteral consumer tests RED→GREEN; full ops14tests/gateway51casePASS. Ruling: preserve legacy login mutations through named4550 and keep other auth alias mutation hold403; only verified presentation GET/HEAD use new runtime. Cost if wrong is login regression; actual isolated Nginx preserves body/method. Ruling: retirement uses effective active unit/env/drop-in/referenced file, live process env/argv, schedules and established-socket inspection; uncertainty fails closed rather than proving arbitrary future programs never call a port. Cost if wrong is a missed future consumer; rollout-independent retained artifacts and exact prior-state rollback remain required. No production traffic switched yet.

Task4 complete (2026-11-21 15:55 KST): exact-main e45 source CI4SUCCESS, artifact e11eb... verified. Test260UI/Prod26 with Test inactive; actual calculator/search/locale/drawer/focus/source sums. Post-retirement actual static147 observations: user78 error/admin1; fixture33 and mutations OPEN. Archive23paths/30byteversions; old native11 and QA nginx2 retired, retained backend/DB/workers/MCP; final runtime proof proves both new units active/enabled and all11old inactive/notenabled. Operational review fixed4Important in one pass with14tests+51gateway cases; actual preflight caught dashmount/virtualkernelread and two true old QA consumers before any unit stop. Additional readonly RED→GREEN guards and pidfd QA cleanup leave no auto-review blocker. Source review fixed1Important RED→GREEN/full95+605. No new minor deferred. Ruling: process metadata and effective configs are bounded operational evidence, not proof about arbitrary future programs; retained artifacts and exact prior-state rollback address residual risk. Evidence PR integration pending.
```
