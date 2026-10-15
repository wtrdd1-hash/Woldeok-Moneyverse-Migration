# F675-02 — AI 가상주식 뉴스 신선도·사용자 신뢰·안전한 장애 복구 상세 기획

> **v2026.10.15.679** · **PLANNING / AUTHORITY_DRIFT / 운영승격 BLOCKED** · 2026-10-15 KST
>
> 영문 기준: [F675-02 AI News](F675_02_AI_NEWS_USER_TRUST_RECOVERY_SPEC.md)
> 문서 우선순위: [PROJECT_PLAN](PROJECT_PLAN.ko.md) → [통합기획 마스터](INTEGRATED_PLANNING_MASTER.ko.md) → [v675 기능 포트폴리오](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.ko.md) → [v325 AI 신문](AI_SCENARIO_USER_NEWSPAPER_SPEC.ko.md) → [v677 기능 실재성](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.ko.md).
> 최초 `origin/main=b70cedbce34ad43bffe593ffbd1ac8374edb5ffa`; 중간·최종 SHA는 [작업기록](../worklog/2026-10-15-f67502-ai-news-user-trust-v679.ko.md).
>
> **기존 정책 유지:** 머니버스는 현금화 불가한 WLD 기반 가상 주식경제이며 현실 증권이나 실제 투자뉴스가 아니다. v261/v325 AI 뉴스 영향 제한, v523/542/543 원장·시장 보존법칙, v530 전체 UI 검증 차단, v487 광고만 허용하는 현금수익화 유지. 기능 스위치 활성화나 백엔드 프로세스 실행만으로 정상 발행이라 판정하지 않는다.

## 1. 사용자 관점의 제품 목표

**사용자 약속:** “뉴스가 현실 투자기사가 아니라 머니버스 가상시장 이야기임을 알고, 언제 실제로 발행됐는지, 설명하는 주식 이벤트가 아직 유효한지, AI 작성/검수/수정/철회 상태를 확인할 수 있다. AI가 실패하면 오래된 기사를 새 기사처럼 보여주지 않는다.”

**AI 기사 생성 → 검수·정책 승인 → 실제 발행 → 가상 주가 이벤트 실행**을 네 단계로 완전히 분리한다. AI는 시나리오 초안을 만든다. 실제 주가 결정 권한, 국고 WLD 발행, 현실 투자 조언이나 허가되지 않은 증권 정보를 갖지 않는다.

포함: 자동 생성 장애/뉴스 신선도, 기사 보존, 가상 주식 이벤트 연결, 모바일 신문 UX, 관리자 진단/복구, 멱등성·검수/철회, 신뢰도와 SEO. 제외: 실세계 증시 뉴스 무단 크롤링, 현실 투자 추천, 키워드용 대량 기사, 유료 AI 뉴스, SSRF 보안 전역 해제, 운영서버에서 자동 발행 임의 활성화, 별도 F675-09 전체 편집관리 시스템과의 기능 중복.

## 2. 코드 및 기존 감사 대조 — 확인 범위 명시

