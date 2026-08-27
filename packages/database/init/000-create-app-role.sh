#!/bin/sh
set -eu
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set=ON_ERROR_STOP=1 --set=app_db_password="$APP_DB_PASSWORD" <<'SQL'
CREATE ROLE moneyverse_app LOGIN PASSWORD :'app_db_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
SQL
