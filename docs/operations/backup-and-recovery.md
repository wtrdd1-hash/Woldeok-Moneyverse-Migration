# Backup & Recovery

## What a release backup protects

Before Production-changing migrations or runtime rolls, the deployment takes an encrypted backup of the production database and the photo object store.

A backup is not considered verified merely because a file exists. Verification should check:

- the encrypted database dump decrypts;
- the dump ends cleanly / is structurally readable;
- the photo archive can be opened/read;
- the backup belongs to the intended stack (Production vs Test).

## Stack identity

Backup tooling must operate on the deployment directory/stack it was invoked for. A historical bug defaulted a Production manual backup command to the Test deployment directory; the deploy script was corrected so the directory is explicit/defaulted to the running stack location.

## Off-host disaster recovery

Current host-local backups improve rollback/recovery from software mistakes but do **not** protect against complete host/storage failure when every copy is on the same machine.

For real disaster recovery, configure an off-host destination such as a mounted NAS or remote storage path and periodically restore-test it.

## Restore policy

A database restore is a high-impact operation. Prefer a forward fix when safe. Use a restore only when the current state cannot be repaired safely and the restore scope is explicitly approved.

Never delete Docker volumes simply to force a restore.