| ID / 긴급도 | 특정 소스·검사 시점의 근거 | 사용자 위험과 해결 계약 |
|---|---|---|
| **N679-01 P0** | 2026-10-15 약 11시 KST **과거 v660 운영 읽기 전용 감사**에서 `stock.ai_scenario_auto` 실패 누적 131건, 마지막 AI 배치/이벤트 10월 11일 17:26 KST. Ollama `/v1/models`는 응답했으나 일반 `safeFetch`의 SSRF 방어가 내부 모델 요청을 거절 | 서버는 켜져 있어도 뉴스는 멈출 수 있음. 내부 모델 전용 연결을 엄격하게 설계 후 분리된 Test에서 실제 생성→검수→발행→조회 증명. 해당 과거 건수를 지금 운영 상태로 단정하지 않음 |
| **N679-02 P0** | 최신 검토 SHA `backend/src/admin/ai-news.service.ts`는 일반 `safeFetch` 참조. 스케줄러는 `AI_NEWS_AUTO_ENABLED` 및 actor 확인 후 `autoGenerateAndPublish` 호출 | SSRF 전체 예외 금지. `skipped`/연결 실패를 ‘발행 성공’으로 집계 금지 |
| **N679-03 P1** | `backend/src/stock/newspaper.controller.ts` `GET pulse`가 고정 시장심리 68, 이벤트 4개, 예시 헤드라인과 `updatedAt=new Date()`를 함께 반환 | 실제 측정치처럼 보이는 허위 실시간 표기. 검증 가능한 집계로 교체하거나 **예시** 고지, 근거 없으면 `UNKNOWN` |
| **N679-04 P1** | `GET weekly-brief`에서 일부 DB 집계와 숫자 하한/고정 거래량·등락률·순위·설명이 혼재. 큰 WLD와 연관된 합계에 `Number` 변환 존재 | 실측, 가상 시뮬레이션 예시, 미확인을 명확히 분리. 정수 문자열/BigInt 경계 유지, 근거 없는 랭킹·“유동성이 건전” 문구 금지 |
| **N679-05 P1** | `GET poll`은 인메모리 투표수, 초기값과 인스턴스별 변동값 | 공정·영속적 투표로 과장 금지. 예시 투표임을 표시하거나 권한·중복투표/스팸방지·DB 영속화 별도 승인 |
| **N679-06 P1** | `frontend/src/app/newspaper/page.tsx`는 현재 `/stocks/market-events`와 주식 데이터 조회. 제목/메타에 ‘실시간’. 현재 진행 이벤트 피드만으로 지난 기사 보존이 입증되지 않음 | **기사 아카이브와 진행 중 시장 이벤트를 별도 목록으로**. 효과 만료 후에도 공개 이력은 해당 상태로 열람 |
| **N679-07 P1** | 기존 v325 기획이 이미 AI/게임 전용 고지, 발행시각/검수, 수정·철회, 사람 승인, 기간·영향 제한, 대량 생성 SEO 금지를 정의 | 같은 기능 재설계가 아니라 **기존 명세 구현완성 및 사실성 복구** 우선 |
| **N679-08 P0** | 별도 `fix/stock-ai-news-local-transport-v2026.10.15.661` 워크트리가 존재하나 검토한 `origin/main`에 병합된 것으로 확인되지 않음 | 기존 수정 후보와 충돌하지 않게 구현 시 별도 검토·차이 반영. 이번 문서 작업에서 해결/배포 완료로 판정하지 않음 |

증거 구분: `SOURCE_OBSERVED` 최신 코드, `HISTORICAL_RUNTIME_OBSERVED` v660 당시 운영 감사, `CANDIDATE_ONLY` v661 작업 브랜치, `HYPOTHESIS` 사용자 가설, `TEST_VERIFIED/PRODUCTION_VERIFIED`는 별도 동일 소스 SHA 수용 검증 후에만 사용.

## 3. 실제 이용자 시나리오 — 조사 전 가설

**실제 이용자 인터뷰·설문·A/B 실험은 아직 하지 않았다.** 아래는 관찰·검증할 과제다.

