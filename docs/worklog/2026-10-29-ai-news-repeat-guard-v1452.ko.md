# v2026.10.29.1452 AI 가상주식 뉴스 반복 차단 작업기록

## 0. 작업 시작 (2026-10-29 KST)
- 사용자 지시: 치무전자 뉴스 반복 해결, 서비스 지속·원장/기존 가격 데이터 불변.
- 기준 main: `b84d645a87e8fa0d544ca3ee17e785e737e477ea` (조회 완료). 기존 checkout의 타 개발자 변경은 유지하고 별도 branch/worktree에서만 작업.
- 표준 문서 우선 확인: `docs/planning/PROJECT_PLAN.ko.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`, `docs/planning/F675_02_AI_NEWS_USER_TRUST_RECOVERY_SPEC.ko.md`; 선행 진단 이슈 #1848.
- 운영 및 DB 읽기 확인: active 13건 중 치무전자 11건, 누적 204 중 143건, 제목 138회 동일. hourly 스케줄러 및 LLM fallback 레이블 오기록 확인.
- 변경 범위: 자동 뉴스 경로의 중복·최근 종목 쿨다운·모델 라벨·회귀시험. 금융 원장/시장 가격 수동 보정 없음.

## 1. 중간 기록 (2026-10-29 14:38 KST)
- TDD RED 4/55 실패 확인 후 GREEN 55/55, 후속 테스트 RED 3건·GREEN 59/59 확인. 추가 24개 창/5개 종목 순환 회귀 작성.
- 변경: 모델 오류 시 실제 fallback label 사용, 고정 fallback에서 상위 5개 기업 후보 생성, 기존 등록 기업·강도 제한 유지, 최근 7일 동명 헤드라인 및 24시간 종목 중복 거부, 후보 중 최근 7일 기사가 가장 적은 기업 우선, 이력 조회 실패 시 발행 중단.
- 동일 기사/기업 그룹의 자동 발행 멱등 UUID를 제목·효과 종목으로 유도. 기존 DB의 advisory transaction lock/UNIQUE idempotency를 재사용하므로 별도 SQL migration·신규 원장 쓰기 없음. 중복 초안은 남을 수 있지만 동일 가격 이벤트 재적용은 방지.
- 백엔드 1,961 PASS, 440 SKIP, 실패 0; 해당 소스 TypeScript 체크/빌드/ESLint PASS. 운영 DB app role 기존 200개 이벤트 읽기 함수 SELECT 성공; 실거래나 금융 DML 없음.
- main 재확인 (원격 main b84d645a8): 병합/작업 충돌 없음. 운영 exact-SHA 테스트 및 별도 환경 체크 지속.

## 2. 운영 배포 중간 점검 — 2026-10-29 15:18~15:22 KST
- main `a6284ef43810a7b310dc23565876fd02567fa918`에 #1849 병합 및 CI PASS. 이후 다른 개발자의 SWF/중앙은행 v1502 코드가 main으로 통합·승격되어 `origin/main=95a8fdb85...`(기록 전 재확인). 버전 다운그레이드 금지.
- 실제 운영 Nginx/백엔드 `c2129625aa6629c616fb31ce790950618b8d92b2`는 뉴스 수정 `990be7310`의 자손. 운영 빌드 JS에 `recentAutoMarketHistory`와 `no_novel_candidate`가 있음. v1502 전체 운영/공식 Test 기록은 동시 작업 문서 `2026-10-29-v1502-operational-promotion` 참조.
- 그러나 구형 `moneyverse-backend.service` 3000이 `prod-v2026.10.22.toss-redesign` 경로에서 scheduler=true/news_auto=true로 뉴스 잡을 실행함을 실측. 최신 운영 public backend 3564는 scheduler=false. 이로 인해 코드 수정만 배포되어도 실제 뉴스 중복 생성이 지속될 수 있었음.
- 전용 생산 코드 리허설: v1502 코드 + 기존 리더 환경에서 독립 port 3574, scheduler OFF, news_auto OFF; health 200, 정확 SHA, 뉴스 API 200, 관리자 무인증 401, 정상 부팅 확인. 원격 Test에서 v1452 백엔드 3498 (격리 DB) health 200/SHA 990be731 검증. 임시 프로세스는 종료함.

## 3. 작업 종료 — 2026-10-29 15:23 KST
- 기존 `moneyverse-backend.service` 전체 unit/drop-in 설정을 두 번째 디스크 비공개 디렉터리에 백업한 뒤 새 `zzzz-v1452-news-scheduler.conf`를 추가하여 **실행 경로만 현재 운영 v1502 불변 백엔드로 교체**. `systemctl daemon-reload` 뒤 구형 리더만 restart; 공개 v1502 backend/frontend 및 Nginx 구성은 변경하지 않음.
- 새 리더 PID 444173 / 실제 cwd `/srv/moneyverse-data/releases/prod-v2026.10.29.1502-c2129625a/backend` / PORT 3000 / MONEYVERSE_SCHEDULER_ENABLED=true / AI_NEWS_AUTO_ENABLED=true / BUILD_ID c2129625. 시스템 로그에 `schedule started`, market ticker running, Nest 부팅 완료, 서비스 ACTIVE.
- 운영 리더 `/health` 200, `/api/version` c2129625, 공개 `/health` 200, 공개 `/api/version` 동일. `/`, `/newspaper`, `/stocks`, `/status`, 시장뉴스 API(리더 및 공개 API) 모두 HTTP 200. API 관리자 비인증 401. 원장·가격·스키마·DB 쓰기 권한·기존 뉴스 데이터 직접 변경 없음.
- 현재 활성 뉴스는 과거의 미만료 이벤트 13건(치무전자 12건)이 포함되어 있으므로 **기존 뉴스가 즉시 사라진다고 주장하지 않음**. 새 스케줄러의 다음 정규 시각 실행 후 새 동일 제목/종목 이벤트가 생성되지 않았는지 장기 관찰 필요. 이번 시점 검증은 코드/설정/부팅/공개 응답 및 안전 테스트이며 주기 경과 후 통계는 아직 미검증.
- GitHub 기록: 원인 #1848, 코드 PR #1849, 별도 운영완료 문서 PR(후속). 현재 main에 다른 작업자의 v1502가 존재하므로 기존 운영 코드를 v1452 아티팩트로 되돌려 교체하지 않고 이미 검증된 c2129625를 재사용함.
- 롤백: `/etc/systemd/system/moneyverse-backend.service.d/zzzz-v1452-news-scheduler.conf` 제거, `systemctl daemon-reload`, 기존 리더 restart; 백업 `/srv/moneyverse-data/tasks/v1452-news-scheduler-systemd-backup-20261029-1522`에 보존. **구형 코드 롤백은 뉴스 중복 원인을 재도입할 수 있으므로 운영 심각 장애 시에만** 실행.
- 미검증: 실제 사용자 쿠키 재사용, 정규 스케줄 1회 이상 결과로 신규 뉴스 중복 0 확증, 누적 7일/24시간 분포 정상화(대기). 현장 기록 `/srv/moneyverse-data/tasks/v2026.10.29.1452-news-scheduler-production-rollout.ko.md`.
