# A/v2168 — QA 근거 점검 및 중복 수정기획 방지 (2026-11-13 18:05 KST)

## 시작 / 회차 복원
이전 완료 B/v2166: 기획 브랜치 커밋 `9adad477bde7dd9984ff0c65119564e510505a2b`, Draft PR #3133. 현재 A/v2168, 다음 B/v2170(잠정). 시작 시 원격 main `47c0dc714b9876d397bc1844111262e73da3b59c`. 기획 기록만 작성하고 런타임/DB는 변경하지 않음. miniPC 백엔드·프론트·봇·MCP·nginx·Docker 가동, 연결 DB는 개발용. 호스팅 스킬 목록은 비어 있음. 로컬 스킬 목록 확인 및 using-superpowers, systematic-debugging, writing-plans, verification-before-completion의 SKILL.md를 실제 읽음. GitHub 커넥터로 AGENTS.md 확인, GitHub CLI로 #3101과 최근 병합/열린 PR 조사.

## 중간 조사 / 원인 중복 방지
- **기존 P0 INC-2026.11.12.01 / #3101:** GitHub 이슈 OPEN(최종 변경 2026-11-13T02:30:10Z). 운영 모바일 화면에서 10,000,000 WLD 조폐국→국고 충전 실패 보고. OTP 유효성, 원장 결제, 영수증은 UNKNOWN. main의 `admin-mint-topup-dialog.tsx`에는 #3119의 UUID requestKey 유지 구현이 존재함. 기존 요청 필드 누락의 소스 불일치 해결 근거이지 운영 사고/정산 해결 증거는 아님. 권한 있는 충전 실행 없음. 새로운 재현/원인이 없어 기존 이슈 ID를 유지하고 신규 수정기획 0건.
- **P1 소스와 기능 활성화 주장 구분:** #3130 병합 제목과 별개로 main KDIC 컨트롤러의 금융 POST 세 경로는 503 `KDIC_LEDGER_SETTLEMENT_UNVERIFIED`를 명시. Test exact-SHA 인증 검증 및 운영 읽기전용 근거 전에는 실제 동작 UNKNOWN. SWF 플래그/설정도 별도 검증 필요. 원장 대사 없이 안전 보류 해제 금지. 신규 QA 결함 확정 아님.
- 최근 #3127/#3128/#3130/#3123 병합 제목 조사, 열린 #3132(ACL), #3133(B 기획) 확인. 다른 담당자의 변경과 분리. 영문 정본/국문 대조 PROJECT_PLAN, INTEGRATED_PLANNING_MASTER의 존재와 첫머리 확인. 최근 30일 전수조사 및 전체 영한 동등성 검증 미완료.

## 수용 기준 / 담당 인계
P0 QA/개발: 격리 Test exact-SHA 실백엔드로 재현, OTP 소모 및 requestKey 재시도, 거래 전후 지갑·원장·영수증 확인, 미설명 차이 0건, OTP 노출 금지. 운영 배포 SHA 읽기전용 검증과 과거 거래 대사 전 이슈 종료 금지. P1 QA/개발: KDIC 금융 경로별 허용/503 구분, SWF 플래그, RBAC·CSRF·멱등성·원장 제약 확인, 안전 보류 유지. P2 기획: v2162/v2166과 다른 신규 후보 및 30일 코드/기획/PR/외부 자료 전수 대조.

## 중간 main 재확인 / 완료
작성 직전 main `47c0dc714b9876d397bc1844111262e73da3b59c` 불변 확인. 새 원인이나 운영 QA 증거 없음. 신규 수정 델타 **0**, NET_NEW **0**, 신규 확인 중복 **0**, 검토 이슈 그룹 **2**(사고 1, 소스 상태 1), 새 기획 채택 **0**, 이번 회차 구현 **0**, QA/운영 검증 **0**. 정본 수정 근거 없어 변경하지 않음. **기획 품질 BLOCKED**: 최근 30일 양 저장소 전수, 인증 Test exact-SHA, 운영 원장 대사, 전체 영한 동등성, 외부 독립 10,000건 중복제거 근거 미확인. 테스트 미실행, Test/운영 승격 없음. TSI-001~011 및 Draft #3006 보존.

### 실제 스킬 적용
| 단계 | 읽은 로컬 SKILL.md | 적용/증거 | 결과 |
|---|---|---|---|
| 시작 | using-superpowers | 우선순위·근거 조사 | 범위 확정 |
| QA 분석 | systematic-debugging | 새 원인 미확정 시 추측 수정 금지 | 기존 사고 유지 |
| 기획 게이트 | writing-plans | 확정된 수정 델타 부재 | 중복 상세기획 없음 |
| 종료 검증 | verification-before-completion | 테스트 증거 없으면 PASS 금지 | BLOCKED |

호스팅 스킬 목록 `[]`, 구현/신규 설계/독립 테스트가 없어 기타 로컬 스킬 미적용. GitHub 업데이트는 검토용 기획 PR만 해당하며 main 반영이나 구현 아님. 다음 B/v2170은 기존 후보와 다른 세 후보를 비교하고 증거 부족 시 0건 채택.