| 이용자·할 일 | 이용자 질문 | 막아야 할 경험 | 사용성 검증 |
|---|---|---|---|
| 검색/공유링크로 온 비회원 | “이건 실제 기업 뉴스인가, 게임 세계 이야기인가?” | 실제 언론사처럼 보이는 헤드라인/AI 고지 부재 | 첫 화면에서 가상기업·AI 발행·원본 발행일 인지 |
| 모바일 신규 회원 | “어떤 가상 종목이 영향을 받고 얼마나 지속되나?” | 어려운 용어, 작은 터치요소, 상승 보장 암시 | 기사→영향 범위·종료시간→해당 가상종목 돌아가기 |
| 기존 주식 플레이어 | “이 뉴스는 지금도 시세에 영향이 있나?” | 종료 뉴스에 ‘실시간’ 배지 | 발행/효력 시작·종료시간과 현재 가상 호가 비교 |
| 며칠 만에 다시 온 사람 | “소식이 안 뜨는데 서비스가 멈춘 것인가?” | 오래된 기사에 화면 렌더링 현재시각 표기 | 마지막 실제 발행시각/지연 공지/과거기사 보기 |
| 저속망·스크린리더 사용자 | “본문을 읽고 장애 후 다시 돌아갈 수 있나?” | 반복 로딩·색깔 화살표만 전달 | 키보드/화면읽기/저속망 대체 경로 |
| 운영관리자 | “자동 뉴스가 왜 실패했고 중복 급등락 없이 복구할 수 있나?” | skip을 success로 집계, 내부망 SSRF 무력화, 반복 발행 | 실패 단계·보안 차단 이유·안전한 격리 재처리 |
| 수정된 기사를 읽는 이용자 | “예전 제목이 왜 바뀌었나? 무엇을 수정했나?” | 기사 몰래 수정/공유 링크 단절 | 수정 시각·이유·공개 변경이력과 원문 참조 |

이용동기·정보이해·오류 회복 중심의 선택적 소규모 탐색조사(대표적 과제군마다 가능하면 3~5명), 한국어/영어, 기존/신규 이용자, 모바일·보조기술 그룹을 대상으로 설계한다. 이는 모집단 대표 표본이나 통계적 개선 증거가 아니다. 비밀번호·개인 계좌·잔액은 수집하지 않는다. 조사 전 신뢰도, 유지율, 신규 가입 및 기사 조회수는 `UNKNOWN`.

## 4. 사용자에게 보일 신문/기사 화면

**기존 `/newspaper` 유지.** SEO 때문에 동일한 신문을 `/news`로 중복 구현하지 않는다.

1. **첫 화면 머리:** “머니버스 가상시장 뉴스 · AI 생성 및 운영 검수” / “Moneyverse Fictional-Market News · AI-assisted, reviewed”. 첫 기사보다 위에 명시하여 현실 뉴스와 혼동되지 않게 한다.
2. **신선도 안내:** `lastPublishedAt`와 발행·정상/지연/미확인 상태. 관리자용 ‘모델 호출 성공 시각’과 사용자용 ‘실제 발행 시각’은 구분한다.
3. **대표 기사:** 실제 발행한 기사만, 가상 회사명, 이해하기 쉬운 요약, `publishedAt`, AI/편집 표기, 시장 이벤트 `ACTIVE/ENDED/NO_MARKET_EFFECT` 표시. 페이지 조회시각으로 기사 최신성을 만들지 않는다.
4. **진행중인 영향/최근 기사/지난 기사** 세 목록 분리. 유효한 시장 이벤트가 없다고 과거 기사까지 빈 화면이 되지 않도록 페이지네이션과 보존 기간 설계.
5. **기사 상세:** 발행일/실제 수정일, 가상 회사/종목, AI·편집자 표기, 시나리오 기반 설명, 기간·효과, 정정/철회 이력, 관련 가상 종목, 현실 투자 아님 고지. 관련 실제 시세는 가상 종목 페이지의 권위 있는 값으로 확인한다.
6. **건전한 다음 행동:** “현재 게임 내 호가 보기”, “이벤트 원리 이해하기”, “지난 기사 읽기”. ‘지금 사야 한다’ 또는 강제 가입·출석·놓치면 손해 식 조급한 유도 금지.
7. **오류/빈상태:** 모델 장애여도 검증된 지난 기사는 열람 가능; 가짜 심리지수/거래량을 생성하지 않음. 읽기 GET만 안전하게 재시도.
8. **사용자용 다섯 신선도 상태:** `CURRENT` 실제 측정된 주기 내, `QUIET_MARKET` 생성 정상이나 발행 적격 기사 없음, `STALE` 기대 주기 지남, `UNAVAILABLE` 검증된 장애, `UNKNOWN` 실측/버전/시간 증거 없음. 새 기사가 없다고 주식 거래 전체가 정상·장애라고 단정하지 않는다.

