#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-http://127.0.0.1:3188}
probe() { local expected=$1 path=$2 code; code=$(curl -s -m 6 -o /tmp/mv-p0-smoke-body -w '%{http_code}' "$BASE$path"); [[ "$code" == "$expected" ]] || { echo "FAIL $path expected $expected got $code" >&2; return 1; }; echo "PASS $path $code"; }
probe 302 /admin
probe 302 /admin/
probe 302 /admin/logs
probe 200 /login
probe 200 /api/viewer
probe 401 /api/v1/admin/me
probe 200 /_next/static/css/9d01d690ff7707f0.css
probe 200 /_next/static/chunks/app/admin/layout-fe7b78ca88628906.js
