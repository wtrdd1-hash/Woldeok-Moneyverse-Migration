#!/usr/bin/env python3
"""Create a public-safe audit board without assuming HTTP 200 means working UI.

Input is the v26 180-source-URL inventory (redacted), not user data.
Only add VERIFIED native Spring UI routes for which actual Stage/Production
Chromium, real APIs, and signed-source tests exist. Future pages remain unverified.
"""
import argparse
from pathlib import Path
import json

VERIFIED={
    '/status': {'version':'v2026.11.19.29.1','frontend':'Spring MVC + Thymeleaf + public PostgreSQL content-status collector','qa':'Real public 3 source rows, stale->unknown policy, Chromium EN/KO 320/390/1440, live HTTPS, 232 JUnit'},
    '/tools/compound-calculator': {'version':'v2026.11.18.28.1','frontend':'Spring MVC + Thymeleaf','qa':'Chromium EN/KO 320/390/1440, no-JS form, 226 JUnit, real HTTPS'},
    '/tools/stock-calculator': {'version':'v2026.11.18.28.1','frontend':'Spring MVC + Thymeleaf','qa':'Chromium EN/KO 320/390/1440, no-JS form, 226 JUnit, real HTTPS'},
    '/stocks': {'version':'v2026.11.18.27.1','frontend':'Spring MVC','qa':'Canonical real 10 stocks, Chromium EN/KO 320/390/1440, real HTTPS'},
}

def main():
    p=argparse.ArgumentParser();p.add_argument('--inventory',type=Path,required=True);p.add_argument('--out',type=Path,required=True);args=p.parse_args()
    d=json.loads(args.inventory.read_text());source=d['routes'];assert len(source)==180
    routes=[];seen=set()
    for row in source:
        path=row['route'];assert path not in seen,('duplicate',path);seen.add(path)
        verified=VERIFIED.get(path)
        routes.append({'sourceNextRoute':path,'verification':'VERIFIED_SPRING_RUNTIME_AND_DESIGN' if verified else 'NOT_CERTIFIED',
                       'expectedProductionRenderer':'Spring Boot MVC / Thymeleaf',
                       'knownPriorStatus':row.get('status'),
                       'dynamicPathParametersNeedFixture':bool(row['parameterized']),
                       'verifiedDetails':verified})
    assert all(p in seen for p in VERIFIED)
    output={'ownerDirective':'All web frontend must be Spring Boot: v2026.11.19.29',
            'scope':'Next route source inventory is NOT same as all live runtime URLs or full positive API tests',
            'totalSourceRoutes':len(routes),'verifiedSpringRenderedRedesign':len(VERIFIED),
            'notYetCertified':len(routes)-len(VERIFIED),
            'knownSourceApiUnavailable503Aliases':28,
            'importantNote':'No generic Next home HTML200, anonymous401 or failclosed503 counts as feature acceptance. New Admin v17 and global chat not complete.',
            'routes':routes}
    args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
    print('PUBLIC_SPRING_UI_MIGRATION_BOARD_OK',len(routes),'nativeVerified',len(VERIFIED),'uncertified',len(routes)-len(VERIFIED))

if __name__=='__main__':main()