### 한국어·영어 안내 문구

| 상황 | 한국어 | English |
|---|---|---|
| 콘텐츠 정체성 | AI가 생성하고 검수한 머니버스 가상시장 소식입니다. 실제 기업이나 투자 뉴스가 아닙니다. | AI-assisted news about Moneyverse's fictional market, not real companies or investment news. |
| 유효한 이벤트 | 이 가상시장 이벤트는 표시된 종료 시각까지 적용될 수 있습니다. 실제 시세는 종목 화면에서 확인하세요. | This fictional event may apply until the shown end time. Check the current in-game quote on its stock page. |
| 종료 | 이 이벤트는 종료되었습니다. 기사는 기록으로 남아 있습니다. | This event has ended; the article is kept as history. |
| 자동화 장애 | 최근 자동 생성이 지연되고 있습니다. 마지막 실제 발행 시각을 확인하고 이전 기사를 읽을 수 있습니다. | Automatic updates are delayed. See the last actual publication date or browse earlier stories. |
| 새 기사 없음 | 현재 발행된 새 기사는 없습니다. 이는 시장 거래 정상 여부를 뜻하지 않습니다. | No new story has been published. This does not confirm trading health. |
| 정정 | 이 기사는 수정되었습니다. 변경 이유와 시각을 확인하세요. | This story was corrected. See what changed and when. |
| 철회 | 이 기사는 철회되었습니다. 공유 링크는 정정 안내로 연결됩니다. | This story was retracted. The shared link now explains why. |
| 확인 불가 | 현재 새 소식의 발행 상태를 확인할 수 없습니다. | We can't confirm the latest publication status right now. |

## 5. 발행 시각·상태의 권한 모델

서로 다른 시각을 보존한다: `contextObservedAt` 가상시장 입력 자료 시각, `generatedAt` 모델 응답 완료, `reviewedAt` 검수, `publishedAt` 공개 영속 저장 시점, `eventStartsAt/eventEndsAt` 실제 가상시장 이벤트 효력. `lastSuccessfulModelCallAt`와 `lastPublishedAt`은 다르다. `dateModified`는 기사 본문에 의미 있는 정정/수정이 발생했을 때만 바꾸며 화면을 열거나 캐시가 갱신됐다는 이유로 변경 금지. DB는 UTC 절대시각, 화면은 현지 시차와 명시적 시간대 사용. 클라이언트·서버 시간 불일치 테스트.

**생성 작업:** `SCHEDULED → CLAIMED → MODEL_REQUESTED → GENERATED → VALIDATING → ELIGIBLE | REJECTED | FAILED | SKIPPED`. 재시도 대기 `RETRY_WAIT`, 인적 검토 필요 `REVIEW_REQUIRED`. 스케줄러의 succeeded는 단순 skip일 수 있어 **실제 발행 성공으로 취급 금지**.

**검수·발행:** `DRAFT → POLICY_REVIEWED → APPROVED → PUBLISHED → CORRECTED | RETRACTED`; 부적합은 `REJECTED`. 정정은 원문/새 버전·이유를 영속 보관하고 철회는 설명 및 감사 흔적을 지우지 않는다.

**주가 이벤트:** `NO_EVENT | SCHEDULED | ACTIVE | ENDED | CANCELLED | FAILED`. 게임 경제의 결정적 시장 함수가 가격 결정 권한을 갖는다. 기사 공개가 됐더라도 이벤트 등록/승인이 실패하면 주가 영향이 적용됐다고 주장하지 않는다.

