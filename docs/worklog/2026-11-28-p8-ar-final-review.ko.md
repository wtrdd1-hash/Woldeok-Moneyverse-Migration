# P8-AR 최종 아키텍처·DB·아티팩트 재검토 — 체크포인트 1 (2026-11-28)

[English](2026-11-28-p8-ar-final-review.md) | **한국어**

후보: 통합 `643fad6cdb` + 브랜치 `security/ar02-least-privilege-20261128`. main 1df1150e97.

## 이번 체크포인트
- [x] AR02 권한 인벤토리(소유 합성 샌드박스): 테이블 272, 앱 SELECT 51 / INSERT 9 / UPDATE 2 / DELETE 0, 함수 654 중 앱 실행 472, search_path 미고정·비migrator 소유·PUBLIC 실행 SECURITY DEFINER 0, 앱의 `economy_post_transaction` 실행 불가, 원장 불변식 0/0/0.
- [x] 미사용 INSERT 4건 회수 마이그레이션 367(후보) — 신규 Spring 배포 후 적용. 입찰 로그 SELECT는 레거시 Nest가 사용 중이라 유지(퇴역 시 후속).
- [x] 비밀 경매 목록: 실패 시 가짜 항목 → 503, 최고 입찰자 비공개.
- [x] 검증: 367 소스/패리티 테스트, Spring 1158/0/0/0, DB 106 통과(+5 CI 전용 스킵), 샌드박스 적용·재적용 확인. Codex 변경 요청 → 수정 → APPROVE.

## 영역별 상태
- AR01 HOLD(레거시 Nest 잔여 경로), AR02 부분/HOLD(CI 신규 설치·업그레이드 미실행), AR03 HOLD(CVP·운영 노출·SEC1), AR04 HOLD(이 SHA 미측정), AR05 HOLD(Next 다이제스트·SBOM 재스캔·복구 훈련 미실행), AR06 HOLD(180경로·5개 언어 미재실행).
