# 기획 v1590 — F675-203 기능 보완 (문서 전용)

**이전:** 기능 추가 v1588. **현재:** 기능 보완 v1590. **다음:** 기능 추가 v1592(잠정). **DRAFT / RELEASE HOLD**.

## 근거와 확인 내용
- 원격 main `f13bbce273ffc65e8576170992d82ea00c27a1c9` 시작·중간 확인; 선행 #2269 OPEN/미병합. v1588 기획 승계만 수행, 배포 아님.
- AGENTS.md, README.md, 영문·국문 통합 기획서, SQL 071/123, Nest 상점 컨트롤러·저장소와 Next 보관함 확인. 최신 QA v1430 #2271은 B #2266 CI DB 대상 수정 초안이며 운영 승인 아님.
- D1 P0: 호출자가 전달하는 p_actor와 SECURITY DEFINER EXECUTE만으로 DB에서 세션 소유자를 검증할 수 없음. 위협모델·두 회원 음성 시험 전 신규 함수 EXECUTE 차단.
- D2: INTEGER 10,001건 최대 합계 21,476,983,953,647로 2^53 미만. 실제 10,001건 시험과 별도 4,194,305행 숫자 스트레스 또는 결정적 전송 대역 시험으로 분리.
- D3: PostgreSQL timestamptz를 JavaScript Date 대신 SQL UTC 소수점 6자리 문자열로 보존.
- D4: 기준시각 신선도·STALE 표시·정상 빈 결과 200과 장애 503을 분리.
- P0 4건/P1 6건 전부 OPEN; 외부 독립 근거 10,000건 중 신규 승인 0건, 누적 UNKNOWN/BLOCKED.

## 배포 경계
런타임/API/SQL/DB/WLD/원장/Test/Production 변경 및 main 병합 없음. 기능 OFF. 신규 기능 시험은 제안만 하고 미실행. 별도 개발 브랜치 → 보안 승인 → 정확 SHA 격리 Test → 인증 QA/복원 → 운영자 GitOps 승인. Gemini·개발 A/B/C·QA 브랜치 불변.
