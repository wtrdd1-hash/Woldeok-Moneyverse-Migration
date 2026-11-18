#!/usr/bin/env python3
"""Generate clearly labeled desktop/mobile admin + floating support concept SVGs."""
from pathlib import Path
from html import escape

OUT=Path(__file__).resolve().parent
OUT.mkdir(parents=True,exist_ok=True)
def rect(a,x,y,w,h,fill="#151F38",stroke="#394866",r=15):
 a.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}"/>')
def text(a,x,y,label,size=17,color="#EBF2FF",weight=600,anchor="start"):
 a.append(f'<text x="{x}" y="{y}" font-family="Pretendard, Noto Sans KR, Arial, sans-serif" font-size="{size}" font-weight="{weight}" fill="{color}" text-anchor="{anchor}">{escape(str(label))}</text>')
def circle(a,x,y,r,fill,stroke="#6F54A7"):
 a.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')
def graph(a,x,y,w,h):
 pts=[(0,.8),(.1,.63),(.19,.69),(.29,.43),(.38,.52),(.46,.36),(.57,.45),(.65,.25),(.73,.35),(.82,.1),(.92,.23),(1,.05)]
 for k in range(1,4):
  yy=y+h*k/4
  a.append(f'<line x1="{x}" x2="{x+w}" y1="{yy}" y2="{yy}" stroke="#263959"/>')
 a.append('<polyline fill="none" stroke="#AD8FFF" stroke-width="4" stroke-linecap="round" points="'+
 ' '.join(f'{x+i*w:.0f},{y+j*h:.0f}' for i,j in pts)+'"/>')
def svgroot(w,h):
 return [f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">',
 '''<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5E469F"/><stop offset=".55" stop-color="#262653"/><stop offset="1" stop-color="#102039"/></linearGradient><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7B67ED"/><stop offset="1" stop-color="#B45AEC"/></linearGradient></defs>''']
desktop=svgroot(1660,980)
rect(desktop,0,0,1660,980,"#0B1122","#0B1122",0)
rect(desktop,0,0,228,980,"#111A2E","#243452",0)
text(desktop,27,53,"W",40,"#9E81FF",900)
text(desktop,83,45,"Woldeok",20,"#F7F9FF",850)
text(desktop,83,68,"Moneyverse",20,"#9E81FF",850)
text(desktop,25,115,"ADMINISTRATOR",12,"#91A7CD",750)
nav=["대시보드","회원 관리","경제 / 자산","아이템 관리","콘텐츠 관리","거래 / 시장","통계 / 분석","시스템 로그","보안 / 권한","고객지원"]
for i,n in enumerate(nav):
 y=159+i*64
 if i==0:rect(desktop,14,y-29,199,47,"#483578","#6752AA",12)
 text(desktop,29,y,["⌂","♙","▣","◈","☷","↗","⌁","☰","◇","✉"][i],24,"#BDA9FC")
 text(desktop,64,y-2,n,16,"#F7F6FF" if i==0 else "#AEBED8",670)
rect(desktop,243,16,1398,77,"#131C31")
text(desktop,267,47,"MONEYVERSE / ADMIN CONSOLE",13,"#B29EFF",800)
text(desktop,267,78,"관리자 대시보드",26,"#F8FAFF",850)
rect(desktop,1226,31,198,44,"#2B2A46","#584E80",13)
text(desktop,1326,58,"실측 API 미연동",14,"#F2C886",700,"middle")
circle(desktop,1607,53,20,"#5A4B8C")
text(desktop,1607,59,"W",20,"white",840,"middle")
text(desktop,270,136,"운영 현황과 권한 기록을 정확하게 확인하는 관제 센터",18,"#B7C5DD")
for i,(k,v,sub) in enumerate([
 ("회원 관리","데이터 조회 전","실제 회원 API 확인 필요"),
 ("가상 경제 / 원장","검증 필요","금융 원장 출처 표시"),
 ("고객 문의","연동 전","대기/담당/종료 상태"),
 ("시스템 상태","미확인","Nginx · Spring · DB")]):
 x=260+i*339
 rect(desktop,x,170,324,123,"#202B46","#4E4B78",18)
 desktop.append(f'<rect x="{x}" y="170" width="324" height="3" fill="{["#A98AFF","#64BDF5","#57D9BD","#F3C77C"][i]}"/>')
 text(desktop,x+17,205,k,17,"#B8C9E3")
 text(desktop,x+17,252,v,27,"#F9F9FF",800)
 text(desktop,x+17,278,sub,13,"#9AAFCF")
