#!/bin/sh
# Scheduled local blog generation. Credential bytes must never appear in argv,
# environment variables, source control, or logs. Provision the private HTTP
# header file during an approved deployment (see docs/worklog/2026-10-24-hourly-b-v508-blog-cron-secret.md).
set -eu
umask 077

header_file=${BLOG_CRON_HEADER_FILE:-/etc/moneyverse/blog-cron-header}

# Do not follow symlinks or accept a group/world-readable file. This job runs
# as the service user; the file must belong to that user and contain one header.
if [ ! -f "$header_file" ] || [ -L "$header_file" ] || [ ! -r "$header_file" ]; then
  echo 'blog cron: private credential file unavailable' >&2
  exit 78
fi
mode=$(stat -c '%a' -- "$header_file") || exit 78
owner=$(stat -c '%u' -- "$header_file") || exit 78
if { [ "$mode" != 600 ] && [ "$mode" != 400 ]; } || [ "$owner" != "$(id -u)" ]; then
  echo 'blog cron: unsafe credential file permissions or ownership' >&2
  exit 78
fi
if [ "$(wc -l < "$header_file")" -ne 1 ] || ! LC_ALL=C grep -Eq '^x-cron-secret: [!-~]+$' "$header_file"; then
  echo 'blog cron: invalid credential header format' >&2
  exit 78
fi

# curl reads the HTTP header directly from the protected file. The secret is
# not interpolated into any shell command or process argument.
status=$(curl --noproxy '*' --proto '=http' --request POST \
  --header "@$header_file" \
  --connect-timeout 5 --max-time 120 --retry 0 --max-redirs 0 \
  --silent --show-error --fail --output /dev/null --write-out '%{http_code}' \
  'http://127.0.0.1:3354/api/blog/generate')
if [ "$status" != 201 ]; then
  echo 'blog cron: publication not confirmed by HTTP 201' >&2
  exit 69
fi
