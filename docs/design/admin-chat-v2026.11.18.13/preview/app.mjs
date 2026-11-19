import {
  createChatState,
  transitionChatState,
  validateDraft,
  normalizePageContext
} from './chat-core.mjs';

// This preview intentionally does not import or call the real member-support APIs.
// No fetch, no localStorage, no service worker, no cookies and no message delivery.
const ROUTES = Object.freeze([
  { path:'/admin', label:'운영 대시보드', icon:'⌂', kind:'admin' },
  { path:'/admin/users', label:'회원 관리', icon:'♙', kind:'admin' },
  { path:'/admin/economy', label:'경제 / 원장', icon:'▥', kind:'admin' },
  { path:'/admin/shop', label:'아이템 관리', icon:'◈', kind:'admin' },
  { path:'/admin/analytics', label:'통계 / 분석', icon:'⌁', kind:'admin' },
  { path:'/admin/logs', label:'시스템 로그', icon:'☷', kind:'admin' },
  { path:'/admin/security', label:'권한 / 보안', icon:'◇', kind:'admin' },
  { path:'/admin/support', label:'고객지원 관리', icon:'✉', kind:'admin' },
  { path:'/wallet', label:'회원 지갑', icon:'▤', kind:'member' },
  { path:'/quests', label:'퀘스트', icon:'✧', kind:'member' },
  { path:'/board', label:'커뮤니티', icon:'☰', kind:'member' },
  { path:'/support', label:'고객센터', icon:'☏', kind:'member' }
]);
const ROUTES_BY_PATH=new Map(ROUTES.map(route=>[route.path,route]));
const DEFAULT_ROUTE='/admin';
const contextNames=Object.freeze({
  home:'홈',admin:'관리자',wallet:'지갑 / 금융',stocks:'주식',shop:'아이템 / 상점',
  quests:'퀘스트',community:'커뮤니티',account:'계정',support:'고객지원',other:'기타'
});
const categoryNames=Object.freeze({
  other:'일반 문의',account:'계정 및 로그인',ledger:'WLD 원장 / 잔액',
  trading:'주식 / 거래',item:'아이템 / 퀘스트',bug:'버그 / 오류'
});
let state=createChatState({authenticated:true,initialPath:DEFAULT_ROUTE});
let activeRoute=readInitialRoute();

