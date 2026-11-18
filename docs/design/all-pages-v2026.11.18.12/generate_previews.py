#!/usr/bin/env python3
"""Generate route-level PC/mobile SVG planning visuals; never touch runtime files."""
import json,re
from pathlib import Path
from collections import Counter
from html import escape

ROOT=Path(__file__).resolve().parents[3]
PAGES=ROOT/"frontend/src/app"
HERE=Path(__file__).resolve().parent
OUT=HERE/"previews"
OUT.mkdir(parents=True,exist_ok=True)
VERSION="v2026.11.18.12"
KO={
".":"홈","admin":"관리자","account":"계정","account-deletion":"계정 삭제",
"notifications":"알림","privacy":"개인정보","security":"보안","analytics":"분석",
"api-health":"API 상태","bank":"은행","blog":"블로그","bonds":"국채",
"catalog":"카탈로그","central-bank":"중앙은행","content":"콘텐츠",
"controls":"기능 제어","discord":"디스코드","economy":"경제 운영",
"scenario-lab":"경제 시나리오","enterprises":"국영기업","fx":"외환",
"help":"도움말","kdic":"예금보험","logs":"로그","activity":"활동",
"delivery":"전송","errors":"오류","integrity":"무결성","system":"시스템",
"market":"시장","ai-news":"AI 뉴스","mint":"조폐국","money-flow":"자금 흐름",
"operations":"운영","storage":"저장소","pension":"연금","safety":"안전",
"seo":"검색 최적화","seo-audit":"SEO 감사","shop":"상점","support":"고객지원",
"treasury":"국고","grants":"지원금","users":"회원","work":"직업",
"advisor":"자산 가이드","announcements":"공지사항","arcade":"아케이드",
"savings-pot":"적금","board":"게시판","businesses":"사업","ventures":"스타트업",
"calculators":"계산기","calendar":"일정","casino":"카지노","chat":"채팅",
"clubs":"클럽","members":"멤버","new":"신규","warfare":"클럽전",
"collections":"컬렉션","dashboard":"대시보드","data-deletion":"데이터 삭제",
"design-preview":"디자인 미리보기","developer":"개발자","features":"기능",
"forgot-password":"비밀번호 찾기","gallery":"갤러리","submit":"등록",
"guide":"가이드","career-mastery":"직업 숙련","dopamine-system":"성장",
"glossary":"용어사전","stock-trading":"주식 거래","virtual-banking":"가상 은행",
"inventory":"보관함","invite":"초대","lobby":"로비","login":"로그인",
"providers":"소셜 인증","marketplace":"마켓","auction":"경매","newspaper":"신문",
"prediction":"예측","profile":"프로필","settings":"설정","progression":"성장",
"prestige":"명성","quests":"퀘스트","register":"회원가입",
"reset-password":"비밀번호 재설정","roadmap":"로드맵","takedown":"게시 중단",
"search":"검색","seasons":"시즌","spaces":"공간","real-estate":"부동산",
"status":"상태","stocks":"주식","alerts":"알림","community":"토론",
"compare":"비교","derivatives":"파생상품","history":"내역","league":"리그",
"portfolio":"포트폴리오","watchlist":"관심종목","terms":"이용약관","tools":"금융 도구",
"wallet":"지갑","transactions":"거래 상세","verify-email":"이메일 확인",
"verify-email-change":"이메일 변경 확인","[locale]":"다국어","[slug]":"상세",
"[preset]":"프리셋","[term]":"용어","[symbol]":"종목 상세","[ticker]":"종목",
"[id]":"상세","[userId]":"사용자 상세","[clubId]":"클럽 상세","[photoId]":"사진 상세",
"[postId]":"게시글 상세","[announcementId]":"공지 상세",
"[transactionId]":"거래 상세","[code]":"초대 링크"}
for key,val in {
"capital-gains-tax-calculator":"양도세 계산기","compound-interest-calculator":"복리 계산기",
"compound-calculator":"복리 계산기","crypto-apy-calculator":"가상자산 수익률 계산기",
"dividend-tax-calculator":"배당세 계산기","farming-calculator":"직업 수익 계산기",
"fire-calculator":"경제적 자유 계산기","gift-tax-calculator":"증여세 계산기",
"goal-wealth-calculator":"목표 자산 계산기","isa-calculator":"ISA 계산기",
"kimchi-premium-calculator":"김치 프리미엄 계산기","loan-interest-calculator":"대출 이자 계산기",
"pension-tax-calculator":"연금 세금 계산기","quant-studio":"퀀트 스튜디오",
"real-estate-calculator":"부동산 계산기","retirement-calculator":"은퇴 계산기",
"salary-calculator":"급여 계산기","stock-calculator":"주식 계산기",
"tax-calculator":"세금 계산기","youth-leap-calculator":"청년도약 계산기"
}.items():KO[key]=val
THEMES={
"home":("#9C83FF","#64B7FF"),
"admin":("#62C4E1","#86DBD6"),
"finance":("#45D8AA","#52A9F4"),
"game":("#AE81FE","#EABD65"),
"social":("#D38BF2","#9BA9FF"),
"tools":("#68CCF5","#A387EF"),
"auth":("#978EF2","#79BFFF"),
"legal":("#A4B4D0","#8FA5BA"),
"member":("#A68AFF","#68B8E5")
}
def group(route):
 f=route.split("/")[0]
 if f=="admin":return "admin"
 if f in ("wallet","stocks","bank","bonds","treasury","central-bank","mint",
          "kdic","fx","pension","enterprises","businesses","advisor","prediction"):return "finance"
 if f in ("work","quests","progression","seasons","arcade","casino","shop",
          "inventory","marketplace","collections","spaces","calendar"):return "game"
 if f in ("board","blog","newspaper","chat","clubs","gallery","lobby","announcements","support","help"):return "social"
 if f in ("tools","calculators") or (f=="[locale]" and "tools" in route):return "tools"
 if f in ("login","register","forgot-password","reset-password","verify-email","verify-email-change"):return "auth"
 if f in ("terms","privacy","safety","data-deletion","account-deletion"):return "legal"
 if f=="[locale]" and "blog" in route:return "social"
 if route==".":return "home"
 return "member"
