# 주식 조회 3개가 프로덕션에서 권한 부족으로 실패한다

발견 2026-08-28. 이식 중 실제 데이터베이스에 대고 검증하다 드러났다.
**이식 과정에서 생긴 문제가 아니라 원본에 살아 있는 결함이다.**

## 무엇이 깨져 있나

`moneyverse_app` 롤은 `virtual_stock*` 테이블 다섯 개 전부에 대해 권한이
**없다**(`NONE`). 그런데 주식 저장소의 읽기 네 개는 함수를 거치지 않고 그
테이블을 직접 `SELECT` 한다.

| 저장소 메서드 | 읽는 대상 | 결과 |
| --- | --- | --- |
| `list()` | `virtual_stocks` | `42501 permission denied` |
| `adminList()` | `virtual_stocks` | `42501 permission denied` |
| `portfolio()` | `virtual_stock_positions`, `virtual_stocks` | `42501 permission denied` |
| `history()` | `virtual_stock_trades`, `virtual_stocks` | `42501 permission denied` |
| `priceHistory()` | `stock_price_history()` 함수 | **정상** |
| `trade()` | `stock_trade()` 함수 | **정상** |

## 영향받는 라우트

- `GET /api/v1/stocks`
- `GET /api/v1/stocks/portfolio`
- `GET /api/v1/stocks/history`
- `GET /api/v1/admin/stocks`
- `GET /stocks` (위 목록을 렌더하는 페이지)

## 어떻게 확인했나

추론이 아니라 프로덕션 데이터베이스에서 직접 재현했다. 프로덕션 앱은
`postgresql://moneyverse_app@db:5432/woldeok_moneyverse_prod`로 접속한다.

```sql
SET ROLE moneyverse_app;
SELECT id::text, symbol, name, description, current_price::text, ...
FROM public.virtual_stocks WHERE active ORDER BY symbol;
-- ERROR:  permission denied for table virtual_stocks
```

대조군: 같은 세션에서 함수를 거치는 호출은 전부 성공한다 —
`business_catalog()` 3행, `season_active_events()` 1행,
`stock_price_history(...)` 0행.

## 왜 지금까지 안 보였나

원본의 테스트가 전부 테스트 더블을 쓴다. 더블은 SQL 문자열을 검사하지 않으므로
권한이 없는 테이블을 읽는 쿼리도 통과한다. route-surface 스냅샷도 서비스가
`null`인 상태로 라우팅만 확인하므로 쿼리를 실행하지 않는다.

살아 있는 데이터베이스에 대고 돌린 첫 테스트가 이것을 즉시 드러냈다.

## 이 저장소에서의 처리

이식은 원본에 충실하게 유지했다 — SQL은 바이트 단위로 동일하다. 대신
`backend/src/game.db.test.ts`가 이 실패를 **명시적으로 단언**한다. 결함이
보이지 않게 되는 것을 막기 위해서이고, 고쳐지는 순간 그 테스트들이 빨간불이
되어 갱신을 요구하도록 되어 있다.

## 고치는 방법 — 권장안

**권한을 넓히지 말 것.** `GRANT SELECT ON virtual_stocks TO moneyverse_app`은
가장 빠른 길이지만, 이 애플리케이션이 지키는 경계(앱은 함수만 실행한다)를
주식 도메인에서만 허문다.

아키텍처와 일관된 방법은 마이그레이션 047을 추가해 읽기용
`SECURITY DEFINER` 함수 셋을 두고 `EXECUTE`만 부여하는 것이다:

- `stock_list_active()` — `list()`가 쓰던 쿼리
- `stock_admin_list(p_actor uuid)` — 운영자 확인 후 전체 목록
- `stock_my_positions(p_actor uuid)` — 호출자 본인의 보유분만
- `stock_my_trades(p_actor uuid, p_limit integer)` — 호출자 본인의 체결만

뒤의 셋은 `p_actor`를 인자로 받으므로, 함수가 호출자 소유의 행만 돌려주도록
안에서 강제할 수 있다. 지금처럼 애플리케이션이 `WHERE user_id = $1`을 붙이는
것을 신뢰하는 구조보다 강하다.

**미결정 사항이다.** 이 저장소는 아직 원본 동작을 그대로 옮겨두었고, 수정 여부는
사용자 결정을 기다린다.
