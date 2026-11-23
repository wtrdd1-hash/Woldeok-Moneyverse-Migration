(function() {
  'use strict';

  const defaultStocks = [
    { code: '005930', name: '월덕전자 (W-Electronics)', price: 74500, change: +1.8, volume: 15420310 },
    { code: '000660', name: '덕산하이닉스 (D-Hynix)', price: 178200, change: +3.2, volume: 4892100 },
    { code: '035420', name: '네이버스 (NAVER-S)', price: 194000, change: -0.8, volume: 1120400 },
    { code: '035720', name: '카카오버스티 (KakaoVerse)', price: 44200, change: +0.4, volume: 2451000 },
    { code: '005380', name: '머니현대차 (M-Motors)', price: 241500, change: +2.1, volume: 981200 },
    { code: '373220', name: '에너지솔루션 (W-Energy)', price: 382000, change: -1.4, volume: 620400 },
    { code: '068270', name: '셀트리온버스티 (C-Bio)', price: 181200, change: +0.2, volume: 741200 },
    { code: '005490', name: '포스코홀딩스 (P-Steel)', price: 362500, change: -0.5, volume: 412000 }
  ];

  function formatNumber(num) {
    return Number(num).toLocaleString('ko-KR');
  }

  function initTabs() {
    const tabButtons = document.querySelectorAll('.stocks-tab-btn');
    const tabPanels = document.querySelectorAll('.stocks-tab-panel');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePanel = document.getElementById('panel-' + target);
        if (activePanel) activePanel.classList.add('active');
      });
    });
  }

  function renderStockList() {
    const tbody = document.getElementById('stocks-list-tbody');
    if (!tbody) return;

    tbody.innerHTML = defaultStocks.map(stock => {
      const isUp = stock.change > 0;
      const isDown = stock.change < 0;
      const changeClass = isUp ? 'up' : (isDown ? 'down' : 'flat');
      const sign = isUp ? '+' : '';

      return `
        <tr>
          <td>
            <div class="stock-name-cell">
              <span class="stock-name-title">${stock.name}</span>
              <span class="stock-code-sub">${stock.code}</span>
            </div>
          </td>
          <td><strong class="stock-price">${formatNumber(stock.price)} WLD</strong></td>
          <td><span class="stock-change ${changeClass}">${sign}${stock.change.toFixed(2)}%</span></td>
          <td>${formatNumber(stock.volume)}</td>
          <td>
            <button type="button" class="btn-stock-trade" onclick="window.openTradeModal('${stock.code}', '${stock.name}', ${stock.price})">모의주문</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function loadUserPortfolio() {
    fetch('/api/v1/wallet/verified-summary', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(data => {
        const total = data.totalBalance || data.verifiedBalanceWld || '394,728';
        const netWorthEl = document.getElementById('kpi-invest-total');
        if (netWorthEl) netWorthEl.textContent = formatNumber(total) + ' WLD';
        
        const cashEl = document.getElementById('kpi-invest-cash');
        if (cashEl) cashEl.textContent = formatNumber(data.cashBalance || total) + ' WLD';
      })
      .catch(() => {});
  }

  window.openTradeModal = function(code, name, price) {
    const modal = document.getElementById('stock-trade-modal');
    if (!modal) return;
    document.getElementById('modal-stock-name').textContent = `${name} (${code})`;
    document.getElementById('modal-stock-price').textContent = `${formatNumber(price)} WLD`;
    document.getElementById('trade-stock-code').value = code;
    document.getElementById('trade-stock-price').value = price;
    modal.showModal();
  };

  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    renderStockList();
    loadUserPortfolio();

    const closeModalBtn = document.getElementById('modal-trade-close');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        document.getElementById('stock-trade-modal')?.close();
      });
    }

    // Auto sync periodically (No manual refresh button needed)
    setInterval(() => {
      if (!document.hidden) {
        loadUserPortfolio();
      }
    }, 10000);
  });
})();
