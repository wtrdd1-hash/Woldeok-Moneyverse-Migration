(function () {
  'use strict';

  const byId = id => document.getElementById(id);
  let standing = null;
  let pockets = [];
  let interestTimer = null;
  let liveUnclaimed = 0;

  function formatWld(val) {
    if (!val && val !== 0) return '0 WLD';
    const num = Number(val);
    if (!Number.isFinite(num)) return String(val) + ' WLD';
    return num.toLocaleString('ko-KR') + ' WLD';
  }

  async function apiFetch(url, options = {}) {
    const opts = Object.assign({
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }, options);
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || ('HTTP ' + res.status);
      throw new Error(msg);
    }
    return data && data.data !== undefined ? data.data : data;
  }

  function renderStanding() {
    if (!standing) return;

    const cash = Number(standing.cashBalanceWld || 0);
    const deposit = Number(standing.depositBalanceWld || 0);
    const loan = Number(standing.loanBalanceWld || 0);
    const bonds = Number(standing.bondHoldingsValueWld || 0);
    const netWorth = cash + deposit + bonds - loan;

    byId('kpi-net-worth').textContent = formatWld(netWorth);
    byId('kpi-cash-bal').textContent = formatWld(cash);
    byId('kpi-deposit-bal').textContent = formatWld(deposit);
    byId('kpi-loan-bal').textContent = formatWld(loan);

    byId('badge-credit-grade').textContent = '신용 ' + (standing.creditGrade || 'A1') + ' 등급';
    byId('val-interest-rate').textContent = (standing.depositInterestRateAnnualPercent || '4.50%');

    liveUnclaimed = Number(standing.accruedInterestWld || 0);
    byId('val-unclaimed-interest').textContent = liveUnclaimed.toLocaleString('ko-KR');

    // Loan tab data
    byId('loan-grade-val').textContent = (standing.creditGrade || 'A1') + ' 등급';
    byId('loan-limit-val').textContent = formatWld(standing.creditLimitWld || 5000000);
    byId('loan-rate-val').textContent = '연 ' + (standing.dailyInterestRatePct ? (parseFloat(standing.dailyInterestRatePct) * 365).toFixed(2) + '%' : '3.20%');

    const activeLoan = standing.activeLoan;
    const loanTag = byId('loan-status-tag');
    const loanInfo = byId('active-loan-info');
    const repayForm = byId('form-bank-repay');

    if (activeLoan && activeLoan.loan_id) {
      loanTag.textContent = '대출 이용 중';
      loanTag.className = 'tag-pill highlight';
      loanInfo.innerHTML = `
        <div class="loan-fact-row"><span>대출 원금</span><strong>${formatWld(activeLoan.principal_amount)}</strong></div>
        <div class="loan-fact-row"><span>현재 잔여 부채</span><strong style="color:#F87171;">${formatWld(activeLoan.outstanding_amount)}</strong></div>
        <div class="loan-fact-row"><span>최소 상환 금액</span><strong>${formatWld(activeLoan.minimum_repayment || 0)}</strong></div>
      `;
      repayForm.style.display = 'block';
    } else {
      loanTag.textContent = '이용 중인 대출 없음';
      loanTag.className = 'tag-pill';
      loanInfo.innerHTML = '<p class="empty-loan-text">현재 이용 중인 대출이 없습니다. 필요 시 신용 한도 내에서 언제든 즉시 실행할 수 있습니다.</p>';
      repayForm.style.display = 'none';
    }

    // Bonds tab
    const bondsCont = byId('bonds-holdings-container');
    if (standing.bonds && standing.bonds.length > 0) {
      bondsCont.innerHTML = standing.bonds.map(b => `
        <div class="bond-product-card" style="margin-bottom:0.75rem;">
          <div class="bond-term">${b.bond_name || b.bond_code || '가상 국채'}</div>
          <div class="bond-rate">원금: ${formatWld(b.principal_amount)} → 만기: ${formatWld(b.maturity_amount)}</div>
          <div class="bond-min">상태: ${b.status} (만기일: ${b.maturity_at ? b.maturity_at.slice(0, 10) : '—'})</div>
        </div>
      `).join('');
    } else {
      bondsCont.innerHTML = '<p class="empty-loan-text">현재 보유 중인 채권이 없습니다.</p>';
    }
  }

  function startLiveInterestCounter() {
    if (interestTimer) clearInterval(interestTimer);
    interestTimer = setInterval(() => {
      if (!standing) return;
      const deposit = Number(standing.depositBalanceWld || 0);
      if (deposit <= 0) return;
      // 4.5% annual interest converted to per-second fractional increment
      const perSec = (deposit * 0.045) / (365 * 24 * 3600);
      liveUnclaimed += perSec;
      byId('val-unclaimed-interest').textContent = Math.floor(liveUnclaimed).toLocaleString('ko-KR');
    }, 1000);
  }

  async function loadStanding() {
    const statusBar = byId('bank-status-bar');
    try {
      standing = await apiFetch('/api/v1/banking/standing');
      renderStanding();
      startLiveInterestCounter();
      if (statusBar) statusBar.textContent = '실시간 은행 원장 계좌가 안전하게 동기화되었습니다.';
    } catch (e) {
      if (statusBar) statusBar.textContent = '은행 정보를 불러오지 못했습니다: ' + e.message;
    }
  }

  async function loadPockets() {
    const cont = byId('pockets-container');
    try {
      pockets = await apiFetch('/api/v1/banking/pockets');
      if (!pockets || pockets.length === 0) {
        cont.innerHTML = `
          <div class="pocket-card" style="text-align:center;padding:2rem;">
            <p style="color:#94A3B8;margin-bottom:1rem;">생성된 비상금 저금통 팟이 없습니다.</p>
            <button type="button" class="btn-create-pocket" onclick="document.getElementById('modal-create-pocket').showModal()">+ 첫 저금통 만들기</button>
          </div>
        `;
        return;
      }

      cont.innerHTML = pockets.map(p => {
        const bal = Number(p.balance || 0);
        const target = Number(p.target_amount || 100000);
        const pct = Math.min(100, Math.round((bal / target) * 100));
        return `
          <div class="pocket-card" data-pocket-id="${p.id}">
            <div class="pocket-card-top">
              <span class="pocket-card-title">${p.name}</span>
              <span class="tag-pill positive">${pct}% 달성</span>
            </div>
            <div class="pocket-card-amounts">
              <strong class="pocket-bal">${bal.toLocaleString('ko-KR')} WLD</strong>
              <span class="pocket-target">목표: ${target.toLocaleString('ko-KR')} WLD</span>
            </div>
            <div class="pocket-progress-track">
              <div class="pocket-progress-bar" style="width:${pct}%;"></div>
            </div>
            <div class="pocket-actions">
              <button type="button" class="btn-pocket-action btn-manage-pocket" data-id="${p.id}" data-name="${p.name}">보관금 채우기/꺼내기</button>
            </div>
          </div>
        `;
      }).join('');

      document.querySelectorAll('.btn-manage-pocket').forEach(btn => {
        btn.addEventListener('click', () => {
          byId('transfer-pocket-id').value = btn.dataset.id;
          byId('transfer-pocket-title').textContent = btn.dataset.name + ' 보관금 관리';
          byId('modal-transfer-pocket').showModal();
        });
      });
    } catch (e) {
      cont.innerHTML = '<div class="pocket-loading-placeholder">저금통을 불러오지 못했습니다.</div>';
    }
  }

  function setupTabs() {
    document.querySelectorAll('.bank-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bank-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.bank-tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = byId('tab-pane-' + btn.dataset.tab);
        if (target) target.classList.add('active');
      });
    });
  }

  function setupForms() {
    // Quick Amount Buttons
    document.querySelectorAll('.quick-amt-dep').forEach(btn => {
      btn.addEventListener('click', () => byId('deposit-amount-input').value = btn.dataset.amount);
    });
    byId('btn-deposit-max').addEventListener('click', () => {
      if (standing) byId('deposit-amount-input').value = standing.cashBalanceWld || '0';
    });

    document.querySelectorAll('.quick-amt-wth').forEach(btn => {
      btn.addEventListener('click', () => byId('withdraw-amount-input').value = btn.dataset.amount);
    });
    byId('btn-withdraw-max').addEventListener('click', () => {
      if (standing) byId('withdraw-amount-input').value = standing.depositBalanceWld || '0';
    });

    // Deposit Form
    byId('form-bank-deposit').addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = byId('deposit-amount-input');
      const msg = byId('msg-deposit-result');
      const amount = Number(input.value);
      if (!amount || amount <= 0) return;

      msg.textContent = '입금 처리 중…';
      msg.className = 'bank-inline-msg';
      try {
        const res = await apiFetch('/api/v1/banking/deposit', {
          method: 'POST',
          body: JSON.stringify({ amountWld: amount })
        });
        msg.textContent = (res && res.message) || '성공적으로 예금 입금되었습니다.';
        msg.className = 'bank-inline-msg positive';
        input.value = '';
        await loadStanding();
      } catch (err) {
        msg.textContent = '입금 실패: ' + err.message;
        msg.className = 'bank-inline-msg negative';
      }
    });

    // Withdraw Form
    byId('form-bank-withdraw').addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = byId('withdraw-amount-input');
      const msg = byId('msg-withdraw-result');
      const amount = Number(input.value);
      if (!amount || amount <= 0) return;

      msg.textContent = '출금 처리 중…';
      msg.className = 'bank-inline-msg';
      try {
        const res = await apiFetch('/api/v1/banking/withdraw', {
          method: 'POST',
          body: JSON.stringify({ amountWld: amount })
        });
        msg.textContent = (res && res.message) || '성공적으로 예금 인출되었습니다.';
        msg.className = 'bank-inline-msg positive';
        input.value = '';
        await loadStanding();
      } catch (err) {
        msg.textContent = '출금 실패: ' + err.message;
        msg.className = 'bank-inline-msg negative';
      }
    });

    // Claim Interest Hero Button
    byId('btn-claim-interest-hero').addEventListener('click', async () => {
      const btn = byId('btn-claim-interest-hero');
      btn.disabled = true;
      btn.textContent = '정산 처리 중…';
      try {
        const res = await apiFetch('/api/v1/banking/claim-interest', {
          method: 'POST',
          body: JSON.stringify({})
        });
        alert('🎉 ' + ((res && res.message) || '복리 이자가 지급되었습니다!'));
        await loadStanding();
      } catch (err) {
        alert('이자 수령 안내: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = '지금 이자 받기';
      }
    });

    // Borrow Form
    byId('form-bank-borrow').addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = byId('borrow-amount-input');
      const msg = byId('msg-borrow-result');
      const amount = Number(input.value);
      if (!amount || amount <= 0) return;

      msg.textContent = '대출 심사 및 실행 중…';
      msg.className = 'bank-inline-msg';
      try {
        const res = await apiFetch('/api/v1/banking/borrow', {
          method: 'POST',
          body: JSON.stringify({ principalAmount: amount })
        });
        msg.textContent = (res && res.message) || '가상 대출이 승인되어 지갑으로 지급되었습니다.';
        msg.className = 'bank-inline-msg positive';
        input.value = '';
        await loadStanding();
      } catch (err) {
        msg.textContent = '대출 거절/실패: ' + err.message;
        msg.className = 'bank-inline-msg negative';
      }
    });

    // Repay Form
    byId('form-bank-repay').addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = byId('repay-amount-input');
      const msg = byId('msg-repay-result');
      const amount = Number(input.value);
      if (!amount || amount <= 0) return;

      msg.textContent = '상환 처리 중…';
      msg.className = 'bank-inline-msg';
      try {
        const res = await apiFetch('/api/v1/banking/repay', {
          method: 'POST',
          body: JSON.stringify({
            principalAmount: amount,
            loanId: standing && standing.activeLoan ? standing.activeLoan.loan_id : null
          })
        });
        msg.textContent = (res && res.message) || '상환이 성공적으로 완료되었습니다.';
        msg.className = 'bank-inline-msg positive';
        input.value = '';
        await loadStanding();
      } catch (err) {
        msg.textContent = '상환 실패: ' + err.message;
        msg.className = 'bank-inline-msg negative';
      }
    });

    // Create Pocket Modal
    byId('btn-open-create-pocket').addEventListener('click', () => {
      byId('modal-create-pocket').showModal();
    });
    byId('btn-close-modal-pocket').addEventListener('click', () => byId('modal-create-pocket').close());
    byId('btn-cancel-pocket').addEventListener('click', () => byId('modal-create-pocket').close());

    byId('form-create-pocket-action').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = byId('pocket-name-input').value.trim();
      const target = Number(byId('pocket-target-input').value);
      try {
        await apiFetch('/api/v1/banking/pockets', {
          method: 'POST',
          body: JSON.stringify({ name, targetAmount: target })
        });
        byId('modal-create-pocket').close();
        byId('pocket-name-input').value = '';
        await loadPockets();
      } catch (err) {
        alert('저금통 생성 실패: ' + err.message);
      }
    });

    // Pocket Transfer Modal
    let pocketMode = 'deposit';
    byId('btn-close-modal-transfer').addEventListener('click', () => byId('modal-transfer-pocket').close());
    byId('btn-cancel-transfer-pocket').addEventListener('click', () => byId('modal-transfer-pocket').close());
    byId('btn-pocket-mode-dep').addEventListener('click', () => {
      pocketMode = 'deposit';
      byId('btn-pocket-mode-dep').classList.add('active');
      byId('btn-pocket-mode-wth').classList.remove('active');
    });
    byId('btn-pocket-mode-wth').addEventListener('click', () => {
      pocketMode = 'withdraw';
      byId('btn-pocket-mode-wth').classList.add('active');
      byId('btn-pocket-mode-dep').classList.remove('active');
    });

    byId('form-transfer-pocket-action').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pocketId = byId('transfer-pocket-id').value;
      const amount = Number(byId('transfer-pocket-amount').value);
      const msg = byId('msg-pocket-transfer-res');
      if (!amount || amount <= 0) return;

      msg.textContent = '이동 처리 중…';
      try {
        await apiFetch(`/api/v1/banking/pockets/${pocketId}/transfer`, {
          method: 'POST',
          body: JSON.stringify({ amountWld: amount, direction: pocketMode })
        });
        byId('modal-transfer-pocket').close();
        byId('transfer-pocket-amount').value = '';
        await Promise.all([loadStanding(), loadPockets()]);
      } catch (err) {
        msg.textContent = '이체 실패: ' + err.message;
        msg.className = 'bank-inline-msg negative';
      }
    });
  }

  function init() {
    setupTabs();
    setupForms();
    loadStanding();
    loadPockets();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
