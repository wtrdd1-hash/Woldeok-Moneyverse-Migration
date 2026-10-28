# v1446 — 금융 용어 자가점검과 일일 퀘스트 격리 보완 (기획 초안 / 운영 보류)

주기: 이전 기능 추가 v1444 → 현재 기능 보완 v1446 → 다음 기능 추가 v1448(잠정).

## 작업 점검표
- [x] 설치된 Superpowers 스킬, main의 AGENTS.md/README/영문 계획/국문 대조 확인.
- [x] QA v1358, 실제 용어사전·일일 퀘스트 코드·API 및 GitHub #1321 확인.
- [x] 기존 영문·국문 통합 기획서와 프로젝트 계획에 F675-167 보완 명세 반영.
- [x] P0/P1 개발 인계, 내부·GitHub 업데이트 및 다른 작업자 의존성 기록.
- [x] 중간 main 재조회, 문서 동등성·분류 테스트, Draft PR 및 완료 기록.

## 실제 소스 발견
`daily-economic-quest-station.tsx`는 `quest_financial_quiz`에 1,000 WLD 보상을 표시하고 `/#financial-quiz`로 연결하지만 검색한 프론트엔드에는 해당 앵커가 없다. `dopamine.repository.ts`는 퀘스트 ID에 따른 일일 보상 청구를 처리하면서 검사한 경로에서는 실제 퀴즈 완료 증빙을 검증하지 않는다. 컨트롤러는 저장소 부재 시 모의 성공 응답을 반환한다. 기존 이슈 #1321이 퀘스트 보상·정산 증빙 위험을 추적한다. 운영 악용이 입증된 것은 아니다. F675-167은 별도의 WLD 무관 교육 기능이다.

## 증거와 제약
시작 main 35971c600f25869c96f1c666d4b9f58927202730, QA v1358 FAILED/HOLD. 루트98%/데이터99%, 18,000 WLD 원장 차이, 앱 직접 쓰기 239개 관계, PUBLIC 은행 함수 3개, 마이그레이션 체크섬 5개 불일치·20개 미적용, 공식 Test exact-main/독립 복원 미검증. 외부 독립 중복제거 검증 신규 0건·누적 UNKNOWN/10,000, BLOCKED / IN PROGRESS. 기획에서 런타임·DB·WLD·Test·Production 변경 금지.

## Midpoint design / 중간 설계
[Draft PR #1794](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1794) — documentation-only, unmerged, release HOLD.

## v2026.10.29.1446 — F675-167 퀴즈·일일 보상 격리와 영수증 무결성 보완 (기능 보완 / 초안 / 운영 보류)
- 이전 추가 v1444 → 현재 보완 v1446 → 다음 추가 v1448(잠정). 시작·중간 main `35971c600f25869c96f1c666d4b9f58927202730` 동일, QA v1358 FAILED/HOLD. 미병합 #1790/#1784/#1780 의존, 미구현.
- **실제 코드 충돌:** 일일 퀘스트 `quest_financial_quiz`는 1,000 WLD 보상과 `/#financial-quiz` 링크를 표시하나 검색한 main에 대응 앵커는 없다. `DopamineRepository.claimDailyQuest`는 퀴즈 완료 증빙을 검사하지 않고 저장소 부재 시 컨트롤러 모의 성공 응답 경로가 있다. 이는 소스상 위험이며 운영 악용 입증이 아니다. 보상 정산은 기존 금융 이슈 [#1321](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1321)이 담당한다.
- F675-167은 별도 무보상 `glossary_practice`: 일일 보상 API·퀘스트/올클리어 이벤트·WLD/원장 변경 금지. 서버 전용 정답(공개 약한 해시 금지), 문제은행/배포 SHA·독립 검토, 언어별 검수 5문항×4선택지, 본인·지문 결합 영수증, 저장소 부재 503 실패 차단, 409/410/422/429, 24시간 10회, 30분 만료, 90일 보존, 웹·Android·SEO·WCAG/TalkBack·320px 검증. 클라이언트 모의 성공·점수 금지.
- P0/P1: ENV1446-01 FIN1446-02 SEC1446-03 REL1446-04 QUIZ1446-05 QUIZ1446-06 QUIZ1446-07 QUIZ1446-08 QUIZ1446-09 QUIZ1446-10. 격리 실제 PG 10,001건, 동시 100건, 위조 100건, 정답 유출 방지·퀴즈 원인 WLD 변화 0·정확 SHA Test·롤백 필수. QA v1358 루트98%/데이터99%/tmp97%, 회원 18명 +18,000 WLD, 앱 쓰기239, PUBLIC 은행3, 체크섬5/미적용20, Test SHA 불일치·독립 복원 미검증. 운영 보류.
- 외부 독립 중복제거·검증 신규 0건, 누적 UNKNOWN/10,000, BLOCKED/IN PROGRESS. 문서만 변경, 런타임·DB·금융·Test·Production 변경 없음. 전체 명세는 영문·국문 통합 마스터, 개발 인계 [#1789](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1789).

## GitHub / validation checkpoint
[Draft PR #1794](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1794) OPEN/DRAFT, base #1790, source branch independent. Issue #1789 comment 6481839941; existing reward issue #1321 comment 6481840782. Classifier 17 PASS/0 FAIL; bilingual 4 document pairs and 10 P0/P1 IDs checked. CI classify/release-input/verify-classify PASS, policy/non-runtime pending at 07:05; official Test/real PG/Production not run. Fresh 07:05 root 99% (~1.9GiB), data 99% (~2.9GiB). External approved new 0, cumulative UNKNOWN/10,000 BLOCKED. No runtime/DB/WLD/Test/Production modifications.