**신선도 규칙 후보:** 발행 시각만 보는 것이 아니라 **마지막 발행 완료/마지막 실제 생성시도/스케줄 간격/유예시간**을 함께 본다. 1시간 스케줄을 돌린다고 매시간 새 기사를 보장하지 않으며, 쿨다운·정책 거절·중복 제외로 정상적으로 기사가 0개일 수 있다. 가용성·SHA·관측 증거 없으면 `UNKNOWN`, 정상 `CURRENT` 불가. 보관 기사 시각은 절대 새로고침하지 않는다.

## 6. 서버·DB·모델 연결 및 안전한 발행 아키텍처

기존 `AiNewsRepository` 배치/시나리오, 가상주식 시장 이벤트, 스케줄러 실행 이력, 관리자 콘솔을 재사용하고 v325의 **발행 프로젝션**이 실제 없는 범위에서만 추가한다. 기존 ID와 DB 결산을 유지하며 AI 기사 DB가 주가 결정의 두 번째 원천이 되지 않도록 한다.

기사 레코드 최소 항목:
- `storyId,slug,locale,headline,summary,body`, AI/가상뉴스 고지;
- `generationRunId,batchId,scenarioId,eventId?`, 소스 맥락 해시, 프롬프트·모델·편집정책 버전, 콘텐츠 체크섬, 검수 거절/승인 코드;
- `contextObservedAt,generatedAt,reviewedAt?,publishedAt?,lastSubstantiveModifiedAt?,eventStartsAt?,eventEndsAt?`;
- `generationState,publicationState,effectState,failureReasonCode?,retryAfter?,correctionOf?,revisionId`, 실행 SHA, 담당자;
- 종목은 등록된 가상기업 화이트리스트만, 개인정보 제거된 감사 식별자.

**원자성/중복 방지:** AI 결과는 제한된 초안에만 기록→정책·인적 검수→하나의 DB 트랜잭션에서 actor·스위치·종목·쿨다운 검증 및 발행 의도와 이벤트 연결/Outbox 영속화→기존 승인된 이벤트 실행기에서만 주가 영향 적용. 스케줄 윈도우+맥락+시나리오 해시로 멱등성, 발행버전/이벤트 적용 고유 제약, 작업자 중복소비 방지. 장애 재실행도 같은 기사·같은 이벤트로 귀결되어 가상 시세 충격을 중복 적용할 수 없어야 한다. 메모리 타이머만으로 완료 보장 금지. 기존 경제 원장 원칙 준수, 잔액 UPDATE 및 신규 WLD 발행 금지.

**v325 기존 자동발행 한계 그대로:** 시장 전체 자동 쇼크 불가, 강도 3 자동 발행 불가, 자동 기사당 영향 종목 최대 2개, 자동 영향 최대 24시간, 등록 기업/승인된 actor/감사/중복·과도 노출 제한. 강도 3·전체시장·24시간 초과·현실 오해 가능·법률 민감·출처불확실·서사 충돌은 사람 검수 후에도 경제 정책의 별도 금지규칙을 우회하지 못한다. 관리자는 기존 재인증/CSRF/감사를 유지한다.

**AI 모델 전용 안전 연결:** 일반 `safeFetch`의 SSRF 방어는 유지한다. **배포 담당자가 사전 지정한 단일 내부 모델 host/port/path만 연결하는 전용 클라이언트**를 별도 구현할 것을 명세한다. 사용자 URL·임의 DNS·클라우드 메타데이터·리다이렉트·전체 내부망 허용 금지. 네트워크 격리·요청크기·모델 토큰·시간 제한 및 자격증명 보안. 테스트에 `127.0.0.2` 등 다른 루프백, 내부망, IPv6, 메타데이터 서버, 리다이렉트를 포함. 기존 v661 분리 브랜치는 아직 배포된 정답이 아닌 **검토 대상 후보**다.

