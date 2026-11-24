# Independent Nov18 Test backend

This one-shot operator bootstrap creates a fresh synthetic Test database and full-application backend from accepted source f0336fded6068f884c87f88efedeb770fd3387d4. It never adopts an existing JVM, database, container or volume. Parent task owns source review, integration, public routing and Production decisions.

## Bounds

- API: loopback55438; PostgreSQL: loopback55436.
- New owned Docker container/volume have one fixed ownership label and immutable image identity.
- Database moneyverse_nov18_public_test starts from a new empty volume. Exact git-archive SQL is applied through unchanged ci-apply.mjs.
- Bootstrap principal moneyverse_migrator mirrors disposable CI inside this container only. Runtime principal moneyverse_app remains restricted by canonical migrations.
- New random credentials stay in external root-only state. No Production environment or data is read.
- Full application uses the accepted immutable JAR, DynamicUser, loopback-only IP policy, read-only Hikari pool, no schema initialization, disabled schedules/ticker and empty bot/integration credentials.
- Test origin is explicitly https://test.easy-scraping.com. It cannot inherit Production credentialed CORS.

## Execution

Run the full helper suite and source review before invoking install.py as root on the approved working host. install.assert_vacant() is a read-only preflight. The installer is deliberately one-shot: any existing reserved resource causes refusal; a partial failure retains private evidence and new resources for inspection. It does not automatically delete or recreate data.

Run acceptance.py after startup. Its JSON contains source/JAR/process identity, app-role read-only SQL, effective Hikari read-only configuration, complete migration checksums, zero-user/session counts, canonical stock/board comparison and anonymous/forged identity denial results. The report never certifies authenticated commands, financial changes, all backend routes, or Production.

The only mutation script is install.py; acceptance.py uses SELECT SQL and HTTP GET only. Unit/bootstrap/private diagnostic ownership and image/container/path authority are tested in test_backend.py.

## Accepted continuity
The owned Test service is enabled with on-failure restart,3second delay, successful143 exit and a5restart/300second limit. The owned database container uses unless-stopped. continuity.py performs the one-time bounded transition from the original accepted unit, retains root-private original/before/after evidence, refuses existing boot links or foreign generation changes, and never adopts another resource. acceptance.py now requires these effective manager/container policies as well as the17 existing checks. A controlled unit restart was tested; host reboot and induced-crash testing were not performed.
