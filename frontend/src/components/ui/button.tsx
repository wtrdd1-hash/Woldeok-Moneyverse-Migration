import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'moneyverse-button inline-flex shrink-0 max-w-full touch-manipulation items-center justify-center gap-2 rounded-md border border-transparent text-sm font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
  {
    variants: {
      variant: {
        default: 'bg-[var(--g1-violet-ink)] text-[var(--g1-ink)] hover:bg-[var(--g1-violet)] hover:text-[var(--g1-night)]',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20',
        outline: 'border-[var(--g1-line)] bg-transparent text-[var(--g1-ink)] hover:border-[var(--g1-gold)] hover:bg-[var(--g1-plum-2)]',
        secondary: 'bg-[var(--g1-plum-2)] text-[var(--g1-ink)] hover:bg-[var(--g1-plum-3)]',
        ghost: 'text-[var(--g1-muted)] hover:bg-[var(--g1-plum-2)] hover:text-[var(--g1-ink)]',
        link: 'h-auto min-h-0 rounded-none p-0 text-[var(--g1-gold)] underline-offset-4 hover:underline',
        // 핀테크·거버넌스 도메인 특화 시맨틱 Variant
        stepup:
          'bg-amber-500 text-zinc-950 border-amber-400/60 hover:bg-amber-400 focus-visible:ring-amber-400/40',
        killswitch:
          'bg-rose-950/70 border-rose-500/80 text-rose-300 hover:bg-rose-900/90 hover:text-white focus-visible:ring-rose-500/40',
        'trading-buy':
          'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500/35',
        'trading-sell':
          'bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-500/35',
        surface:
          'bg-[var(--g1-plum)] border-[var(--g1-line)] text-[var(--g1-ink)] hover:border-[var(--g1-gold)] hover:bg-[var(--g1-plum-2)]',
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
