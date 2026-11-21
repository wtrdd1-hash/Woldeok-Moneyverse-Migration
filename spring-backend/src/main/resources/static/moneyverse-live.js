/**
 * Moneyverse Live Engine (Pure Spring-served Native Frontend)
 * Zero Node.js / Zero Next.js hydration dependency.
 * Connects directly to Spring Boot 3.3.5 APIs and Netty Socket.IO 9092.
 */
(function() {
  'use strict';

  function formatNumber(n) {
    if (n === null || n === undefined || isNaN(n)) return '0';
    return Number(n).toLocaleString('ko-KR');
  }

  // --- 1. Socket.IO Realtime Connection ---
  let socket = null;
  function initSocket() {
    if (typeof io === 'undefined') {
      console.warn('[Moneyverse] Socket.IO library not loaded yet, retrying...');
      setTimeout(initSocket, 500);
      return;
    }

    try {
      socket = io(window.location.origin, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1000
      });

      socket.on('connect', function() {
        console.log('[Moneyverse Socket] Connected successfully! ID:', socket.id);
        const statusDot = document.querySelector('.bg-emerald-400');
        if (statusDot) statusDot.classList.add('animate-pulse');
      });

      socket.on('disconnect', function(reason) {
        console.warn('[Moneyverse Socket] Disconnected:', reason);
      });

      socket.on('stock:ticker', function(data) {
        updateSingleStock(data);
      });

      socket.on('stock:quote', function(data) {
        updateSingleStock(data);
      });

      socket.on('economy:tick', function(data) {
        if (data && data.totalCirculation) {
          const circEls = document.querySelectorAll('[data-bind="total-circulation"]');
          circEls.forEach(el => el.textContent = formatNumber(data.totalCirculation) + ' WLD');
        }
      });
    } catch (e) {
      console.error('[Moneyverse Socket] Init error:', e);
    }
  }

  // --- 2. Auth & Wallet Live Binding ---
  async function initAuthAndWallet() {
    try {
      const res = await fetch('/api/v1/auth/me', { credentials: 'same-origin' });
      if (res.ok) {
        const user = await res.json();
        if (user && (user.id || user.userId)) {
          applyLoggedInState(user);
          loadWalletBalance();
          return;
        }
      }
    } catch (e) {
      console.log('[Moneyverse Auth] Guest mode active');
    }
    applyGuestState();
  }

  function applyLoggedInState(user) {
    const name = user.displayName || user.username || '회원';
    // Update header login button to user profile button
    const loginBtns = document.querySelectorAll('a[href="/login"], button[data-action="login"]');
    loginBtns.forEach(btn => {
      btn.textContent = name;
      btn.setAttribute('href', '/profile');
    });

    // Update greeting if present
    const greetingEl = document.getElementById('user-greeting');
    if (greetingEl) greetingEl.textContent = name + '님 환영합니다';
  }

  function applyGuestState() {
    // If guest, show clear friendly trial prompt instead of broken error message
    const balanceEl = document.getElementById('user-balance-display');
    if (balanceEl) {
      balanceEl.innerHTML = '<span class="text-emerald-400">10,000 WLD</span> <span class="text-xs font-normal text-slate-400">(체험 잔액)</span>';
    }
  }

  async function loadWalletBalance() {
    try {
      const res = await fetch('/api/v1/wallet', { credentials: 'same-origin' });
      if (res.ok) {
        const w = await res.json();
        const amt = w.availableBalance || w.totalAssets || w.balance || 0;
        const balanceEl = document.getElementById('user-balance-display');
        if (balanceEl) {
          balanceEl.innerHTML = '<span class="text-emerald-400 font-mono font-bold">' + formatNumber(amt) + '</span> <span class="text-xs font-normal text-slate-400">WLD</span>';
        }
      }
    } catch (e) {
      console.warn('[Moneyverse Wallet] Load error:', e);
    }
  }

  // --- 3. 10 Major Stocks Live Binding ---
  const stockCache = {};
  async function loadInitialStocks() {
    try {
      const res = await fetch('/api/v1/stocks', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        const list = data.stocks || data || [];
        if (Array.isArray(list) && list.length > 0) {
          list.forEach(s => stockCache[s.symbol] = s);
          renderStockList(list.slice(0, 10));
        }
      }
    } catch (e) {
      console.warn('[Moneyverse Stocks] Load error:', e);
    }
  }

  function updateSingleStock(tick) {
    if (!tick || !tick.symbol) return;
    const item = stockCache[tick.symbol] || {};
    item.symbol = tick.symbol;
    if (tick.price) item.current_price = tick.price;
    if (tick.changeRate !== undefined) item.change_rate = tick.changeRate;
    stockCache[tick.symbol] = item;

    const row = document.querySelector('[data-stock-symbol="' + tick.symbol + '"]');
    if (row) {
      const priceEl = row.querySelector('.stock-price');
      const pctEl = row.querySelector('.stock-pct');
      if (priceEl && tick.price) {
        priceEl.textContent = formatNumber(tick.price) + ' WLD';
        priceEl.classList.add('bg-emerald-500/20');
        setTimeout(() => priceEl.classList.remove('bg-emerald-500/20'), 800);
      }
      if (pctEl && tick.changeRate !== undefined) {
        const isUp = tick.changeRate >= 0;
        pctEl.className = 'stock-pct text-xs font-bold tabular-nums ' + (isUp ? 'text-red-400' : 'text-blue-400');
        pctEl.textContent = (isUp ? '+' : '') + Number(tick.changeRate).toFixed(1) + '%';
      }
    }
  }

  function renderStockList(stocks) {
    const container = document.getElementById('market-movers-container');
    if (!container) return;

    if (stocks.length === 0) {
      container.innerHTML = '<div class="p-4 text-center text-xs text-slate-400">상장 종목 시세를 준비 중입니다.</div>';
      return;
    }

    let html = '';
    stocks.forEach(s => {
      const cur = Number(s.current_price || s.price || 1000);
      const open = Number(s.day_open_price || s.open_price || cur);
      const pct = open > 0 ? ((cur - open) / open * 100) : 0;
      const isUp = pct >= 0;
      const name = s.name_ko || s.name || s.symbol;

      html += '<a href="/stocks/' + encodeURIComponent(s.symbol) + '" data-stock-symbol="' + s.symbol + '" class="flex items-center justify-between gap-3 min-w-0 min-h-[52px] p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 transition-all group">';
      html += '  <div class="flex items-center gap-2.5 min-w-0">';
      html += '    <span class="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200">' + s.symbol + '</span>';
      html += '    <span class="text-xs sm:text-sm font-bold text-slate-200 truncate group-hover:text-primary transition-colors">' + name + '</span>';
      html += '  </div>';
      html += '  <div class="text-right font-mono shrink-0 pl-2">';
      html += '    <div class="stock-price text-xs sm:text-sm font-extrabold text-slate-100 tabular-nums transition-colors duration-300">' + formatNumber(cur) + ' <span class="text-[10px] text-slate-400 font-normal">WLD</span></div>';
      html += '    <div class="stock-pct text-xs font-bold tabular-nums ' + (isUp ? 'text-red-400' : 'text-blue-400') + '">' + (isUp ? '+' : '') + pct.toFixed(1) + '%</div>';
      html += '  </div>';
      html += '</a>';
    });
    container.innerHTML = html;
  }

  // --- 4. Language Selector & Dropdowns ---
  function initUIInteractions() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // --- 5. Boot Up ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  function run() {
    console.log('[Moneyverse Live Engine] Bootstrapped with Spring Boot + Netty Socket.IO');
    initSocket();
    initAuthAndWallet();
    loadInitialStocks();
    initUIInteractions();
  }
})();
