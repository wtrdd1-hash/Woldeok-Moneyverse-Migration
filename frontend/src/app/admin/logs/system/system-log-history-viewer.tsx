'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  fetchSystemLogHistoryAction, requestLogHistoryOtpAction,
  verifyLogHistoryOtpAction, type SystemLogHistory,
} from './actions';

const SOURCES = [
  ['NGINX_ACCESS', 'Nginx 접근'],
  ['NGINX_ERROR', 'Nginx 오류'],
  ['SPRING_BACKEND', 'Spring 백엔드'],
  ['FRONTEND', 'Next.js 프론트엔드 서버'],
  ['LEGACY_BACKEND', '기존 NestJS 백엔드'],
] as const;

function datetimeLocal(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

type Window = {
  start: string;
  end: string;
  source: string;
  classification: 'routine' | 'important';
  filter: string;
};

export function SystemLogHistoryViewer() {
  const [source, setSource] = useState<string>('NGINX_ACCESS');
  const [classification, setClassification] = useState<'routine' | 'important'>('routine');
  const [fromInput, setFromInput] = useState(() => datetimeLocal(new Date(Date.now() - 86400000)));
  const [toInput, setToInput] = useState(() => datetimeLocal(new Date()));
  const [filter, setFilter] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [history, setHistory] = useState<SystemLogHistory | null>(null);
  const [window_, setWindow] = useState<Window | null>(null);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  const runQuery = (cursor?: string) => {
    const selected = window_ && cursor ? window_ : {
      source,
      classification,
      start: new Date(fromInput).toISOString(),
      end: new Date(toInput).toISOString(),
      filter: filter.trim(),
    };
    if (!cursor) {
      setWindow(selected);
      setHistory(null);
    }
    setMessage('');
    startTransition(async () => {
      const result = await fetchSystemLogHistoryAction({ ...selected, limit: 100, ...(cursor ? { cursor } : {}) });
      if (!result.success || !result.data) {
        setMessage(result.error ?? '보관 로그 조회를 완료하지 못했습니다.');
        return;
      }
      setHistory(result.data);
    });
  };

  const validateAndQuery = () => {
    const begin = Date.parse(fromInput);
    const end = Date.parse(toInput);
    if (!Number.isFinite(begin) || !Number.isFinite(end) || begin > end ||
        end > Date.now() + 300000 ||
        end - begin > 30 * 86400000 ||
        (classification === 'routine' && end - begin > 7 * 86400000)) {
      setMessage('일반 로그는 최대 7일, 중요 로그는 최대 30일입니다. 날짜 범위를 확인하세요.');
      return;
    }
    runQuery();
  };

  const requestOtp = () => {
    startTransition(async () => {
      const result = await requestLogHistoryOtpAction();
      setOtpMessage(result.success
        ? '등록된 디스코드/텔레그램 관리자 채널로 OTP 발송을 요청했습니다.'
        : result.error ?? 'OTP 요청이 실패했습니다.');
    });
  };

  const verifyOtp = () => {
    startTransition(async () => {
      const result = await verifyLogHistoryOtpAction(otpCode);
      setOtpMessage(result.success
        ? '중요 로그 조회 권한이 5분 동안 활성화되었습니다.'
        : result.error ?? 'OTP 검증이 실패했습니다.');
      setOtpCode('');
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>압축 보관 로그 이력 조회</CardTitle>
        <CardDescription>
          일반 7일 / 중요 30일. 서버에서 개인정보가 마스킹된 기록만 조회합니다.
          현재 로그 실시간 갱신은 위의 5초 자동 모드를 사용하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span>로그 출처</span>
            <select
              className="h-10 w-full rounded-md border bg-background px-2 text-sm"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              {SOURCES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>보존 분류</span>
            <select
              className="h-10 w-full rounded-md border bg-background px-2 text-sm"
              value={classification}
              onChange={(e) => setClassification(e.target.value as 'routine' | 'important')}
            >
              <option value="routine">일반 (7일)</option>
              <option value="important">중요 (30일·OTP)</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>시작 (내 시간대)</span>
            <Input type="datetime-local" value={fromInput} onChange={(e) => setFromInput(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span>종료 (내 시간대)</span>
            <Input type="datetime-local" value={toInput} onChange={(e) => setToInput(e.target.value)} />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 items-end">
          <label className="flex-1 min-w-48 space-y-1 text-sm">
            <span>검색어 (마스킹된 로그 대상)</span>
            <Input value={filter} maxLength={120} onChange={(e) => setFilter(e.target.value)} />
          </label>
          <Button disabled={pending} onClick={validateAndQuery}>보관 로그 검색</Button>
        </div>
        {classification === 'important' && (
          <div className="rounded-md border p-3 space-y-2">
            <p className="text-sm font-semibold">중요 로그 조회 — 추가 OTP 인증</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={pending} onClick={requestOtp}>OTP 발송</Button>
              <Input
                aria-label="6자리 OTP 코드"
                className="w-32"
                type="password"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
              />
              <Button type="button" disabled={pending || otpCode.length !== 6} onClick={verifyOtp}>OTP 검증</Button>
            </div>
            {otpMessage && <p role="status" className="text-sm">{otpMessage}</p>}
          </div>
        )}
        {message && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{message}</p>}
        {history && (
          <div className="space-y-2">
            <p role="status" className="text-sm text-muted-foreground">
              {history.status === 'EMPTY' ? '해당 조건에 일치하는 보관 로그가 없습니다.' : '조회된 로그: ' + history.totalCount + '건'}
              {' · '}보관소 응답: {new Date(history.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
            </p>
            <div className="max-h-[550px] space-y-1 overflow-auto rounded-md bg-zinc-950 p-3 text-xs font-mono text-zinc-100">
              {history.entries.map((entry) => (
                <div key={entry.id + entry.timestamp} className="border-b border-zinc-800 py-1 whitespace-pre-wrap break-all">
                  <span className="text-zinc-400">
                    {new Date(entry.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
                    {' · '}{entry.severity}{' · '}{entry.class}
                  </span>
                  {' '}{entry.message}
                </div>
              ))}
            </div>
            {history.nextCursor && (
              <Button variant="outline" disabled={pending || !window_} onClick={() => runQuery(history.nextCursor ?? undefined)}>
                다음 100건
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
