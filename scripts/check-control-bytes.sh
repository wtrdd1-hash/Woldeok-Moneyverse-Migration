#!/bin/sh
# Input-sanitisation regexes name control characters as backslash-u escape
# TEXT. Editing tools have, on at least four occasions in the original
# repository, replaced such an escape with the raw byte it denotes: the file
# still reads correctly and the literal no longer means what it says.
#
# ESLint cannot see the difference -- to it both are "a control character in a
# regex" -- so this checks the bytes instead.
set -eu

if grep -rnP '[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]' \
     --include='*.ts' --include='*.tsx' --include='*.js' --include='*.mjs' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.next \
     . ; then
  echo 'raw control byte in source: a backslash-u escape was replaced by the byte it denotes' >&2
  exit 1
fi

echo 'no raw control bytes in source'
