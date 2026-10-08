import * as React from 'react';
import { cn } from '@/lib/cn';

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'moneyverse-card flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl py-5 text-card-foreground shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_1px_rgba(255,255,255,0.03)_inset] hover:border-primary/40 transition-all duration-200 min-w-0 max-w-full overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 has-data-[slot=card-action]:grid-cols-[minmax(0,1fr)_auto] [.border-b]:pb-5 min-w-0',
        className,
      )}
      {...props}
    />
  );
}
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'text-[15px] font-extrabold leading-snug tracking-[-0.015em] sm:text-base min-w-0 [overflow-wrap:break-word]',
        className,
      )}
      {...props}
    />
  );
}
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm leading-6 text-muted-foreground min-w-0 [overflow-wrap:break-word]', className)}
      {...props}
    />
  );
}
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end shrink-0', className)}
      {...props}
    />
  );
}
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-5 min-w-0 max-w-full', className)} {...props} />;
}
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-5 [.border-t]:pt-5 min-w-0', className)}
      {...props}
    />
  );
}
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
