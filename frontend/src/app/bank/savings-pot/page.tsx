'use client';

import React, { useState } from 'react';
import { Landmark, Users, Bell, Sparkles, Trophy, Shield, CheckCircle2, Flame, Plus, Clock } from 'lucide-react';

export interface PotMember {
  id: string;
  name: string;
  avatarColor: string;
  depositDays: number;
  isCurrentUser?: boolean;
}

const INITIAL_MEMBERS: PotMember[] = [
  { id: 'm-1', name: '나 (You)', avatarColor: 'bg-amber-500', depositDays: 5, isCurrentUser: true },
  { id: 'm-2', name: '파이낸스덕', avatarColor: 'bg-blue-500', depositDays: 5 },
  { id: 'm-3', name: '월가고래', avatarColor: 'bg-purple-500', depositDays: 4 },
  { id: 'm-4', name: '다이아핸즈', avatarColor: 'bg-emerald-500', depositDays: 5 },
];

export default function SavingsChallengePotPage() {
  const [members, setMembers] = useState<PotMember[]>(INITIAL_MEMBERS);
  const [targetPerPerson] = useState<number>(100000);
  const [dailyQuota] = useState<number>(14285);
  const [todayDeposited, setTodayDeposited] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const totalPotAccumulated = members.reduce((acc, m) => acc + m.depositDays * dailyQuota, 0);
  const totalPotTarget = targetPerPerson * 4;

  const handleDepositToday = () => {
    if (todayDeposited) return;

    setMembers((prev) =>
      prev.map((m) => (m.isCurrentUser ? { ...m, depositDays: m.depositDays + 1 } : m))
    );
    setTodayDeposited(true);
    setNotification('🎉 오늘의 챌린지 저축 (14,285 WLD) 입금 완료! 팟 달성률이 상승했습니다.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleNudge = (memberName: string) => {
    setNotification(`🔔 ${memberName}님을 찔렀습니다! 저축 알림이 발송되었습니다.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Landmark className="h-6 w-6" />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Toss형 4인 공동 저축 챌린지 팟
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              친구 4명이 모여 7일간 공동 저축 완주 시 +5.0% 보너스 금리 및 황금 상자 잭팟 수령
            </p>
          </div>

          {/* Stat Badges */}
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                <Trophy className="h-4 w-4" />
                <span>완주 시 보너스 금리</span>
              </div>
              <div className="font-mono text-base font-bold text-white">+5.0%p 확정 가산</div>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2">
              <div className="flex items-center gap-1.5 text-xs text-rose-300">
                <Flame className="h-4 w-4" />
                <span>중도 포기 페널티</span>
              </div>
              <div className="font-mono text-base font-bold text-white">10% 원천 소각</div>
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3.5 text-xs font-semibold text-emerald-300 shadow">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Main Pot Overview Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">
                  7일 챌린지 팟 #104
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" /> D-2일 남음
                </span>
              </div>
              <h2 className="mt-2 text-lg font-extrabold text-white">
                40만 WLD 목표 공동 저축 팟
              </h2>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">현재 모인 총 금액</div>
              <div className="font-mono text-2xl font-black text-amber-400">
                {totalPotAccumulated.toLocaleString()} / {totalPotTarget.toLocaleString()} WLD
              </div>
            </div>
          </div>

          {/* Total Pot Progress Bar */}
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-slate-400">
              <span>팟 전체 달성률</span>
              <span className="font-mono font-bold text-emerald-400">
                {Math.round((totalPotAccumulated / totalPotTarget) * 100)}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((totalPotAccumulated / totalPotTarget) * 100))}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleDepositToday}
              disabled={todayDeposited}
              className={`flex-1 rounded-xl py-3 text-xs font-bold transition-all ${
                todayDeposited
                  ? 'bg-emerald-600/30 text-emerald-300'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 shadow'
              }`}
            >
              {todayDeposited
                ? '✓ 오늘 저축 완료됨 (14,285 WLD)'
                : '💰 오늘치 14,285 WLD 저축 입금하기'}
            </button>
          </div>
        </div>

        {/* 4 Member Progress Cards & Friend Nudge */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">팟 참가자 4인 진행 현황</h2>
            </div>
            <span className="text-xs text-slate-400">닉네임 100% 익명 보호 적용</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((member) => {
              const isBehind = member.depositDays < 5;
              const percent = Math.round((member.depositDays / 7) * 100);

              return (
                <div
                  key={member.id}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                    member.isCurrentUser
                      ? 'border-amber-500/60 bg-amber-500/10'
                      : isBehind
                      ? 'border-rose-500/40 bg-slate-900/60'
                      : 'border-slate-800 bg-slate-900/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white ${member.avatarColor}`}
                        >
                          {member.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200">{member.name}</div>
                          <div className="text-[10px] text-slate-400">{member.depositDays}/7일 완료</div>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400">{percent}%</span>
                    </div>

                    <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Nudge Button */}
                  {!member.isCurrentUser && (
                    <button
                      type="button"
                      onClick={() => handleNudge(member.name)}
                      className={`mt-4 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                        isBehind
                          ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Bell className="h-3.5 w-3.5" />
                      친구 찌르기
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
