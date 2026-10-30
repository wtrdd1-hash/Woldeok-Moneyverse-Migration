# 기획 v1544 — 회원 보유 아이템 만료 알림 선택(F675-192)
**상태:** DRAFT/RELEASE HOLD/문서 전용. **주기:** 이전 보완 v1542, 현재 추가 v1544, 다음 보완 v1546(잠정). **main:** 761a55a094fb9dd383d213e817305e68c79fa23c; **선행:** #2105; **개발 인계:** #2112; **Draft:** #2113.

## 시작
설치된 Superpowers using-superpowers, brainstorming, worktrees, writing-plans, verification 스킬을 읽음. skills 커넥터 목록이 비어 URI가 없었음. miniPC Debian 13.6·서비스·GitHub PR·AGENTS.md·README.md·영문 기준/국문 대조 문서 확인. 별도 브랜치와 작업 폴더 생성. 런타임/DB 변경 없음.

## 중간·발견
origin/main과 기준 문서를 다시 조회. 보관함 화면, 마이그레이션 123, Nest 알림함·Android app-api·활성 PR/이슈 확인. 번호가 있는 마이그레이션에서 in_app_notifications CREATE TABLE을 찾지 못했으므로 실제 스키마·앱 권한은 검증 전제 조건. 신규 #2111은 Test FX ACL 500, #2109는 비공개 공간 접근 문제. 마지막 상세 전체 QA v1405는 단위시험 통과/의존성 감사 실패, #2103 정확 SHA 증빙 미완. 현재 Test 정상화 증거가 아님.

## 설계·인계
브라우저 타이머·이메일/푸시 대신 앱 내 명시적 신청 기능 선택. 사용자 흐름/API/DB/트랜잭션/보안/SEO/Android/접근성/관리자 KPI/회귀/롤백은 영문·국문 통합 문서에 수록. #2112에 P0 4/P1 6 인계. 7일/1일 시간 창, 만료시각별 중복방지, 수신거부 잠금과 알림·영수증 원자성, 플래그 OFF. 캘린더·자동 장착·결제·WLD 변경 없음. 합성 10,001건 시험은 제안만, 미실행. 외부 근거 신규 0·누적 UNKNOWN/10,000 BLOCKED.

## 완료 기준
커밋/PR/CI는 증빙 확보 후 별도 기록. 문서 CI로 런타임 시험·배포 승인 주장 금지. 정확 SHA Test·권한·감사·독립 복원 전까지 RELEASE HOLD.