def title(route):
 if route==".":return "홈 대시보드"
 parts=[KO.get(x,x) for x in route.split("/") if x!="[locale]"]
 if parts and parts[0]=="관리자":return "관리자 · "+" · ".join(parts[1:]) if len(parts)>1 else "관리자 대시보드"
 return " · ".join(parts)
def rect(a,x,y,w,h,fill,stroke="#2B3453",r=14):
 a.append('<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s" stroke="%s"/>'%(x,y,w,h,r,fill,stroke))
def txt(a,x,y,v,n=18,color="#F1F4FF",weight=600,anchor="start"):
 a.append('<text x="%s" y="%s" font-family="Noto Sans KR,Noto Sans CJK KR,Pretendard,Arial,sans-serif" font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>'%(x,y,n,weight,color,anchor,escape(str(v))))
def path(a,x,y,w,h,color):
 points=[(.0,.7),(.1,.6),(.2,.67),(.31,.4),(.42,.49),(.52,.32),(.64,.44),(.75,.19),(.86,.3),(1,.08)]
 p=" ".join("%.1f,%.1f"%(x+i*w,y+j*h) for i,j in points)
 a.append('<polyline points="%s" stroke="%s" stroke-width="3.8" fill="none" stroke-linecap="round"/>'%(p,color))
def labelbox(a,x,y,w,h,name,value,accent):
 rect(a,x,y,w,h,"#1B2339")
 txt(a,x+17,y+26,name,14,"#A8B8D3",500)
 txt(a,x+17,y+58,value,21,"#FFFFFF",760)
 txt(a,x+w-16,y+h-12,"샘플",12,accent,650,"end")
def nav(a,active):
 for i,label in enumerate(["홈","자산","게임","소통","마이"]):
  xx=1265+76*i
  txt(a,xx,870,["⌂","↗","◇","✦","◉"][i],25,"#A793FF" if i==active else "#91A5CB",700,"middle")
  txt(a,xx,895,label,13,"#E8E8FF" if i==active else "#9FAED0",500,"middle")
