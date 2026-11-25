# Production Next frontend cutover (2026-11-24)

Owner instruction: promote to Production after security and real functional tests pass.

- Service: `moneyverse-next-frontend-v20261124` (port 55476), release `next-frontend-v20261124-4dd2e699fd20`, env `/etc/moneyverse/next-frontend-v20261124.env` (copy of the blog Next env with PORT=55476 and VERIFIED_HELP_CENTER_V1=true). Backend: unchanged production Spring 4550.
- nginx: new file `/etc/nginx/sites-available/moneyverse-next-prod-v20261124` (symlinked in sites-enabled), `server_name easy-scraping.com www.easy-scraping.com`. Pages and the 106 Next BFF routes go to Next; every other `/api/` to Spring 4550; socket.io, discord integrations unchanged (9092); actuator denied; `/api/v1/blog/verified` to the read-only blog reader 55470 (the legacy route to 9092 answered 400).
- The legacy default server block is untouched. Backups: `/var/backups/moneyverse-next-prod-cutover-20261124/`.

Rollback (seconds, no restart of Spring):

```sh
sudo rm /etc/nginx/sites-enabled/moneyverse-next-prod-v20261124
sudo nginx -t && sudo nginx -s reload
```

## 2026-11-24 DESIGN180 promotion (blue/green)

- Green: `moneyverse-next-frontend-green-v20261124` (port 55478), release `next-frontend-v20261124-7f1af9b4cfb1`, env `/etc/moneyverse/next-frontend-green-v20261124.env`.
- Blue (previous G2 release `4dd2e699fd20`) keeps running on 55476 for rollback.
- nginx: the three `127.0.0.1:55476` upstreams in the easy-scraping.com block now point at 55478 (graceful reload, no downtime). Backup of the previous block: `/var/backups/moneyverse-next-prod-cutover-20261124/nginx-next-prod.before-d180`.

Rollback to the previous frontend (seconds):

```sh
sudo sed -i 's#127.0.0.1:55478#127.0.0.1:55476#g' /etc/nginx/sites-available/moneyverse-next-prod-v20261124
sudo nginx -t && sudo nginx -s reload
```