**작업자 복구:** 작업 ID와 배치 잠금·최대 동시처리수·지수형 지연+무작위 지터·재시도 상한·서킷 브레이커·무효 모델 출력 격리·요금 및 자원 예산. 전송 거절·연결 실패·시간초과·모델 출력 오류·콘텐츠 검수 거절·중복/쿨다운 skip·DB 실패·이벤트 적용 실패를 별도 상태로 기록한다. 수동 재처리는 **발행되지 않은 것을 증명한 요청에만**, 권한·중복방지·승인·감사를 거쳐 실행한다.

## 7. API·프론트엔드 계약 (후보, 실제 구현 주장 금지)

**공개 API:**
- 기존 `GET /api/v1/newspaper/weekly-brief` 및 `/pulse`는 `dataKind: MEASURED | SIMULATED_ILLUSTRATION | UNAVAILABLE`, `observedAt`, 출처를 추가. 기존 소비자와 하위 호환·점진적 API 폐기 기획, 숫자 68/4를 실측 데이터처럼 반환하는 구조는 해소.
- `GET /api/v1/newspaper/edition?cursor&locale`: 실제 발행시각, 신선도, 공개기사, 진행중 이벤트 별도 목록, 페이지네이션.
- `GET /api/v1/newspaper/stories/:slug`, `GET /api/v1/newspaper/archive?cursor&symbol`: 승인된 기사·아카이브/공개 정정. 철회 기사 공유 URL은 왜 철회됐는지 설명을 보여주고 임의 삭제로 감사 이력을 숨기지 않는다.
- `GET /api/v1/newspaper/stories/:slug/history`: 공개 가능한 정정·시각·변경 이유만. 비공개 프롬프트나 관리자 메모/키 노출 금지.
- 개인화 뉴스/푸시 알림은 별도 수신 동의·개인정보·빈도 제한이 승인된 후; 이번 F675-02에서 자동 활성화하지 않는다.

**관리자 API·콘솔:**
- 현재 `/api/v1/admin/ai-news/batches/latest` 및 설정/모델/스케줄 관리에 **단계별 실제 이력**, 마지막 ‘skip 아닌’ 생성 성공, 마지막 실제 발행, 검토/반려 건수, 실행 SHA, 오류 분류·이벤트 연결 결과 추가.
- 후보 `GET /api/v1/admin/ai-news/runs?cursor&status`, `GET /api/v1/admin/ai-news/publications/:id`. 수정·정정·재처리는 별도 인증된 POST와 스텝업·CSRF·멱등키·감사 필요. GET이 원장이나 뉴스 상태를 바꾸면 안 된다.
- 공개 페이지에는 모델 원문 프롬프트·API 키·내부주소·개인정보·관리자 감사 내용을 노출하지 않는다. URL 소유권/권한/페이지 크기/에러모델/율 제한·보존기간 계약 필수.

**응답 예시:** 영문 명세의 JSON은 과거 감사 시점을 설명하기 위한 **가상 샘플**이다. `feedFreshness: STALE`, `lastPublishedAt`과 `lastConfirmedAttemptAt`, `latestRunOutcome: FAILED`, `activeEvents: []`, `stories[]`, `sourceReliability: HISTORICAL_EXAMPLE`을 분리한다. 실서버 응답이 그와 같다고 단정하지 않는다.

## 8. 실제 사용자 신뢰도·성과 검증

민감정보가 없는 `ai_news_attempt_total{outcome}`, `ai_news_model_error_total{category}`, `ai_news_review_total{decision}`, `ai_news_publish_total`, `ai_news_duplicate_suppressed_total`, `ai_news_event_link_consistency`, **실제 발행/모델성공까지 경과시간**, `ai_news_public_archive_views`, `news_to_fictional_stock_learning_click`, `correction_open_rate`, `fiction_confusion_reports` 계측. 0건 표본 = `UNKNOWN`이지 성공률 100%가 아님. 사용자 ID·프롬프트·원장 잔액·종목별 개인 보유량을 메트릭 라벨과 생성 프롬프트에 넣지 않는다.