def svg(route,g,t):
 color,secondary=THEMES[g];a=[]
 a.append('<svg xmlns="http://www.w3.org/2000/svg" width="1660" height="990" viewBox="0 0 1660 990">')
 a.append('<defs><linearGradient id="hero" x1="0" y1="0" x2="1" y2="1"><stop stop-color="%s" stop-opacity=".32"/><stop offset="1" stop-color="%s" stop-opacity=".08"/></linearGradient></defs>'%(color,secondary))
 rect(a,0,0,1660,990,"#0C1020","#0C1020",0)
 txt(a,34,47,"W   Woldeok Moneyverse",27,color,800)
 txt(a,403,47,"ALL-PAGE DESIGN  /  "+VERSION,16,"#B1BBDD")
 txt(a,35,80,t+"   ·   "+("/" if route=="." else "/"+route),18,"#DEE8FB")
 txt(a,1620,83,"CONCEPT ONLY · FAKE DATA · NO RUNTIME CHANGE",13,"#899DBC",500,"end")
 rect(a,28,110,1121,836,"#10172A",color,22)
 rect(a,45,127,192,802,"#131B2D")
 txt(a,64,165,"W  Moneyverse",21,color,760)
 names=["홈","대시보드","지갑","주식","퀘스트","상점","커뮤니티","관리자"]
 if g=="admin":names=["운영 개요","회원 관리","경제 관리","승인 요청","감사 로그","보안 센터","콘텐츠","서비스 상태"]
 if g=="tools":names=["금융 도구","복리 계산","세금 계산","은퇴 계획","주식 도구","가이드","시뮬레이션","지원"]
 for i,word in enumerate(names):
  yy=226+66*i
  if i==0:rect(a,54,yy-31,172,46,"#393160","#6453B0",10)
  txt(a,72,yy,"✦",16,color)
  txt(a,99,yy,word,16,"#F9F8FF" if i==0 else "#A7B7D5")
 rect(a,254,128,875,66,"#162037")
 txt(a,278,171,t[:28],23,"#F8F9FF",760)
 rect(a,855,143,179,35,"#1F2A42")
 txt(a,870,167,"⌕  메뉴 검색",13,"#9FB2D2")
 txt(a,1098,166,"◉",24,color)
 x=265;y=214;w=851
 # Differentiated desktop compositions for major product families
 if g=="auth":
  rect(a,319,226,742,647,"#151E33")
  txt(a,690,327,"W",72,color,900,"middle")
  txt(a,690,387,t,30,"#FFFFFF",820,"middle")
  for i,z in enumerate(["계정 정보","비밀번호"]):
   txt(a,424,458+i*103,z,15,"#BBCBE5")
   rect(a,419,474+i*103,540,59,"#101829","#435276",9)
  rect(a,419,711,540,60,color,color,12)
  txt(a,686,751,"안전하게 계속하기",18,"#FFFFFF",760,"middle")
 elif g=="tools":
  rect(a,x,y,w,100,"url(#hero)",color)
  txt(a,x+22,y+46,t,29,"#FFFFFF",820)
  txt(a,x+22,y+80,"변수 입력과 결과를 명확하게 분리한 계산형 레이아웃",15,"#D2DFFA")
  rect(a,x,y+124,409,487,"#182136")
  rect(a,x+429,y+124,422,487,"#182136")
  txt(a,x+23,y+165,"계산 조건",22,color,750)
  for i,z in enumerate(["금액 (WLD)","기간 (개월)","가정 수익률 (%)"]):
   txt(a,x+24,y+210+i*98,z,15,"#B2C5E3")
   rect(a,x+20,y+224+i*98,366,52,"#0F182C","#465673",10)
   txt(a,x+40,y+258+i*98,["1,000,000","12","3.5"][i],19,"#F3F6FF")
  rect(a,x+20,y+537,366,55,color,color,9)
  txt(a,x+203,y+572,"계산하기",17,"#FFFFFF",760,"middle")
  txt(a,x+450,y+166,"계산 결과 (예시)",22,"#F9FBFF",750)
  txt(a,x+450,y+263,"1,035,000 WLD",30,color,800)
  txt(a,x+452,y+306,"실제 수익 및 투자 보장 아님",14,"#A1B7D5")
  path(a,x+461,y+351,352,160,color)
 elif g=="legal":
  rect(a,x,y,w,104,"url(#hero)",color)
  txt(a,x+25,y+46,t,29,"#F7FBFF",790)
  txt(a,x+26,y+79,"이용자 안내와 권리 보호를 위한 읽기 중심 화면",15,"#CBD9F0")
  rect(a,x,y+123,246,511,"#192139")
  txt(a,x+24,y+164,"문서 목차",21,color,740)
  for i,z in enumerate(["개요","세부 조항","이용자 권리","문의"]):
   txt(a,x+25,y+220+i*72,z,17,"#D2DDF2")
  rect(a,x+262,y+123,589,511,"#172035")
  for i,z in enumerate(["서비스 이용 정책","핵심 기준 및 조건","정보 처리 기준","문의 및 처리 절차"]):
   yy=y+181+i*108
   txt(a,x+285,yy,z,20,"#F5F8FE",750)
   txt(a,x+285,yy+37,"사용자가 확인할 수 있는 정확한 안내문을 배치",14,"#B0C1DA")
 elif g=="game":
  rect(a,x,y,w,154,"url(#hero)",color)
  txt(a,x+24,y+48,t[:30],30,"#FFFFFF",810)
  txt(a,x+25,y+88,"미션 · 보상 · 레벨 성장 경험",17,"#CBD7F0")
  for i,k in enumerate(["오늘의 목표","경험치","보상 상태"]):
   labelbox(a,x+286*i,y+177,272,97,k,["3 / 5 완료","LV. 42","확인 대기"][i],color)
  for i,k in enumerate(["진행 중 콘텐츠","보상과 아이템","이벤트 / 기록"]):
   xx=x+i*286
   rect(a,xx,y+298,272,332,"#1B233D",color if i==0 else "#354061")
   txt(a,xx+21,y+365,["◇","✧","★"][i],48,color,800)
   txt(a,xx+19,y+412,k,20,"#F5F2FF",770)
   txt(a,xx+19,y+449,"참여 조건 · 진행률 · 보상",13,"#A5B3D3")
   rect(a,xx+18,y+550,234,48,"#383258","#6454A2",10)
   txt(a,xx+135,y+581,"자세히 보기",15,"#EAE6FF",700,"middle")
 elif g=="social":
  rect(a,x,y,w,132,"url(#hero)",color)
  txt(a,x+24,y+52,t[:29],30,"#FFFFFF",800)
  txt(a,x+25,y+87,"콘텐츠 읽기 · 참여 · 신고 · 검색",17,"#CDD9F2")
  for i,z in enumerate(["오늘의 새로운 이야기","인기 소식 / 가이드","활동 내역 및 대화","이벤트와 공지"]):
   yy=y+150+i*127
   rect(a,x,yy,w,110,"#182238")
   rect(a,x+17,yy+15,100,79,"url(#hero)",color,12)
   txt(a,x+142,yy+43,z,21,"#F5F7FF",730)
   txt(a,x+143,yy+78,"작성자 · 등록 시간 · 상태 · 참여 정보",15,"#AEC0D6")
   txt(a,x+w-22,yy+64,"›",31,color,760,"end")
 else:
  rect(a,x,y,w,132,"url(#hero)",color)
  txt(a,x+23,y+48,t[:31],29,"#FFFFFF",830)
  txt(a,x+24,y+84,("운영 권한·감사 이력 중심" if g=="admin" else "숫자·기능·상태를 한눈에 확인하는 구성"),16,"#D0DEFA")
  for i,z in enumerate((["상태","검토 항목","권한"] if g=="admin" else ["가상 자산","최근 변동","활동"])):
   labelbox(a,x+286*i,y+153,273,103,z,
            (["확인 필요","대기 중","접근 제한"] if g=="admin" else ["12,580 WLD","+2.41%","진행 중"])[i],color)
  rect(a,x,y+273,548,191,"#182237")
  txt(a,x+21,y+309,"현황 추이  /  예시 데이터",17,"#C9D6EB",660)
  path(a,x+31,y+346,477,91,color)
  rect(a,x+564,y+273,287,191,"#182237")
  txt(a,x+580,y+314,"빠른 작업",19,"#F5F7FF",750)
  for i,z in enumerate(["상태 조회","상세 정보","작업 기록"]):
   txt(a,x+582,y+355+i*32,"◦  "+z,15,"#AFC2DE")
  rect(a,x,y+480,w,190,"#161E32")
  txt(a,x+22,y+522,"최근 기록",21,"#F7FAFF",750)
  for i,z in enumerate(["데이터 원천 상태","권한 및 확인","마지막 작업"]):
   txt(a,x+22,y+561+i*34,z,15,"#CAD8EB")
   txt(a,x+780,y+561+i*34,["조회","검토","표시"][i],14,color,660,"end")
 txt(a,278,915,"본 화면은 설계용 예시이며 실제 회원/금융 데이터를 사용하지 않습니다.",13,"#9EADC9")
 # Phone mockup
 rect(a,1182,110,450,836,"#080D1B",color,40)
 rect(a,1196,125,421,805,"#101729","#364361",28)
 rect(a,1340,136,127,18,"#040711","#040711",10)
 txt(a,1219,163,"9:41",14,"#F2F6FF")
 txt(a,1218,208,"W",35,color,900)
 txt(a,1260,205,"Moneyverse",18,"#F7F5FF",790)
 txt(a,1585,205,"☰",28,"#CCD9FA",650,"end")
 rect(a,1214,230,387,105,"url(#hero)",color,16)
 txt(a,1231,270,t[:21],21,"#FFFFFF",790)
 txt(a,1231,307,"모바일 맞춤 구성 · 시안",14,"#BBD1EB")
 if g=="auth":
  for i,z in enumerate(["계정 정보","비밀번호"]):
   txt(a,1232,390+i*104,z,16,"#C0D1E9")
   rect(a,1232,402+i*104,354,62,"#18223A","#3F506E",12)
  rect(a,1232,646,354,54,color,color,11)
  txt(a,1409,682,"계속하기",18,"#FFFFFF",780,"middle")
 elif g=="tools":
  for i,z in enumerate(["금액 입력","기간 선택","가정 수익률"]):
   rect(a,1214,356+i*105,387,91,"#1B243D")
   txt(a,1233,387+i*105,z,16,"#BED0E8")
   txt(a,1565,425+i*105,["1,000,000","12","3.5%"][i],19,color,750,"end")
  rect(a,1229,701,356,54,color,color,12)
  txt(a,1407,735,"결과 보기",17,"#FFFFFF",770,"middle")
 else:
  options={
  "admin":["운영 상태","승인/권한","로그·감사","오류 처리"],
  "finance":["자산 정보","추이 차트","거래 내역","관련 메뉴"],
  "game":["오늘의 미션","보상 / 아이템","진행 내역","시즌 · 랭킹"],
  "social":["최신 이야기","인기 콘텐츠","공지 / 알림","참여하기"],
  "legal":["정책 개요","세부 조항","이용자 권리","문의"],
  "member":["내 활동","최근 알림","맞춤 기능","내 설정"],
  "home":["오늘의 자산","퀘스트","시장 동향","새 소식"]}
  for i,z in enumerate(options.get(g,options["member"])):
   yy=353+i*113
   rect(a,1214,yy,387,95,"#19233B",color if i==0 else "#33415B",15)
   txt(a,1234,yy+37,z,20,"#F4F6FF",760)
   txt(a,1235,yy+66,"자세한 내용 보기  ›",13,"#B1C5DC")
 rect(a,1211,829,392,78,"#141B30","#384562",21)
 nav(a,0)
 txt(a,1408,927,"390px 모바일 예시 · 실제 서비스 아님",12,"#91A2BE",500,"middle")
 a.append("</svg>")
 return "\n".join(a)+"\n"

