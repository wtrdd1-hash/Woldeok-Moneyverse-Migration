import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'moneyverse-button inline-flex shrink-0 max-w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-transparent text-sm font-bold whitespace-nowrap transition-all duration-150 active:scale-[0.98] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20',
        outline: 'border-border bg-card text-foreground hover:border-input hover:bg-muted',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-muted hover:text-foreground',
        link: 'h-auto min-h-0 rounded-none p-0 text-primary underline-offset-4 hover:underline',
        // 핀테크·거버넌스 도메인 특화 시맨틱 Variant
        stepup:
          'bg-amber-500 text-zinc-950 border-amber-400/60 hover:bg-amber-400 shadow-sm shadow-amber-500/20 focus-visible:ring-amber-400/40',
        killswitch:
          'bg-rose-950/70 border-rose-500/80 text-rose-300 hover:bg-rose-900/90 hover:text-white shadow-[0_0_15px_rgba(244,63,94,0.2)] focus-visible:ring-rose-500/40',
        'trading-buy':
          'bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20 focus-visible:ring-red-500/35',
        'trading-sell':
          'bg-blue-500 text-white hover:bg-blue-600 shadow-sm shadow-blue-500/20 focus-visible:ring-blue-500/35',
        surface:
          'bg-zinc-900/90 border-zinc-800 text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800/90',
      },
      size: {
        default: 'min-h-[44px] h-11 px-4 py-2 has-[>svg]:px-3',
        xs: 'min-h-[36px] sm:min-h-0 h-8 gap-1 px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*=size-])]:size-3',
        sm: 'min-h-[44px] sm:min-h-[36px] h-10 gap-1.5 px-3.5 has-[>svg]:px-3',
        lg: 'min-h-[48px] h-12 px-6 has-[>svg]:px-4',
        icon: 'size-11',
        'icon-xs': 'size-8 sm:size-6 [&_svg:not([class*=size-])]:size-3',
        'icon-sm': 'size-10 sm:size-8',
        'icon-lg': 'size-11 sm:size-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  shortcutHint?: string;
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  isLoading = false,
  shortcutHint,
  disabled,
  children,
  ...props
}: ButtonProps) {
  if (asChild) {
    return (
      <Slot.Root
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      disabled={disabled || isLoading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {isLoading && <Loader2 className="size-4 animate-spin shrink-0" aria-hidden="true" />}
      {children}
      {shortcutHint && !isLoading && (
        <kbd className="hidden sm:inline-flex items-center rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-mono font-semibold opacity-80 border border-current/15">
          {shortcutHint}
        </kbd>
      )}
    </button>
  );
}
export { Button, buttonVariants };
