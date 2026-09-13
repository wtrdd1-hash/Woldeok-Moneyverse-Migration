# 플레이어 마켓 작업대 v2026.09.13.20

- 선택 기능: 플레이어 마켓/제작의 첫 런타임 슬라이스.
- 사용자 효과: 로그인 회원이 `/marketplace`에서 서버가 제공하는 실제 보유 상점 아이템, 수량, 카테고리, 고유 번호 아이템을 확인할 수 있다.
- 기준선: 현재 `main` `6ad8304ac743366ae8b9bc445934160b0eaecdee`와 최신 migration-parity/Banking 후보 #224 `abdb75e48907f6326386c40b7b6413aa990c45b0`.
- 겹침 검토: #224는 Banking과 migration parity를 변경하며 marketplace UI와 직접 겹치지 않는다. 최신 DB 트리 상태를 보존하기 위해 해당 head를 기준으로 새 브랜치를 만들었다.
- 런타임 범위: 회원 전용 프론트엔드 페이지와 `/shop` 진입 링크만 추가했다. 새 API, DB migration, 원장 변경, 거래 정산은 없다.
- 안전 경계: 판매 등록, 구매, 이전, 에스크로, 제작 mutation은 원자적인 서버/DB 계약이 구현되고 검증될 때까지 노출하지 않는다.
- 검증: PR CI 통과 후에만 Test 후보를 만든다. main/운영 승격 전 isolated Test exact-SHA 검증이 필수다.
- 인프라: `kuber-infrastructure` main은 `18eed320d3ae1eb2f29b32c11a0a9db8ffcebaf3`이며 Production은 변경하지 않았다.
- 정리: 승인된 원격 장비가 모두 오프라인이고 현재 GitHub 연결에 delete-ref 기능이 없어 superseded remote ref 삭제는 대기 상태다.
- 남은 위험: 현재 작업대는 읽기 전용이다. marketplace listing/escrow/settlement와 crafting recipe는 아직 미구현이다.
- 다음 우선순위: inventory provenance와 ledger 불변식을 유지하면서 서버/DB marketplace 계약을 구현하고, 이후 crafting recipe/settlement를 구현한다.
