# 완료 작업 전용 자동 main 통합 — v2026.09.22.337

날짜: 2026-09-22
범위: GitHub 브랜치 통합/정리 자동화 및 문서

## 변경
- Auto Integrate는 열린 PR이 없는 브랜치에 자동 PR을 만들지 않으며 해당 브랜치를 작업 중으로 취급한다.
- Draft PR과 WIP/work-in-progress/do-not-merge/hold/merge-blocked/in-progress 라벨 PR은 병합·충돌조정·정리 대상에서 제외한다.
- 반복 실패한 완료 PR도 삭제하지 않고 수정 대상으로 보존한다.
- 예약된 contained-branch 정리는 merged PR 증거가 있을 때만 브랜치를 삭제한다.
- main 통합 전 정확한 현재 HEAD의 `Build Test Candidate` 성공과 mergeable 상태는 계속 필수다.

## 목표 상태
완료된 ready PR은 자동으로 main에 통합되고, 작업 중인 브랜치는 자동화가 main으로 끌어오거나 삭제하지 않는다.

[executed on device: debian13 (d2f8c9a2-2e5a-4e57-a99d-1a9389e70b4c)]