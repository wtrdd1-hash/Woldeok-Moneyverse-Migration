/* Shared UI behavior for independently rendered site pages. */
(function () {
  'use strict';
  const locale = window.MV39Locale;
  const page = document.body.dataset.page || 'home';
  const root = document.getElementById('page-content');
  let session = null;
  let checkedSession = false;
  let epoch = 0;
  let sessionEpoch = 0;

  function t(key) { return locale.tx(key); }
  function elt(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = String(text);
    return element;
  }
  function withChildren(element, ...children) {
    children.flat(5).forEach(child => {
      if (child === null || child === undefined) return;
      element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return element;
  }
  function link(href, label, className='inline-link') {
    const a=elt('a',className,label);
    a.href=href;
    return a;
  }
  function box(title, body, action) {
    const outer=elt('section','card');
    const heading=elt('h3','card-heading');
    heading.appendChild(elt('span','',title));
    if (action) heading.appendChild(action);
    outer.appendChild(heading);
    if (body) outer.appendChild(body);
    return outer;
  }
  function state(text, href, hrefLabel) {
    const wrap=elt('div','state',text);
    if (href) withChildren(wrap,document.createTextNode(' '),link(href,hrefLabel||t('signInAction')));
    return wrap;
  }
  function grid(classes,...items) { return withChildren(elt('div','content-grid '+(classes||'')),items); }
  function sectionTitle(text) { return elt('h3','section-heading',text); }
  function metric(title, foot) {
    const container=elt('article','card');
    const label=elt('div','metric-label',title);
    const value=elt('div','metric-value',!checkedSession?t('loading'):t('unavailable'));
    const sub=elt('div','metric-foot',foot||'');
    withChildren(container,label,value,sub);
    return {container,value,sub};
  }
  function numberString(raw) {
    if (raw===null || raw===undefined) return null;
    const value=String(raw).trim();
    const match=/^(-?)(\d+)(?:\.(\d+))?$/.exec(value);
    if (!match) return null;
    return match[1]+match[2].replace(/\B(?=(\d{3})+(?!\d))/g,',')+(match[3]!==undefined?'.'+match[3]:'');
  }
  function wld(raw) { const value=numberString(raw);return value===null?null:value+' WLD'; }
  function smallNumber(raw) { return new Intl.NumberFormat(locale.current()).format(Number(raw)); }
  function pct(price,open) { return window.MV39Money.percentageChange(price,open); }
  function isSignedIn() { return checkedSession&&Boolean(session&&(session.signedIn===true||session.authenticated===true)&&session.user); }
  async function fetchJson(url) {
    const response=await fetch(url,{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}});
    if (!response.ok) throw new Error('unavailable');
    const type=response.headers.get('content-type')||'';
    if (!type.includes('application/json')) throw new Error('unavailable');
    return response.json();
  }
  function validNow(generation) { return generation===epoch; }
  function action(href,label) {
    const a=elt('a','action-card');a.href=href;
    withChildren(a,elt('span','',label),elt('span','action-chevron','›'));
    return a;
  }
  function actionList(actions) {
    return withChildren(elt('div','action-list'),actions.map(([href,label])=>action(href,label)));
  }
  function table(headers,description) {
    const wrap=elt('div','table-scroll');wrap.tabIndex=0;wrap.setAttribute('role','region');
    wrap.setAttribute('aria-label',description||t('marketTitle'));
    const tab=elt('table','data-table');const thead=elt('thead');const tr=elt('tr');
    headers.forEach(label=>tr.appendChild(elt('th','',label)));
    thead.appendChild(tr);
    const tbody=elt('tbody');
    withChildren(tab,thead,tbody);wrap.appendChild(tab);
    return {wrap,tbody,columns:headers.length};
  }
  function tableLoading(tbl) {
    const tr=elt('tr'),cell=elt('td','',t('loading'));cell.colSpan=tbl.columns;tr.appendChild(cell);tbl.tbody.replaceChildren(tr);
  }
  function tableMessage(tbl,text) {
    const tr=elt('tr'),cell=elt('td','',text);cell.colSpan=tbl.columns;tr.appendChild(cell);tbl.tbody.replaceChildren(tr);
  }
  function addRow(tbl,values,classes) {
    const tr=elt('tr');
    values.forEach((value,i)=>tr.appendChild(elt('td',(classes&&classes[i])||'',value===null||value===undefined?'—':value)));
    tbl.tbody.appendChild(tr);
  }
  function stockTable(limit) {
    const wrap=elt('div','market-data');
    const tbl=table([t('symbol'),t('stockName'),t('sector'),t('currentPrice'),t('change'),t('status')],t('marketTitle'));
    const mobile=elt('div','market-mobile-list');
    mobile.setAttribute('role','list');mobile.setAttribute('aria-label',t('marketTitle'));
    mobile.appendChild(state(t('loading')));
    wrap.appendChild(tbl.wrap);wrap.appendChild(mobile);
    tableLoading(tbl);
    const gen=epoch;
    const updateState=(label)=>{tableMessage(tbl,label);mobile.replaceChildren(state(label));};
    fetchJson('/api/v1/stocks').then(source=>{
      if (!validNow(gen)) return;
      const rows=source&&Array.isArray(source.stocks)?source.stocks.slice(0,limit):null;
      if (!rows) {updateState(t('unavailable'));return;}
      tbl.tbody.replaceChildren();mobile.replaceChildren();
      rows.forEach(stock=>{
        if (!stock||typeof stock.symbol!=='string'||typeof stock.name!=='string') return;
        const change=pct(stock.current_price,stock.day_open_price);
        const validPrice=wld(stock.current_price);
        const status=stock.halt_status==='ACTIVE'?t('tradable'):stock.halt_status==='HALTED'?t('halted'):t('unavailable');
        addRow(tbl,[stock.symbol,stock.name,stock.description||'—',validPrice||t('unavailable'),change||'—',status],['mono','','long','mono',change&&change.startsWith('+')?'positive':'negative','']);
        // Mobile source-truth compact rows, no 760px-wide table or invented trend.
        const row=elt('article','market-mobile-row');row.setAttribute('role','listitem');
        const label=elt('div','market-mobile-identity');
        label.appendChild(elt('strong','market-mobile-symbol',stock.symbol));
        label.appendChild(elt('span','market-mobile-name',stock.name));
        const meta=elt('div','market-mobile-values');
        meta.appendChild(elt('strong','market-mobile-price',validPrice||t('unavailable')));
        meta.appendChild(elt('span','market-mobile-status',change||status));
        row.appendChild(label);row.appendChild(meta);mobile.appendChild(row);
      });
      if (!tbl.tbody.children.length) updateState(t('empty'));
    }).catch(()=>{if(validNow(gen))updateState(t('unavailable'));});
    return wrap;
  }
  function listFeed(url,limit,kind) {
    const container=elt('div','feed-list');container.appendChild(state(t('loading')));
    const gen=epoch;
    fetchJson(url).then(source=>{
      if(!validNow(gen))return;
      const entries=kind==='shop'?source&&source.items:source&&source.posts;
      // A 200 response is not proof of a verified board read. Explicit ok:true is required.
      const canonicalBoardId=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
      if ((kind!=='shop' && (!source || source.ok!==true)) || !Array.isArray(entries)
          || (kind==='board' && entries.some(item=> !item || typeof item.id!=='string'
              || !canonicalBoardId.test(item.id) || typeof item.title!=='string' || !item.title.trim()))) {
        container.replaceChildren(state(t('unavailable')));return;
      }
      container.replaceChildren();
      entries.slice(0,limit).forEach(item=>{
        if (!item||typeof item!=='object') return;
        const entry=elt('article','feed-item');
        if(kind==='shop') {
          entry.appendChild(elt('div','feed-title',item.name||t('shopHero')));
          entry.appendChild(elt('div','feed-meta',[t('price'),wld(item.price)||t('unavailable'), '·',t('inStock'),item.stock_remaining===null||item.stock_remaining===undefined?t('unavailable'):String(item.stock_remaining)].join(' ')));
          if(item.description)entry.appendChild(elt('p','feed-summary',item.description));
        } else {
          entry.appendChild(elt('div','feed-title',item.title||t('recentPosts')));
          const date=item.createdAt&&Number.isFinite(Date.parse(item.createdAt))
            ?new Date(item.createdAt).toLocaleDateString(document.documentElement.lang||'en') :null;
          entry.appendChild(elt('div','feed-meta', [item.authorName||'—',date].filter(Boolean).join(' · ')));
          if(item.body)entry.appendChild(elt('p','feed-summary',item.body));
        }
        container.appendChild(entry);
      });
      if (!container.children.length) container.appendChild(state(t('empty')));
    }).catch(()=>{if(validNow(gen))container.replaceChildren(state(t('unavailable')));});
    return container;
  }
  function personalSummary() {
    const wallet=metric(t('walletAvailable'));
    const stocks=metric(t('positionsCount'));
    const quests=metric(t('myQuests'));
    quests.value.replaceChildren(link('/quests',t('goToQuests')));
    wallet.value.textContent=isSignedIn()?t('loading'):t('loggedOut');
    stocks.value.replaceChildren(isSignedIn()?link('/stocks',t('myHoldings')):link('/login',t('signInAction')));
    stocks.sub.textContent=isSignedIn()?t('holdingsNotice'):'';
    const cards=withChildren(elt('div','kpi-grid'),wallet.container,stocks.container,quests.container);
    if (isSignedIn()) {
      const gen=epoch;
      fetchJson('/api/v1/wallet/summary').then(raw=>{
        if(!validNow(gen))return;
        wallet.value.textContent=raw&&raw.signedIn===true?(wld(raw.totalAvailableAmount)||t('unavailable')):t('unavailable');
      }).catch(()=>{if(validNow(gen))wallet.value.textContent=t('unavailable');});

    }
    return cards;
  }
  function renderHome() {
    const head=elt('div','dashboard-section-header');
    head.appendChild(sectionTitle(t('myOverview')));
    const refresh=elt('button','refresh-button',t('refresh'));
    refresh.type='button';refresh.addEventListener('click',()=>readSession());
    head.appendChild(refresh);root.appendChild(head);
    root.appendChild(personalSummary());
    root.appendChild(sectionTitle(t('quickActions')));
    root.appendChild(withChildren(elt('div','tools-grid'),[
      action('/wallet',t('wallet')),action('/stocks',t('stocks')),action('/quests',t('quests')),
      action('/shop',t('shop')),action('/board',t('board')),action('/support',t('support'))
    ]));
    root.appendChild(sectionTitle(t('marketTitle')));
    root.appendChild(grid('two',box(t('marketTitle'),stockTable(8),link('/stocks',t('viewAll'))),
      box(t('trendTitle'),state(t('trendUnavailable')))));
    root.appendChild(sectionTitle(t('recentPosts')));
    // The v41 Spring board API now reads the canonical public DB source only and returns
    // 503 instead of fake articles; the home renders verified source results or Unavailable.
    root.appendChild(box(t('board'),listFeed('/api/v1/board',4,'board'),link('/board',t('seeAll'))));
  }
  function renderWallet() {
    root.appendChild(personalSummary());
    root.appendChild(sectionTitle(t('transactions')));
    // A legacy transaction endpoint can resolve to a default actor after session expiry.
    // Never fetch or display another member's ledger; use the verified summary only.
    root.appendChild(box(t('transactions'),state(t('walletNotice')+' '+t('unavailable'))));
  }
  function renderStocks() {
    root.appendChild(personalSummary());
    root.appendChild(sectionTitle(t('myHoldings')));
    const holdings=table([t('symbol'),t('stockName'),t('quantity'),t('marketValue')],t('myHoldings'));
    tableLoading(holdings);
    root.appendChild(box(t('myHoldings'),holdings.wrap));
    if (!isSignedIn()) tableMessage(holdings,t('loggedOut'));
    else {
      const gen=epoch;
      tableMessage(holdings,t('holdingsNotice'));
    }
    root.appendChild(sectionTitle(t('marketTitle')));
    root.appendChild(box(t('marketTitle'),stockTable(30)));
  }
  function renderQuests() {
    root.appendChild(box(t('myQuests'),state(isSignedIn()?t('questsPending'):t('loggedOut'),isSignedIn()?null:'/login',t('signInAction'))));
    root.appendChild(sectionTitle(t('quickActions')));
    root.appendChild(actionList([['/shop',t('shop')],['/wallet',t('wallet')],['/support',t('support')]]));
  }
  function renderShop() {
    root.appendChild(box(t('shopHero'),listFeed('/api/v1/shop/public-catalog',30,'shop')));
    root.appendChild(sectionTitle(t('account')));
    root.appendChild(box(t('personalOnly'),state(isSignedIn()?t('walletNotice'):t('loggedOut'),isSignedIn()?null:'/login',t('signInAction'))));
  }
  function renderBoard() {
    root.appendChild(box(t('recentPosts'),listFeed('/api/v1/board',40,'board')));
    root.appendChild(sectionTitle(t('support')));
    root.appendChild(actionList([['/support',t('helpButton')]]));
  }
  function renderSupport() {
    root.appendChild(box(t('supportHero'),state(t('supportUnavailable'))));
    root.appendChild(sectionTitle(t('quickActions')));
    root.appendChild(actionList([['/help',t('openHelp')],['/board',t('board')],['/account',t('account')]]));
  }
  function renderAccount() {
    const wrap=elt('div','account-box');
    if(!isSignedIn()) wrap.appendChild(box(t('account'),state(t('loggedOut'),'/login',t('signInAction'))));
    else {
      const profile=elt('div','metric-value',session.user.displayName||session.user.username||t('account'));
      wrap.appendChild(box(t('accountName'),profile));
      wrap.appendChild(box(t('personalOnly'),actionList([['/wallet',t('wallet')],['/stocks',t('myHoldings')]])));
    }
    root.appendChild(wrap);
  }
  function renderPage() {
    epoch++;
    root.replaceChildren();
    const heroes={home:['personalTitle','homeLead'],wallet:['walletHero','walletLead'],stocks:['stocksHero','stocksLead'],
      quests:['questsHero','questsLead'],shop:['shopHero','shopLead'],board:['boardHero','boardLead'],
      support:['supportHero','supportLead'],account:['accountHero','accountLead']};
    const hero=heroes[page]||heroes.home;
    document.getElementById('hero-title').textContent=t(hero[0]);
    document.getElementById('hero-description').textContent=t(hero[1]);
    const renders={home:renderHome,wallet:renderWallet,stocks:renderStocks,quests:renderQuests,
      shop:renderShop,board:renderBoard,support:renderSupport,account:renderAccount};
    (renders[page]||renderHome)();
  }
  function localizeStatic() {
    document.documentElement.lang=locale.current();
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      el.textContent=t(el.dataset.i18n);
    });
    document.title=t(page)+' · W Moneyverse';
    const select=document.getElementById('language-selector');
    select.value=locale.preference();
    select.setAttribute('aria-label',t('selectLanguage'));
    const auto=select.querySelector('option[value="auto"]');
    auto.textContent=t('auto');
    document.querySelector('.support-fab').setAttribute('aria-label',t('support'));
  }
  function renderAuthControls() {
    const container=document.getElementById('auth-actions');container.replaceChildren();
    container.closest('.topbar').classList.toggle('member-authenticated',isSignedIn());
    if (!isSignedIn()) {container.appendChild(link('/login',t('login'),'auth-link'));return;}
    const profile=link('/account',session.user.displayName||session.user.username||t('account'),'auth-link auth-profile');
    profile.title=t('account');
    const button=elt('button','auth-logout',t('logout'));button.type='button';
    button.addEventListener('click',async()=>{
      button.disabled=true;
      try {
        const headers={Accept:'application/json'};
        if(session&&session.csrfToken)headers['X-CSRF-Token']=session.csrfToken;
        const response=await fetch('/api/v1/auth/logout',{method:'POST',credentials:'same-origin',cache:'no-store',headers});
        if(!response.ok)throw new Error('unavailable');
        session=null;checkedSession=true;renderAuthControls();renderPage();
        window.location.assign('/');
      } catch (_){button.disabled=false;button.textContent=t('retry');}
    });
    container.append(profile,button);
    const roles=Array.isArray(session.user.roles)?session.user.roles:[];
    const isAdmin=roles.some(role=>typeof role==='string'&&role.toLowerCase().includes('admin'));
    if(isAdmin) {
      document.querySelectorAll('.side-links').forEach(nav=>{
        const existing=nav.querySelector('a[data-admin="true"]');
        if (existing) {existing.lastElementChild.textContent=t('admin');return;}
        const a=link('/admin',t('admin'),'nav-link');a.dataset.admin='true';
        a.insertBefore(elt('span','nav-icon','⚙'),a.firstChild);
        nav.appendChild(a);
      });
    }
  }
  function toggleDrawer(open) {
    const drawer=document.getElementById('mobile-menu');
    const backdrop=document.getElementById('drawer-backdrop');
    drawer.hidden=!open;backdrop.hidden=!open;
    const toggle=document.getElementById('mobile-menu-toggle');
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?t('close'):t('menu'));
    if(open)document.getElementById('mobile-menu-close').focus();
    else toggle.focus();
  }
  function bindNavigation() {
    if(!document.documentElement.dataset.uiLanguage) {
    document.getElementById('mobile-menu-toggle').addEventListener('click',()=>toggleDrawer(true));
    document.getElementById('mobile-menu-close').addEventListener('click',()=>toggleDrawer(false));
    document.getElementById('drawer-backdrop').addEventListener('click',()=>toggleDrawer(false));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.getElementById('mobile-menu').hidden)toggleDrawer(false);});
    document.querySelectorAll('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>toggleDrawer(false)));
    document.getElementById('language-selector').addEventListener('change',event=>locale.setPreference(event.target.value));
    }
    window.addEventListener('mv39-language-change',()=>{localizeStatic();renderAuthControls();renderPage();});
  }
  async function readSession() {
    const requestToken=++sessionEpoch;
    // Clear old account data before checking a new session (logout/account switch in another tab).
    session=null;
    checkedSession=false;
    renderAuthControls();renderPage();
    let result=null;
    try {
      const raw=await fetchJson('/api/v1/auth/session');
      if(raw&&raw.user&&(raw.signedIn===true||raw.authenticated===true))result=raw;
    } catch { result=null; }
    if(requestToken!==sessionEpoch)return;
    session=result;
    checkedSession=true;
    document.querySelectorAll('a[data-admin="true"]').forEach(a=>a.remove());
    renderAuthControls();renderPage();
  }
  function start() {
    localizeStatic();bindNavigation();renderPage();readSession();
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)readSession();});
    window.addEventListener('pageshow',event=>{if(event.persisted)readSession();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
