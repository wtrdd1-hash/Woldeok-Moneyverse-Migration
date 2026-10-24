'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { groupDigits, isPositiveWldInput } from '@/lib/money';
import { Send, Search, CheckCircle2, User, AlertCircle } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';

interface Recipient {
  userId: string;
  displayName: string;
}

export function P2PTransferModal({ triggerText }: { triggerText?: string }) {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    recipientName: string;
    amount: string;
    message?: string | undefined;
    sticker?: string | undefined;
    txId: string;
  } | null>(null);

  const STICKERS = [
    {
      id: 'cheer',
      label: localeLabel(locale, '🎉 축하해', '🎉 Congrats', '🎉 おめでとう', '🎉 祝贺', '🎉 Chúc mừng'),
    },
    {
      id: 'coffee',
      label: localeLabel(locale, '☕ 커피 한잔', '☕ Coffee on me', '☕ コーヒー一杯', '☕ 请喝咖啡', '☕ Mời ly cà phê'),
    },
    {
      id: 'debt',
      label: localeLabel(locale, '💸 빚 청산', '💸 Debt cleared', '💸 借金返済', '💸 还清债务', '💸 Thanh toán nợ'),
    },
    {
      id: 'rocket',
      label: localeLabel(locale, '🚀 떡상 기원', '🚀 To the moon', '🚀 爆上がり祈願', '🚀 暴涨暴富', '🚀 Chúc phát tài'),
    },
    {
      id: 'thanks',
      label: localeLabel(locale, '❤️ 고마워', '❤️ Thank you', '❤️ ありがとう', '❤️ 感谢有你', '❤️ Cảm ơn bạn'),
    },
    {
      id: 'pizza',
      label: localeLabel(locale, '🍕 맛있는 밥', '🍕 Treat meal', '🍕 美味しいご飯', '🍕 请吃顿饭', '🍕 Bữa ăn ngon'),
    },
  ];

  // 수취인 검색 디바운스
  useEffect(() => {
    if (!searchQuery.trim() || selectedRecipient) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/transfers/search?query=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.recipients || []);
        }
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedRecipient]);

  const handleTransfer = async () => {
    if (!selectedRecipient || !isPositiveWldInput(amount)) {
      setErrorMsg(
        localeLabel(
          locale,
          '수취인과 송금 금액(1 WLD 이상)을 입력해주세요.',
          'Please enter a recipient and transfer amount (min 1 WLD).',
          '受取人と送金金額（1 WLD以上）を入力してください。',
          '请输入收款人和转账金额（至少 1 WLD）。',
          'Vui lòng nhập người nhận và số tiền chuyển (tối thiểu 1 WLD).'
        )
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/transfers/p2p', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUserId: selectedRecipient.userId,
          amount,
          message: message.trim() || undefined,
          sticker: selectedSticker || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(
          data.error ||
            localeLabel(
              locale,
              '송금 처리에 실패했습니다.',
              'Transfer processing failed.',
              '送金処理に失敗しました。',
              '转账处理失败。',
              'Xử lý chuyển tiền thất bại.'
            )
        );
        setIsSubmitting(false);
        return;
      }

      setReceipt({
        recipientName: selectedRecipient.displayName,
        amount,
        message: message.trim() || undefined,
        sticker: selectedSticker || undefined,
        txId: data.transactionId || 'TX-' + Math.random().toString(36).slice(2, 9),
      });
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          localeLabel(
            locale,
            '네트워크 오류가 발생했습니다.',
            'A network error occurred.',
            'ネットワークエラーが発生しました。',
            '发生网络错误。',
            'Đã xảy ra lỗi mạng.'
          )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedRecipient(null);
    setSearchQuery('');
    setAmount('');
    setMessage('');
    setSelectedSticker(null);
    setErrorMsg(null);
    setReceipt(null);
  };

  const defaultTrigger = localeLabel(
    locale,
    '스마트 P2P 송금',
    'Smart P2P Transfer',
    'スマート P2P 送金',
    '智能 P2P 转账',
    'Chuyển tiền P2P'
  );

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) handleReset(); }}>
      <DialogTrigger asChild>
        <Button className="h-10 px-4 font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/10">
          <Send className="h-4 w-4 mr-2" />
          {triggerText || defaultTrigger}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md border-border/60 bg-card/95 backdrop-blur-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {localeLabel(
                  locale,
                  '1:1 P2P 스마트 안심 송금',
                  '1:1 P2P Smart Safe Transfer',
                  '1:1 P2P スマート安全送金',
                  '1:1 P2P 智能安全转账',
                  'Chuyển tiền P2P Nhanh chóng'
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {localeLabel(
                  locale,
                  '수수료 0원! 감사 메모와 귀여운 스티커를 동봉해 마음을 전하세요.',
                  'Zero fee! Send thoughtful notes and expressive stickers directly.',
                  '手数料無料！感謝メッセージと可愛いスタンプを添えて気持ちを伝えましょう。',
                  '0 手续费！附上感谢留言与专属表情传递心意。',
                  'Miễn phí 0đ! Gửi kèm lời nhắn và nhãn dán biểu cảm trực tiếp.'
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {receipt ? (
          /* 송금 완료 영수증 */
          <div className="py-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {localeLabel(locale, '송금 완료!', 'Transfer Complete!', '送金完了！', '转账完成！', 'Chuyển tiền thành công!')}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {localeLabel(
                locale,
                '수취인에게 실시간 알림이 발송되었습니다.',
                'Real-time notification delivered to recipient ledger.',
                '受取人にリアルタイム通知が送信されました。',
                '已向收款人发送实时账单通知。',
                'Thông báo thời gian thực đã được gửi đến người nhận.'
              )}
            </p>

            <div className="w-full mt-5 p-4 rounded-xl border border-border/50 bg-muted/20 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">
                  {localeLabel(locale, '받는 분', 'Recipient', '受取人', '收款人', 'Người nhận')}
                </span>
                <span className="font-semibold text-foreground">{receipt.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">
                  {localeLabel(locale, '보낸 금액', 'Amount Sent', '送金金額', '转账金额', 'Số tiền gửi')}
                </span>
                <span className="font-mono font-bold text-primary text-base">{receipt.amount} WLD</span>
              </div>
              {receipt.message && (
                <div className="flex justify-between pt-1 border-t border-border/30">
                  <span className="text-muted-foreground text-xs">
                    {localeLabel(locale, '동봉 메시지', 'Memo', 'メッセージ', '附言', 'Lời nhắn')}
                  </span>
                  <span className="text-xs font-medium text-foreground">{receipt.message}</span>
                </div>
              )}
              {receipt.sticker && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">
                    {localeLabel(locale, '스티커', 'Sticker', 'スタンプ', '贴纸', 'Nhãn dán')}
                  </span>
                  <Badge variant="outline" className="text-xs">{receipt.sticker}</Badge>
                </div>
              )}
            </div>

            <Button onClick={handleReset} className="w-full mt-6 h-11 rounded-xl font-bold">
              {localeLabel(locale, '새로운 송금하기', 'Make Another Transfer', '新しい送金を行う', '发起新转账', 'Thực hiện chuyển tiền mới')}
            </Button>
          </div>
        ) : (
          /* 송금 폼 */
          <div className="space-y-4 pt-2">
            {/* 1. 수취인 검색 / 선택 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>
                  {localeLabel(locale, '받는 사람 (닉네임)', 'Recipient (Nickname)', '受取人 (ニックネーム)', '收款人（昵称）', 'Người nhận (Biệt danh)')}
                </span>
                {selectedRecipient && (
                  <button
                    onClick={() => { setSelectedRecipient(null); setSearchQuery(''); }}
                    className="text-xs text-primary underline"
                  >
                    {localeLabel(locale, '변경', 'Change', '変更', '更改', 'Thay đổi')}
                  </button>
                )}
              </label>

              {selectedRecipient ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-primary/40 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">{selectedRecipient.displayName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{selectedRecipient.userId.slice(0, 8)}...</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                    {localeLabel(locale, '인증됨', 'Verified', '認証済み', '已认证', 'Đã xác minh')}
                  </Badge>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={localeLabel(
                      locale,
                      '수취인 닉네임을 검색하세요...',
                      'Search recipient by nickname...',
                      '受取人のニックネームを検索...',
                      '搜索收款人昵称...',
                      'Tìm kiếm người nhận theo biệt danh...'
                    )}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 rounded-xl"
                  />
                  {/* 검색 결과 드롭다운 */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-44 overflow-y-auto rounded-xl border border-border/60 bg-popover/95 p-1 shadow-xl backdrop-blur-md">
                      {searchResults.map((user) => (
                        <button
                          key={user.userId}
                          type="button"
                          onClick={() => { setSelectedRecipient(user); setSearchResults([]); }}
                          className="w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg hover:bg-muted transition-colors"
                        >
                          <span className="font-semibold text-foreground">{user.displayName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{user.userId.slice(0, 6)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {isSearching && (
                    <div className="absolute right-3 top-3 text-[11px] text-muted-foreground animate-pulse">
                      {localeLabel(locale, '검색 중...', 'Searching...', '検索中...', '搜索中...', 'Đang tìm kiếm...')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. 금액 입력 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {localeLabel(locale, '송금 금액 (WLD)', 'Transfer Amount (WLD)', '送金金額 (WLD)', '转账金额 (WLD)', 'Số tiền chuyển (WLD)')}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11 font-mono text-base font-bold pr-14 rounded-xl"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-muted-foreground">WLD</span>
              </div>
              {/* 퀵 프리셋 버튼 */}
              <div className="flex gap-1.5 pt-1">
                {[10, 50, 100, 500].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(String(preset))}
                    className="h-7 text-xs px-2.5 rounded-lg border-border/40 font-mono"
                  >
                    +{preset}
                  </Button>
                ))}
              </div>
            </div>

            {/* 3. 감사 메모 (선택) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-foreground">
                  {localeLabel(locale, '감사 메모 (선택)', 'Personal Memo (Optional)', 'メッセージ (任意)', '附言（可选）', 'Lời nhắn (Tùy chọn)')}
                </label>
                <span className="text-[10px] text-muted-foreground">{message.length}/30</span>
              </div>
              <Input
                placeholder={localeLabel(
                  locale,
                  '도박 빚 갚는다! / 커피 맛있게 마셔',
                  'Thanks for the coffee! / Bill split',
                  'コーヒーごちそうさま！ / 割り勘',
                  '请你喝咖啡！ / 账单分摊',
                  'Cảm ơn bạn nhé! / Chia tiền cà phê'
                )}
                maxLength={30}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="h-9 rounded-xl text-xs"
              />
            </div>

            {/* 4. 스티커 동봉 (선택) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {localeLabel(locale, '감정 스티커 동봉', 'Attach Expressive Sticker', 'スタンプを添える', '附带表情贴纸', 'Đính kèm nhãn dán')}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {STICKERS.map((stk) => (
                  <button
                    key={stk.id}
                    type="button"
                    onClick={() => setSelectedSticker(selectedSticker === stk.label ? null : stk.label)}
                    className={`px-2 py-1.5 rounded-lg border text-xs text-center transition-all ${
                      selectedSticker === stk.label
                        ? 'border-blue-500 bg-blue-500/15 text-blue-400 font-bold ring-1 ring-blue-500/30'
                        : 'border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                    }`}
                  >
                    {stk.label}
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 송금 버튼 */}
            <Button
              onClick={handleTransfer}
              disabled={isSubmitting || !selectedRecipient || !isPositiveWldInput(amount)}
              className="w-full h-11 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white mt-2 shadow-lg shadow-blue-500/20"
            >
              {isSubmitting
                ? localeLabel(locale, '안심 송금 처리 중...', 'Processing transfer...', '送金処理中...', '转账处理中...', 'Đang xử lý chuyển tiền...')
                : `${amount ? groupDigits(amount) : 0} WLD ${localeLabel(locale, '즉시 송금하기', 'Send Now', '即時送金する', '立即转账', 'Chuyển tiền ngay')}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
