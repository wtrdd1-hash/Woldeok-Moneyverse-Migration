'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IDLE } from '@/lib/action-state';
import { StepUpField } from './step-up-field';
import { blockIpAddress, liftIpAddressBlock, permanentlySuspendUser } from './security-actions';

export function PermanentSuspensionDialog({ userId, displayName }: { readonly userId: string; readonly displayName: string }) {
  const [state, action] = useActionState(permanentlySuspendUser, IDLE);
  return <Dialog><DialogTrigger asChild><Button variant="destructive" size="sm">영구 정지</Button></DialogTrigger><DialogContent><form action={action} className="grid gap-4"><input type="hidden" name="userId" value={userId}/><DialogHeader><DialogTitle>{displayName} 영구 정지</DialogTitle><DialogDescription>계정을 제한 상태로 고정하고 현재 로그인 세션을 모두 종료합니다. 슈퍼관리자 권한이 필요합니다.</DialogDescription></DialogHeader><Textarea name="reason" minLength={3} maxLength={1000} required placeholder="정지 사유"/><StepUpField id={`permanent-${userId}`} undo="관리자 DB 정책에 따라 제한 해제를 별도 수행해야 합니다."/><ActionAlert state={state}/><SubmitButton variant="destructive">영구 정지 실행</SubmitButton></form></DialogContent></Dialog>;
}

export function IpBlockDialog() {
  const [state, action] = useActionState(blockIpAddress, IDLE);
  return <Dialog><DialogTrigger asChild><Button variant="destructive">IP/CIDR 차단</Button></DialogTrigger><DialogContent><form action={action} className="grid gap-4"><DialogHeader><DialogTitle>IP 또는 CIDR 차단</DialogTitle><DialogDescription>서버 요청 진입부에서 차단합니다. 공유망·모바일망은 CIDR 차단 범위를 신중히 확인하세요.</DialogDescription></DialogHeader><Input name="network" required maxLength={64} placeholder="203.0.113.5/32"/><Textarea name="reason" minLength={3} maxLength={1000} required placeholder="차단 사유"/><StepUpField id="ip-block" undo="보안 화면의 차단 기록에서 해제할 수 있습니다."/><ActionAlert state={state}/><SubmitButton variant="destructive">차단 적용</SubmitButton></form></DialogContent></Dialog>;
}

export function LiftIpBlockDialog({ blockId, network }: { readonly blockId: string; readonly network: string }) {
  const [state, action] = useActionState(liftIpAddressBlock, IDLE);
  return <Dialog><DialogTrigger asChild><Button variant="outline" size="sm">차단 해제</Button></DialogTrigger><DialogContent><form action={action} className="grid gap-4"><input type="hidden" name="blockId" value={blockId}/><DialogHeader><DialogTitle>{network} 차단 해제</DialogTitle><DialogDescription>해제 즉시 해당 주소의 요청이 다시 서버에 도달할 수 있습니다.</DialogDescription></DialogHeader><Textarea name="reason" minLength={3} maxLength={1000} required placeholder="해제 사유"/><StepUpField id={`ip-lift-${blockId}`} undo="같은 네트워크를 다시 차단할 수 있습니다."/><ActionAlert state={state}/><SubmitButton>차단 해제</SubmitButton></form></DialogContent></Dialog>;
}