검증할 사용자 가설: 첫 기사에서 AI/게임 정체성을 바로 알아볼 수 있음, 며칠 지난 기사라도 정직한 발행일과 보관함이 유용함, 변경이력 제공이 혼동 감소에 도움, ‘가상 종목·원리 이해’ 이어보기는 단순 조회수보다 사용자 가치가 큼. 모든 UX 실험군에서 AI·게임 고지를 유지한다. 인터뷰/실사용 성과는 아직 `UNKNOWN`.

## 9. SEO·다국어·언론 윤리/준법

- `/newspaper`를 공개 허브로 유지하고 공개 가능한 충분한 내용의 기사만 고유 URL 제공. 자동생성 저품질/중복/미검수/정정 철회/샘플 숫자 기사 기본 `noindex`. 가상기업×시간×방향별 키워드 페이지 자동생성 금지.
- 실제 표시되는 `datePublished/dateModified`, 편집자/발행자, 시간대, 수정이력과 JSON-LD를 일치. 새로고침/웹 빌드때 `dateModified` 수정 금지. 허구 시나리오에 부적합한 `NewsArticle` 스키마/Google News 등재 주장 금지; 필요하면 검증된 `Article/CreativeWork`만 사용.
- 영어/한국어 검수된 문서 우선, 다른 번역은 실제 품질검사 후 공개. 진짜 등가 내용만 hreflang, 수동 언어 선택과 타임존 제공.
- 실제 회사/인물·무단 복제 외부 뉴스·생성 가짜 현실 사진 금지. AI 표시와 가상게임 고지는 기사 목록·본문·공유 미리보기에도 유지. 대한민국 AI법/등급/개인정보 법규 적용은 최신 전문가 검토 후 별도 수용하며 법률 적합성 완료 선언 금지.
- 광고는 승인된 공개 콘텐츠에서만, 허위 스폰서 기사 혼동·무효 트래픽/보상형 광고 유도 금지. 유료 기사·투자 추천·제휴 금융 판매 금지.

## 10. 개발 단계와 필수 통과 조건

| 단계 | 결과 | 반드시 실패 테스트로 증명할 것 |
|---|---|---|
| **D0** 현재 소스/실제 장애 진단 | v660/v661 차이·현재 Test/운영 SHA·경로·상태표 | 과거 실패수치를 최신으로 오인하지 않음, 읽기 전용 |
| **D1** 보안 모델 연결 | 내부 전용 클라이언트 + 모델 통신 보안 테스트 | 승인 주소만 허용, 내부망 전체/메타데이터/우회 리다이렉트 차단, 무효 출력 차단 |
| **D2** 스케줄러/영속 상태 | 멱등성 실행 기록·재시도·잠금·Outbox | 충돌/재시작/중복 실행에도 기사·가격 이벤트 중복 0, skip ≠ publish |
| **D3** 발행/시장 연결 | 기존 v325 검수·발행·만료·정정/철회 | 가상 종목 허용목록, 강도·기간·전체시장 자동 금지 |
| **D4** 사용자 신문 | 기존 /newspaper의 대표기사/유효이벤트/보관/본문·고지·신선도 | 가짜 최신시간 0, 종료 기사 보존, 한국어·영어·모바일·보조기술 |
| **D5** 운영관제 | 관리자 기존 AI 뉴스 콘솔의 실패 단계·실제 성공/발행 지표 | 일반 사용자 접근 차단, 스텝업·CSRF·비밀정보 비노출 |
| **D6** 품질/SEO | 출처 진실성, AI/허구 고지, 캐노니컬, 정정 이력, 개인정보 | 대량 저품질 뉴스 색인 금지, 출처 없는 데이터 금지 |
| **D7** 출시 안전 | 코드·DB·모델·시장 이벤트 통합테스트, 정확한 SHA 격리 Test 및 전체 UI 5회, 세션·롤백 | **기존 v530 UI 차단, DB·원장 권한, Test/운영 SHA 불일치 미해결이면 HOLD** |

