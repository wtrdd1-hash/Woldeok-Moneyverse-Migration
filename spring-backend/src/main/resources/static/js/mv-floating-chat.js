/* Access only: delivery requires the receipt-backed member page, never an invented acknowledgement. */
(function(window) {
  'use strict';
  function start() {
    if(document.getElementById('mv-floating-chat-root')||document.getElementById('mv-support-launcher'))return;
    const root=document.createElement('div');root.id='mv-floating-chat-root';
    root.innerHTML='<button type="button" class="mv-floating-chat-btn" id="mv-floating-chat-trigger" aria-haspopup="dialog" aria-controls="mv-floating-chat-modal"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg></button>'+
      '<dialog class="mv-chat-modal" id="mv-floating-chat-modal" aria-labelledby="mv-safe-chat-heading"><div class="mv-chat-header"><h2 id="mv-safe-chat-heading"></h2><button type="button" class="mv-chat-close" id="mv-chat-close-btn">×</button></div><div class="mv-chat-body"><p id="mv-safe-chat-notice"></p><a class="mv-btn mv-btn-primary" id="mv-safe-support-link" href="/support"></a><a class="mv-btn mv-btn-accent" id="mv-safe-chat-link" href="/chat"></a></div></dialog>';
    document.body.appendChild(root);
    const trigger=document.getElementById('mv-floating-chat-trigger'),panel=document.getElementById('mv-floating-chat-modal'),close=document.getElementById('mv-chat-close-btn');
    const copy={
      en:['Help & chat','Contact support','Member messages','Continue on the support or message page and confirm delivery from its stored receipt.','Close'],
      ko:['고객지원·채팅','관리자 고객 문의','회원 1:1 채팅','고객지원 또는 쪽지 화면에서 접수·전송 결과를 확인하세요.','닫기'],
      ja:['サポートとチャット','サポート窓口','メンバーのメッセージ','サポートまたはメッセージ画面で、保存された受付結果を確認してください。','閉じる'],
      zh:['帮助与聊天','联系支持','会员消息','请在支持或消息页面确认已保存的接收和发送结果。','关闭'],
      vi:['Hỗ trợ và trò chuyện','Liên hệ hỗ trợ','Tin nhắn thành viên','Tiếp tục trên trang hỗ trợ hoặc tin nhắn và kiểm tra biên nhận đã lưu.','Đóng']
    };
    function localize() {
      const language=(document.documentElement.lang||'en').split('-')[0];const words=copy[language]||copy.en;
      document.getElementById('mv-safe-chat-heading').textContent=words[0];
      document.getElementById('mv-safe-support-link').textContent=words[1];
      document.getElementById('mv-safe-chat-link').textContent=words[2];
      document.getElementById('mv-safe-chat-notice').textContent=words[3];
      trigger.setAttribute('aria-label',words[0]);close.setAttribute('aria-label',words[4]);
    }
    let previousFocus=null;
    trigger.addEventListener('click',()=>{
      if(typeof panel.showModal!=='function'){window.location.href='/support';return;}
      previousFocus=document.activeElement;
      panel.classList.add('open');if(!panel.open)panel.showModal();close.focus();
    });
    close.addEventListener('click',()=>panel.close());
    panel.addEventListener('close',()=>{panel.classList.remove('open');if(previousFocus&&previousFocus.isConnected)previousFocus.focus();else trigger.focus();});
    if(typeof MutationObserver==='function')new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    localize();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);
