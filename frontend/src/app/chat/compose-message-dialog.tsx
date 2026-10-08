'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send,
  Search,
  User,
  ShieldCheck,
  RotateCw,
  Sparkles,
  PenSquare,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { sendAdminDirectMessage } from '@/app/admin/actions';

interface SearchedUser {
  readonly user_id: string;
  readonly display_name: string;
}

interface ComposeMessageDialogProps {
  readonly isAdmin?: boolean;
  readonly defaultPeerUserId?: string;
  readonly defaultPeerDisplayName?: string;
  readonly trigger?: React.ReactNode;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}

const ADMIN_TEMPLATES = [
  {
    title: '운영 안내',
    text: '[월덕 머니버스 공식 안내] 안녕하세요. 운영팀에서 회원님의 원활한 서비스 이용을 위해 안내 드립니다. ',
  },
  {
    title: '정책 주의',
    text: '[운영진 경고] 비정상적인 거래 시도 또는 부적절한 언행이 감지되었습니다. 규정 위반 반복 시 이용이 제한될 수 있습니다.',
  },
  {
    title: '보상 지급',
    text: '[이벤트 당첨] 축하드립니다! 이벤트 참여에 감사드리며 보상이 지급되었습니다. 내역을 확인해 주세요.',
  },
];

export function ComposeMessageDialog({
  isAdmin = false,
  defaultPeerUserId,
  defaultPeerDisplayName,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ComposeMessageDialogProps) {
  const router = useRouter();
  const { locale } = useLocale();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setIsOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<readonly SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(
    defaultPeerUserId
      ? { user_id: defaultPeerUserId, display_name: defaultPeerDisplayName ?? defaultPeerUserId }
      : null,
  );

  const [messageBody, setMessageBody] = useState('');
  const [isOfficialAdmin, setIsOfficialAdmin] = useState(isAdmin);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // 실시간 회원 검색 (디바운스 250ms)
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchedUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/app-api/v1/chat/search-users?query=${encodeURIComponent(query)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setSearchedUsers(data.users ?? []);
        }
      } catch {
        // 무시
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectUser = (u: SearchedUser) => {
    setSelectedUser(u);
    setSearchQuery('');
    setSearchedUsers([]);
    setStatusMessage(null);
  };

  const handleSend = async () => {
    if (!selectedUser) {
      setStatusMessage({ type: 'error', text: '쪽지를 받을 회원을 먼저 선택해 주세요.' });
      return;
    }
    const trimmed = messageBody.trim();
    if (trimmed.length < 2) {
      setStatusMessage({ type: 'error', text: '메시지를 2자 이상 입력해 주세요.' });
      return;
    }
    if (trimmed.length > 2000) {
      setStatusMessage({ type: 'error', text: '메시지는 최대 2000자까지 작성할 수 있어요.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      if (isAdmin && isOfficialAdmin) {
        // 1. 관리자 공식 쪽지 발송
        const formData = new FormData();
        formData.set('recipientUserId', selectedUser.user_id);
        formData.set('body', trimmed);
        const res = await sendAdminDirectMessage({ status: 'idle' }, formData);
        if (res.status === 'ok') {
          setStatusMessage({ type: 'ok', text: '공식 쪽지를 성공적으로 발송했습니다.' });
          setTimeout(() => {
            setIsOpen(false);
            setMessageBody('');
            setSelectedUser(null);
            router.refresh();
          }, 800);
        } else {
          setStatusMessage({ type: 'error', text: res.message ?? '발송 중 오류가 발생했습니다.' });
        }
      } else {
        // 2. 일반 1:1 쪽지 발송 (대화방 생성 및 메시지 전송)
        const openRes = await fetch('/app-api/v1/chat/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ peerUserId: selectedUser.user_id }),
        });

        if (!openRes.ok) {
          const err = await openRes.json().catch(() => ({}));
          throw new Error(err.message || '대화방을 생성할 수 없습니다.');
        }

        const openData = await openRes.json();
        const conversationId = openData.conversation_id;

        const msgRes = await fetch(`/app-api/v1/chat/conversations/${encodeURIComponent(conversationId)}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: trimmed }),
        });

        if (!msgRes.ok) {
          const err = await msgRes.json().catch(() => ({}));
          throw new Error(err.message || '메시지를 발송할 수 없습니다.');
        }

        setStatusMessage({ type: 'ok', text: '쪽지를 성공적으로 전송했습니다.' });
        setTimeout(() => {
          setIsOpen(false);
          setMessageBody('');
          setSelectedUser(null);
          router.push(`/chat?conversationId=${encodeURIComponent(conversationId)}`);
          router.refresh();
        }, 600);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '쪽지 전송 중 오류가 발생했습니다.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2 font-bold shadow-xs">
            <PenSquare className="size-4" />
            <span>{localeLabel(locale, '새 쪽지 작성', 'Compose Message', '新規作成', '写私信')}</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[480px] p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-black tracking-tight">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Send className="size-4" />
            </div>
            <span>{localeLabel(locale, '새 쪽지 보내기', 'Send Direct Message', 'メッセージ送信', '发送私信')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* 수신자 선택 영역 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
              <span>{localeLabel(locale, '받는 회원', 'Recipient', '宛先会員', '接收会员')}</span>
              {selectedUser && (
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-[11px] text-primary hover:underline font-normal"
                >
                  {localeLabel(locale, '상대방 변경', 'Change', '変更', '更改')}
                </button>
              )}
            </label>

            {selectedUser ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-xs shrink-0">
                    {selectedUser.display_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-sm truncate">{selectedUser.display_name}</p>
                    <p className="text-[10px] text-muted-foreground truncate font-mono">{selectedUser.user_id}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0 font-bold">
                  {localeLabel(locale, '선택됨', 'Selected', '選択中', '已选')}
                </Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder={localeLabel(
                      locale,
                      '받을 회원의 닉네임을 검색하세요…',
                      'Search member by nickname…',
                      '会員のニックネームを検索…',
                      '搜索接收会员的昵称…',
                    )}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 h-9 text-sm"
                    autoFocus
                  />
                  {isSearching && (
                    <RotateCw className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 animate-spin text-muted-foreground" />
                  )}
                </div>

                {/* 검색 결과 드롭다운 */}
                {searchQuery.trim() && (
                  <div className="max-h-[160px] overflow-y-auto rounded-xl border bg-card p-1 shadow-md space-y-0.5">
                    {searchedUsers.length > 0 ? (
                      searchedUsers.map((u) => (
                        <button
                          key={u.user_id}
                          type="button"
                          onClick={() => handleSelectUser(u)}
                          className="w-full p-2 rounded-lg hover:bg-muted/80 text-left flex items-center justify-between gap-2 transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="size-6 rounded-full bg-muted text-foreground flex items-center justify-center font-bold text-[11px] shrink-0">
                              {u.display_name.slice(0, 1).toUpperCase()}
                            </div>
                            <span className="font-bold text-xs truncate group-hover:text-primary">
                              {u.display_name}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground group-hover:text-primary font-bold shrink-0">
                            {localeLabel(locale, '선택', 'Select', '選択', '选择')}
                          </span>
                        </button>
                      ))
                    ) : !isSearching ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        {localeLabel(locale, '검색 결과가 없습니다.', 'No members found.', '結果が見つかりません。', '无搜索结果。')}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 관리자 공식 발송 옵션 */}
          {isAdmin && (
            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-amber-500">
                  <input
                    type="checkbox"
                    checked={isOfficialAdmin}
                    onChange={(e) => setIsOfficialAdmin(e.target.checked)}
                    className="rounded border-amber-500/50 text-amber-600 focus:ring-amber-500 size-4"
                  />
                  <ShieldCheck className="size-4" />
                  <span>{localeLabel(locale, '관리자 공식 쪽지로 발송', 'Send as Official Admin DM', '公式管理者メッセージとして送信', '作为官方管理员私信发送')}</span>
                </label>
                <Badge variant="outline" className="text-[10px] font-bold border-amber-500/40 text-amber-500">
                  ADMIN
                </Badge>
              </div>

              {isOfficialAdmin && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] text-muted-foreground">
                    {localeLabel(
                      locale,
                      '빠른 템플릿 선택:',
                      'Quick Templates:',
                      'クイックテンプレート:',
                      '快速模板选择:',
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ADMIN_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.title}
                        type="button"
                        onClick={() => setMessageBody(tmpl.text)}
                        className="text-[11px] px-2 py-1 rounded-md border bg-background hover:bg-muted transition-colors font-medium text-foreground"
                      >
                        {tmpl.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 메시지 작성 본문 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>{localeLabel(locale, '쪽지 내용', 'Message Content', 'メッセージ内容', '私信内容')}</span>
              <span className={messageBody.length > 2000 ? 'text-destructive font-black' : ''}>
                {messageBody.length} / 2000자
              </span>
            </div>
            <Textarea
              rows={4}
              placeholder={localeLabel(
                locale,
                '전달할 메시지를 입력해 주세요 (매너 있는 대화를 지켜주세요)…',
                'Write your message here…',
                'メッセージを入力してください…',
                '请输入要发送的私信内容…',
              )}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="resize-none text-sm"
              disabled={isSubmitting}
            />
          </div>

          {/* 상태 알림 메시지 */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                statusMessage.type === 'ok'
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              {statusMessage.type === 'ok' ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              {localeLabel(locale, '취소', 'Cancel', 'キャンセル', '取消')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSend}
              disabled={isSubmitting || !selectedUser || !messageBody.trim()}
              className="gap-2 font-bold px-4"
            >
              {isSubmitting ? (
                <RotateCw className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              <span>{localeLabel(locale, '쪽지 보내기', 'Send', '送信', '发送')}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
