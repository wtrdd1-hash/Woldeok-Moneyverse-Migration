# v2026.11.23.2 — 실제 수정 디자인 이미지 전달 기록
영문 정본: [English](2026-11-23-nov18-corrected-visual-handoff.md)
상태: **새 디자인 이미지 생성 완료 / GitHub 기존 PNG 교체 전 / 실제 코드 구현 전**.
기존 감사: [이슈 #3374](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3374), [초안 PR #3375](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3375).

이번 대화에 신규 디자인 이미지 4개를 전달했다(바이너리 파일은 GitHub에 올리지 못함).
1. `home-mobile.png`: 모바일 직업 진입/현재 직업/업무/보상 및 직업 하단 메뉴.
2. `home-desktop.png`: PC 사이드바 직업 메뉴와 진행 중 업무·직업 수행 바로가기.
3. `bank-wallet-desktop.png`: 보라색으로 은행·지갑 통일하고 입금·출금·적금·카드 발급·송금·받기·영수증 시안을 추가.
4. `home-career-desktop.png`: 직업 패널·현재 업무·예상 수익·직업 변경 진입 및 관련 메뉴를 상세화.

**주의:** 생성 시안 속 캐릭터, 직업, 시간, 날씨, 금액, WLD, 지표, 거래 성공 표시는 모두 **허구의 디자인 예시**이며 실제 계정/서버 조회·결제·전송·승급 성공 근거가 아니다. 사용자 전달 ZIP 이미지는 SAMPLE DATA 워터마크를 적용했다.

**GitHub 적용 미완료:** 미니PC가 오프라인이고 연결된 GitHub 파일 기록 도구는 UTF-8 문서 기록용이라 PNG 바이너리 업로드를 수행하지 못했다. 따라서 기존 `docs/design/all-pages-v2026.11.18.12/previews/*.png`는 **교체되지 않았다**. 이 상태에서 이슈를 닫거나 디자인 전체 수정을 완료 처리할 수 없다.

후속: 미니PC 또는 승인된 바이너리 업로드로 이미지 반영, 5개 언어/금액·문구 교열, 180개 전체 시안 대조, 실제 Spring+Thymeleaf 구현·Test·권한 QA·무중단 운영 게이트 이행. Test·운영·DB 변경 없음.
