'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { ViralCardPayload } from '@/lib/viral-share-card';
import { ViralShareCardDialog } from '@/components/viral-share-card-dialog';

interface ViralShareButtonProps {
  payload: ViralCardPayload;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  label?: string;
}

export function ViralShareButton({
  payload,
  className = '',
  variant = 'outline',
  label = '1초 진단 결과 카드 공유',
}: ViralShareButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 font-semibold text-xs transition-all active:scale-95 ${className}`}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        {label}
      </Button>

      {open && (
        <ViralShareCardDialog
          open={open}
          onOpenChange={setOpen}
          payload={payload}
        />
      )}
    </>
  );
}