rect(desktop,260,319,800,338,"#18243D")
text(desktop,280,354,"운영 모니터링 · 디자인 샘플",20,"#F7FBFF",800)
text(desktop,282,380,"실제 수치가 아닌 시안입니다",14,"#98AFCF")
graph(desktop,287,418,743,191)
rect(desktop,1075,319,563,338,"#172137")
text(desktop,1099,355,"서버·API 점검 목록",21,"#F7F8FF",800)
for i,n in enumerate(["웹 서버 (Nginx)","Java Spring Boot","PostgreSQL DB","Discord 서비스","고객지원 / 채팅"]):
 y=401+i*45
 text(desktop,1100,y,n,16,"#D6E4F8")
 text(desktop,1610,y,"미검증",14,"#F5CB8B",750,"end")
 desktop.append(f'<line x1="1099" x2="1613" y1="{y+15}" y2="{y+15}" stroke="#34415C"/>')
rect(desktop,260,679,1367,231,"#17213A")
text(desktop,285,716,"빠른 관리 바로가기",22,"#F4F6FF",820)
for i,k in enumerate(["회원 / 권한","거래 / 자산","상점 / 아이템","공지 / 블로그","로그 / 보안","고객지원"]):
 x=287+i*218
 rect(desktop,x,745,200,110,"#2B2B52","#59508F",15)
 text(desktop,x+100,789,["♙","▤","◈","✉","☷","☏"][i],30,"#C7AFFF",750,"middle")
 text(desktop,x+100,828,k,16,"#F6F4FF",740,"middle")
circle(desktop,1581,871,33,"url(#b)","#D2B7FF")
text(desktop,1581,884,"☏",29,"white",800,"middle")
text(desktop,1565,932,"전 페이지 문의",15,"#D4BFFE",750,"end")
rect(desktop,1071,134,565,164,"url(#g)","#715DA9",18)
text(desktop,1098,172,"●  전역 둥근 채팅 / 문의",20,"#FFFFFF",830)
text(desktop,1099,206,"모든 페이지에서 탭 전환·문의 분류",17,"#DAD7FA")
text(desktop,1099,231,"로그인·권한·개인정보 분리",15,"#C1C8E7")
text(desktop,1099,271,"실제 연동은 Spring 보안 게이트 이후",14,"#F6CE92",700)
text(desktop,270,948,"v2026.11.18.13  ·  DESIGN REFERENCE ONLY  ·  SAMPLE UI, NOT A RUNNING ADMIN SERVER",13,"#91A7C7")
desktop.append("</svg>")
(OUT/"admin-console-desktop.svg").write_text("\n".join(desktop)+"\n",encoding="utf-8")

mobile=svgroot(470,1000)
rect(mobile,0,0,470,1000,"#0D1325","#0D1325",0)
rect(mobile,16,18,438,966,"#111A2D","#6B55A6",37)
rect(mobile,171,31,129,24,"#080A14","#080A14",13)
text(mobile,40,64,"9:41",17,"#F2F4FF",750)
text(mobile,404,64,"◉ ▰",16,"#EDF4FF")
text(mobile,45,114,"W",37,"#A88CFF",900)
text(mobile,92,106,"Woldeok Moneyverse",20,"#F9F7FF",800)
text(mobile,423,106,"☰",28,"#DAE2FA",800,"end")
text(mobile,43,168,"관리자 대시보드",29,"#FCFAFF",850)
text(mobile,43,196,"샘플 디자인 · 실제 관리자 데이터 미연동",14,"#9EAFD2")
for i,(label,number) in enumerate([("회원 현황","조회 전"),("경제 원장","검증 필요"),("고객 문의","연동 전"),("서버 상태","미확인")]):
 x=38+(i%2)*199;y=224+(i//2)*111
 rect(mobile,x,y,191,99,"#202B45","#4A416B",14)
 text(mobile,x+12,y+31,label,15,"#B6C9E3")
 text(mobile,x+12,y+67,number,23,"#F8FBFF",760)
rect(mobile,38,458,390,170,"#17223B")
text(mobile,56,492,"운영 추이 (예시)",17,"#F7F9FF",800)
graph(mobile,60,527,344,81)
rect(mobile,38,646,390,154,"#1D2745")
text(mobile,57,681,"시스템 확인",18,"#F0F4FF",790)
for i,k in enumerate(["Nginx","Java Spring","PostgreSQL"]):
 y=716+i*28
 text(mobile,60,y,k,15,"#CAD8EC")
 text(mobile,407,y,"미검증",13,"#F6CD8C",670,"end")
rect(mobile,35,910,399,62,"#172138","#4B5478",24)
for i,k in enumerate(["홈","관리","원장","문의","MY"]):
 x=69+81*i
 text(mobile,x,939,["⌂","♙","▤","☏","◉"][i],22,"#A994F7",730,"middle")
 text(mobile,x,960,k,12,"#D3DFF2",500,"middle")
circle(mobile,408,860,29,"url(#b)","#E7D1FF")
text(mobile,408,873,"☏",26,"white",760,"middle")
mobile.append("</svg>")
(OUT/"admin-console-mobile.svg").write_text("\n".join(mobile)+"\n",encoding="utf-8")
print("REFERENCE_SVGS",len(list(OUT.glob("*.svg"))))
