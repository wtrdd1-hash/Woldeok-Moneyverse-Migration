'use client';

import { useState } from 'react';
import { Eye, ShieldAlert, MessageSquare, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getChatReportDetailAction, type ChatReportDetail } from './actions';

export interface ChatReportItem {
  report_id: string;
  reporter_id: string;
  reporter_username: string;
  reporter_nickname: string;
  reported_user_id: string;
  reported_username: string;
  reported_nickname: string;
  conversation_id: string;
  reason: string;
  details: string;
  evidence_count: number;
  status: string;
  created_at: string;
  actioned_at: string | null;
  actioned_by: string | null;
  actioner_nickname: string | null;
}

function reasonBadge(reason: string) {
  switch (reason) {
    case 'spam_promotional':
      return <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 text-xs">스팸 / 홍보</Badge>;
    case 'fraud_scam':
      return <Badge variant="destructive" className="text-xs">사기 / 금융 피해</Badge>;
    case 'abuse_harassment':
      return <Badge variant="destructive" className="bg-rose-600 text-white text-xs">욕설 / 협박</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs">기타 규정 위반</Badge>;
  }
}

export function ChatReportEvidenceDialog({ item }: { item: ChatReportItem }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ChatReportDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen && !detail) {
      setLoading(true);
      setError(null);
      try {
        const res = await getChatReportDetailAction(item.report_id);
        if (res) {
          setDetail(res);
        } else {
          setError('증거 스냅샷을 불러오지 못했습니다.');
        }
      } catch {
        setError('증거 스냅샷을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  }

  const messages = detail?.evidence_snapshot ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <Eye className="size-3.5" />
          증거 열람 ({item.evidence_count}건)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b bg-muted/20">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="size-4 text-destructive" />
            <DialogTitle className="text-base font-semibold">
              채팅 신고 증거 스냅샷 (Audit Evidence Snapshot)
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            신고 접수 시점에 불변 암호화 기록된 최근 대화 내역 10건입니다. (열람 기록이 감사 로그에 영구 보존됩니다)
          </DialogDescription>
        </DialogHeader>

        {/* 신고 메타 요약 */}
        <div className="p-4 bg-muted/10 border-b grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">신고자:</span>{' '}
            <span className="font-semibold text-foreground">{item.reporter_nickname}</span>{' '}
            <span className="text-muted-foreground font-mono">(@{item.reporter_username})</span>
          </div>
          <div>
            <span className="text-muted-foreground">피신고자:</span>{' '}
            <span className="font-semibold text-destructive">{item.reported_nickname}</span>{' '}
            <span className="text-muted-foreground font-mono">(@{item.reported_username})</span>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-muted-foreground">신고 사유:</span>
            {reasonBadge(item.reason)}
          </div>
          <div className="col-span-2 bg-background p-2.5 rounded border text-xs">
            <div className="text-[11px] font-semibold text-muted-foreground mb-1">신고자 서술 내용:</div>
            <div className="text-foreground whitespace-pre-wrap">{item.details}</div>
          </div>
        </div>

        {/* 메시지 타임라인 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[240px] max-h-[380px] bg-background">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
              <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
              <p className="text-xs">증거 원장을 불러오고 감사 로그를 기록하는 중...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-xs text-destructive">{error}</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              증거 스냅샷 메시지가 존재하지 않습니다.
            </div>
          ) : (
            messages.map((m) => {
              const isReportedUser = m.sender_id === item.reported_user_id;
              return (
                <div
                  key={m.id || m.sequence}
                  className={`flex flex-col ${isReportedUser ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1 px-1">
                    <User className="size-3" />
                    <span className={isReportedUser ? 'font-semibold text-destructive' : 'font-medium'}>
                      {isReportedUser ? `${item.reported_nickname} (피신고자)` : `${item.reporter_nickname} (신고자)`}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">#{m.sequence}</span>
                    <Clock className="size-3 ml-1" />
                    <span>
                      {new Date(m.created_at).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words shadow-sm ${
                      isReportedUser
                        ? 'bg-destructive/10 text-destructive-foreground border border-destructive/20 rounded-tl-sm'
                        : 'bg-muted text-foreground rounded-tr-sm'
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t bg-muted/20 flex justify-end">
          <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
