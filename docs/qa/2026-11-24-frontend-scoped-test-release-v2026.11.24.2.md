# Nov 24 native frontend repair — verified scoped Test promotion
Version **v2026.11.24.2**. Status **TEST_DEPLOYED_SCOPED / FULL SITE RELEASE HOLD**. Deployed to https://test.easy-scraping.com; no Production promotion.

## Root cause and corrected user paths
Old isolated Spring Test renderer had GET allowlist limited to early accepted routes; /terms, /privacy and /socket.io.min.js were 403 despite authored legal policy text and static socket JS existing. Announcement/gallery Thymeleaf page title rendered literal `null` due to expression composition. First two new JUnit tests RED, then implementation GREEN. Existing source authored 2026-09-02 EN/KO full legal articles are transformed offline into Spring Thymeleaf without rewriting policy, with five-locale navigation chrome and explicit EN source fallback in JA/ZH/VI. Fix mobile privacy overflow by constraining grid items; common Nov23 navy/violet palette and original favicon retained.

## Implementation and boundaries
Fixed source `6eee110a03932764b01e15bc93faf829282bfa1a` / immutable JAR sha256 `fbc2bd0367d6a9739a6ed61232b228177786040b7b62fbae0969622d54a96c87` on isolated 127.0.0.1:55443. Test Nginx route-scoped 6 legal/static exact locations plus 8 announcement/gallery aliases moved from old 55440 to 55443. Other Test endpoints, authenticated/financial and root unaffected; current Spring API 55438 and Test DB 55436 remain. Production host configuration remained byte-identical, though common Nginx graceful reload was performed. Nginx configuration before sha256 `b7d40d78382065579f0491f5f41f69b5994ca344a3ec47780d9f629979d1eb3d`, after `fb95b7f6ba7afd8baa9a2f5f327db970db1d8b1ac0c29a591179e9ad3aecfe67`, outside Test block sha256 `2aded4226c64107dd7e42e95c6f0a5f95ef643c2d01636de37b4bab8241cc7be`. Backup stored at `/srv/moneyverse-native-test-20261124/6eee110a03932764b01e15bc93faf829282bfa1a/nginx-test-scoped.before.conf`.

## Verification
- Red-green JUnit for exact legal/script routes, denied adjacent paths, source-owned content, 5 languages and localized publication titles: 28/28 PASS. Earlier same Java source full Gradle clean test bootJar 676/676 PASS (excluded database-tagged tests not miscounted).
- Source candidate Node native source test 350/350 PASS after asset SHA references; Gradle bootJar exact source PASS; `nginx -t` PASS.
- Actual isolated direct preview 60 Chromium cases PASS (four screens × five languages × 320/390/1440). External **HTTPS Chromium 60/60 PASS**, no JS errors or body overflow. [Raw evidence](evidence/2026-11-24-native-scoped-test/browser-60-external.json) and screenshot PNGs in evidence directory.
- External HTTPS read-only `/terms`, `/privacy`, `/socket.io.min.js`, `/announcements`, `/gallery` HTTP200. Unchanged Test home/API 200, old bank/stocks/wallet/admin 302 as guest; admin internal API remains denied. The browser-facing Test deploy proves scoped new routes only, not all-page acceptance.

## Release HOLD on remaining work
A whole-frontend upgrade from the verified source commit would regress existing bank and stocks guest routes 302→403 due to a mismatch between advertised 7b676e source and runtime content. Prevented by strict scoped routing. The latest parallel source branch introduces 52 pre-existing native Node test failures on rebase (asset hashes, BOM catalog and stocks fixture harness); not used for release. Full 180-page route acceptance, 114 denied routes, dynamic fixtures, OAuth/RBAC positive, financial ledger, chat websocket and 240 browser scenario suite are OPEN. Production unchanged; no data writes.

This is scoped Test deployment only, independently staged; peer/Gemini FE branches must resolve overlaps before any main merge or full Test/Production release.
