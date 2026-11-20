/**
 * Moneyverse Global 56px Floating Support & 1:1 Chat Widget
 * (v2026.11.20.1 Authority Compliance)
 */

(function(window) {
  'use strict';

  function initFloatingChat() {
    if (document.getElementById('mv-floating-chat-root')) return;

    var root = document.createElement('div');
    root.id = 'mv-floating-chat-root';

    root.innerHTML = 
      '<!-- Floating Circular Trigger Button (56x56) -->' +
      '<button type="button" class="mv-floating-chat-btn" id="mv-floating-chat-trigger" aria-label="Support and Chat">' +
        '<svg viewBox="0 0 24 24">' +
          '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>' +
        '</svg>' +
      '</button>' +

      '<!-- Expandable Support / Chat Modal -->' +
      '<div class="mv-chat-modal" id="mv-floating-chat-modal">' +
        '<div class="mv-chat-header">' +
          '<div class="mv-chat-tabs">' +
            '<button type="button" class="mv-chat-tab active" id="mv-tab-support" data-i18n="chat.tab_support">관리자 고객 문의</button>' +
            '<button type="button" class="mv-chat-tab" id="mv-tab-dm" data-i18n="chat.tab_dm">회원 1:1 채팅</button>' +
          '</div>' +
          '<button type="button" class="mv-chat-close" id="mv-chat-close-btn" aria-label="Close">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
          '</button>' +
        '</div>' +

        '<!-- Support Pane -->' +
        '<div class="mv-chat-body" id="mv-pane-support">' +
          '<div style="font-size: 0.85rem; color: var(--mv-text-secondary);">' +
            '월덕 머니버스 공식 관리자 및 보안팀에 1:1 지원 문의를 접수합니다. 처리 내역은 계정에 암호화되어 기록됩니다.' +
          '</div>' +
          '<div>' +
            '<label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; color: var(--mv-text-secondary);" data-i18n="chat.category_label">문의 분류</label>' +
            '<select class="mv-select" id="mv-support-category">' +
              '<option value="LEDGER">WLD 원장 및 잔액 문의</option>' +
              '<option value="ACCOUNT">계정 및 보안 인증 (2FA)</option>' +
              '<option value="MARKET">가상 주식 및 거래소 주문</option>' +
              '<option value="BUG">시스템 버그 및 오류 신고</option>' +
              '<option value="GENERAL">기타 일반 문의</option>' +
            '</select>' +
          '</div>' +
          '<div style="flex: 1; display: flex; flex-direction: column;">' +
            '<label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; color: var(--mv-text-secondary);">문의 내용 (최대 1,000자)</label>' +
            '<textarea class="mv-textarea" id="mv-support-body" style="flex: 1; resize: none;" placeholder="문의하실 내용을 자세히 입력해주세요..."></textarea>' +
          '</div>' +
          '<div id="mv-support-receipt" style="display: none; padding: 10px; border-radius: var(--mv-radius-sm); font-size: 0.82rem;"></div>' +
          '<button type="button" class="mv-btn mv-btn-primary" id="mv-support-submit" style="width: 100%;" data-i18n="chat.btn_send">문의 접수하기</button>' +
        '</div>' +

        '<!-- 1:1 DM Pane -->' +
        '<div class="mv-chat-body" id="mv-pane-dm" style="display: none;">' +
          '<div style="font-size: 0.85rem; color: var(--mv-text-secondary);">' +
            '회원 간 1:1 쪽지 및 실시간 다이렉트 메시지를 안전하게 전송합니다.' +
          '</div>' +
          '<div>' +
            '<label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; color: var(--mv-text-secondary);">상대방 유저 ID 또는 계정</label>' +
            '<input type="text" class="mv-input mv-input-mono" id="mv-dm-target" placeholder="수신자 UUID 또는 닉네임">' +
          '</div>' +
          '<div style="flex: 1; display: flex; flex-direction: column;">' +
            '<label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; color: var(--mv-text-secondary);">메시지 내용</label>' +
            '<textarea class="mv-textarea" id="mv-dm-body" style="flex: 1; resize: none;" placeholder="전송할 메시지를 입력하세요..."></textarea>' +
          '</div>' +
          '<div id="mv-dm-status" style="display: none; padding: 10px; border-radius: var(--mv-radius-sm); font-size: 0.82rem;"></div>' +
          '<button type="button" class="mv-btn mv-btn-accent" id="mv-dm-submit" style="width: 100%;">메시지 전송</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(root);

    // Event Bindings
    var triggerBtn = document.getElementById('mv-floating-chat-trigger');
    var modal = document.getElementById('mv-floating-chat-modal');
    var closeBtn = document.getElementById('mv-chat-close-btn');
    var tabSupport = document.getElementById('mv-tab-support');
    var tabDm = document.getElementById('mv-tab-dm');
    var paneSupport = document.getElementById('mv-pane-support');
    var paneDm = document.getElementById('mv-pane-dm');

    triggerBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      modal.classList.toggle('open');
    });

    closeBtn.addEventListener('click', function() {
      modal.classList.remove('open');
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        modal.classList.remove('open');
      }
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
      if (modal.classList.contains('open') && !modal.contains(e.target) && e.target !== triggerBtn) {
        modal.classList.remove('open');
      }
    });

    // Tab Switching
    tabSupport.addEventListener('click', function() {
      tabSupport.classList.add('active');
      tabDm.classList.remove('active');
      paneSupport.style.display = 'flex';
      paneDm.style.display = 'none';
    });

    tabDm.addEventListener('click', function() {
      tabDm.classList.add('active');
      tabSupport.classList.remove('active');
      paneDm.style.display = 'flex';
      paneSupport.style.display = 'none';
    });

    // Submit Support Inquiry
    var submitSupportBtn = document.getElementById('mv-support-submit');
    submitSupportBtn.addEventListener('click', async function() {
      var cat = document.getElementById('mv-support-category').value;
      var body = document.getElementById('mv-support-body').value.trim();
      var receiptEl = document.getElementById('mv-support-receipt');

      if (!body) {
        alert('문의 내용을 입력해주세요.');
        return;
      }
      if (body.length > 1000) {
        alert('문의 내용은 최대 1,000자까지 작성 가능합니다.');
        return;
      }

      submitSupportBtn.disabled = true;
      submitSupportBtn.textContent = '서버 영수증 발급 중...';

      try {
        var res = await fetch('/api/v1/support/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ category: cat, message: body, path: window.location.pathname })
        });
        var data = await res.json().catch(function() { return {}; });

        receiptEl.style.display = 'block';
        if (res.ok) {
          receiptEl.style.background = 'rgba(74, 222, 128, 0.15)';
          receiptEl.style.color = '#4ADE80';
          receiptEl.textContent = '✓ 문의가 정상 접수되었습니다. (영수증 ID: ' + (data.inquiryId || data.id || 'RCVD-' + Date.now()) + ')';
          document.getElementById('mv-support-body').value = '';
        } else {
          receiptEl.style.background = 'rgba(251, 113, 133, 0.15)';
          receiptEl.style.color = '#FB7185';
          receiptEl.textContent = '접수 실패: ' + (data.message || data.error || '잠시 후 다시 시도해주세요.');
        }
      } catch (err) {
        receiptEl.style.display = 'block';
        receiptEl.style.background = 'rgba(251, 113, 133, 0.15)';
        receiptEl.style.color = '#FB7185';
        receiptEl.textContent = '네트워크 통신 오류가 발생했습니다.';
      } finally {
        submitSupportBtn.disabled = false;
        submitSupportBtn.textContent = '문의 접수하기';
      }
    });

    // Submit 1:1 DM
    var submitDmBtn = document.getElementById('mv-dm-submit');
    submitDmBtn.addEventListener('click', async function() {
      var target = document.getElementById('mv-dm-target').value.trim();
      var body = document.getElementById('mv-dm-body').value.trim();
      var statusEl = document.getElementById('mv-dm-status');

      if (!target || !body) {
        alert('수신자와 메시지 내용을 모두 입력해주세요.');
        return;
      }

      submitDmBtn.disabled = true;
      submitDmBtn.textContent = '전송 중...';

      try {
        var res = await fetch('/api/v1/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ recipient: target, content: body })
        });
        var data = await res.json().catch(function() { return {}; });

        statusEl.style.display = 'block';
        if (res.ok) {
          statusEl.style.background = 'rgba(74, 222, 128, 0.15)';
          statusEl.style.color = '#4ADE80';
          statusEl.textContent = '✓ 메시지가 성공적으로 전송되었습니다.';
          document.getElementById('mv-dm-body').value = '';
        } else {
          statusEl.style.background = 'rgba(251, 113, 133, 0.15)';
          statusEl.style.color = '#FB7185';
          statusEl.textContent = '전송 실패: ' + (data.message || data.error || '수신자 확인 필요');
        }
      } catch (err) {
        statusEl.style.display = 'block';
        statusEl.style.background = 'rgba(251, 113, 133, 0.15)';
        statusEl.style.color = '#FB7185';
        statusEl.textContent = '메시지 전송 중 통신 오류가 발생했습니다.';
      } finally {
        submitDmBtn.disabled = false;
        submitDmBtn.textContent = '메시지 전송';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatingChat);
  } else {
    initFloatingChat();
  }

})(window);
