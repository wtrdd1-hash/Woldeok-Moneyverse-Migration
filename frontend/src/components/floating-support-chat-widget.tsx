'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Headphones,
  MessageSquare,
  Send,
  X,
  ChevronLeft,
  Plus,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogIn,
  BookOpen,
  Copy,
  Check,
  RotateCw,
  Volume2,
  VolumeX,
  User,
  UserPlus,
  BellOff,
  Search,
  Paperclip,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatMessageRenderer } from '@/components/chat-message-renderer';
import { useViewer } from '@/lib/use-viewer';
import { useLocale } from '@/components/locale-provider';
import type { Locale } from '@/lib/locale';
import { synthSound } from '@/lib/audio/synth-sound';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';

function localeLabel(locale: Locale, ko: string, en: string, ja?: string, zh?: string): string {
  if (locale === 'en') return en;
  if (locale === 'ja') return ja || en;
  if (locale === 'zh') return zh || en;
  return ko;
}

// ==========================================
// 1. 모델 인터페이스 (고객지원 & 1:1 쪽지)
// ==========================================

interface SupportThread {
  readonly thread_id: string;
  readonly subject: string;
  readonly status: 'open' | 'waiting_user' | 'resolved' | string;
  readonly created_at: string;
  readonly last_message_at: string;
}

interface SupportMessage {
  readonly message_id: string;
  readonly sender_kind: 'user' | 'admin';
  readonly body: string;
  readonly created_at: string;
}

interface DirectConversation {
  readonly conversation_id: string;
  readonly state: string;
  readonly latest_sequence: string;
  readonly last_message_at: string | null;
  readonly created_at: string;
  readonly peer_user_id: string;
  readonly peer_display_name: string;
  readonly peer_avatar_key: string | null;
  readonly last_read_sequence: string;
  readonly unread_count: string;
  readonly muted: boolean;
  readonly archived: boolean;
  readonly last_message_body: string | null;
  readonly is_peer_blocked?: boolean;
}

interface DirectChatMessage {
  readonly id: string;
  readonly conversation_id: string;
  readonly sender_id: string;
  readonly sequence: string;
  readonly body: string;
  readonly created_at: string;
  readonly is_mine: boolean;
}

const CATEGORY_PRESETS: readonly {
  readonly ko: string;
  readonly en: string;
  readonly ja: string;
  readonly zh: string;
  readonly prefixKo: string;
  readonly prefixEn: string;
  readonly prefixJa: string;
  readonly prefixZh: string;
}[] = [
  {
    ko: '계정/인증',
    en: 'Account/Auth',
    ja: 'アカウント/認証',
    zh: '账户/认证',
    prefixKo: '[계정/인증] ',
    prefixEn: '[Account] ',
    prefixJa: '[アカウント] ',
    prefixZh: '[账户] ',
  },
  {
    ko: 'WLD 원장',
    en: 'WLD Ledger',
    ja: 'WLD元帳',
    zh: 'WLD账本',
    prefixKo: '[WLD 원장] ',
    prefixEn: '[WLD] ',
    prefixJa: '[WLD元帳] ',
    prefixZh: '[WLD账本] ',
  },
  {
    ko: '주식/거래소',
    en: 'Stock/Exchange',
    ja: '株式/取引所',
    zh: '股票/交易所',
    prefixKo: '[주식/거래소] ',
    prefixEn: '[Stock] ',
    prefixJa: '[株式] ',
    prefixZh: '[股票] ',
  },
  {
    ko: '버그 제보',
    en: 'Bug Report',
    ja: 'バグ報告',
    zh: '漏洞反馈',
    prefixKo: '[버그 제보] ',
    prefixEn: '[Bug] ',
    prefixJa: '[バグ報告] ',
    prefixZh: '[漏洞反馈] ',
  },
  {
    ko: '건의사항',
    en: 'Suggestions',
    ja: 'ご意見・提案',
    zh: '意见建议',
    prefixKo: '[건의사항] ',
    prefixEn: '[Suggestion] ',
    prefixJa: '[ご意見] ',
    prefixZh: '[建议] ',
  },
] as const;

const STATUS_MAP: Record<
  string,
  {
    labelKo: string;
    labelEn: string;
    labelJa: string;
    labelZh: string;
    color: string;
    badgeKo: string;
    badgeEn: string;
    badgeJa: string;
    badgeZh: string;
  }
> = {
  open: {
    labelKo: '답변 대기 중',
    labelEn: 'Waiting Reply',
    labelJa: '回答待ち',
    labelZh: '等待回复',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    badgeKo: '대기',
    badgeEn: 'Waiting',
    badgeJa: '待機',
    badgeZh: '等待',
  },
  waiting_user: {
    labelKo: '관리자 답변 도착',
    labelEn: 'Admin Replied',
    labelJa: 'サポート回答あり',
    labelZh: '客服已回复',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    badgeKo: '답변완료',
    badgeEn: 'Replied',
    badgeJa: '回答済',
    badgeZh: '已回复',
  },
  resolved: {
    labelKo: '처리 완료',
    labelEn: 'Resolved',
    labelJa: '対応完了',
    labelZh: '处理完毕',
    color: 'text-muted-foreground bg-muted/40 border-border',
    badgeKo: '완료',
    badgeEn: 'Done',
    badgeJa: '完了',
    badgeZh: '完成',
  },
};

function formatTimeAgo(isoString: string, locale: Locale): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) {
      return localeLabel(locale, '방금 전', 'Just now', 'たった今', '刚刚');
    }
    if (diffMin < 60) {
      return localeLabel(locale, `${diffMin}분 전`, `${diffMin}m ago`, `${diffMin}分前`, `${diffMin}分钟前`);
    }
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      return localeLabel(locale, `${diffHours}시간 전`, `${diffHours}h ago`, `${diffHours}時間前`, `${diffHours}小时前`);
    }
    const diffDays = Math.floor(diffHours / 24);
    return localeLabel(locale, `${diffDays}일 전`, `${diffDays}d ago`, `${diffDays}日前`, `${diffDays}天前`);
  } catch {
    return '';
  }
}

// ==========================================
// 2. 통합 플로팅 채팅 컴포넌트
// ==========================================

