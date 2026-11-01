# C v1284 — 회원 관심 종목 검증 및 Android 개인정보 보호

## 시작
- 기준: origin/main a8541927c3a351d980454c66e95a3356c47e0722, 독립 auto/hourly-c-watchlist-source-v1284-20261102-0445 브랜치.
- 기존 Nest 회원 세션/동의 검사와 SQL 177의 본인 전용 SECURITY DEFINER 조회 함수를 재사용한다. DB/금융 원장 쓰기는 없다.

## 중간
- 기존 화면은 비정상 시세 문자열에서 BigInt 예외가 발생하고, Android API는 원본 서버의 public 캐시 및 색인 헤더를 그대로 전달했다.
- 실패 재현 후 데이터 형식 검증, 정상 빈 상태와 장애 구분, 재조회 및 모바일 접근성, Android 503 차단과 private/no-store/noindex/no-referrer 적용.
- 집중 테스트 19건 PASS. 모든 필수 게이트 검증 전까지 병합/배포 금지.

## 종료
- 최종 SHA 및 게이트는 영문 정본의 Finished 항목과 동일하게 갱신한다.