main_routes={str(p.parent.relative_to(PAGES)) for p in PAGES.rglob("page.tsx") if "api" not in p.parts and "app-api" not in p.parts}
# Two routes exist in the mini-PC working checkout but are not yet in GitHub main.
# Keep them clearly provisional, with a screenshot concept rather than claiming release.
BRANCH_ONLY={"admin/logs/errors", "calculators"}
routes=sorted(main_routes | BRANCH_ONLY)
if not routes:raise RuntimeError("page routes not found")
records=[]
for route in routes:
 g=group(route);name=("home" if route=="." else re.sub("[^a-zA-Z0-9_-]","-",route))+".svg"
 (OUT/name).write_text(svg(route,g,title(route)),encoding="utf-8")
 records.append({"route":"/" if route=="." else "/"+route,"title_ko":title(route),"family":g,"image":"previews/"+name,"desktop":True,"mobile":True,"status":"BRANCH_ONLY_CONCEPT" if route in BRANCH_ONLY and route not in main_routes else "MAIN_ROUTE_CONCEPT"})
data={"version":VERSION,"source":"frontend/src/app/**/page.tsx (excluding API routes)","count":len(records),"github_main_count":len(main_routes),"branch_only_routes":sorted(BRANCH_ONLY-main_routes),"admin_count":sum(r["family"]=="admin" for r in records),"records":records}
(HERE/"routes-manifest.json").write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
lines=["# All-Page PC + Mobile Visual Concepts / 전체 페이지 시안","",
"Version: "+VERSION+" | Status: PLANNING ONLY | Source: frontend/src/app/**/page.tsx","",
"One SVG for each of 178 GitHub main routes PLUS 2 explicitly flagged mini-PC-only routes shows BOTH desktop and mobile concept screens.",
"All values are synthetic; images are planning mockups, NOT screenshots or functional/production verification.","",
"## Counts / 개수",""]
for g,count in sorted(Counter(r["family"] for r in records).items()):lines.append("- "+g+": "+str(count))
lines+=["","## Complete page gallery / 전체 페이지 목록","","| Route | Screen | Family | Preview |","|---|---|---|---|"]
for r in records:lines.append("| "+r["route"]+" | "+r["title_ko"]+" | "+r["family"]+" ("+r["status"]+") | [SVG]("+r["image"]+") |")
(HERE/"README.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
parts=["<!doctype html><html lang='ko'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Moneyverse all page concepts</title><style>body{margin:0;background:#0c1120;color:#fafbff;font-family:system-ui,'Noto Sans KR',sans-serif}header{position:sticky;top:0;background:#101829;padding:24px;border-bottom:1px solid #40496a}input{padding:12px;background:#1c2640;color:white;border:1px solid #65719b;width:min(650px,90%)}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(390px,1fr));gap:16px;padding:22px}article{border:1px solid #313f5d;border-radius:17px;background:#172037;overflow:hidden}img{width:100%;height:auto}article div{padding:12px}small{color:#aabedb}a{color:#b5afff}</style></head><body><header><h1>월덕 머니버스 · 180개 PC/모바일 화면 시안</h1><p>화면별 구상 이미지이며 운영 화면과 서버를 변경하지 않았습니다.</p><input id='q' placeholder='화면·경로 검색'></header><main>"]
for r in records:
 label=escape(r["title_ko"]);url=escape(r["route"]);path=r["image"]
 parts.append("<article data-search='"+label+" "+url+"'><a href='"+path+"'><img loading='lazy' src='"+path+"' alt='"+label+" PC 모바일 시안'></a><div><strong>"+label+"</strong><br><small>"+url+" · "+r["family"]+"</small></div></article>")
parts.append("</main><script>document.querySelector('#q').oninput=e=>document.querySelectorAll('article').forEach(a=>a.hidden=!a.dataset.search.toLowerCase().includes(e.target.value.toLowerCase()))</script></body></html>")
(HERE/"gallery.html").write_text("\n".join(parts)+"\n",encoding="utf-8")
print(json.dumps({"count":len(records),"admin":data["admin_count"],"family":dict(Counter(r["family"] for r in records)),"svg_count":len(list(OUT.glob("*.svg")))},ensure_ascii=False))