필수 케이스: 모델 접근 실패/로컬 모델에 키 없음/SSRF 차단·허용 전용 통신/리다이렉트·메타데이터, JSON 무효, 악성 프롬프트·현실회사/사람 포함·무단 저작물, 동일 맥락 반복 생성, 큰 WLD, 시간대/날짜 경계, 정상 생성됐으나 적격 기사 0개, 이벤트 만료, 뒤늦은 정정/공유 철회 URL, DB 커밋 후 응답 유실, 크론+수동 동시작동, 테스트 재시작, 일반 사용자 관리자 접근, 320·360·390·430px/200·400% 확대, 키보드·스크린리더, 정보 누락/빈 화면/메타 불일치.

**수용 목표(예측 수치 아님):** 허위 실시간 시각 0, 승인 범위 외 자동 주가 이벤트 0, 중복 이벤트 적용 0, 공개 기사에 게임/AI 고지·이력 연결 100%, 정정·철회에 수정 이력 유지 100%, API 프롬프트·개인정보·키 유출 0, 근거 부족 시 상태 `UNKNOWN` 고지, 동일 SHA Test에서 실제 생성→승인 이벤트→발행→사용자 열람까지 증명. 트래픽과 매출 상승률은 측정 전까지 정하지 않는다.

**이번 v679는 기획·문서 작업 전용**이며 AI 모델 실행·실제 발행·DB 변경·Test/운영승격 또는 기존 P0 해결은 하지 않는다.

## 11. 2026-10-15 확인한 외부 1차·실무 레퍼런스

| ID | 출처 | 적용 |
|---|---|---|
| R679-01 | [Reuters Institute 2026 한국](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026/south-korea) | 한국 독자의 뉴스 신뢰·AI 표기 맥락; 머니버스 이용자 조사 아님 |
| R679-02 | [Reuters Institute 2026 주요 조사](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026/dnr-executive-summary) | 모바일/플랫폼/출처검증 중심 뉴스 이용, 클릭 유도 과장 금지 |
| R679-03 | [Google News 투명성 정책](https://support.google.com/news/publisher-center/answer/6204050) | 발행인·저자·날짜 정보 |
| R679-04 | [Google News 기사 가이드](https://support.google.com/news/publisher-center/answer/9607104?hl=en) | 실제 발행/수정일, 인위적인 최신화 금지 |
| R679-05 | [Google 생성형 AI 콘텐츠](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) | 독창적 효용/검증 대 저품질 대량 생성 |
| R679-06 | [Google Article 데이터](https://developers.google.com/search/docs/appearance/structured-data/article) | 진짜 datePublished/dateModified/저자 표시 |
| R679-07 | [AP 2026 AI 편집 가이드](https://www.ap.org/the-definitive-source/announcements/ap-updates-newsroom-standards-for-artificial-intelligence/) | AI 생성은 편집·검증을 대신할 수 없음. 허구 게임을 언론으로 오인시키지 않음 |
| R679-08 | [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) | 생성 오류·이력·검토·모니터링 |
| R679-09 | [OWASP SSRF 방어](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) | 승인된 단일 내부 모델 경계 및 부정 테스트 |
| R679-10 | [OpenTelemetry 이벤트 규약](https://opentelemetry.io/docs/specs/semconv/general/events/) | 실제 상태 전이 별 이벤트 기록 |
| R679-11 | [OpenTelemetry 공통 규약](https://opentelemetry.io/docs/specs/semconv/) | 트레이스·메트릭과 개인정보 |
| R679-12 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | 상태 알림·텍스트·포커스·모바일 |
| R679-13 | [Google 검색 스팸 정책](https://developers.google.com/search/docs/essentials/spam-policies) | 저품질 자동 뉴스 대량 색인 금지 |

레퍼런스는 설계 근거이지 실제 운영 정상성·Google 승인·법률 적합성의 증거가 아니다. 개발 직전 최신판을 다시 검증한다.