function $(id){return document.getElementById(id);}
function e(tag,attrs={},text){
  const node=document.createElement(tag);
  for(const [name,value] of Object.entries(attrs)){
    if(name==='class') node.className=value;
    else if(name==='data-route') node.dataset.demoRoute=value;
    else if(name==='data-value') node.dataset.value=value;
    else node.setAttribute(name,String(value));
  }
  if(text!==undefined) node.textContent=String(text);
  return node;
}
function readInitialRoute(){
  const raw=new URLSearchParams(window.location.search).get('page');
  return ROUTES_BY_PATH.has(raw)?raw:DEFAULT_ROUTE;
}
function pageMeta(){
  return ROUTES_BY_PATH.get(activeRoute) ?? ROUTES_BY_PATH.get(DEFAULT_ROUTE);
}
function actionButton(label,route,style='outline-button'){
  return e('button',{type:'button','data-route':route,class:style},label);
}
function heading(parent,title,description,button){
  const row=e('div',{class:'page-intro'});
  const left=e('div');
  left.append(e('h1',{},title),e('p',{},description));
  row.append(left);
  if(button){
    const right=e('div',{class:'page-action'});
    right.append(button); row.append(right);
  }
  parent.append(row);
}
function metric(label,value,description){
  const item=e('section',{class:'metric','aria-label':label});
  item.append(e('div',{class:'label'},label),e('div',{class:'value'},value),e('div',{class:'detail'},description));
  return item;
}
function panel(title,note){
  const node=e('section',{class:'panel'});
  const h=e('h2');
  h.append(e('span',{'aria-hidden':'true'},'✦'),document.createTextNode(' '+title));
  node.append(h);
  if(note) node.append(e('p',{class:'panel-sub'},note));
  return node;
}
function chart(){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 500 190');
  svg.setAttribute('class','chart-svg');
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label','샘플 데이터 선 그래프. 실제 이용 통계가 아닙니다.');
  const lines=['40','80','120','160'];
  for(const y of lines){
    const line=document.createElementNS(svg.namespaceURI,'line');
    for(const [k,v] of Object.entries({x1:'15',x2:'484',y1:y,y2:y,stroke:'#344461','stroke-width':'1'})){
      line.setAttribute(k,v);
    }
    svg.append(line);
  }
  const path=document.createElementNS(svg.namespaceURI,'polyline');
  path.setAttribute('points','16,152 50,143 79,149 115,112 147,126 187,103 219,113 256,84 288,91 328,61 360,80 398,50 434,56 484,29');
  path.setAttribute('fill','none');
  path.setAttribute('stroke','#ab86ff');
  path.setAttribute('stroke-width','4');
  path.setAttribute('stroke-linecap','round');
  svg.append(path);
  return svg;
}
function adminHome(parent){
  heading(parent,'관리자 대시보드','서비스·회원·경제·보안 상황을 한 곳에서 관리하는 디자인 예시입니다.',
    actionButton('전체 로그 보기','/admin/logs','primary-button'));
  const metrics=e('div',{class:'metrics'});
  [
    ['회원 현황','조회 전','서버 권한 및 실측 API 필요'],
    ['경제 원장','검증 필요','실제 원장 연결 전에는 잔액 숨김'],
    ['고객 문의','연동 전','회원 지원 목록 실측 없음'],
    ['시스템 상태','미확인','Nginx · Spring · DB 검증 전']
  ].forEach(item=>metrics.append(metric(...item)));
  parent.append(metrics);
  const grid=e('div',{class:'panel-grid'});
  const main=panel('운영 현황 추이','디자인 샘플 시계열 · 실제 활성 사용자 통계가 아닙니다');
  main.classList.add('chart-panel');main.append(chart());
  const system=panel('시스템 컴포넌트','실제 연결 전에는 정상이라고 표시하지 않습니다.');
  const ul=e('ul',{class:'system-list'});
  for(const name of ['Nginx','Java Spring API','PostgreSQL','Discord Gateway','고객지원/채팅']){
    const li=e('li');li.append(e('span',{},name),e('span',{class:'substatus'},'미검증'));
    ul.append(li);
  }
  system.append(ul);
  const issues=panel('운영 검토 항목','담당자가 확인할 차단 요건');
  const issueItems=e('div',{class:'issue-list'});
  [
    ['인증 확인','사용자 헤더 위조 방지 / 세션 결속'],
    ['문의 성공 판정','실제 DB 영수증 확인 후에만 성공 처리'],
    ['관리자 권한','접근권한 · OTP · 로그 무결성'],
    ['현행 UI 보호','기존 프론트엔드 변경 없이 격리 개발']
  ].forEach(([title,sub])=>{
    const item=e('div',{class:'issue-item'});
    item.append(e('strong',{},title),e('small',{},sub)); issueItems.append(item);
  });
  issues.append(issueItems);grid.append(main,system,issues);
  const quick=panel('주요 관리 메뉴','각 카드에서 관리 페이지 디자인 미리보기로 이동합니다.');
  quick.classList.add('wide-panel');
  const links=e('div',{class:'quick-actions'});
  for(const r of ROUTES.filter(r=>r.kind==='admin'&&r.path!=='/admin')){
    const b=actionButton('',r.path);
    b.append(e('b',{'aria-hidden':'true'},r.icon),document.createTextNode(r.label));
    links.append(b);
  }
  quick.append(links);
  quick.append(e('p',{class:'demo-note'},'모든 수치·차트는 디자인 샘플입니다. 민감한 관리자 작업 및 데이터 수정 API는 연결되지 않았습니다.'));
  grid.append(quick);parent.append(grid);
}
function otherPage(parent){
  const item=pageMeta();
  const isAdmin=item.kind==='admin';
  heading(parent,item.label+' · 화면 시안',
    isAdmin?'승인·권한·감사 경계를 지키는 관리자 UI 후보 화면입니다.':'사이트 어느 위치에서나 오른쪽 아래 문의 동그라미가 유지됩니다.',
    e('button',{type:'button','data-open-chat':'true',class:'primary-button'},'여기서 문의 열기'));
  const metricBox=e('div',{class:'metrics'});
  (isAdmin?[
    ['상태','미확인','권한·원천 데이터 필요'],
    ['현재 화면','설계 중','실제 관리자 API 미연동'],
    ['변경 기록','조회 전','감사 로그 필요'],
    ['검증','보류','정식 Test 환경 별도']
  ]:[
    ['내 활동','데모 화면','개인정보 조회 없음'],
    ['서비스 상태','조회 전','서버 실측 필요'],
    ['바로가기','문의 / 채팅','화면 이동 후에도 열림'],
    ['개인 정보','수집 안 함','문의 글 미전송']
  ]).forEach(k=>metricBox.append(metric(...k)));
  parent.append(metricBox);
  const grid=e('div',{class:'panel-grid'});
  const data=panel(isAdmin?'검토 대상 목록':'상세 콘텐츠 카드',
    '실제 사용자·거래·아이템·채팅 정보가 아닌 디자인용 항목입니다.');
  const table=e('div',{class:'table-scroll'});
  const t=e('table',{class:'data-table'});
  const tr=e('tr');
  ['구분','상태','권한 / 원천','작업'].forEach(z=>tr.append(e('th',{scope:'col'},z)));
  const th=e('thead');th.append(tr);t.append(th);
  const tb=e('tbody');
  ['일반 조회','상태 업데이트','검토 기록','권한 확인','사용자 요청'].forEach((row,i)=>{
    const tr=e('tr');
    tr.append(e('td',{},row),e('td',{},'확인 필요'),e('td',{},'샘플 데이터'),e('td',{},i===0?'읽기 전용':'미연결'));
    tb.append(tr);
  });
  t.append(tb);table.append(t);data.append(table);grid.append(data);
  const second=panel('주요 정보','프리뷰에서 안전한 읽기 상태만 제공');
  second.append(e('p',{class:'preview-status'},'ⓘ 실제 API 연결을 하지 않았습니다. 정보 누락을 성공 또는 0으로 표시하지 않습니다.'));
  const side=panel('도움말','채팅 아이콘을 통해 어디서나 문의 창을 열 수 있습니다.');
  side.append(e('p',{class:'panel-sub'},'PC · 모바일에서 입력 중인 초안을 유지하고 카테고리/문의·채팅 탭 전환을 체험하세요.'));
  side.append(e('p',{class:'demo-note'},'디자인 미리보기에서 모든 메시지는 미전송 상태입니다.'));
  grid.append(second,side);parent.append(grid);
}
function renderPage(){
  const root=$('page-content');
  root.replaceChildren();
  $('current-title').textContent=pageMeta().label;
  if(activeRoute==='/admin')adminHome(root);else otherPage(root);
  for(const target of [$('admin-nav'),$('mobile-menu')]){
    target.replaceChildren();
    for(const route of ROUTES){
      const b=e('button',{type:'button',class:'nav-item'+(activeRoute===route.path?' active':''),'data-route':route.path});
      b.append(e('span',{class:'nav-symbol','aria-hidden':'true'},route.icon),
        document.createTextNode(route.label));
      if(activeRoute===route.path) b.setAttribute('aria-current','page');
      target.append(b);
    }
  }
}
function syncWidget(){
  const isOpen=state.open;
  $('chat-panel').hidden=!isOpen;
  $('chat-launcher').setAttribute('aria-expanded',String(isOpen));
  $('tab-support').setAttribute('aria-selected',String(state.tab==='support'));
  $('tab-direct').setAttribute('aria-selected',String(state.tab==='direct'));
  $('view-support').hidden=state.tab!=='support';
  $('view-direct').hidden=state.tab!=='direct';
  $('context-label').textContent=contextNames[state.context]??'기타';
  $('inquiry-category').value=state.category;
  $('draft-label').textContent=state.tab==='direct'?'1:1 메시지 내용':'문의 내용';
  const draft=state.tab==='direct'?state.directDraft:state.draft;
  if($('chat-draft').value!==draft)$('chat-draft').value=draft;
  $('character-counter').textContent=Array.from(draft.trim()).length+' / 1000';
  $('login-warning').hidden=state.authenticated;
  $('chat-preview-submit').disabled=!state.authenticated||!validateDraft(draft).ok;
  $('chat-response').textContent=state.notice?.message??'';
  const auth=$('auth-button');
  auth.textContent=state.authenticated?'로그인 상태: 시뮬레이션 (클릭하면 로그아웃)':'로그아웃 상태: 시뮬레이션 (클릭하면 로그인)';
  $('auth-button-mobile').textContent=state.authenticated?'♙':'♧';
  $('auth-button-mobile').setAttribute('aria-label',state.authenticated?'미리보기 로그아웃':'미리보기 로그인');
}
function changeRoute(route){
  if(!ROUTES_BY_PATH.has(route))return;
  activeRoute=route;
  window.history.pushState({page:route},'', '?page='+encodeURIComponent(route));
  state=transitionChatState(state,{type:'NAVIGATE',path:route});
  renderPage();syncWidget();
  $('mobile-menu').hidden=true;
  $('mobile-menu-button').setAttribute('aria-expanded','false');
}
function openChat(){
  state=transitionChatState(state,{type:'OPEN'});
  syncWidget();
  $('tab-'+state.tab).focus();
}
function closeChat(){
  state=transitionChatState(state,{type:'CLOSE'});
  syncWidget();
  $('chat-launcher').focus();
}
function applyTab(tab){
  state=transitionChatState(state,{type:'SWITCH_TAB',tab});
  syncWidget();
  $('tab-'+tab).focus();
}
renderPage();
state=transitionChatState(state,{type:'NAVIGATE',path:activeRoute});
syncWidget();

