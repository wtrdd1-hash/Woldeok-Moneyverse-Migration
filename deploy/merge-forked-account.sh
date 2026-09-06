#!/usr/bin/env bash
# Moves a member's sign-in onto the account that holds their money.
#
# Before 162 a login found its account by an encrypted subject, and a change
# of DATA_ENCRYPTION_KEY made every stored subject unfindable -- so the next
# login built a new, empty account for a member who already had one. 162 stops
# that happening again; it cannot undo the accounts already split, because
# only the owner knows which ones are theirs.
#
# This takes the account they keep (the one with the balance and the roles)
# and the empty one their latest login made, and gives the kept account the
# new login's identity. Balances and ledger history are never moved: the
# ledger is the record, and rewriting it would be a lie.
#
#   ./merge-forked-account.sh <keep-user-id> <discard-user-id>          # shows the plan
#   ./merge-forked-account.sh <keep-user-id> <discard-user-id> --yes    # applies it
set -euo pipefail

KEEP="${1:?the user id to keep — the one with the balance}"
DISCARD="${2:?the user id the latest login created}"
APPLY=0
[ "${3:-}" = '--yes' ] && APPLY=1
DB_CONTAINER="${DB_CONTAINER:-wdmvp-db}"

psql_run() {
  docker exec -i "$DB_CONTAINER" sh -lc \
    'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" '"$1"
}

cat <<INFO
keep:    $KEEP
discard: $DISCARD
mode:    $([ "$APPLY" = 1 ] && echo APPLY || echo 'dry run')

INFO

echo '== the two accounts as they stand =='
psql_run "-c \"
SELECT left(u.id::text,8) AS user, i.provider, left(i.display_name,14) AS name,
       coalesce((SELECT sum(b.available_amount) FROM public.accounts a
                 JOIN public.account_balances b ON b.account_id=a.id
                 WHERE a.owner_user_id=u.id),0) AS cash,
       (SELECT count(*) FROM public.user_roles r WHERE r.user_id=u.id) AS roles
FROM public.users u LEFT JOIN public.identities i ON i.user_id=u.id
WHERE u.id IN ('$KEEP','$DISCARD')\""

if [ "$APPLY" != 1 ]; then
  echo
  echo 'nothing was changed. re-run with --yes to apply.'
  exit 0
fi

# One transaction: the kept identity takes the discarded one's subject, and
# the empty account goes. A discarded account with a balance stops the whole
# thing -- that would be a different job with a different name.
psql_run "-c \"
BEGIN;
DO \\\$\\\$
DECLARE v_cash numeric;
BEGIN
  SELECT coalesce(sum(b.available_amount),0) INTO v_cash
  FROM public.accounts a JOIN public.account_balances b ON b.account_id=a.id
  WHERE a.owner_user_id='$DISCARD';
  IF v_cash <> 0 THEN
    RAISE EXCEPTION 'the account to discard holds % -- merge it by hand', v_cash;
  END IF;
END
\\\$\\\$;

UPDATE public.identities AS keep_row
SET provider_subject = discard_row.provider_subject,
    subject_hash = discard_row.subject_hash,
    display_name = coalesce(nullif(discard_row.display_name,''), keep_row.display_name)
FROM public.identities AS discard_row
WHERE discard_row.user_id = '$DISCARD'
  AND keep_row.user_id = '$KEEP'
  AND keep_row.provider = discard_row.provider;

DELETE FROM public.identities WHERE user_id = '$DISCARD';
DELETE FROM public.account_balances WHERE account_id IN
  (SELECT id FROM public.accounts WHERE owner_user_id = '$DISCARD');
DELETE FROM public.accounts WHERE owner_user_id = '$DISCARD';
DELETE FROM public.auth_sessions WHERE user_id = '$DISCARD';
DELETE FROM public.users WHERE id = '$DISCARD';
COMMIT;\""

echo
echo '== after =='
psql_run "-c \"
SELECT left(u.id::text,8) AS user, i.provider, left(i.display_name,14) AS name,
       coalesce((SELECT sum(b.available_amount) FROM public.accounts a
                 JOIN public.account_balances b ON b.account_id=a.id
                 WHERE a.owner_user_id=u.id),0) AS cash
FROM public.users u LEFT JOIN public.identities i ON i.user_id=u.id
WHERE u.id = '$KEEP'\""
