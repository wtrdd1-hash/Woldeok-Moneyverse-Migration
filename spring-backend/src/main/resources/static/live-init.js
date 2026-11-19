(function() {
  function formatMoney(amount) {
    if (amount === null || amount === undefined || amount === "") return "0";
    return Number(amount).toLocaleString();
  }

  // 1. Live Socket.IO Gateway Setup
  let socket = null;
  function initSocketIO() {
    if (typeof io === 'undefined') {
      console.warn('[SocketIO] io is not defined yet');
      return;
    }
    if (socket && socket.connected) return;

    try {
      socket = io(window.location.origin, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 20
      });

      socket.on('connect', function() {
        console.log('[SocketIO] Connected to Netty-SocketIO gateway');
        socket.emit('market:subscribe');
      });

      socket.on('market:ticks', function(stocks) {
        if (Array.isArray(stocks) && stocks.length > 0) {
          renderMoversCards(stocks);
        }
      });

      socket.on('online', function(count) {
        const onlineBadges = document.querySelectorAll('[data-socket="online-count"]');
        onlineBadges.forEach(el => { el.textContent = count; });
      });

      socket.on('disconnect', function() {
        console.log('[SocketIO] Disconnected, will auto-reconnect');
      });
    } catch (e) {
      console.warn('[SocketIO] Init error:', e);
    }
  }

  // 2. Live Header Session Sync
  let currentViewer = null;
  async function loadLiveHeader() {
    try {
      const res = await fetch('/api/v1/auth/viewer', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) return;
      const viewer = await res.json();
      currentViewer = viewer;
      const signedIn = Boolean(viewer && viewer.signedIn);

      const loginButtons = Array.from(document.querySelectorAll('header a, header button')).filter(el => {
        const text = (el.textContent || '').trim();
        return text === '로그인' || text === 'Sign in';
      });

      if (signedIn) {
        const displayName = viewer.displayName || viewer.name || '월덕';
        const initial = displayName.substring(0, 1);
        const isAdmin = Boolean(viewer.adminRoles && viewer.adminRoles.length > 0);

        const userHtml = `
          <div id="live-user-badge" class="flex items-center gap-2">
            <a href="/profile" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/80 transition-all shadow-sm">
              <div class="size-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs grid place-items-center">
                ${initial}
              </div>
              <span class="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[100px]">${displayName}</span>
              ${isAdmin ? '<span class="text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">ADMIN</span>' : ''}
            </a>
            <a href="/wallet" class="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/80 text-emerald-400 transition-all shadow-sm" title="내 지갑 바로가기">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
            </a>
          </div>
        `;

        loginButtons.forEach(btn => {
          if (!btn.closest('#live-user-badge')) {
            btn.outerHTML = userHtml;
          }
        });
      } else {
        loginButtons.forEach(btn => {
          btn.setAttribute('href', '/auth/discord/authorize');
          btn.onclick = function(e) {
            e.preventDefault();
            window.location.href = '/auth/discord/authorize';
          };
        });
      }
    } catch (e) {
      console.warn('[LiveHeader] Error:', e);
    }
  }

  // 3. Live Wallet Balance Binding
  async function loadLiveWallet() {
    try {
      const res = await fetch('/api/wallet/summary', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();

      const balEl = document.getElementById('live-wallet-balance');
      const loginBtn = document.getElementById('live-wallet-login-btn');

      if (data && data.signedIn && data.totalAvailableAmount !== null) {
        const formatted = formatMoney(data.totalAvailableAmount);
        if (balEl) {
          balEl.textContent = formatted;
          balEl.className = 'font-mono text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight tabular-nums animate-in fade-in duration-300';
        }
        if (loginBtn) {
          loginBtn.outerHTML = '<span id="live-wallet-login-btn" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"><svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>Verified Ledger</span>';
        }

        // 혹시 아직 옛 로그인 후 확인 텍스트가 남아있는 노드가 있다면 치환
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        const targetNodes = [];
        let n;
        while (n = walker.nextNode()) {
          if (n.nodeValue && n.nodeValue.includes('로그인 후 확인')) {
            targetNodes.push(n);
          }
        }
        targetNodes.forEach(node => {
          const parent = node.parentElement;
          if (parent) {
            parent.innerHTML = `<span class="text-3xl sm:text-5xl font-black font-fintech text-emerald-400 tabular-nums tracking-tight">${formatted} <span class="text-sm sm:text-base font-bold text-slate-300 ml-1">${data.currency || 'WLD'}</span></span>`;
          }
        });

        // 가입 없이 시작 카드 -> 환영 카드로 전환
        const quickstart = document.querySelector('[data-testid="guest-quickstart"], section[aria-labelledby="guest-quickstart-heading"]');
        if (quickstart) {
          const title = quickstart.querySelector('#guest-quickstart-heading');
          const sub = quickstart.querySelector('p.text-xs.font-semibold');
          const desc = quickstart.querySelector('p.mt-2.text-sm');
          if (sub) {
            sub.textContent = '회원 혜택 적용 중';
            sub.className = 'mb-2 text-xs font-semibold tracking-wide text-amber-400';
          }
          if (title) {
            const name = (currentViewer && (currentViewer.displayName || currentViewer.name)) || '월덕 시민';
            title.textContent = `반갑습니다, ${name}님! 오늘의 미션을 확인하세요`;
          }
          if (desc) {
            desc.textContent = '가상 주식 모의투자 체결, 복리 계산기 및 1:1 P2P 간편 송금을 자유롭게 이용하실 수 있습니다.';
          }
        }
      } else {
        if (balEl && balEl.textContent !== '0') {
          balEl.textContent = '0';
        }
      }
    } catch (e) {
      console.warn('[LiveWallet] Error:', e);
    }
  }

  // 4. Live Stock Movers UI Rendering
  function renderMoversCards(rawStocks) {
    if (!rawStocks || !rawStocks.length) return;

    const stocks = rawStocks.map(s => {
      const cur = Number(s.current_price || s.price || 0);
      const open = Number(s.day_open_price || s.open_price || cur);
      const pct = open > 0 ? (((cur - open) / open) * 100) : 0;
      return { ...s, cur, open, pct };
    }).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 4);

    let container = document.getElementById('live-stock-movers');
    if (!container) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      let n;
      while (n = walker.nextNode()) {
        if (n.nodeValue && n.nodeValue.includes('시세 자료를 불러오지 못했습니다')) {
          container = n.parentElement.closest('.space-y-2') || n.parentElement.parentElement;
          if (container) {
            container.id = 'live-stock-movers';
            break;
          }
        }
      }
    }

    if (!container) {
      container = document.querySelector('[data-page="home"] section.toss-card .space-y-2');
    }

    if (container) {
      container.innerHTML = stocks.map(stock => {
        const isUp = stock.pct >= 0;
        const sign = isUp ? '+' : '';
        const colorClass = isUp ? 'text-rose-400' : 'text-blue-400';
        const arrow = isUp 
          ? '<svg xmlns="http://www.w3.org/2000/svg" class="size-3 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m18 15-6-6-6 6"/></svg>'
          : '<svg xmlns="http://www.w3.org/2000/svg" class="size-3 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>';

        return `
          <a href="/stocks/${encodeURIComponent(stock.symbol)}" class="flex items-center justify-between gap-3 min-w-0 min-h-[56px] p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-200 group shadow-xs">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/60">
                ${stock.symbol}
              </span>
              <span class="text-xs sm:text-sm font-bold text-slate-100 truncate group-hover:text-emerald-400 transition-colors">
                ${stock.name}
              </span>
            </div>
            <div class="text-right font-mono shrink-0 pl-2">
              <div class="text-xs sm:text-sm font-extrabold text-slate-100 tabular-nums">
                ${formatMoney(stock.cur)} <span class="text-[10px] text-slate-400 font-normal">WLD</span>
              </div>
              <div class="text-xs font-bold tabular-nums flex items-center justify-end gap-0.5 mt-0.5 ${colorClass}">
                ${arrow} <span>${sign}${stock.pct.toFixed(2)}%</span>
              </div>
            </div>
          </a>
        `;
      }).join('');
    }
  }

  async function loadLiveStocksRest() {
    try {
      const res = await fetch('/api/v1/stocks', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const stocks = data.stocks || [];
      if (stocks.length > 0) {
        renderMoversCards(stocks);
      }
    } catch (e) {
      console.warn('[LiveStocksRest] Error:', e);
    }
  }

  // 5. 온보딩 퀘스트 & 1:1 간편 송금 모달 인터랙션
  function setupModals() {
    // 1:1 간편 송금 버튼 바인딩
    const transferBtns = Array.from(document.querySelectorAll('button, a')).filter(el => {
      const t = (el.textContent || '').trim();
      return t.includes('1:1 간편 송금') || t.includes('스마트 P2P 송금');
    });

    transferBtns.forEach(btn => {
      btn.onclick = function(e) {
        e.preventDefault();
        openTransferModal();
      };
    });

    // 온보딩 퀘스트 동글 바인딩
    const questBtn = document.querySelector('button.group\\/chip');
    if (questBtn) {
      questBtn.onclick = function(e) {
        e.preventDefault();
        openQuestModal();
      };
    }

    // 1:1 채팅 동글 바인딩
    const supportBtn = document.querySelector('button[aria-label*="1:1 채팅"]');
    if (supportBtn) {
      supportBtn.onclick = function(e) {
        e.preventDefault();
        openSupportModal();
      };
    }
  }

  function openTransferModal() {
    let modal = document.getElementById('smart-transfer-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'smart-transfer-modal';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200';
      modal.innerHTML = `
        <div class="relative w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-black text-slate-100 flex items-center gap-2">
              <span class="size-2 rounded-full bg-emerald-400"></span> 1:1 스마트 P2P 송금
            </h3>
            <button type="button" id="close-transfer-modal" class="text-slate-400 hover:text-white p-1 text-sm font-bold">✕</button>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">받는 회원 User ID (또는 UUID)</label>
              <input type="text" id="transfer-recipient" placeholder="5f7b8b44-e4aa-40b8-b93a-800ec0151d20" class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">송금 수량 (WLD)</label>
              <input type="number" id="transfer-amount" placeholder="10000" class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">송금 메모</label>
              <input type="text" id="transfer-memo" placeholder="모의투자 정산금" class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div id="transfer-status-msg" class="text-xs min-h-[16px]"></div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" id="cancel-transfer-btn" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700">취소</button>
            <button type="button" id="submit-transfer-btn" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-lg shadow-emerald-500/20">즉시 송금</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('close-transfer-modal').onclick = () => modal.remove();
      document.getElementById('cancel-transfer-btn').onclick = () => modal.remove();
      document.getElementById('submit-transfer-btn').onclick = async () => {
        const to = document.getElementById('transfer-recipient').value.trim();
        const amt = document.getElementById('transfer-amount').value.trim();
        const memo = document.getElementById('transfer-memo').value.trim();
        const msg = document.getElementById('transfer-status-msg');

        if (!to || !amt) {
          msg.textContent = '받는 회원 ID와 수량을 입력해 주세요.';
          msg.className = 'text-xs text-rose-400 font-bold';
          return;
        }

        msg.textContent = '원장 트랜잭션 전송 중...';
        msg.className = 'text-xs text-amber-400 font-bold';

        try {
          const res = await fetch('/api/wallet/transfer', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipientUserId: to, amountWld: amt, memo: memo })
          });
          const ret = await res.json();
          if (res.ok) {
            msg.textContent = '송금이 성공적으로 완료되었습니다!';
            msg.className = 'text-xs text-emerald-400 font-bold';
            setTimeout(() => { modal.remove(); loadLiveWallet(); }, 1200);
          } else {
            msg.textContent = ret.message || '송금에 실패했습니다.';
            msg.className = 'text-xs text-rose-400 font-bold';
          }
        } catch (e) {
          msg.textContent = '네트워크 오류가 발생했습니다.';
          msg.className = 'text-xs text-rose-400 font-bold';
        }
      };
    }
  }

  async function openQuestModal() {
    let modal = document.getElementById('quest-modal');
    if (modal) modal.remove();

    let quests = [];
    try {
      const res = await fetch('/api/v1/progression/early-game', { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const d = await res.json();
        quests = d.beginnerQuests || [];
      }
    } catch (e) {}

    if (!quests.length) {
      quests = [
        { title: '로그인 및 이용 동의', rewardWld: 10000, isCompleted: true },
        { title: '실전 복리 계산기 체험', rewardWld: 5000, isCompleted: true },
        { title: '가상 주식 10단 호가창 조회', rewardWld: 5000, isCompleted: true },
        { title: '가상 주식 모의투자 첫 체결', rewardWld: 20000, isCompleted: false },
        { title: '일일 직업 파밍 루틴 수행', rewardWld: 10000, isCompleted: false },
        { title: '1:1 스마트 P2P 간편 송금', rewardWld: 15000, isCompleted: false },
        { title: '핀테크 금융 상식 퀴즈 정답', rewardWld: 10000, isCompleted: false }
      ];
    }

    modal = document.createElement('div');
    modal.id = 'quest-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200';
    modal.innerHTML = `
      <div class="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-lg font-black text-slate-100 flex items-center gap-2">
            <span class="size-2 rounded-full bg-emerald-400"></span> 온보딩 퀘스트 진행 현황
          </h3>
          <button type="button" id="close-quest-modal" class="text-slate-400 hover:text-white p-1 text-sm font-bold">✕</button>
        </div>
        <p class="text-xs text-slate-400">각 미션을 완료할 때마다 실시간 WLD 보상이 불변 원장으로 자동 지급됩니다.</p>
        <div class="space-y-2.5">
          ${quests.map((q, idx) => `
            <div class="flex items-center justify-between p-3.5 rounded-2xl ${q.isCompleted ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-950/60 border border-slate-800'}">
              <div class="flex items-center gap-3">
                <span class="size-6 rounded-full text-xs font-mono font-bold grid place-items-center ${q.isCompleted ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-300'}">
                  ${q.isCompleted ? '✓' : (idx + 1)}
                </span>
                <div>
                  <div class="text-xs sm:text-sm font-bold text-slate-200">${q.title}</div>
                  <div class="text-[11px] text-amber-400 font-mono">+${formatMoney(q.rewardWld)} WLD</div>
                </div>
              </div>
              <span class="text-xs font-bold px-2 py-0.5 rounded-md ${q.isCompleted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}">
                ${q.isCompleted ? '완료' : '진행 중'}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('close-quest-modal').onclick = () => modal.remove();
  }

  function openSupportModal() {
    let modal = document.getElementById('support-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'support-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200';
    modal.innerHTML = `
      <div class="relative w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-lg font-black text-slate-100 flex items-center gap-2">
            <span class="size-2 rounded-full bg-emerald-400"></span> 1:1 고객지원 및 문의
          </h3>
          <button type="button" id="close-support-modal" class="text-slate-400 hover:text-white p-1 text-sm font-bold">✕</button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">문의 제목</label>
            <input type="text" id="support-subject" placeholder="가상 주식 모의투자 체결 문의" class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">문의 내용</label>
            <textarea id="support-body" rows="3" placeholder="문의하실 내용을 상세히 적어주세요." class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"></textarea>
          </div>
        </div>
        <div id="support-status-msg" class="text-xs min-h-[16px]"></div>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" id="cancel-support-btn" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700">닫기</button>
          <button type="button" id="submit-support-btn" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-lg shadow-emerald-500/20">문의 접수</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('close-support-modal').onclick = () => modal.remove();
    document.getElementById('cancel-support-btn').onclick = () => modal.remove();
    document.getElementById('submit-support-btn').onclick = async () => {
      const subject = document.getElementById('support-subject').value.trim();
      const body = document.getElementById('support-body').value.trim();
      const msg = document.getElementById('support-status-msg');

      if (!subject || !body) {
        msg.textContent = '제목과 내용을 모두 입력해 주세요.';
        msg.className = 'text-xs text-rose-400 font-bold';
        return;
      }

      msg.textContent = '문의 접수 중...';
      msg.className = 'text-xs text-amber-400 font-bold';

      try {
        const res = await fetch('/api/v1/support/threads', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: subject, body: body })
        });
        if (res.ok) {
          msg.textContent = '문의가 정상적으로 접수되었습니다. 관리자 답변 시 알림이 발송됩니다.';
          msg.className = 'text-xs text-emerald-400 font-bold';
          setTimeout(() => modal.remove(), 1500);
        } else {
          msg.textContent = '문의 접수에 실패했습니다.';
          msg.className = 'text-xs text-rose-400 font-bold';
        }
      } catch (e) {
        msg.textContent = '네트워크 오류가 발생했습니다.';
        msg.className = 'text-xs text-rose-400 font-bold';
      }
    };
  }

  function runAll() {
    initSocketIO();
    loadLiveHeader();
    loadLiveWallet();
    loadLiveStocksRest();
    setupModals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAll);
  } else {
    runAll();
  }
  setInterval(runAll, 2500);
})();