document.addEventListener('click',event=>{
  const routeButton=event.target.closest('[data-demo-route],[data-route]');
  if(!routeButton)return;
  const route=routeButton.dataset.route??routeButton.dataset.demoRoute;
  if(!route)return;
  event.preventDefault();
  changeRoute(route);
  // Support button opens actual global preview panel for convenience.
  if(route==='/support')openChat();
});
$('chat-launcher').addEventListener('click',()=>{
  state.open?closeChat():openChat();
});
$('chat-close').addEventListener('click',closeChat);
$('tab-support').addEventListener('click',()=>applyTab('support'));
$('tab-direct').addEventListener('click',()=>applyTab('direct'));
$('header-help').addEventListener('click',openChat);
document.addEventListener('click',event=>{
  if(event.target.closest('[data-open-chat]'))openChat();
});
$('chat-full-support').addEventListener('click',()=>{
  changeRoute('/support');
  openChat();
});
$('inquiry-category').addEventListener('change',event=>{
  state=transitionChatState(state,{type:'SET_CATEGORY',category:event.target.value});
  syncWidget();
});
$('chat-draft').addEventListener('input',event=>{
  state=transitionChatState(state,{type:'SET_DRAFT',text:event.target.value});
  syncWidget();
});
$('chat-preview-submit').addEventListener('click',()=>{
  state=transitionChatState(state,{type:'SUBMIT_PREVIEW'});
  syncWidget();
});
function togglePreviewAuthentication(){
  state=transitionChatState(state,{type:state.authenticated?'SIGN_OUT':'SIGN_IN'});
  syncWidget();
}
$('auth-button').addEventListener('click',togglePreviewAuthentication);
$('auth-button-mobile').addEventListener('click',togglePreviewAuthentication);
$('mobile-menu-button').addEventListener('click',()=>{
  const menu=$('mobile-menu');
  menu.hidden=!menu.hidden;
  $('mobile-menu-button').setAttribute('aria-expanded',String(!menu.hidden));
});
document.querySelectorAll('.faq-button').forEach(button=>{
  button.addEventListener('click',()=>{
    const preset={
      login:['account','로그인 화면에 문제가 발생했습니다.'],
      ledger:['ledger','WLD 잔액과 거래 내역 확인이 필요합니다.'],
      bug:['bug','현재 화면에서 오류가 발생했습니다.']
    }[button.dataset.faq];
    if(!preset)return;
    state=transitionChatState(state,{type:'SET_CATEGORY',category:preset[0]});
    state=transitionChatState(state,{type:'SET_DRAFT',text:preset[1]});
    syncWidget();$('chat-draft').focus();
  });
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&state.open){event.preventDefault();closeChat();}
});
window.addEventListener('popstate',()=>{
  activeRoute=readInitialRoute();
  state=transitionChatState(state,{type:'NAVIGATE',path:activeRoute});
  renderPage();syncWidget();
});
