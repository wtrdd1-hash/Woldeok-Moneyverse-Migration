# Project Planning / 기획서

The project plan is a living specification and must be reviewed before implementation work begins.

- [Project Plan — English](PROJECT_PLAN.md)
- [프로젝트 기획서 — 한국어](PROJECT_PLAN.ko.md)

## Required development rule

Before changing product behavior, database rules, security boundaries, economy policy, admin behavior, UI structure, or operational workflows, check the project plan first.

If implementation intentionally and validly changes the planned behavior, update the project plan in the same branch and the same work log. Do not treat planning updates as optional follow-up documentation.

If code violates an existing security, privacy, ledger, data-integrity, or product invariant, fix the code instead of weakening the plan to match the bug.

Every significant change should record:

1. what the plan said before the change,
2. what implementation changed,
3. why the change is justified,
4. validation/test evidence,
5. test and production deployment status,
6. final completion status and release/changelog entry.

---

# 기획서 사용 원칙

개발 작업을 시작하기 전에 기획서를 먼저 확인합니다.

제품 동작, 데이터베이스 규칙, 보안 경계, 경제 정책, 관리자 기능, UI 구조, 운영 절차가 의도적으로 변경되는 경우 코드만 수정하지 않고 같은 브랜치와 같은 작업내역에서 기획서도 함께 갱신합니다.

반대로 코드가 보안·개인정보·원장·데이터 무결성·제품 불변 규칙을 위반한 경우에는 기획서를 약화시켜 코드에 맞추지 않고 코드를 수정합니다.

중요 변경은 기존 기획, 실제 변경점, 변경 사유, 테스트 근거, 테스트/운영 배포 상태, 최종 완료 및 Release/CHANGELOG 반영 여부까지 기록합니다.
