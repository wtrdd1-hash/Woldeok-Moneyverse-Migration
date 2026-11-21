#!/usr/bin/env python3
"""A protected administrator preview of the exact-main artifact while public documents stay in maintenance."""
from pathlib import Path

PREFIX='/_mv/nov18-rebuild-qa/'
INCLUDE=Path('/etc/nginx/snippets/moneyverse-nov18-rebuild-qa-20261121.conf')

def patch_site(before):
    anchor='    include /etc/nginx/snippets/moneyverse-nov18-maintenance-20261121.conf;\n'
    production='    listen 80 default_server;\n'+anchor
    if before.count(production)!=1 or str(INCLUDE) in before:raise ValueError('Expected active Production maintenance anchor is not unique')
    return before.replace(production,production+'    include '+str(INCLUDE)+';\n',1)

def render_config(port=4830):
    if not isinstance(port,int) or not 1<=port<=65535:raise ValueError('Invalid fixed loopback port')
    upstream='http://127.0.0.1:'+str(port)
    common='''
 if ($request_method !~ ^(GET|HEAD)$) { return 405; }
 auth_request /__mv_p0_admin_auth_20261118;
 proxy_pass_request_headers off;
 proxy_pass_request_body off;
 proxy_set_header Host easy-scraping.com;
 proxy_set_header Accept $http_accept;
 proxy_set_header Accept-Language $http_accept_language;
 proxy_set_header RSC $http_rsc;
 proxy_set_header X-Forwarded-Proto https;
 proxy_set_header X-Forwarded-Host easy-scraping.com;
 proxy_connect_timeout 2s;
 proxy_read_timeout 15s;
 proxy_hide_header Set-Cookie;
 proxy_hide_header Cache-Control;
 proxy_hide_header X-Robots-Tag;
 add_header Cache-Control "private, no-store" always;
 add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
 add_header X-MV-Rebuild-QA "nov18-20261121" always;
'''
    return 'location = '+PREFIX+'admin-shop {\n'+common+' proxy_set_header Cookie $http_cookie;\n proxy_set_header Accept-Encoding "";\n proxy_pass '+upstream+'/admin/shop;\n sub_filter_once off;\n sub_filter \'href="/assets/\' \'href="'+PREFIX+'assets/\';\n sub_filter \'src="/assets/\' \'src="'+PREFIX+'assets/\';\n}\nlocation ^~ '+PREFIX+'assets/ {\n'+common+' proxy_set_header Cookie "";\n proxy_pass '+upstream+'/assets/;\n}\nlocation ^~ '+PREFIX+' {\n add_header Cache-Control "private, no-store" always;\n return 404;\n}\n'
