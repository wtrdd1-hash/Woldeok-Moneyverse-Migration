# Worklog — Mobile OAuth Prelogin Isolation v2026.09.14.71

Production evidence: a real Discord mobile callback at 2026-09-14 11:06 KST consumed `mobile_client=true` challenge but failed with PostgreSQL `active pre-login session required`; the challenge was attached to a session whose `user_id` was already populated. The fix isolates mobile challenges onto a fresh anonymous session and preserves ordinary web OAuth behavior.
