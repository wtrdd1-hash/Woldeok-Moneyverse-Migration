#!/bin/sh
# Prisma introspects the schema; it never owns it. A Prisma migration would
# drop the SECURITY DEFINER functions and the role grants that keep the
# application unable to move money directly, so no script or manifest may
# invoke one.
#
# The forbidden phrase is assembled at runtime rather than written out, so
# this guard does not match its own source. Spelling it literally here is
# what made the first version of this check fail on every run.
set -eu

forbidden="prisma"" ""migrate"

if grep -rn \
     --include='*.json' --include='*.ts' --include='*.yml' \
     --include='*.yaml' --include='*.sh' \
     --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=docs \
     -- "$forbidden" .; then
  echo "$forbidden must never run: the numbered SQL files own the schema" >&2
  exit 1
fi

echo "no forbidden Prisma schema-mutating command found"
