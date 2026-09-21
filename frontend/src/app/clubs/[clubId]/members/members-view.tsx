'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface ClubMember {
  readonly club_id: string;
  readonly user_id: string;
  readonly display_name: string;
  readonly avatar_key: string | null;
  readonly role: 'owner' | 'steward' | 'moderator' | 'member';
  readonly joined_at: string;
  readonly is_me: boolean;
}

export function MembersView({
  clubId,
  members,
  myRole,
}: {
  readonly clubId: string;
  readonly members: ClubMember[];
  readonly myRole: string | null;
}) {
  const router = useRouter();
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const isLeader = myRole === 'owner' || myRole === 'steward';

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    setUpdatingUser(targetUserId);
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/members/${targetUserId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '역할 변경에 실패했습니다.');
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setUpdatingUser(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">클럽 회원 명부 ({members.length}명)</h2>
          <p className="text-xs text-muted-foreground">
            클럽원들의 역할을 확인하고, 1:1 쪽지 버튼을 눌러 비공개로 직접 대화할 수 있습니다.
          </p>
        </div>

        <Link
          href={`/clubs/${clubId}`}
          className="text-xs text-muted-foreground hover:text-foreground font-medium px-3 py-1.5 rounded-lg border border-border bg-muted/40 transition-colors"
        >
          ← 클럽하우스로 돌아가기
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-border">
          {members.map((member) => {
            const isMe = member.is_me;

            return (
              <div
                key={member.user_id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary flex-shrink-0">
                    {member.display_name.charAt(0)}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {member.display_name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-bold">
                          나
                        </span>
                      )}
                      <RoleBadge role={member.role} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      가입일: {new Date(member.joined_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* 역할 변경 드롭다운 (운영진 권한) */}
                  {isLeader && !isMe && member.role !== 'owner' && (
                    <select
                      value={member.role}
                      disabled={updatingUser === member.user_id}
                      onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                      className="bg-muted border border-input rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="steward">운영진 (Steward)</option>
                      <option value="moderator">중재자 (Moderator)</option>
                      <option value="member">일반 회원 (Member)</option>
                    </select>
                  )}

                  {/* 1:1 쪽지 보내기 버튼 (본인이 아닐 때 노출) */}
                  {!isMe && (
                    <Link
                      href={`/chat?peer=${member.user_id}`}
                      className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                    >
                      <span>✉️</span>
                      <span>1:1 쪽지</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { readonly role: string }) {
  switch (role) {
    case 'owner':
      return (
        <span className="text-[10px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
          👑 클럽장
        </span>
      );
    case 'steward':
      return (
        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
          ⭐ 운영진
        </span>
      );
    case 'moderator':
      return (
        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
          🛡️ 중재자
        </span>
      );
    default:
      return (
        <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
          회원
        </span>
      );
  }
}
