'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AdminQuickUserSearch() {
  const [userId, setUserId] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = userId.trim();
    if (clean) {
      router.push(`/admin/users/${encodeURIComponent(clean)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="회원 UUID를 입력하고 바로 상세 조회/제재..."
          className="pl-9 text-xs sm:text-sm font-mono h-10"
        />
      </div>
      <Button type="submit" size="sm" className="h-10 shrink-0 bg-amber-500 text-black hover:bg-amber-400 font-bold">
        <UserCheck className="size-4 mr-1.5" />
        빠른 조회
      </Button>
    </form>
  );
}