export function FloatingSupportChatWidget() {
  const viewer = useViewer();
  const { locale } = useLocale();
  const isSignedIn = Boolean(viewer?.signedIn);

  // 팝오버 열림/닫힘 및 메인 탭 ('support' | 'direct')
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'support' | 'direct'>('support');

  // 고객센터(Support) 상태
  const [supportView, setSupportView] = useState<'list' | 'chat' | 'new'>('list');
  const [threads, setThreads] = useState<readonly SupportThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<SupportThread | null>(null);
  const [supportMessages, setSupportMessages] = useState<readonly SupportMessage[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [supportReplyText, setSupportReplyText] = useState('');

  // 1:1 개인 쪽지(Direct Chat) 상태
  const [directView, setDirectView] = useState<'list' | 'chat'>('list');
  const [conversations, setConversations] = useState<readonly DirectConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<DirectConversation | null>(null);
  const [directMessages, setDirectMessages] = useState<readonly DirectChatMessage[]>([]);
  const [directReplyText, setDirectReplyText] = useState('');
  const [directSearch, setDirectSearch] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<readonly { user_id: string; display_name: string }[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const directSearchInputRef = useRef<HTMLInputElement | null>(null);

  // 공통 UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // 이미지 첨부 상태 및 안티바이러스 스캔 업로드
  const [inquiryAttachedImg, setInquiryAttachedImg] = useState<{ url: string; name: string } | null>(null);
  const [supportReplyAttachedImg, setSupportReplyAttachedImg] = useState<{ url: string; name: string } | null>(null);
  const [directReplyAttachedImg, setDirectReplyAttachedImg] = useState<{ url: string; name: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTarget, setUploadTarget] = useState<'inquiry' | 'support_reply' | 'direct_reply'>('support_reply');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  // 이미지 파일 업로드 & 안티바이러스 검사 처리기
  const handleUploadImageFile = async (file: File, target: 'inquiry' | 'support_reply' | 'direct_reply') => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error(
        localeLabel(
          locale,
          '이미지 파일 크기는 최대 8MB까지 가능합니다.',
          'Image size must be within 8MB.',
          '画像サイズは最大8MBまでです。',
          '图片大小不得超过8MB。'
        )
      );
      return;
    }

    setIsUploadingImage(true);
    const toastId = toast.loading(
      localeLabel(
        locale,
        '안티바이러스 검사 및 이미지 업로드 중…',
        'Scanning for viruses and uploading image…',
        'ウイルス検査および画像アップロード中…',
        '正在进行防病毒安全检测并上传…'
      )
    );

    try {
      const sessionRes = await fetch('/app-api/v1/auth/session');
      const sessionData = await sessionRes.json();
      const csrfToken = sessionData.csrfToken ?? '';

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/app-api/v1/content/chat/upload', {
        method: 'POST',
        headers: {
          'x-csrf-token': csrfToken,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          localeLabel(
            locale,
            '보안 검사를 통과하여 이미지가 첨부되었습니다.',
            'Image verified clean and attached.',
            'セキュリティ検査を通過し画像が添付されました。',
            '已通过安全检查并成功附加图片。'
          ),
          { id: toastId }
        );
        if (target === 'inquiry') {
          setInquiryAttachedImg({ url: data.url, name: file.name });
        } else if (target === 'support_reply') {
          setSupportReplyAttachedImg({ url: data.url, name: file.name });
        } else if (target === 'direct_reply') {
          setDirectReplyAttachedImg({ url: data.url, name: file.name });
        }
      } else {
        const errorMsg = data.detail || data.message || '업로드에 실패했습니다.';
        toast.error(errorMsg, { id: toastId });
      }
    } catch {
      toast.error(
        localeLabel(
          locale,
          '이미지 업로드 중 네트워크 오류가 발생했습니다.',
          'Network error during image upload.',
          '画像アップロード中にエラーが発生しました。',
          '图片上传过程中发生网络错误。'
        ),
        { id: toastId }
      );
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasteEvent = useCallback(
    (e: React.ClipboardEvent, target: 'inquiry' | 'support_reply' | 'direct_reply') => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleUploadImageFile(file, target);
            break;
          }
        }
      }
    },
    [locale]
  );

  // 알림 감지 레퍼런스
  const prevWaitingCount = useRef<number>(0);
  const prevDirectUnread = useRef<number>(0);
  const prevSupportMsgCount = useRef<number>(0);
  const prevDirectMsgCount = useRef<number>(0);

  // 음소거 설정 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('moneyverse_support_muted');
      if (saved === 'true') {
        setIsMuted(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // 음소거 토글
  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('moneyverse_support_muted', String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // ----------------------------------------------------
  // A. 고객센터(Support) 데이터 페칭 & 액션
  // ----------------------------------------------------

  const fetchThreads = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const res = await fetch('/app-api/v1/support/threads', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list: SupportThread[] = data.threads ?? [];
        setThreads(list);

        // 관리자 새 답변 감지 시 차임벨 및 토스트
        const waitingCount = list.filter((t) => t.status === 'waiting_user').length;
        if (prevWaitingCount.current < waitingCount) {
          if (!isMuted) {
            synthSound.playNotificationChime();
          }
          toast.success(
            localeLabel(locale, '관리자 답변이 도착했습니다!', 'New admin reply received!', 'サポートからの回答が届きました！', '客服回复已送达！'),
            {
              description: localeLabel(
                locale,
                '1:1 문의 대화창에서 확인해 보세요.',
                'Check your 1:1 support chat.',
                '1:1サポートチャットで確認してください。',
                '请在1:1客服对话框中查看。'
              ),
              action: {
                label: localeLabel(locale, '보기', 'View', '見る', '查看'),
                onClick: () => {
                  setIsOpen(true);
                  setActiveTab('support');
                  setSupportView('list');
                },
              },
            }
          );
        }
        prevWaitingCount.current = waitingCount;
      }
    } catch {
      // ignore
    }
  }, [isSignedIn, locale, isMuted]);

  const fetchSupportMessages = useCallback(
    async (threadId: string) => {
      try {
        const res = await fetch(`/app-api/v1/support/threads/${encodeURIComponent(threadId)}/messages`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          const list: SupportMessage[] = data.messages ?? [];
          setSupportMessages(list);

          if (prevSupportMsgCount.current > 0 && list.length > prevSupportMsgCount.current) {
            const lastMsg = list[list.length - 1];
            if (lastMsg?.sender_kind === 'admin' && !isMuted) {
              synthSound.playNotificationChime();
            }
          }
          prevSupportMsgCount.current = list.length;
        }
      } catch {
        // ignore
      }
    },
    [isMuted]
  );

  // ----------------------------------------------------
  // B. 1:1 개인 쪽지(Direct Chat) 데이터 페칭 & 액션
  // ----------------------------------------------------

  const fetchConversations = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const res = await fetch('/app-api/v1/chat/conversations', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list: DirectConversation[] = data.conversations ?? [];
        setConversations(list);

        // 쪽지 안읽음 수 합산 및 새 쪽지 감지
        const totalUnread = list.reduce((acc, c) => acc + (Number.parseInt(c.unread_count, 10) || 0), 0);
        if (prevDirectUnread.current < totalUnread) {
          if (!isMuted) {
            synthSound.playNotificationChime();
          }
          toast.info(
            localeLabel(locale, '새 1:1 쪽지가 도착했습니다!', 'New direct message received!', '新しいダイレクトメッセージが届きました！', '收到新的私信！'),
            {
              description: localeLabel(
                locale,
                '1:1 쪽지 대화창에서 확인해 보세요.',
                'Check your direct chat hub.',
                '1:1メッセージ画面で確認してください。',
                '请在私信对话框中查看。'
              ),
              action: {
                label: localeLabel(locale, '열기', 'Open', '開く', '打开'),
                onClick: () => {
                  setIsOpen(true);
                  setActiveTab('direct');
                  setDirectView('list');
                },
              },
            }
          );
        }
        prevDirectUnread.current = totalUnread;
      }
    } catch {
      // ignore
    }
  }, [isSignedIn, locale, isMuted]);

  const fetchDirectMessages = useCallback(
    async (convId: string) => {
      try {
        const res = await fetch(`/app-api/v1/chat/conversations/${encodeURIComponent(convId)}/messages?limit=50`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          const list: DirectChatMessage[] = data.messages ?? [];
          setDirectMessages(list);

          if (prevDirectMsgCount.current > 0 && list.length > prevDirectMsgCount.current) {
            const lastMsg = list[list.length - 1];
            if (lastMsg && !lastMsg.is_mine && !isMuted) {
              synthSound.playNotificationChime();
            }
          }
          prevDirectMsgCount.current = list.length;
        }
      } catch {
        // ignore
      }
    },
    [isMuted]
  );

  // ----------------------------------------------------
  // C. 주기적 폴링 및 동기화
  // ----------------------------------------------------

  useEffect(() => {
    if (!isSignedIn) return;
    if (isOpen) {
      setIsLoading(true);
      Promise.all([fetchThreads(), fetchConversations()]).finally(() => setIsLoading(false));
    }
  }, [isOpen, isSignedIn, fetchThreads, fetchConversations]);

  // 대화창 열림 시 5초, 닫힘 시 30초 주기 폴링
  useEffect(() => {
    if (!isSignedIn) return;
    const isChatActive =
      isOpen &&
      ((activeTab === 'support' && supportView === 'chat' && selectedThread) ||
        (activeTab === 'direct' && directView === 'chat' && selectedConversation));

    const intervalTime = isChatActive ? 5000 : 30000;
    const interval = setInterval(() => {
      if (isOpen) {
        if (activeTab === 'support' && supportView === 'chat' && selectedThread) {
          fetchSupportMessages(selectedThread.thread_id);
        } else if (activeTab === 'direct' && directView === 'chat' && selectedConversation) {
          fetchDirectMessages(selectedConversation.conversation_id);
        }
        fetchThreads();
        fetchConversations();
      } else {
        fetchThreads();
        fetchConversations();
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [
    isOpen,
    activeTab,
    supportView,
    directView,
    selectedThread,
    selectedConversation,
    isSignedIn,
    fetchThreads,
    fetchConversations,
    fetchSupportMessages,
    fetchDirectMessages,
  ]);

  // 하단 스크롤 자동 이동
  useEffect(() => {
    if (
      (activeTab === 'support' && supportView === 'chat') ||
      (activeTab === 'direct' && directView === 'chat')
    ) {
      if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [activeTab, supportView, directView, supportMessages, directMessages]);

  // ----------------------------------------------------
  // D. 고객지원 핸들러
  // ----------------------------------------------------

  const handleSelectSupportThread = (thread: SupportThread) => {
    setSelectedThread(thread);
    setSupportView('chat');
    setIsLoading(true);
    prevSupportMsgCount.current = 0;
    fetchSupportMessages(thread.thread_id).finally(() => setIsLoading(false));
  };

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newSubject.trim() || (!newBody.trim() && !inquiryAttachedImg)) || isSending) return;

    setIsSending(true);
    const finalBody = inquiryAttachedImg
      ? `${newBody.trim() ? `${newBody.trim()}\n\n` : ''}${inquiryAttachedImg.url}`
      : newBody.trim();

    try {
      const sessionRes = await fetch('/app-api/v1/auth/session');
      const sessionData = await sessionRes.json();
      const csrfToken = sessionData.csrfToken ?? '';

      const idempotencyKey = crypto.randomUUID();
      const res = await fetch('/app-api/v1/support/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          subject: newSubject.trim().slice(0, 120),
          body: finalBody.slice(0, 2000),
          idempotencyKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (!isMuted) synthSound.playMessageSent();
        toast.success(
          localeLabel(locale, '문의가 성공적으로 접수되었습니다!', 'Support inquiry submitted!', 'お問い合わせを送信しました！', '工单提交成功！')
        );
        setNewSubject('');
        setNewBody('');
        setInquiryAttachedImg(null);
        await fetchThreads();
        if (data.thread) {
          handleSelectSupportThread(data.thread);
        } else {
          setSupportView('list');
        }
      } else {
        toast.error(
          localeLabel(
            locale,
            '문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.',
            'Failed to submit inquiry. Please try again.',
            'お問い合わせの送信に失敗しました。',
            '工单提交失败，请稍后重试。'
          )
        );
      }
    } catch {
      toast.error(
        localeLabel(locale, '네트워크 통신 중 오류가 발생했습니다.', 'Network error occurred.', '通信エラーが発生しました。', '网络通信异常。')
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSupportReply = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!supportReplyText.trim() && !supportReplyAttachedImg) || !selectedThread || isSending) return;

    const textToSend = supportReplyText.trim();
    const capturedImg = supportReplyAttachedImg;
    const finalBody = capturedImg
      ? `${textToSend ? `${textToSend}\n\n` : ''}${capturedImg.url}`
      : textToSend;

    setSupportReplyText('');
    setSupportReplyAttachedImg(null);
    setIsSending(true);

    try {
      const sessionRes = await fetch('/app-api/v1/auth/session');
      const sessionData = await sessionRes.json();
      const csrfToken = sessionData.csrfToken ?? '';

      const idempotencyKey = crypto.randomUUID();
      const res = await fetch(`/app-api/v1/support/threads/${encodeURIComponent(selectedThread.thread_id)}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          body: finalBody.slice(0, 2000),
          idempotencyKey,
        }),
      });

      if (res.ok) {
        if (!isMuted) synthSound.playMessageSent();
        await fetchSupportMessages(selectedThread.thread_id);
      } else {
        toast.error(localeLabel(locale, '메시지 전송에 실패했습니다.', 'Failed to send message.', '送信に失敗しました。', '消息发送失败。'));
        setSupportReplyText(textToSend);
        setSupportReplyAttachedImg(capturedImg);
      }
    } catch {
      toast.error(localeLabel(locale, '네트워크 오류가 발생했습니다.', 'Network error occurred.', 'ネットワークエラーが発生しました。', '网络错误。'));
      setSupportReplyText(textToSend);
      setSupportReplyAttachedImg(capturedImg);
    } finally {
      setIsSending(false);
    }
  };

  // ----------------------------------------------------
  // E. 1:1 개인 쪽지 핸들러
  // ----------------------------------------------------

  const handleSelectDirectConversation = async (conv: DirectConversation) => {
    setSelectedConversation(conv);
    setDirectView('chat');
    setIsLoading(true);
    prevDirectMsgCount.current = 0;

    // 읽음 처리 전송
    const latestSeq = Number.parseInt(conv.latest_sequence, 10) || 0;
    if (latestSeq > 0) {
      try {
        const sessionRes = await fetch('/app-api/v1/auth/session');
        const sessionData = await sessionRes.json();
        const csrfToken = sessionData.csrfToken ?? '';

        fetch(`/app-api/v1/chat/conversations/${encodeURIComponent(conv.conversation_id)}/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({ sequence: latestSeq }),
        }).catch(() => {});
      } catch {
        /* ignore */
      }
    }

    fetchDirectMessages(conv.conversation_id).finally(() => {
      setIsLoading(false);
      fetchConversations();
    });
  };

  const handleSendDirectReply = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!directReplyText.trim() && !directReplyAttachedImg) || !selectedConversation || isSending) return;

    const textToSend = directReplyText.trim();
    const capturedImg = directReplyAttachedImg;
    const finalBody = capturedImg
      ? `${textToSend ? `${textToSend}\n\n` : ''}${capturedImg.url}`
      : textToSend;

    setDirectReplyText('');
    setDirectReplyAttachedImg(null);
    setIsSending(true);

    try {
      const sessionRes = await fetch('/app-api/v1/auth/session');
      const sessionData = await sessionRes.json();
      const csrfToken = sessionData.csrfToken ?? '';

      const idempotencyKey = crypto.randomUUID();
      const res = await fetch(`/app-api/v1/chat/conversations/${encodeURIComponent(selectedConversation.conversation_id)}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          body: finalBody.slice(0, 2000),
          idempotencyKey,
        }),
      });

      if (res.ok) {
        if (!isMuted) synthSound.playMessageSent();
        await fetchDirectMessages(selectedConversation.conversation_id);
        fetchConversations();
      } else {
        toast.error(localeLabel(locale, '쪽지 전송에 실패했습니다.', 'Failed to send direct message.', 'メッセージ送信に失敗しました。', '私信发送失败。'));
        setDirectReplyText(textToSend);
        setDirectReplyAttachedImg(capturedImg);
      }
    } catch {
      toast.error(localeLabel(locale, '네트워크 오류가 발생했습니다.', 'Network error occurred.', 'ネットワークエラーが発生しました。', '网络错误。'));
      setDirectReplyText(textToSend);
      setDirectReplyAttachedImg(capturedImg);
    } finally {
      setIsSending(false);
    }
  };

  const openConversationByPeer = useCallback(
    async (peerUserId: string, peerDisplayName: string) => {
      if (!isSignedIn || !peerUserId) return;
      setIsLoading(true);
      try {
        // 기존에 열려있는 대화방 중 해당 피어가 있는지 확인
        const existing = conversations.find((c) => c.peer_user_id === peerUserId);
        if (existing) {
          await handleSelectDirectConversation(existing);
          return;
        }

        const sessionRes = await fetch('/app-api/v1/auth/session');
        const sessionData = await sessionRes.json();
        const csrfToken = sessionData.csrfToken ?? '';

        const res = await fetch('/app-api/v1/chat/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({ peerUserId }),
        });

        if (res.ok) {
          const data = await res.json();
          const newConv: DirectConversation = {
            conversation_id: data.conversation_id,
            peer_user_id: peerUserId,
            peer_display_name: peerDisplayName,
            peer_avatar_key: null,
            latest_sequence: data.latest_sequence ?? '0',
            last_read_sequence: '0',
            unread_count: '0',
            last_message_at: null,
            last_message_body: null,
            state: data.state ?? 'active',
            created_at: new Date().toISOString(),
            muted: false,
            archived: false,
          };
          setSelectedConversation(newConv);
          setDirectView('chat');
          await fetchDirectMessages(newConv.conversation_id);
          await fetchConversations();
        } else {
          toast.error(
            localeLabel(
              locale,
              '대화방을 시작할 수 없습니다.',
              'Failed to start conversation.',
              '会話を開始できませんでした。',
              '创建对话失败。'
            )
          );
        }
      } catch {
        toast.error(
          localeLabel(
            locale,
            '대화방 연결 중 네트워크 오류가 발생했습니다.',
            'Network error starting conversation.',
            '会話接続中にエラーが発生しました。',
            '网络错误。'
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isSignedIn, conversations, locale, fetchDirectMessages, fetchConversations]
  );

  // 1:1 쪽지 열기 이벤트(moneyverse:open-dm) 수신
  useEffect(() => {
    const handleOpenDmEvent = (e: Event) => {
      const custom = e as CustomEvent<{ peerUserId?: string | null; peerDisplayName?: string }>;
      const { peerUserId, peerDisplayName } = custom.detail || {};
      setIsOpen(true);
      setActiveTab('direct');
      if (peerUserId) {
        openConversationByPeer(peerUserId, peerDisplayName || '사용자');
      } else if (peerDisplayName) {
        setDirectView('list');
        setDirectSearch(peerDisplayName);
      }
    };
    window.addEventListener('moneyverse:open-dm', handleOpenDmEvent);
    return () => window.removeEventListener('moneyverse:open-dm', handleOpenDmEvent);
  }, [openConversationByPeer]);

  // 회원 검색 디바운스 로직
  useEffect(() => {
    const query = directSearch.trim();
    if (!query || query.length < 1 || !isSignedIn) {
      setSearchedUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const res = await fetch(`/app-api/v1/chat/search-users?query=${encodeURIComponent(query)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setSearchedUsers(data.users ?? []);
        }
      } catch {
        // ignore
      } finally {
        setIsSearchingUsers(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [directSearch, isSignedIn]);

  const handleCopyChat = (kind: 'support' | 'direct') => {
    let text = '';
    const adminTag = localeLabel(locale, '운영팀', 'Admin', '運営チーム', '官方客服');
    const meTag = localeLabel(locale, '나', 'Me', '自分', '我');
    const peerTag = localeLabel(locale, '상대', 'Peer', '相手', '对方');

    if (kind === 'support') {
      text = supportMessages.map((m) => `[${m.sender_kind === 'admin' ? adminTag : meTag}] ${m.body}`).join('\n\n');
    } else {
      text = directMessages
        .map((m) => `[${m.is_mine ? meTag : selectedConversation?.peer_display_name ?? peerTag}] ${m.body}`)
        .join('\n\n');
    }
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(
      localeLabel(locale, '대화 내용이 클립보드에 복사되었습니다.', 'Chat transcript copied!', '会話内容をコピーしました。', '对话内容已复制到剪贴板。')
    );
    setTimeout(() => setCopied(false), 2000);
  };

  // 알림 뱃지 수 계산
  const waitingAdminReplies = threads.filter((t) => t.status === 'waiting_user').length;
  const totalDirectUnread = conversations.reduce((acc, c) => acc + (Number.parseInt(c.unread_count, 10) || 0), 0);
  const totalNotificationBadge = waitingAdminReplies + totalDirectUnread;

  // 1:1 쪽지 필터링 목록
  const filteredConversations = conversations.filter((c) => {
    if (!directSearch.trim()) return true;
    const q = directSearch.toLowerCase();
    return c.peer_display_name.toLowerCase().includes(q) || (c.last_message_body && c.last_message_body.toLowerCase().includes(q));
  });

  return (
    <>
      {/* 1. 플로팅 챗 버블 트리거 버튼 */}
      <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40 select-none flex flex-col items-end group/support">
        {/* 데스크톱 마이크로 툴팁 배너 (호버 시 부드럽게 노출) */}
        {!isOpen && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-zinc-950/95 border border-zinc-700/80 shadow-xl text-[11px] font-bold text-zinc-100 backdrop-blur-xl opacity-0 group-hover/support:opacity-100 transition-all duration-300 transform translate-y-1 group-hover/support:translate-y-0 pointer-events-none">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{localeLabel(locale, '1:1 채팅 · 고객지원', '1:1 Chat & Support', '1:1チャット・サポート', '1:1聊天与客服')}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (!isOpen && !isMuted) synthSound.playClick();
            setIsOpen((prev) => !prev);
          }}
          className={cn(
            'group relative flex size-12 sm:size-13 items-center justify-center rounded-full shadow-2xl transition-all duration-300 active:scale-95 outline-none',
            isOpen
              ? 'bg-muted border-2 border-border text-foreground'
              : 'bg-gradient-to-br from-amber-500 via-primary to-amber-600 text-primary-foreground border-2 border-amber-400/50 hover:scale-105 hover:shadow-primary/40 ring-4 ring-amber-500/20 hover:ring-amber-500/40'
          )}
          aria-label={localeLabel(
            locale,
            '1:1 채팅 및 고객센터 열기/닫기',
            'Toggle chat & support hub',
            'チャット・サポートを開閉',
            '打开/关闭聊天与客服中心'
          )}
        >
          {isOpen ? (
            <X className="size-5 transition-transform duration-200 group-hover:rotate-90" />
          ) : (
            <Headphones className="size-5.5 sm:size-6 transition-transform duration-200 group-hover:scale-110" />
          )}

          {/* 통합 알림 뱃지 */}
          {!isOpen && totalNotificationBadge > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-600 font-mono text-[11px] font-black text-white shadow-md ring-2 ring-background animate-bounce">
              {totalNotificationBadge}
            </span>
          )}
        </button>
      </div>

      {/* 2. 채널톡/인터콤 스타일 통합 팝업 대화창 */}
      {isOpen && (
        <div
          ref={popupRef}
          className="fixed bottom-20 sm:bottom-22 right-3.5 sm:right-6 z-40 w-[calc(100vw-1.75rem)] max-w-[380px] h-[min(550px,calc(100dvh-9.5rem))] flex flex-col rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 text-foreground"
        >
          {/* A. 팝오버 상단 글로벌 헤더 */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/70 bg-muted/40 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {/* 뒤로가기 버튼 */}
              {((activeTab === 'support' && supportView !== 'list') || (activeTab === 'direct' && directView !== 'list')) && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'support') {
                      setSupportView('list');
                      setSelectedThread(null);
                    } else {
                      setDirectView('list');
                      setSelectedConversation(null);
                    }
                  }}
                  className="p-1 -ml-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={localeLabel(locale, '목록으로 돌아가기', 'Back to list', '一覧に戻る', '返回列表')}
                >
                  <ChevronLeft className="size-4.5" />
                </button>
              )}

              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0">
                {activeTab === 'support' ? <Headphones className="size-4" /> : <MessageSquare className="size-4" />}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-black truncate">
                  {activeTab === 'support'
                    ? supportView === 'chat' && selectedThread
                      ? selectedThread.subject
                      : supportView === 'new'
                      ? localeLabel(locale, '새 문의 접수', 'New Support Ticket', '新規お問い合わせ', '发起新工单')
                      : localeLabel(locale, '고객센터 · 1:1 문의', 'Customer Support', 'カスタマーサポート', '客服中心 · 1:1工单')
                    : directView === 'chat' && selectedConversation
                    ? selectedConversation.peer_display_name
                    : localeLabel(locale, '1:1 개인 쪽지함', '1:1 Direct Chat', '1:1メッセージ', '1:1私信')}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {activeTab === 'support'
                      ? localeLabel(locale, '운영진 상담 가동', 'Admin Online', 'サポート稼働中', '客服在线')
                      : localeLabel(locale, '비공개 1:1 실시간 대화', 'Encrypted Direct Chat', '暗号化1:1チャット', '加密1:1私信')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* 효과음 Mute 토글 */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                title={
                  isMuted
                    ? localeLabel(locale, '효과음 켜기', 'Unmute sound', '効果音をオン', '开启提示音')
                    : localeLabel(locale, '효과음 끄기', 'Mute sound', '効果音をオフ', '关闭提示音')
                }
                aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              >
                {isMuted ? <VolumeX className="size-3.5 text-muted-foreground" /> : <Volume2 className="size-3.5 text-primary" />}
              </Button>

              {/* 전체 화면 열기 링크 */}
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                title={localeLabel(locale, '전체 화면으로 열기', 'Open in full page', '全画面で開く', '在新页面打开')}
              >
                <Link
                  href={
                    activeTab === 'support'
                      ? selectedThread
                        ? `/support?thread=${selectedThread.thread_id}`
                        : '/support'
                      : selectedConversation
                      ? `/chat?conversationId=${selectedConversation.conversation_id}`
                      : '/chat'
                  }
                >
                  <ExternalLink className="size-3.5" />
                </Link>
              </Button>

              {/* 닫기 버튼 */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label={localeLabel(locale, '닫기', 'Close', '閉じる', '关闭')}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* B. 듀얼 세그먼트 탭 스위처 ([👑 고객센터] ↔ [💬 1:1 쪽지]) */}
          {isSignedIn && (
            <div className="flex items-center p-1.5 bg-muted/30 border-b border-border/60 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('support');
                  if (!isMuted) synthSound.playClick();
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                  activeTab === 'support'
                    ? 'bg-card text-foreground shadow-xs border border-border/80'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Headphones className="size-3.5" />
                <span>{localeLabel(locale, '고객센터', 'Support', 'サポート', '客服中心')}</span>
                {waitingAdminReplies > 0 && (
                  <span className="size-4 rounded-full bg-emerald-600 text-white font-mono text-[9px] font-black flex items-center justify-center">
                    {waitingAdminReplies}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('direct');
                  if (!isMuted) synthSound.playClick();
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                  activeTab === 'direct'
                    ? 'bg-card text-foreground shadow-xs border border-border/80'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <MessageSquare className="size-3.5" />
                <span>{localeLabel(locale, '1:1 쪽지', '1:1 Direct', '1:1メッセージ', '1:1私信')}</span>
                {totalDirectUnread > 0 && (
                  <span className="size-4 rounded-full bg-primary text-primary-foreground font-mono text-[9px] font-black flex items-center justify-center">
                    {totalDirectUnread}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* C. 본문 영역 */}
          <div className="flex-1 overflow-y-auto p-3.5 flex flex-col min-h-0 bg-gradient-to-b from-card to-background/50">
            {/* 1. 비로그인 게스트 뷰 */}
            {!isSignedIn ? (
              <div className="my-auto flex flex-col items-center justify-center text-center p-4 space-y-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
                  <ShieldCheck className="size-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-foreground">
                    {localeLabel(
                      locale,
                      '로그인 후 1:1 대화를 이용하세요',
                      'Sign in to use 1:1 Chat & Support',
                      'ログインして1:1チャットを利用',
                      '登录后使用1:1私信与客服'
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed [word-break:keep-all]">
                    {localeLabel(
                      locale,
                      '회원 계정으로 로그인하시면 1:1 개인 쪽지 및 운영진 1:1 고객지원 서비스를 안전하게 이용하실 수 있습니다.',
                      'Secure, encrypted 1:1 member conversations and official admin inquiries are tied to your account.',
                      '会員ログインすると、1:1メッセージや公式カスタマーサポートを安全にご利用いただけます。',
                      '登录会员账号即可安全体验1:1私信与官方客服咨询。'
                    )}
                  </p>
                </div>

                <Button asChild className="w-full h-10 font-bold text-xs gap-1.5 rounded-xl shadow-md">
                  <Link href="/login">
                    <LogIn className="size-4" />
                    <span>{localeLabel(locale, '로그인하러 가기', 'Sign In Now', 'ログインする', '立即登录')}</span>
                  </Link>
                </Button>

                <div className="w-full pt-3 border-t border-border/60 text-left space-y-1.5 text-xs">
                  <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                    <BookOpen className="size-3.5" />
                    <span>{localeLabel(locale, '자주 찾는 가이드', 'Helpful Guides', 'よくあるガイド', '常用指南')}</span>
                  </p>
                  <div className="grid gap-1">
                    <Link
                      href="/guide/getting-started"
                      className="p-2 rounded-lg bg-muted/40 hover:bg-muted text-[11px] font-medium transition-colors flex items-center justify-between"
                    >
                      <span>
                        {localeLabel(
                          locale,
                          '💡 3분 머니버스 입문 가이드',
                          '💡 3-Min Getting Started Guide',
                          '💡 3分マネーバース入門ガイド',
                          '💡 3分钟新手入门指南'
                        )}
                      </span>
                      <ChevronLeft className="size-3 rotate-180 text-muted-foreground" />
                    </Link>
                    <Link
                      href="/guide/stock-trading"
                      className="p-2 rounded-lg bg-muted/40 hover:bg-muted text-[11px] font-medium transition-colors flex items-center justify-between"
                    >
                      <span>
                        {localeLabel(
                          locale,
                          '📈 가상 주식 거래소 이용 안내',
                          '📈 Virtual Stock Exchange Guide',
                          '📈 仮想株式取引所の使い方',
                          '📈 模拟股票交易所使用指南'
                        )}
                      </span>
                      <ChevronLeft className="size-3 rotate-180 text-muted-foreground" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : activeTab === 'support' ? (
              /* 2. [고객센터 탭] */
              supportView === 'list' ? (
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  <Button
                    type="button"
                    onClick={() => setSupportView('new')}
                    className="w-full h-10 font-bold text-xs gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  >
                    <Plus className="size-4" />
                    <span>{localeLabel(locale, '새 1:1 문의 작성하기', 'Open New Support Inquiry', '新規お問い合わせを作成', '发起新工单')}</span>
                  </Button>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                    {isLoading ? (
                      <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                        <RotateCw className="size-5 animate-spin mx-auto text-primary" />
                        <p>{localeLabel(locale, '문의 내역을 불러오는 중…', 'Loading inquiries…', 'お問い合わせ履歴を読込中…', '正在加载工单…')}</p>
                      </div>
                    ) : threads.length === 0 ? (
                      <div className="py-12 text-center space-y-2">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground mx-auto">
                          <Headphones className="size-5" />
                        </div>
                        <p className="text-xs font-bold text-foreground">
                          {localeLabel(locale, '접수된 문의 내역이 없습니다', 'No support tickets yet', 'お問い合わせ履歴がありません', '暂无工单记录')}
                        </p>
                        <p className="text-[11px] text-muted-foreground [word-break:keep-all]">
                          {localeLabel(
                            locale,
                            '궁금한 점이나 건의사항이 있다면 문의를 남겨주세요.',
                            'Click the button above to ask anything.',
                            'ご質問やご意見があればお気軽にお問い合わせください。',
                            '如有任何疑问或建议，欢迎随时提交工单。'
                          )}
                        </p>
                      </div>
                    ) : (
                      threads.map((thread) => {
                        const statusMeta = STATUS_MAP[thread.status] ?? STATUS_MAP.open!;
                        const statusLabel = localeLabel(
                          locale,
                          statusMeta.labelKo,
                          statusMeta.labelEn,
                          statusMeta.labelJa,
                          statusMeta.labelZh
                        );
                        return (
                          <button
                            key={thread.thread_id}
                            type="button"
                            onClick={() => handleSelectSupportThread(thread)}
                            className="w-full p-3 rounded-xl border border-border/70 bg-card hover:bg-secondary/40 hover:border-primary/40 transition-all text-left space-y-1.5 shadow-xs group"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                                {thread.subject}
                              </span>
                              <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0', statusMeta.color)}>
                                {statusLabel}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                              <span>{formatTimeAgo(thread.last_message_at || thread.created_at, locale)}</span>
                              <span className="group-hover:translate-x-0.5 transition-transform">
                                {localeLabel(locale, '대화 열기 →', 'Open →', '開く →', '打开 →')}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : supportView === 'chat' && selectedThread ? (
                <div className="flex-1 flex flex-col min-h-0 space-y-3">
                  {/* 대화방 서브 헤더 (모바일 오버랩 방지) */}
                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/60 text-[11px] min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 overflow-hidden font-bold">
                      <span className="truncate text-xs font-semibold text-foreground shrink min-w-0" title={selectedThread.subject}>
                        {selectedThread.subject}
                      </span>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-mono shrink-0 whitespace-nowrap">
                        {STATUS_MAP[selectedThread.status]
                          ? localeLabel(
                              locale,
                              STATUS_MAP[selectedThread.status]!.badgeKo,
                              STATUS_MAP[selectedThread.status]!.badgeEn,
                              STATUS_MAP[selectedThread.status]!.badgeJa,
                              STATUS_MAP[selectedThread.status]!.badgeZh
                            )
                          : selectedThread.status}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyChat('support')}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors shrink-0 whitespace-nowrap pl-1"
                    >
                      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      <span>
                        {copied
                          ? localeLabel(locale, '복사됨', 'Copied', 'コピー済', '已复制')
                          : localeLabel(locale, '복사', 'Copy', 'コピー', '复制')}
                      </span>
                    </button>
                  </div>

                  {/* 메시지 스트림 */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px]">
                    {isLoading && supportMessages.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        <RotateCw className="size-4 animate-spin mx-auto mb-1 text-primary" />
                        <span>{localeLabel(locale, '대화 내역을 불러오는 중…', 'Loading messages…', 'メッセージ読込中…', '正在加载消息…')}</span>
                      </div>
                    ) : supportMessages.length === 0 ? (
                      <p className="text-center py-6 text-xs text-muted-foreground">
                        {localeLabel(locale, '메시지가 없습니다.', 'No messages in this inquiry.', 'メッセージがありません。', '暂无消息。')}
                      </p>
                    ) : (
                      supportMessages.map((m) => {
                        const isAdminMsg = m.sender_kind === 'admin';
                        return (
                          <div
                            key={m.message_id}
                            className={cn('flex flex-col space-y-1 max-w-[94%] sm:max-w-[85%] text-xs', isAdminMsg ? 'mr-auto' : 'ml-auto items-end')}
                          >
                            <span className="text-[10px] font-bold text-muted-foreground px-1">
                              {isAdminMsg
                                ? localeLabel(locale, '👑 운영진 답변', '👑 Admin Support', '👑 運営サポート', '👑 官方客服')
                                : localeLabel(locale, '나', 'You', '自分', '我')}
                            </span>
                            <div
                              className={cn(
                                'p-3 rounded-2xl leading-relaxed shadow-xs w-full',
                                isAdminMsg
                                  ? 'bg-primary/15 border border-primary/30 text-foreground rounded-tl-xs'
                                  : 'bg-secondary text-foreground border border-border/60 rounded-tr-xs'
                              )}
                            >
                              <ChatMessageRenderer body={m.body} isMine={!isAdminMsg} />
                            </div>
                            <span className="text-[9px] text-muted-foreground font-mono px-1">{formatTimeAgo(m.created_at, locale)}</span>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              ) : (
                /* 새 문의 작성 폼 */
                <form onSubmit={handleCreateInquiry} className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2.5">
                    {/* 카테고리 프리셋 칩 */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">
                        {localeLabel(locale, '빠른 카테고리 선택', 'Quick Category', 'カテゴリ選択', '快捷分类')}
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {CATEGORY_PRESETS.map((cat) => {
                          const catLabel = localeLabel(locale, cat.ko, cat.en, cat.ja, cat.zh);
                          const currentPrefix = localeLabel(locale, cat.prefixKo, cat.prefixEn, cat.prefixJa, cat.prefixZh);
                          const isSelected = newSubject.startsWith(currentPrefix) || newSubject.startsWith(cat.prefixKo);
                          return (
                            <button
                              key={cat.ko}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setNewSubject(newSubject.replace(/^\[[^\]]+\]\s*/, ''));
                                } else {
                                  setNewSubject(`${currentPrefix}${newSubject.replace(/^\[[^\]]+\]\s*/, '')}`);
                                }
                              }}
                              className={cn(
                                'px-2 py-0.5 rounded-md border text-[10px] font-bold transition-all active:scale-95',
                                isSelected
                                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                  : 'border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                              )}
                            >
                              {catLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="inquiry-subject" className="text-xs font-bold text-foreground">
                        {localeLabel(locale, '문의 제목', 'Subject', '件名', '工单标题')}
                      </label>
                      <input
                        id="inquiry-subject"
                        type="text"
                        maxLength={120}
                        required
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder={localeLabel(locale, '문의 제목을 입력하세요', 'Brief inquiry title', '件名を入力してください', '请输入工单标题')}
                        className="w-full h-9 px-3 rounded-xl border border-border/80 bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="inquiry-body" className="text-xs font-bold text-foreground">
                          {localeLabel(locale, '상세 내용', 'Description', '詳細内容', '详细描述')}
                        </label>
                        <span className="text-[10px] text-muted-foreground">
                          {localeLabel(locale, '클립보드(Ctrl+V) 이미지 붙여넣기 지원', 'Ctrl+V paste supported', 'Ctrl+V画像貼付対応', '支持Ctrl+V粘贴截图')}
                        </span>
                      </div>
                      <textarea
                        id="inquiry-body"
                        maxLength={2000}
                        rows={4}
                        value={newBody}
                        onChange={(e) => setNewBody(e.target.value)}
                        onPaste={(e) => handlePasteEvent(e, 'inquiry')}
                        placeholder={localeLabel(
                          locale,
                          '문의 내용이나 발생한 현상을 구체적으로 적어주세요. 스크린샷 이미지도 첨부할 수 있습니다.',
                          'Please describe your inquiry in detail. Screenshots can also be attached.',
                          'お問い合わせ内容や発生した現象を詳しく入力してください。スクショも添付可能です。',
                          '请详细描述您的问题，支持附加屏幕截图。'
                        )}
                        className="w-full p-3 rounded-xl border border-border/80 bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-inner resize-none"
                      />
                    </div>

                    {/* 이미지 첨부 미리보기 및 첨부 버튼 */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setUploadTarget('inquiry');
                          fileInputRef.current?.click();
                        }}
                        disabled={isUploadingImage}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold transition-all shadow-2xs disabled:opacity-50"
                      >
                        <Paperclip className="size-3.5 text-primary" />
                        <span>{localeLabel(locale, '이미지 첨부', 'Attach Image', '画像添付', '添加图片')}</span>
                      </button>

                      {inquiryAttachedImg && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-xs font-bold text-primary truncate max-w-[200px]">
                          <ImageIcon className="size-3.5 shrink-0" />
                          <span className="truncate text-[11px]">{inquiryAttachedImg.name}</span>
                          <button
                            type="button"
                            onClick={() => setInquiryAttachedImg(null)}
                            className="p-0.5 rounded-full hover:bg-primary/20 text-muted-foreground hover:text-foreground ml-1"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSending || !newSubject.trim() || (!newBody.trim() && !inquiryAttachedImg)}
                      className="w-full h-10 font-bold text-xs gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md disabled:opacity-50"
                    >
                      {isSending ? (
                        <>
                          <RotateCw className="size-3.5 animate-spin" />
                          <span>{localeLabel(locale, '접수 중…', 'Submitting…', '送信中…', '正在提交…')}</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-3.5" />
                          <span>{localeLabel(locale, '1:1 문의 접수하기', 'Submit Inquiry', '送信する', '提交工单')}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )
            ) : (
              /* 3. [1:1 쪽지 탭] */
              directView === 'list' ? (
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  {/* 상단 검색 및 새 쪽지 액션 */}
                  <div className="space-y-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <input
                          ref={directSearchInputRef}
                          type="text"
                          value={directSearch}
                          onChange={(e) => setDirectSearch(e.target.value)}
                          placeholder={localeLabel(
                            locale,
                            '대화 상대 또는 메시지 검색',
                            'Search conversation or user',
                            '相手またはメッセージ検索',
                            '搜索联系人或消息'
                          )}
                          className="w-full h-8 pl-8 pr-7 rounded-xl border border-border/70 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                        />
                        {directSearch && (
                          <button
                            type="button"
                            onClick={() => setDirectSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <X className="size-3" />
                          </button>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          directSearchInputRef.current?.focus();
                        }}
                        className="h-8 px-2.5 rounded-xl border-primary/30 text-primary hover:bg-primary/10 text-xs font-bold shrink-0 gap-1"
                      >
                        <UserPlus className="size-3.5" />
                        <span>{localeLabel(locale, '새 쪽지', 'New DM', '新規', '新私信')}</span>
                      </Button>
                    </div>
                  </div>

                  {/* 대화방 및 검색 결과 목록 스트림 */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                    {isLoading && conversations.length === 0 ? (
                      <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                        <RotateCw className="size-5 animate-spin mx-auto text-primary" />
                        <p>{localeLabel(locale, '쪽지 대화 목록을 불러오는 중…', 'Loading direct messages…', 'メッセージ一覧を読込中…', '正在加载私信…')}</p>
                      </div>
                    ) : directSearch.trim() ? (
                      /* 검색 모드 (기존 대화방 + 신규 회원 검색 결과) */
                      <div className="space-y-3">
                        {/* 1) 회원 검색 결과 (새 대화 시작) */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground px-1">
                            <span className="flex items-center gap-1 text-primary">
                              <UserPlus className="size-3" />
                              {localeLabel(locale, '회원 검색 결과 (새 대화 시작)', 'Members found', '会員検索結果', '会员搜索结果')}
                            </span>
                            {isSearchingUsers && <RotateCw className="size-3 animate-spin text-muted-foreground" />}
                          </div>

                          {searchedUsers.length > 0 ? (
                            searchedUsers.map((u) => (
                              <button
                                key={u.user_id}
                                type="button"
                                onClick={() => openConversationByPeer(u.user_id, u.display_name)}
                                className="w-full p-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/15 transition-all text-left flex items-center justify-between gap-2 shadow-2xs group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-xs shrink-0">
                                    {u.display_name.slice(0, 1).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                                      {u.display_name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {localeLabel(locale, '클릭하여 1:1 쪽지 시작하기', 'Click to start 1:1 chat', 'クリックしてチャット開始', '点击发起1:1私信')}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary text-primary-foreground shrink-0 shadow-xs">
                                  {localeLabel(locale, '대화하기', 'Chat', 'チャット', '对话')}
                                </span>
                              </button>
                            ))
                          ) : !isSearchingUsers ? (
                            <p className="text-[11px] text-muted-foreground px-1 py-1 italic">
                              {localeLabel(locale, '일치하는 신규 회원이 없습니다.', 'No matching members.', '一致する会員がいません。', '无匹配会员。')}
                            </p>
                          ) : null}
                        </div>

                        {/* 2) 기존 대화방 검색 결과 */}
                        {filteredConversations.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[11px] font-bold text-muted-foreground px-1 flex items-center gap-1">
                              <MessageSquare className="size-3" />
                              {localeLabel(locale, '참여 중인 쪽지 대화방', 'Existing chats', '進行中の会話', '现有对话')}
                            </p>
                            {filteredConversations.map((conv) => {
                              const unread = Number.parseInt(conv.unread_count, 10) || 0;
                              return (
                                <button
                                  key={conv.conversation_id}
                                  type="button"
                                  onClick={() => handleSelectDirectConversation(conv)}
                                  className="w-full p-2.5 rounded-xl border border-border/70 bg-card hover:bg-secondary/40 hover:border-primary/40 transition-all text-left flex items-start gap-2.5 shadow-xs group"
                                >
                                  <div className="size-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-black text-xs shrink-0">
                                    {conv.peer_display_name.slice(0, 1).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                                        {conv.peer_display_name}
                                      </span>
                                      {conv.last_message_at && (
                                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                                          {formatTimeAgo(conv.last_message_at, locale)}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                      {conv.last_message_body ||
                                        localeLabel(locale, '대화 내용이 없습니다', 'No messages yet', '会話内容がありません', '暂无对话内容')}
                                    </p>
                                  </div>
                                  {unread > 0 && (
                                    <span className="size-4 rounded-full bg-primary text-primary-foreground font-mono text-[9px] font-black flex items-center justify-center shrink-0 self-center">
                                      {unread}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {filteredConversations.length === 0 && searchedUsers.length === 0 && !isSearchingUsers && (
                          <div className="py-8 text-center space-y-1">
                            <p className="text-xs font-bold text-foreground">
                              {localeLabel(locale, '검색 결과가 없습니다', 'No results found', '検索結果がありません', '未找到搜索结果')}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {localeLabel(
                                locale,
                                `'${directSearch}' 닉네임을 가진 회원을 찾을 수 없습니다.`,
                                `No member matches '${directSearch}'.`,
                                `「${directSearch}」に一致する相手が見つかりません。`,
                                `未找到与'${directSearch}'匹配的会员。`
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      /* 대화방 없음 (Empty State) */
                      <div className="py-10 text-center space-y-3 px-2">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto shadow-inner">
                          <MessageSquare className="size-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black text-foreground">
                            {localeLabel(locale, '주고받은 1:1 쪽지가 없습니다', 'No direct messages yet', 'メッセージがありません', '暂无私信记录')}
                          </p>
                          <p className="text-[11px] text-muted-foreground [word-break:keep-all] leading-relaxed">
                            {localeLabel(
                              locale,
                              '게시판이나 회원 프로필에서 [쪽지]를 누르거나, 상단 검색창에 닉네임을 입력해 대화를 시작해 보세요.',
                              'Start by clicking [Direct Message] on posts or searching a member name above.',
                              '掲示板の[メッセージ]ボタンまたは上の検索バーから会話を開始できます。',
                              '可通过论坛帖子中的[私信]按钮或在上方搜索会员开启对话。'
                            )}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => directSearchInputRef.current?.focus()}
                          className="h-8.5 px-4 font-bold text-xs gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        >
                          <UserPlus className="size-3.5" />
                          <span>{localeLabel(locale, '대화 상대 검색하기', 'Search Member', '相手を検索', '搜索联系人')}</span>
                        </Button>
                      </div>
                    ) : (
                      /* 기존 대화방 목록 */
                      filteredConversations.map((conv) => {
                        const unread = Number.parseInt(conv.unread_count, 10) || 0;
                        return (
                          <button
                            key={conv.conversation_id}
                            type="button"
                            onClick={() => handleSelectDirectConversation(conv)}
                            className="w-full p-2.5 rounded-xl border border-border/70 bg-card hover:bg-secondary/40 hover:border-primary/40 transition-all text-left flex items-start gap-2.5 shadow-xs group"
                          >
                            <div className="size-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-black text-xs shrink-0">
                              {conv.peer_display_name.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                                  {conv.peer_display_name}
                                </span>
                                {conv.last_message_at && (
                                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                                    {formatTimeAgo(conv.last_message_at, locale)}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                {conv.last_message_body ||
                                  localeLabel(locale, '대화 내용이 없습니다', 'No messages yet', '会話内容がありません', '暂无对话内容')}
                              </p>
                            </div>
                            {unread > 0 && (
                              <span className="size-4 rounded-full bg-primary text-primary-foreground font-mono text-[9px] font-black flex items-center justify-center shrink-0 self-center">
                                {unread}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : directView === 'chat' && selectedConversation ? (
                /* 1:1 쪽지 대화방 */
                <div className="flex-1 flex flex-col min-h-0 space-y-3">
                  {/* 대화방 서브 헤더 */}
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/40 border border-border/60 text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="truncate max-w-[200px]">{selectedConversation.peer_display_name}</span>
                      {selectedConversation.is_peer_blocked && (
                        <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3.5">
                          {localeLabel(locale, '차단됨', 'Blocked', 'ブロック中', '已拉黑')}
                        </Badge>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyChat('direct')}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      <span>
                        {copied
                          ? localeLabel(locale, '복사됨', 'Copied', 'コピー済', '已复制')
                          : localeLabel(locale, '복사', 'Copy', 'コピー', '复制')}
                      </span>
                    </button>
                  </div>

                  {/* 메시지 스트림 */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px]">
                    {isLoading && directMessages.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        <RotateCw className="size-4 animate-spin mx-auto mb-1 text-primary" />
                        <span>{localeLabel(locale, '쪽지 대화 내역을 불러오는 중…', 'Loading messages…', 'メッセージ読込中…', '正在加载私信…')}</span>
                      </div>
                    ) : directMessages.length === 0 ? (
                      <p className="text-center py-6 text-xs text-muted-foreground">
                        {localeLabel(
                          locale,
                          '주고받은 메시지가 없습니다. 첫 인사를 건네보세요!',
                          'No messages yet. Say hello!',
                          'メッセージがありません。挨拶してみましょう！',
                          '暂无消息记录，打个招呼吧！'
                        )}
                      </p>
                    ) : (
                      directMessages.map((m) => (
                        <div
                          key={m.id}
                          className={cn('flex flex-col space-y-1 max-w-[88%] text-xs', m.is_mine ? 'ml-auto items-end' : 'mr-auto')}
                        >
                          <span className="text-[10px] font-bold text-muted-foreground px-1">
                            {m.is_mine ? localeLabel(locale, '나', 'You', '自分', '我') : selectedConversation.peer_display_name}
                          </span>
                          <div
                            className={cn(
                              'p-3 rounded-2xl leading-relaxed shadow-xs',
                              m.is_mine
                                ? 'bg-primary text-primary-foreground rounded-tr-xs'
                                : 'bg-secondary text-foreground border border-border/60 rounded-tl-xs'
                            )}
                          >
                            <ChatMessageRenderer body={m.body} isMine={m.is_mine} />
                          </div>
                          <span className="text-[9px] text-muted-foreground font-mono px-1">{formatTimeAgo(m.created_at, locale)}</span>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              ) : null
            )}
          </div>

          {/* D. 하단 답변 입력 바 */}
          {isSignedIn && (
            <>
              {activeTab === 'support' && supportView === 'chat' && selectedThread && (
                <div className="p-2.5 border-t border-border/70 bg-muted/30 shrink-0 space-y-1.5">
                  {supportReplyAttachedImg && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-xs font-bold text-primary w-fit max-w-[280px]">
                      <ImageIcon className="size-3.5 shrink-0" />
                      <span className="truncate text-[11px]">{supportReplyAttachedImg.name}</span>
                      <button
                        type="button"
                        onClick={() => setSupportReplyAttachedImg(null)}
                        className="p-0.5 rounded-full hover:bg-primary/20 text-muted-foreground hover:text-foreground ml-1"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleSendSupportReply} className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadTarget('support_reply');
                        fileInputRef.current?.click();
                      }}
                      disabled={isUploadingImage || isSending}
                      className="size-9 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0 transition-colors shadow-2xs disabled:opacity-50"
                      title={localeLabel(locale, '이미지 첨부', 'Attach Image', '画像添付', '添加图片')}
                    >
                      <Paperclip className="size-4 text-primary" />
                    </button>
                    <input
                      type="text"
                      maxLength={2000}
                      value={supportReplyText}
                      onChange={(e) => setSupportReplyText(e.target.value)}
                      onPaste={(e) => handlePasteEvent(e, 'support_reply')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          if ((e.nativeEvent as unknown as { isComposing?: boolean })?.isComposing) return;
                          e.preventDefault();
                          handleSendSupportReply();
                        }
                      }}
                      placeholder={localeLabel(
                        locale,
                        '답변 입력… (Ctrl+V 이미지 붙여넣기 지원)',
                        'Type reply… (Ctrl+V paste image)',
                        '返信を入力… (Ctrl+V画像貼付対応)',
                        '输入回复… (支持Ctrl+V粘贴截图)'
                      )}
                      className="flex-1 h-9 px-3 rounded-xl border border-border/80 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                      disabled={isSending}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isSending || (!supportReplyText.trim() && !supportReplyAttachedImg)}
                      className="size-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shrink-0"
                      aria-label={localeLabel(locale, '메시지 전송', 'Send message', 'メッセージ送信', '发送消息')}
                    >
                      <Send className="size-3.5" />
                    </Button>
                  </form>
                </div>
              )}

              {activeTab === 'direct' && directView === 'chat' && selectedConversation && (
                <div className="p-2.5 border-t border-border/70 bg-muted/30 shrink-0 space-y-1.5">
                  {directReplyAttachedImg && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-xs font-bold text-primary w-fit max-w-[280px]">
                      <ImageIcon className="size-3.5 shrink-0" />
                      <span className="truncate text-[11px]">{directReplyAttachedImg.name}</span>
                      <button
                        type="button"
                        onClick={() => setDirectReplyAttachedImg(null)}
                        className="p-0.5 rounded-full hover:bg-primary/20 text-muted-foreground hover:text-foreground ml-1"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleSendDirectReply} className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadTarget('direct_reply');
                        fileInputRef.current?.click();
                      }}
                      disabled={isUploadingImage || isSending || Boolean(selectedConversation.is_peer_blocked)}
                      className="size-9 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0 transition-colors shadow-2xs disabled:opacity-50"
                      title={localeLabel(locale, '이미지 첨부', 'Attach Image', '画像添付', '添加图片')}
                    >
                      <Paperclip className="size-4 text-primary" />
                    </button>
                    <input
                      type="text"
                      maxLength={2000}
                      value={directReplyText}
                      onChange={(e) => setDirectReplyText(e.target.value)}
                      onPaste={(e) => handlePasteEvent(e, 'direct_reply')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          if ((e.nativeEvent as unknown as { isComposing?: boolean })?.isComposing) return;
                          e.preventDefault();
                          handleSendDirectReply();
                        }
                      }}
                      placeholder={localeLabel(
                        locale,
                        '쪽지 내용 입력… (Enter 전송)',
                        'Type message… (Enter to send)',
                        'メッセージを入力… (Enterで送信)',
                        '输入私信… (Enter 发送)'
                      )}
                      className="flex-1 h-9 px-3 rounded-xl border border-border/80 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                      disabled={isSending || Boolean(selectedConversation.is_peer_blocked)}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isSending || (!directReplyText.trim() && !directReplyAttachedImg) || Boolean(selectedConversation.is_peer_blocked)}
                      className="size-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shrink-0"
                      aria-label={localeLabel(locale, '쪽지 전송', 'Send message', 'メッセージ送信', '发送私信')}
                    >
                      <Send className="size-3.5" />
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}

          {/* 숨겨진 전용 이미지 파일 인풋 */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUploadImageFile(f, uploadTarget);
            }}
          />
        </div>
      )}
    </>
  );
}
