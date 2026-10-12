'use client';

import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Lock, Unlock, ZapOff, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface KillSwitchItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: typeof ShieldAlert;
  readonly isFrozen: boolean;
  readonly riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

const INITIAL_SWITCHES: KillSwitchItem[] = [
  {
    id: 'ks_stock_market',
    name: '가상 주식 거래소 전 종목 매매 동결 (Circuit Breaker)',
    description: '비정상 시세 조종이나 급격한 변동성 발생 시 18개 전 종목 호가 주문 및 체결을 즉각 일시 정지합니다.',
    icon: ZapOff,
    isFrozen: false,
    riskLevel: 'CRITICAL',
  },
  {
    id: 'ks_treasury_outflow',
    name: '국고(VAULT_MAIN) 출금 및 대량 이체 차단',
    description: '원장 부정 유출 의심 시 국고 계좌에서의 모든 출금, 환전 및 보조금 지급을 즉시 동결합니다.',
    icon: Lock,
    isFrozen: false,
    riskLevel: 'CRITICAL',
  },
  {
    id: 'ks_auth_signup',
    name: '신규 회원가입 및 지갑 생성 일시 잠금',
    description: '봇 공격이나 다계정 어뷰징 탐지 시 신규 유저 온보딩 및 지갑 생성 엔드포인트를 차단합니다.',
    icon: AlertTriangle,
    isFrozen: false,
    riskLevel: 'HIGH',
  },
  {
    id: 'ks_bot_quarantine',
    name: '외부 봇 웹훅 및 소셜 자동 연동 격리',
    description: 'X(Twitter) 자동 트윗 데몬 및 외부 알림 웹훅 발송을 격리 모드로 전환합니다.',
    icon: ShieldAlert,
    isFrozen: false,
    riskLevel: 'MEDIUM',
  },
];

export function EmergencyKillSwitchCard() {
  const [switches, setSwitches] = useState<KillSwitchItem[]>(INITIAL_SWITCHES);
  const [selectedSwitch, setSelectedSwitch] = useState<KillSwitchItem | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [auditLog, setAuditLog] = useState<string[]>([]);

  const handleOpenDialog = (item: KillSwitchItem) => {
    setSelectedSwitch(item);
    setConfirmInput('');
  };

  const handleToggleConfirm = () => {
    if (!selectedSwitch) return;

    const nextState = !selectedSwitch.isFrozen;
    setSwitches((prev) =>
      prev.map((s) => (s.id === selectedSwitch.id ? { ...s, isFrozen: nextState } : s))
    );

    const now = new Date().toLocaleTimeString();
    const actionText = nextState ? '🚨 긴급 동결 (FROZEN)' : '✅ 정상 가동 복원 (RELEASED)';
    const logEntry = `[${now}] ${selectedSwitch.name} 상태 변경: ${actionText}`;
    setAuditLog((prev) => [logEntry, ...prev.slice(0, 4)]);

    setSelectedSwitch(null);
    setConfirmInput('');
  };

  const isConfirmationValid = selectedSwitch
    ? selectedSwitch.isFrozen
      ? confirmInput.trim().toUpperCase() === 'CONFIRM UNFREEZE'
      : confirmInput.trim().toUpperCase() === 'CONFIRM FREEZE'
    : false;

  return (
    <Card className="border-rose-500/30 bg-rose-950/10 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-rose-500/20 bg-rose-500/5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-rose-500">
              <ShieldAlert className="size-5" />
              <span>긴급 비상 킬스위치 제어탑 (Emergency Circuit Breakers)</span>
            </CardTitle>
            <CardDescription className="text-xs text-rose-400/80">
              이상 금융거래, 시세 교란, 해킹 징후 포착 시 시스템 영역을 원터치로 즉각 격리합니다. 오작동 방지를 위해 2단계 검증이 요구됩니다.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-rose-500/40 text-rose-400 bg-rose-500/10 text-xs font-mono">
            CRITICAL CONTROL
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {switches.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  item.isFrozen
                    ? 'border-rose-500 bg-rose-950/40 shadow-sm shadow-rose-950'
                    : 'border-border/70 bg-card/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-md ${item.isFrozen ? 'bg-rose-500/20 text-rose-400' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground leading-snug">{item.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono px-1.5 py-0 ${
                            item.isFrozen
                              ? 'border-rose-500 text-rose-400 bg-rose-500/10 font-bold'
                              : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                          }`}
                        >
                          {item.isFrozen ? 'FROZEN (동결됨)' : 'OPERATIONAL (정상)'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          [{item.riskLevel}]
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={item.isFrozen ? 'default' : 'destructive'}
                    className={`text-xs font-bold shrink-0 ${
                      item.isFrozen ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                    }`}
                    onClick={() => handleOpenDialog(item)}
                  >
                    {item.isFrozen ? (
                      <>
                        <Unlock className="size-3.5 mr-1" />
                        <span>동결 해제</span>
                      </>
                    ) : (
                      <>
                        <Lock className="size-3.5 mr-1" />
                        <span>긴급 동결</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-2.5 text-[11px] text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* 킬스위치 감사 로그 스트립 */}
        {auditLog.length > 0 && (
          <div className="mt-3 p-2.5 rounded-md bg-muted/40 border border-border/60 text-xs font-mono space-y-1">
            <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-400" />
              <span>실시간 비상 관제 감사 증적 (Session Audit Log)</span>
            </div>
            {auditLog.map((log, idx) => (
              <div key={idx} className="text-[11px] text-muted-foreground/90 pl-1">
                {log}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* 2단계 확인(Step-Up Field) 모달 다이얼로그 */}
      {selectedSwitch && (
        <Dialog open={true} onOpenChange={() => setSelectedSwitch(null)}>
          <DialogContent className="max-w-md border-rose-500/40 bg-slate-950">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-500 text-base">
                <AlertTriangle className="size-5" />
                <span>2단계 관리자 보안 확인 (Step-Up Field)</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-1">
                {selectedSwitch.isFrozen ? (
                  <>해당 격리 조치를 해제하고 정상 서비스 상태로 복원하시겠습니까?</>
                ) : (
                  <>
                    주의: 이 작업은 <strong>즉각적인 서비스 정지</strong>를 유발하며 모든 진행 중인 유저 요청이 차단됩니다.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-2.5 rounded bg-rose-950/30 border border-rose-800/40 text-rose-300 font-mono">
                대상: <strong>{selectedSwitch.name}</strong>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-medium">
                  실행 확인을 위해 아래 문구를 정확히 입력하세요:
                </label>
                <div className="p-1.5 rounded bg-muted font-mono font-bold text-center text-foreground select-all text-xs">
                  {selectedSwitch.isFrozen ? 'CONFIRM UNFREEZE' : 'CONFIRM FREEZE'}
                </div>
                <Input
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder={selectedSwitch.isFrozen ? 'CONFIRM UNFREEZE' : 'CONFIRM FREEZE'}
                  className="font-mono text-center tracking-widest uppercase border-rose-500/40 focus:border-rose-500"
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setSelectedSwitch(null)}>
                취소
              </Button>
              <Button
                variant={selectedSwitch.isFrozen ? 'default' : 'destructive'}
                size="sm"
                disabled={!isConfirmationValid}
                onClick={handleToggleConfirm}
                className={selectedSwitch.isFrozen ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                {selectedSwitch.isFrozen ? '정상 복구 승인' : '긴급 동결 실행'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
